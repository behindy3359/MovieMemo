const { Review, Member, Movie, Like, Report } = require('../model');
const { paginate, paginateResponse } = require('../utils/paginate');
const checkBadWords = require('../utils/badWordsFilter');
const { sort } = require('../utils/sort');
const { where } = require('sequelize');
const { query } = require('express');
const jwt = require('jsonwebtoken');

// 리뷰 생성
exports.postReview = async (req, res) => {
    const { memberId, movieId, content, reviewMovieRating } = req.body;
    // 영어 및 한국어 필터링
    if (checkBadWords(content)) {
        return res.status(400).json({ message: "부적절한 단어가 포함되어 있습니다." });
    }

    try {
        const review = await Review.create({
            memberId, movieId, content, reviewMovieRating
        });

        /* // 해당 영화의 모든 리뷰 조회
        const movieReviewList = await Review.findAll({ where: { movieId } });
        // 새로운 리뷰 평균 평점 계산 (DB에 있는 평점을 처음부터 전부 계산하므로 DB를 전부 읽어야 함)
        const totalReviews = movieReviewList.length;
        const sumRating = movieReviewList.reduce((sum, r) => sum + r.reviewMovieRating, 0);
        const avgRating = sumRating / totalReviews;
        
        // 영화의 평균 평점 업데이트
        await Movie.update({ avgRating }, { where: { id: movieId } }); */


        // 현재 영화의 리뷰 평균 평점 업데이트
        // 새로 작성한 리뷰에 해당하는 영화 조회
        const movie = await Movie.findOne({ where: { movieId } });
        if (!movie) return res.status(404).json({ message: `영화가 존재하지 않습니다.`});
        // 현재 컬럼에 등록된 영화 리뷰 평점 평균 (새로 작성된 리뷰 포함 하지 않음)
        const currentAvgRating = parseFloat(movie.reviewMovieRating);
        // 영화 리뷰 개수 (새로 작성된 리뷰 포함)
        const totalReviews = await Review.count({ where: { movieId } });
        // 새로운 평균 평점 계산 (새로 작성된 리뷰 포함)
        const newAvgRating = (parseFloat(parseFloat(currentAvgRating * parseFloat(parseFloat(parseFloat(totalReviews) - 1))) + parseFloat(reviewMovieRating) ) / parseFloat(totalReviews));

        // 영화 리뷰 평점 평균 업데이트
        const update = await Movie.update({ reviewMovieRating: newAvgRating }, { where: { movieId } });
        return res.status(201).json({ message: `리뷰가 작성되었습니다.`, review });
        
    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: `리뷰를 생성할 수 없습니다.` });
    }
}

// 특정 리뷰 한개 조회
exports.getReview = async (req, res) => {
    const { reviewId } = req.params;

    try {
        const review = await Review.findOne({
            where: { reviewId },

            include: [
                {
                    model: Member,
                    attributes: ['nick']
                },
                {
                    model: Like, // 리뷰 추천인 리스트
                    attributes: ['memberId'],
                    // include: [{
                    //     model: Member,
                    //     attributes: ['nick']
                    // }]
                }
            ]
        });

        if (!review) return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.`})
        
        return res.status(200).json(review);

    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: `리뷰 조회 중 오류가 발생했습니다.` });
    }
}

// 좋아요 높은 리뷰 조회
exports.getTopReviews = async (req, res) => {
    // const { limit } = req.params;
    const limit = parseInt(req.params.limit, 10);
    try {
        const reviews = await Review.findAll({
            order: sort('popular'),
            limit, 
            include: [
                {
                    model: Member,
                    attributes: ['nick']
                }
            ],
            include: [
                {
                    model: Movie,
                    attributes: ['posterUrl']
                }
            ]
        });
        // console.log(reviews);
        if (reviews.length === 0) return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.` });

        return res.status(200).json(reviews);

    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: `리뷰 조회 중 오류가 발생했습니다.` });
    }
}


