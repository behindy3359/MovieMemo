const { Review, Member, Movie, Like, Report } = require('../model');
const { paginate, paginateResponse } = require('../utils/paginate');
const { sort } = require('../utils/sort');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');

// 관리자 조회
exports.getAdminPage = async (req, res) => {
    const { page = 1, pageSize = 8, nick, sortBy = 'report' } = req.query;
    
    // 페이지네이션 설정
    const { limit, offset } = paginate(page, pageSize);

    try {
        let data = [];
        let searchMessage = '';

        // 닉네임 검색이 있는 경우 멤버 목록 조회 및 정렬
        if (nick) {
            const memberWhereCondition = {
                nick: {
                    [Op.like]: `%${nick}%`
                }
            };

            const { count: memberCount, rows: memberRows } = await Member.findAndCountAll({
                where: memberWhereCondition,
                order: [['nick', 'ASC']],
                limit,
                offset
            });

            if (memberRows.length === 0) {
                searchMessage = '검색 결과가 없습니다.';
            } else {
                const exactMemberMatches = memberRows.filter(member => member.nick === nick);
                const partialMemberMatches = memberRows.filter(member => member.nick !== nick);
                const sortedMembers = [...exactMemberMatches, ...partialMemberMatches];

                data = paginateResponse(sortedMembers, memberCount, page, pageSize, 'members');
            }
        } else {
            // 리뷰 목록 조회 (기본값, 신고순으로 정렬)
            const { count: reviewCount, rows: reviewRows } = await Review.findAndCountAll({
                order: sort(sortBy),
                include: [
                    {
                        model: Member,
                        attributes: ['nick']
                    },
                    {
                        model: Movie,
                        attributes: ['movieTitle']
                    }
                ],
                limit,
                offset
            });

            data = paginateResponse(reviewRows, reviewCount, page, pageSize, 'reviews');

            if (reviewRows.length === 0) {
                return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.` });
            }
        }

        const pagination = {
            currentPage: page,
            totalPages: data.totalPages,
            totalReviews: data.totalReviews,
            pageSize: pageSize
        };

        if (req.xhr || req.headers.accept.includes('application/json')) {
            console.log('JSON response:', {
                data,
                pagination,
                searchMessage,
                sortBy
            });
            return res.status(200).json({
                data,
                pagination,
                searchMessage,
                sortBy
            });
        } else {
            console.log('HTML response:', {
                data,
                pagination,
                searchMessage,
                sortBy
            });
            return res.status(200).render('adminpage', {
                data,
                pagination,
                searchMessage,
                sortBy
            });
        }

    } catch (error) {
        console.log(`Error: ${error.message}`);
        return res.status(500).json({ message: `조회 중 오류가 발생했습니다.` });
    }
};
