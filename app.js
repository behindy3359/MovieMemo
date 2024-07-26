const express = require("express");
const path = require('path');
const dotenv = require('dotenv');
const { routerMiddleware } = require("./middleware/routerMiddleware");
const db = require('./model/index');
const jwt = require("jsonwebtoken");

const envFile = process.env.NODE_ENV === 'server' ? '../.env.server' : '.env';

dotenv.config({
  path: path.resolve(__dirname, envFile),
});

const aaa = process.env.SESSION_SECRET;

const session = require("express-session");
const app = express();
const { sequelize } = require(`./model/index`);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 세션 미들웨어 설정
app.use(
  session({
    secret: aaa,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // HTTPS를 사용할 경우 true로 설정
  })
);

// process.env 객체를 통해 환경 변수에 접근
const port = process.env.PORT || 5000;

// 미들웨어 등록
app.use(`/static`, express.static(__dirname + `/public`));
app.use(`/css`, express.static(__dirname + `/public/css`));
app.use(`/js`, express.static(__dirname + `/public/js`));
app.use(`/img`, express.static(__dirname + `/public/img`));

//기본 요청주소 localhost:8000

app.get("/", (req, res) => {
  res.render("main");
});

// review render
app.get("/review", (req, res) => {
  res.render("review");
});


// 회원가입 경로
app.get("/register", (req, res) => {
  res.render("signup");
});

routerMiddleware(app);

// 404
app.get("*", (req, res) => {
  res.render("404");
});

sequelize
  // force : true ; 서버 실행할 때마다 테이블 재생성
  // force : false ; 서버 실행 시 테이블이 없으면 생성
  .sync({ force: false })
  .then(() => {
    app.listen(port, () => {
      console.log(`${port}에 연결됨`);
      console.log(`Database connection succeeded!`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