// 회원이 작성한 리뷰 목록
exports.getMemberReviewList = async (req, res) => {
    const memberId = req.memberId;
    const { sortBy = 'popular', page = 1, pageSize = 8 } = req.query;

    const order = sort(sortBy); // 정렬
    const { limit, offset } = paginate(page, pageSize); // pagination

    try {
        const { count, rows } = await Review.findAndCountAll({
            where: { memberId },
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
            order,
            offset,
            limit
        });

        // if (!rows.length) {
        //     if (!res.headersSent) { // 이미 헤더가 전송된 경우를 체크
        //         return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
        //     }
        // }

        return paginateResponse(rows, count, page, limit, 'reviews');
    } catch (error) {
        console.log(`Error : ${error.message}`);
        if (!res.headersSent) { // 이미 헤더가 전송된 경우를 체크
            return res.status(500).json({ message: '리뷰 조회 중 오류가 발생했습니다.' });
        }
    }
}


exports.getMovieReviewList = async (req, res) => {
    const { movieId } = req.params;
    let sortBy = 'rating';
    let page = req.query.page;
    let pageSize = 6;

    const order = sort(sortBy);
    const { limit, offset } = paginate(page, pageSize);

    try {
        const { count, rows } = await Review.findAndCountAll({
            where: { movieId },
            include: [
                {
                    model: Member,
                    attributes: ['nick']
                },
                {
                    model: Like,
                    include: [
                        {
                            model: Member,
                            attributes: ['memberId', 'nick']
                        }
                    ]
                },
                {
                    model: Report,
                    include: [
                        {
                            model: Member,
                            attributes: ['memberId', 'nick']
                        }
                    ]
                }
            ],
            order,
            offset,
            limit
        });

        if (!rows.length) return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });

        const reviewsWithLikeReport = rows.map(review => {
            const plainReview = review.get({ plain: true });
            return {
                ...plainReview,
                likeCount: plainReview.Likes.length,
                reportCount: plainReview.Reports.length,
                likedUsers: plainReview.Likes.map(like => ({
                    memberId: like.Member.memberId,
                    nick: like.Member.nick
                })),
                reportedUsers: plainReview.Reports.map(report => ({
                    memberId: report.Member.memberId,
                    nick: report.Member.nick
                }))
            };
        });
        console.log(reviewsWithLikeReport);

        return res.status(200).json(paginateResponse(reviewsWithLikeReport, count, page, limit, 'reviews'));
        
    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: '리뷰 조회 중 오류가 발생했습니다.' });
    }
}


// 특정 리뷰 내용 수정
exports.patchReview = async (req, res) => {

    const { reviewId } = req.params;
    const { reviewMovieRating : rating, content } = req.body;
    const memberId = req.memberId;

    try {
        const review = await Review.findOne({
            where: { reviewId }
        });

        if (!review) return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.`});

        if (checkBadWords(content)) {
            return res.status(400).json({ message: "부적절한 단어가 포함되어 있습니다." });
        }

        // 수정 전 영화 리뷰 평점
        const previousMovieRating = review.reviewMovieRating;
        
        // 수정 후 영화 리뷰 평점
        review.reviewMovieRating = rating;
        
        review.content = content;
        await review.save();

        // 영화의 리뷰 평균 평점 업데이트
        const movie = await Movie.findOne({ where: { movieId: review.movieId } });
        const currentAvgRating = movie.avgRating;
        const totalReviews = await Review.count({ where: { movieId: review.movieId } });
        const newAvgRating = parseFloat(parseFloat(parseFloat(currentAvgRating) * parseFloat(totalReviews)) - parseFloat(previousMovieRating) + parseFloat(rating)) / parseFloat(totalReviews);

        await Movie.update({ avgRating: newAvgRating }, { where: { movieId: review.movieId } });

        return res.status(200).json(review);

    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: `리뷰 수정 중 오류가 발생했습니다.` });
    }
}

// 특정 리뷰 삭제
exports.deleteReview = async (req, res) => {
    
    const { reviewId } = req.params;
    const memberId = req.memberId;
    const isAdmin = req.isAdmin;
    try {
        const review = await Review.findOne({
            where: { reviewId }
        })

        if (!review) return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.`})

        // 리뷰 작성자가 현재 사용자와 일치하거나 ADMIN인지 확인
        if (review.memberId !== memberId && !isAdmin) {
            console.log(`권한이 없습니다.`);
            return res.status(403).json({ message: `유효하지 않은 접근입니다.` });
        }

        // 삭제 할 영화 리뷰 평점
        const deleteMovieRating = review.reviewMovieRating;

        await review.destroy();

        // 영화의 리뷰 평균 평점 업데이트
        const movie = await Movie.findOne({ where: { movieId: review.movieId } });
        const currentAvgRating = movie.avgRating;
        const totalReviews = await Review.count({ where: { movieId: review.movieId } });

        // 리뷰 삭제 후 남은 리뷰가 있다면 다시 계산, 없으면 0으로 처리
        const newAvgRating = totalReviews > 0 ? ((currentAvgRating * (totalReviews + 1)) - deleteMovieRating) / totalReviews : 0;

        await Movie.update({ avgRating: newAvgRating }, { where: { movieId: review.movieId } });

        return res.status(200).json({ message: `리뷰가 삭제되었습니다.`})

    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: `리뷰 삭제 중 오류가 발생했습니다.` });
    }
}

