const express = require('express');
const router = express.Router();
const controller = require('../controller/CMovie');
const { authenticateUser, authenticateAdmin } = require("../middleware/auth");


// 기본 요청 경로 localhost:PORT/movie

// 영화 제목을 사용해 검색하기, 목록으로 반환
router.get('/searchT/:movieTitle', controller.getMovieBySearch);

// 배우 이름을 사용해 검색하기, 목록으로 반환
router.get('/searchA/:movieActor', controller.getMovieBySearch);

// 특정 장르로 영화 리스트 불러오기
router.get('/genreList/:genreType', controller.getMovieType);

// 영화 id로 특정 영화 하나의 정보 불러오기
router.get('/movieInfo/:movieId', controller.getMovieInfo);

// 영화에 리스트 요청하기 추후 박스오피스 기능에 사용할듯
// router.get('/movieList', controller.getMovieList);

//  관리자 권한이 필요한 요청들

// 영화 정보 추가 생성 (관리자 권한 필요)
router.post('/',  authenticateAdmin, controller.postMovie);

// 영화 정보 수정하기 (관리자 권한 필요)
router.patch('/',  authenticateAdmin, controller.patchMovie);

// 영화 정보 삭제하기 (관리자 권한 필요)
router.delete('/',  authenticateAdmin, controller.deleteMovie);

module.exports = router;