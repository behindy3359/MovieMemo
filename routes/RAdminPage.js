const express = require(`express`);
const router = express.Router();
const controller = require('../controller/CAdminPage');

const { authenticateAdmin } = require("../middleware/auth");


// 기본 요청 경로 localhost:PORT/adminPage
router.get('/', authenticateAdmin, controller.getAdminPage);


module.exports = router;