// 좋아요
exports.likeReview = async (req, res) => {
    const memberId = req.memberId;
    const { reviewId } = req.body;

    try {
        const review = await Review.findOne({
            where: { reviewId }
        })

        if (!review) return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.`})

        // 좋아요 내역 확인
        const existLike = await Like.findOne({ where : { memberId, reviewId }});
        if (existLike) {
            // return res.status(400).json({ message : `이미 좋아요를 눌렀습니다. `});

            // 좋아요 있으면 취소
            await Like.destroy({ where : { memberId, reviewId }});
            review.likeCount -= 1;
            await review.save();

            return res.status(200).json({ message : `좋아요가 취소 되었습니다.`, review });

        }

        // 좋아요 증가
        await Like.create({ memberId, reviewId });
        review.likeCount += 1;
        await review.save();

        return res.status(200).json({ message : `좋아요가 추가 되었습니다.`, review });

    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: `좋아요가 추가 중 오류가 발생했습니다.` });
    }
}

// 신고
exports.reportReview = async (req, res) => {
    const memberId = req.memberId;
    const { reviewId } = req.body;

    try {
        const review = await Review.findOne({
            where: { reviewId }
        })

        if (!review) return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.`})
        // 신고 내역 확인
        const existReport = await Report.findOne({ where : { memberId, reviewId }});
        if (existReport) {
                        
            // 신고 있으면 취소
            await Report.destroy({ where : { memberId, reviewId }});
            review.reportCount -= 1;
            await review.save();

            return res.status(200).json({ message : `신고가 취소 되었습니다.`, review });
        }
        
        // 신고 증가
        await Report.create({ memberId, reviewId });
        review.reportCount += 1;
        await review.save();
        return res.status(200).json({ message : `신고가 추가 되었습니다.`, review });
        
    } catch (error) {
        console.log(`Error : ${error.message}`);
        return res.status(500).json({ message: `신고 추가 중 오류가 발생했습니다.` });
    }
}
// // 특정 리뷰 삭제
// exports.deleteReview = async (req, res) => {
    
//     const { reviewId } = req.params;
//     const memberId = req.memberId;
//     const isAdmin = req.isAdmin;
//     try {
//         const review = await Review.findOne({
//             where: { reviewId }
//         })

//         if (!review) return res.status(404).json({ message: `리뷰를 찾을 수 없습니다.`})

//         // 리뷰 작성자가 현재 사용자와 일치하거나 ADMIN인지 확인
//         if (review.memberId !== memberId && !isAdmin) {
//             console.log(`권한이 없습니다.`);
//             return res.status(403).json({ message: `유효하지 않은 접근입니다.` });
//         }

//         // 삭제 할 영화 리뷰 평점
//         const deleteMovieRating = review.reviewMovieRating;

//         await review.destroy();

//         // 영화의 리뷰 평균 평점 업데이트
//         const movie = await Movie.findOne({ where: { movieId: review.movieId } });
//         const currentAvgRating = movie.avgRating;
//         const totalReviews = await Review.count({ where: { movieId: review.movieId } });

//         // 리뷰 삭제 후 남은 리뷰가 있다면 다시 계산, 없으면 0으로 처리
//         const newAvgRating = totalReviews > 0 ? ((currentAvgRating * (totalReviews + 1)) - deleteMovieRating) / totalReviews : 0;

//         await Movie.update({ avgRating: newAvgRating }, { where: { movieId: review.movieId } });

//         return res.status(200).json({ message: `리뷰가 삭제되었습니다.`})

//     } catch (error) {
//         console.log(`Error : ${error.message}`);
//         return res.status(500).json({ message: `리뷰 삭제 중 오류가 발생했습니다.` });
//     }
// }




