const express = require(`express`);
const router = express.Router();
const controller = require('../controller/CMyPage');

const { authenticateUser, authenticateAdmin } = require("../middleware/auth");


// 기본 요청 경로 localhost:PORT/myPage

router.get('/', authenticateUser, controller.getMyPage);


module.exports = router;