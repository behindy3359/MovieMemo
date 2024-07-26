const express = require(`express`);
const router = express.Router();
const controller = require(`../controller/CReview`);
const { authenticateUser, authenticateAdmin } = require("../middleware/auth");


// 기본 요청 경로 localhost:PORT/review

// 리뷰 생성
router.post(`/`, authenticateUser, controller.postReview);

// 특정 리뷰 한개 조회
router.get(`/:reviewId`, controller.getReview);

// 좋아요 높은 리뷰 조회
router.get(`/getTopReviews/:limit`, controller.getTopReviews);

// 회원이 작성한 리뷰 목록
router.get(`/member/:memberId`, controller.getMemberReviewList);

// 영화에 작성된 리뷰 목록
router.get(`/movie/:movieId`, controller.getMovieReviewList);

// 특정 리뷰 내용 수정
router.patch(`/:reviewId`, authenticateUser, controller.patchReview);

// 특정 리뷰 내용 삭제
router.delete(`/:reviewId`, authenticateUser, controller.deleteReview);

// 좋아요
router.post('/like', authenticateUser, controller.likeReview);

// 신고
router.post('/report', authenticateUser, controller.reportReview);

module.exports = router;