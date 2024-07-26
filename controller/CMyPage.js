const { Review, Member, Movie, Like, Report } = require("../model");
const { getMemberReviewList } = require("../controller/CReview");
const { paginate, paginateResponse } = require("../utils/paginate");
const checkBadWords = require("../utils/badWordsFilter");
const { sort } = require("../utils/sort");
const { where } = require("sequelize");
const { query } = require("express");
const jwt = require("jsonwebtoken");

// 마이페이지 조회
exports.getMyPage = async (req, res) => {
  const memberId = req.memberId;
  const { sortBy = "popular", page = 1 } = req.query;

  console.log("Received memberId:", memberId);

  try {
    if (!memberId) {
      console.error("Invalid memberId");
      return res.status(400).json({ message: "Invalid memberId" }); // 잘못된 요청에 대한 응답
    }

    console.log("Executing query with memberId:", memberId);

    const member = await Member.findOne({
      where: { memberId },
      attributes: ["nick", "gender", "age"],
    });

    if (member) {
      console.log("Member details:", {
        nick: member.nick,
        gender: member.gender,
        age: member.age,
      });
    } else {
      console.error("Member not found");
    }

    if (!member) {
      return res.status(404).json({ message: "회원을 찾을 수 없습니다." }); // 회원을 찾을 수 없는 경우
    }

    req.query.sortBy = sortBy; // 정렬 순서 전달
    const reviewsData = await getMemberReviewList(req, res);

    if (reviewsData.error) {
      throw new Error("리뷰 조회중 에러가 발생했습니다.");
    }

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res
        .status(200)
        .json({ reviews: reviewsData.reviews, pagination: reviewsData });
    } else {
      return res
        .status(200)
        .render("mypage", {
          member,
          reviews: reviewsData.reviews,
          pagination: reviewsData,
        });
    }
  } catch (error) {
    console.error(`Error : ${error.message}`);
    if (!res.headersSent) {
      // 이미 헤더가 전송된 경우를 체크
      return res
        .status(500)
        .json({ message: "회원 조회 중 오류가 발생했습니다." });
    }
  }
};
