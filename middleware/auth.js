const jwt = require("jsonwebtoken");

//유저 인증 미들웨어
const authenticateUser = (req, res, next) => {
  const authorHeader = req.headers.authorization || req.session.token;
  if (!authorHeader) return res.status(401).json({ message: "유효하지 않은 접근입니다." });

  const token = authorHeader.split(" ")[1] || req.session.token;

  if (!token) {
    return res.status(401).json({ message: "유효하지 않은 접근입니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.memberId = decoded.memberId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    if (!res.headersSent) { // 이미 헤더가 전송된 경우를 체크
      res.status(401).json({ message: "유효하지 않은 접근입니다." });
    }
  }
};



//관리자 인증 미들웨어
const authenticateAdmin = (req, res, next) => {
  const authorHeader = req.headers.authorization|| req.session.token;
  if (!authorHeader) return res.status(401).json({ message: "유효하지 않은 접근입니다." });
  
  const token = authorHeader.split(" ")[1] || req.session.token;

  if (!token) {
    return res.status(401).json({ message: "유효하지 않은 접근입니다." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "유효하지 않은 접근입니다." });
    }
    req.memberId = decoded.memberId;
    req.isAdmin = decoded.isAdmin;
    next();
  } catch (err) {
    res.status(401).json({ message: "유효하지 않은 접근입니다." });
  }
};

module.exports = {
  authenticateUser,
  authenticateAdmin,
};
