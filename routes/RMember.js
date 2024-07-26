const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const controller = require("../controller/CMember");
const { authenticateUser, authenticateAdmin } = require("../middleware/auth");

// 기본 요청 경로 localhost:PORT/member

// 로그인
router.post(
  "/login",
  [
    check("name").notEmpty().withMessage("이름을 입력해주세요."),
    check("password")
      .isLength({ min: 8 })
      .withMessage("비밀번호는 최소 8자 이상이어야 합니다.")
      .matches(/[0-9]/)
      .withMessage("비밀번호는 숫자를 포함해야 합니다.")
      .matches(/[a-z]/)
      .withMessage("비밀번호는 소문자를 포함해야 합니다.")
      .matches(/[A-Z]/)
      .withMessage("비밀번호는 대문자를 포함해야 합니다.")
      .matches(/[\W]/)
      .withMessage("비밀번호는 특수문자를 포함해야 합니다."),
  ],
  controller.loginMember
);

// Middleware for field-specific validation
const fieldValidations = (field) => {
  switch (field) {
    case 'name':
      return check('name').notEmpty().withMessage("이름을 입력해주세요.");
    case 'nick':
      return check('nick').notEmpty().withMessage("닉네임을 입력해주세요.");
    case 'email':
      return check('email')
        .isEmail().withMessage("올바른 이메일 양식을 지켜주세요.");
    case 'password':
      return [
        check('password')
          .isLength({ min: 8 }).withMessage("비밀번호는 최소 8자 이상이어야 합니다.")
          .matches(/[0-9]/).withMessage("비밀번호는 숫자를 포함해야 합니다.")
          .matches(/[a-z]/).withMessage("비밀번호는 소문자를 포함해야 합니다.")
          .matches(/[A-Z]/).withMessage("비밀번호는 대문자를 포함해야 합니다.")
          .matches(/[\W]/).withMessage("비밀번호는 특수문자를 포함해야 합니다.")
      ];
    default:
      return [];
  }
};


// Route for field-specific validation
router.post('/validate/:field', (req, res) => {
  const field = req.params.field;
  const validations = fieldValidations(field);

  validations.forEach(validation => validation.run(req));

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json({ errors: errors.array() });
  }

  res.json({ errors: [] });
});


// 회원가입
router.post(
  "/register",
  [
    check("name").notEmpty().withMessage("이름을 입력해주세요."),
    check("nick").notEmpty().withMessage("닉네임을 입력해주세요."),
    check("password")
      .isLength({ min: 8 })
      .withMessage("비밀번호는 최소 8자 이상이어야 합니다.")
      .matches(/[0-9]/)
      .withMessage("비밀번호는 숫자를 포함해야 합니다.")
      .matches(/[a-z]/)
      .withMessage("비밀번호는 소문자를 포함해야 합니다.")
      .matches(/[A-Z]/)
      .withMessage("비밀번호는 대문자를 포함해야 합니다.")
      .matches(/[\W]/)
      .withMessage("비밀번호는 특수문자를 포함해야 합니다."),
  ],
  controller.postMember
);

// 비밀번호 수정
router.patch(
  "/password",
  [
    authenticateUser,
    check("password")
      .isLength({ min: 8 })
      .withMessage("비밀번호는 최소 8자 이상이어야 합니다.")
      .matches(/[0-9]/)
      .withMessage("비밀번호는 숫자를 포함해야 합니다.")
      .matches(/[a-z]/)
      .withMessage("비밀번호는 소문자를 포함해야 합니다.")
      .matches(/[A-Z]/)
      .withMessage("비밀번호는 대문자를 포함해야 합니다.")
      .matches(/[\W]/)
      .withMessage("비밀번호는 특수문자를 포함해야 합니다."),
  ],
  controller.patchMember
);

// 회원 탈퇴
router.delete("/", authenticateUser, controller.deleteMember);

// 로그아웃
router.delete("/logout", authenticateUser, controller.logoutMember);

// 비밀번호 확인
router.post('/verifyPassword', authenticateUser, controller.verifyPassword);

// 회원 조회 (관리자)
router.get('/searchM', authenticateAdmin ,controller.getMembers);

router.get('/nickname', controller.getNicks);

// 회원 탈퇴
router.delete('/:memberId', authenticateAdmin, controller.deleteMemberAdmin);

module.exports = router;
