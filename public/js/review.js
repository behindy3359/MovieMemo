// (영화)상세 페이지  viewMovieDetails()
//리뷰 등록
// 리뷰 등록 버튼 postReview()
let nowPage = 1;

const targerE = document.querySelector(".info_container");
const targerId = targerE.id;

// 리뷰 모달 버튼
const createReview = document.querySelector(".createReviewBtn");
const buttonClose = document.querySelector(".buttonClose");
const rvmodal = document.querySelector(".movie_review_modal_bg");

async function getUserNickname() {
  try {
    let result = {};
    await axios
      .get("/member/nickname", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => {
        result = res.data;
      });

    return result;
  } catch (error) {
    // console.error("사용자 닉네임을 가져오는 중 오류 발생:", error);
    return "";
  }
}

createReview.addEventListener("click", async () => {
  let checkUser = await getUserNickname();
  if (!checkUser) {
    return alert("로그인이 필요합니다.");
  }

  rvmodal.classList.remove("hidden");
  rvmodal.classList.add("visible");
});

buttonClose.addEventListener("click", () => {
  rvmodal.classList.add("hidden");
  rvmodal.classList.remove("visible");
});

// 영화 제목
const movieTitle = document.querySelector(".movie_title > .contents_title");

// 영화 포스터
const moviePoster = document.querySelector(".poster_box");

// 영화 줄거리
const moviePlot = document.querySelector(".story_box > .story_text");

// 출연 배우들
const actors = document.querySelector(".cast_list");

// 개봉일
const releaseDate = document.querySelector(".release_date");

// 영화 감독
const director = document.querySelector(".director");

// 영화 장르
const movieGenre = document.querySelector(".genre");

// 영화 예고편
const trailerMovie = document.querySelector(".trailer_box");

// 좋아요 버튼 누를 시 요청

const likeBtn = document.querySelector(".likeBtn");

// UI 업데이트를 위한 함수
function updateLikeCount(likeCount) {
  const likeCountDisplay = document.querySelector(".likeCount");
  likeCountDisplay.textContent = likeCount; // 좋아요 수 업데이트
}

// 리뷰 작성 버튼

function getRating() {
  // name이 'rating'인 모든 라디오 버튼을 선택합니다.
  const ratingInputs = document.querySelectorAll('input[name="rating"]');

  // 선택된 라디오 버튼을 찾습니다.
  for (const input of ratingInputs) {
    if (input.checked) {
      return input.value; // 선택된 라디오 버튼의 값을 반환합니다.
    }
  }

  // 선택된 라디오 버튼이 없는 경우
  return null;
}

document
  .querySelector(".reviewSubBtn")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    let memberInfo = await getUserNickname();

    const typeOfMethod = document.querySelector(".reviewSubBtn").textContent;
    const RVRating = getRating();
    let reviewId;
    const reviewPost = document.getElementById("reviewPost").value;
    let userNick = memberInfo.nickname;
    let userId = memberInfo.userId;

    if (!RVRating) {
      alert("리뷰에 등록할 평점을 입력해주세요");
    } else if (!reviewPost) {
      alert("리뷰 내용을 작성하세요");
    } else {
      try {
        const response =
          typeOfMethod === "제출"
            ? await axios.post(
                "/review",
                {
                  reviewMovieRating: RVRating,
                  content: reviewPost,
                  memberId: userId,
                  movieId: targerId,
                },
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                  },
                }
              )
            : (reviewId =
                document
                  .querySelector(".rating_btn")
                  .getAttribute("id")
                  .replace("rvid", "") || 1);

        document.querySelector("#reviewForm").reset();
        window.location.href = window.location.href;

        await axios.patch(
          `/review/${reviewId}`,
          {
            reviewMovieRating: RVRating,
            content: reviewPost,
            memberId: userId,
            movieId: targerId,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        // document.getElementById('responseMessage').innerText = response.data.message;\
      } catch (err) {
        console.error(err);
      }
    }
  });

const moreBtn = document.querySelector(".load_more");

document.addEventListener("DOMContentLoaded", async () => {
  let data;
  const reviewSc = document.querySelector(".review_section");
  const loadMoreBtn = document.querySelector(".load_more");

  try {
    const response = await axios.get(`/review/movie/${targerId}`);
    data = response.data || {};
    console.log("data>>>>>>>>>>>", data);
  } catch (err) {
    console.error("Error fetching review data:", err);
    data = {};
  }

  const totalReviews = data.totalReviews || 0;

  if (totalReviews === 0) {
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    const noReviewsMsg = `<span class="no_reviews">작성된 리뷰가 없습니다.</span>`;
    reviewSc.insertAdjacentHTML("beforeend", noReviewsMsg);
    return;
  }

  if (totalReviews < 7 && loadMoreBtn) {
    loadMoreBtn.style.display = "none";
  }

  if (data.reviews && Array.isArray(data.reviews)) {
    for (const review of data.reviews) {
      const userInfo = await getUserNickname();
      const usernick = userInfo.nickname;
      let checkReport = review.reportedUsers.some(
        (user) => user.nick === usernick
      );
      let checkLike = review.likedUsers.some((user) => user.nick === usernick);

      let reportElement = `<div class='review-icon review-icon-report-empty' id='rpBtn${review.reviewId}'></div>`;
      let likeElement = `<div class='review-icon review-icon-like-empty' id='lkBtn${review.reviewId}'></div>`;

      if (checkLike) {
        likeElement = `<div class='review-icon review-icon-like-full' id='lkBtn${review.reviewId}'></div>`;
      }
      if (checkReport) {
        reportElement = `<div class='review-icon review-icon-report-full' id='rpBtn${review.reviewId}'></div>`;
      }

      let reviewHtml;
      usernick === review.Member.nick
        ? (reviewHtml = `<div class="review_box">
            <div class="review_user">
              <div class="user_rating">
                <span class="user_nickname">${review.Member.nick}</span>
                <span> <i class="rating__star far fa-star"></i> : ${
                  review.reviewMovieRating
                }</span>
              </div>
              <div class="likeBox">
                <div class='review-icon review-icon-like-full'></div>
                <p class="likeCount">${review.likeCount}</p>
              </div>
              <button type="button" class="editBtn" id="editBtn${
                review.reviewId
              }">
                <span class="material-symbols-rounded">
                  edit
                </span>
              </button>
            </div>
            <div class="review_content">
              <p>${review.content}</p>
            </div>
            <div class="review_date">
              <span class="write_date">${review.createdAt.substr(0, 10)}</span>
    
              <p class="review_btns_box">
                <button type="button" class="deleteBtn" id="deleteBtn${
                  review.reviewId
                }" data-review-id="123">
                  <span class="material-symbols-rounded">
                    delete
                  </span>
                </button>
                </p>
            </div>`)
        : (reviewHtml = `<div class="review_box">
            <div class="review_user">
              <div class="user_rating">
                <span class="user_nickname">${review.Member.nick}</span>
                <span> <i class="rating__star far fa-star"></i> : ${
                  review.reviewMovieRating
                }</span>
              </div>
              <div class="likeBox">
                <button type="button" class="likeBtn" id="likeBtn${
                  review.reviewId
                }">
                  ${likeElement}
                </button>
                <p class="likeCount" id='lkCount${review.reviewId}'>${
            review.likeCount
          }</p>
              </div>
            </div>
            <div class="review_content">
              <p>
              ${review.content}
              </p>
            </div>
            <div class="review_date">
              <span class="write_date">${review.createdAt.substr(0, 10)}</span>
              <p class="review_btns_box">
                <button type="button" class="warningBtn" id="warningBtn${
                  review.reviewId
                }">
                  ${reportElement}
                </button>
              </p>
            </div>`);
      reviewSc.insertAdjacentHTML("beforeend", reviewHtml);
    }
  }
});

// document.addEventListener("DOMContentLoaded", async () => {
//   let data;
//   const reviewSc = document.querySelector(".review_section");

//   await axios({
//     method: "get",
//     url: `/review/movie/${targerId}`,
//   }).then((res) => {
//     data = res.data || '';
//     console.log('data>>>>>>>>>>>',data);
//   }).catch((err)=>{

//   });
//   if (!data.totalReviews || data.totalReviews < 7 ) {
//     document.querySelector(".load_more").style.display = "none";
//   }

//   if(!data.totalReviews){
//     document.querySelector('load_more').display='none';
//     let replaceHTML = `<span class="load_more"> 작성된 리뷰가 없습니다. </span>`;
//     reviewSc.insertAdjacentHTML("beforeend", replaceHTML);

//     return null
//   }

//   data.reviews.forEach(async (review) => {
//     let userInfo = await getUserNickname();
//     let usernick = await userInfo.nickname;

//     });
// });

moreBtn.addEventListener("click", async () => {
  nowPage = nowPage + 1;
  let pagedata;

  await axios({
    method: "get",
    url: `/review/movie/${targerId}`,
    params: {
      page: nowPage,
    },
  }).then((res) => {
    pagedata = res.data;
  });

  if (pagedata.totalReviews - 6 * (nowPage - 1) < 7) {
    document.querySelector(".load_more").style.display = "none";
  }

  pagedata.reviews.forEach(async (review) => {
    let userInfo = await getUserNickname();
    let usernick = await userInfo.nickname;

    let checkReport = review.reportedUsers.some(
      (user) => user.nick === usernick
    );
    let checkLike = review.likedUsers.some((user) => user.nick === usernick);

    let reportElement = `<div class='review-icon review-icon-report-empty' id='rpBtn${review.reviewId}'></div>`;
    let likeElement = `<div class='review-icon review-icon-like-empty' id='lkBtn${review.reviewId}'></div>`;

    if (checkLike) {
      likeElement = `<div class='review-icon review-icon-like-full' id='lkBtn${review.reviewId}'></div>`;
    }
    if (checkReport) {
      reportElement = `<div class='review-icon review-icon-report-full' id='rpBtn${review.reviewId}'></div>`;
    }
    console.log("checkLike>>>>>>>>>>>>>>>", checkLike);
    console.log("checkReport>>>>>>>>>>>>>>>", checkReport);

    let reviewHtml;
    usernick === review.Member.nick
      ? (reviewHtml = `<div class="review_box">
        <div class="review_user">
          <div class="user_rating">
            <span class="user_nickname">${review.Member.nick}</span>
            <span> <i class="rating__star far fa-star"></i> : ${
              review.reviewMovieRating
            }</span>
          </div>
          <div class="likeBox">
            <div class='review-icon review-icon-like-full'></div>
            <p class="likeCount">${review.likeCount}</p>
          </div>
          <button type="button" class="editBtn" id="editBtn${review.reviewId}">
            <span class="material-symbols-rounded">
              edit
            </span>
          </button>
        </div>
        <div class="review_content">
          <p>${review.content}</p>
        </div>
        <div class="review_date">
          <span class="write_date">${review.createdAt.substr(0, 10)}</span>

          <p class="review_btns_box">
            <button type="button" class="deleteBtn" id="deleteBtn${
              review.reviewId
            }" data-review-id="123">
              <span class="material-symbols-rounded">
                delete
              </span>
            </button>
            </p>
        </div>`)
      : (reviewHtml = `<div class="review_box">
        <div class="review_user">
          <div class="user_rating">
            <span class="user_nickname">${review.Member.nick}</span>
            <span> <i class="rating__star far fa-star"></i> : ${
              review.reviewMovieRating
            }</span>
          </div>
          <div class="likeBox">
            <button type="button" class="likeBtn" id="likeBtn${
              review.reviewId
            }">
              ${likeElement}
            </button>
            <p class="likeCount" id='lkCount${review.reviewId}'>${
          review.likeCount
        }</p>
          </div>
        </div>
        <div class="review_content">
          <p>
          ${review.content}
          </p>
        </div>
        <div class="review_date">
          <span class="write_date">${review.createdAt.substr(0, 10)}</span>
          <p class="review_btns_box">
            <button type="button" class="warningBtn" id="warningBtn${
              review.reviewId
            }">
              ${reportElement}
            </button>
          </p>
        </div>`);

    const reviewSc = document.querySelector(".review_section");
    reviewSc.insertAdjacentHTML("beforeend", reviewHtml);
  });
});

document
  .querySelector(".review_section")
  .addEventListener("click", async function (e) {
    // 삭제 버튼 클릭 처리
    if (e.target.closest(".deleteBtn")) {
      const reviewId = e.target
        .closest(".deleteBtn")
        .getAttribute("id")
        .replace("deleteBtn", "");
      await axios({
        method: "delete",
        url: `/review/${reviewId}`,
        data: {},
      }).then((res) => {
        window.location.href = `/movie/movieInfo/${targerId}`;
      });
      await alert("리뷰가 삭제되었습니다.");
    }

    // 신고 버튼 클릭 처리
    if (e.target.closest(".warningBtn")) {
      const reviewId = e.target
        .closest(".warningBtn")
        .id.replace("warningBtn", "");

      await axios({
        method: "post",
        url: `/review/report`,
        data: {
          reviewId: reviewId,
        },
      }).then((res) => {
        if (
          document
            .querySelector(`#rpBtn${reviewId}`)
            .classList.contains("review-icon-report-full")
        ) {
          document
            .querySelector(`#rpBtn${reviewId}`)
            .classList.add("review-icon-report-empty");
          document
            .querySelector(`#rpBtn${reviewId}`)
            .classList.remove("review-icon-report-full");
        } else {
          document
            .querySelector(`#rpBtn${reviewId}`)
            .classList.add("review-icon-report-full");
          document
            .querySelector(`#rpBtn${reviewId}`)
            .classList.remove("review-icon-report-empty");
        }
      });
    }

    if (e.target.closest(".likeBtn")) {
      const reviewId = e.target.closest(".likeBtn").id.replace("likeBtn", "");

      await axios({
        method: "post",
        url: `/review/like`,
        data: {
          reviewId: reviewId,
        },
      }).then((res) => {
        if (
          document
            .querySelector(`#lkBtn${reviewId}`)
            .classList.contains("review-icon-like-full")
        ) {
          document
            .querySelector(`#lkBtn${reviewId}`)
            .classList.add("review-icon-like-empty");
          document
            .querySelector(`#lkBtn${reviewId}`)
            .classList.remove("review-icon-like-full");
          document.querySelector(`#lkCount${reviewId}`).textContent =
            parseInt(
              document.querySelector(`#lkCount${reviewId}`).textContent
            ) - 1;
        } else {
          document
            .querySelector(`#lkBtn${reviewId}`)
            .classList.add("review-icon-like-full");
          document
            .querySelector(`#lkBtn${reviewId}`)
            .classList.remove("review-icon-like-empty");
          document.querySelector(`#lkCount${reviewId}`).textContent =
            parseInt(
              document.querySelector(`#lkCount${reviewId}`).textContent
            ) + 1;
        }
      });
    }

    if (e.target.closest(".editBtn")) {
      const reviewId = e.target.closest(".editBtn").id.replace("editBtn", "");
      console.log("수정 버튼 클릭됨, 리뷰 ID:", reviewId);
      let reviewdata;
      await axios({
        method: "get",
        url: `/review/${reviewId}`,
      }).then((res) => {
        reviewdata = res.data;

        const radioButton = document.getElementById(
          `rating${res.data.reviewMovieRating}`
        );
        radioButton.checked = true;
        document.querySelector("#reviewPost").value = res.data.content;
        document.querySelector(".reviewSubBtn").textContent = "수정";
        document
          .querySelector(".rating_btn")
          .setAttribute("id", `rvid${reviewId}`);
      });
      await e.target.closest(".editBtn").addEventListener("click", () => {
        rvmodal.classList.remove("hidden");
        rvmodal.classList.add("visible");
      });
    }
  });

//release date

document.addEventListener("DOMContentLoaded", () => {
  const releaseBox = document.querySelector(".releaseBox");
  const typeOfMethod = document.querySelector(".reviewSubBtn").textContent;
  const releaseDateStr = releaseBox.getAttribute("data-release-date");
  let formattedDate;
  let releaseDate;

  if (releaseDateStr) {
    releaseDate = new Date(
      releaseDateStr.substring(0, 4), // Year
      releaseDateStr.substring(4, 6) - 1, // Month (0-based index)
      releaseDateStr.substring(6, 9) // Day
    );
    // yyyy-mm-dd
    formattedDate = releaseDate.toISOString().slice(0, 10);
  } else {
    releaseDate = "개봉일자를 알 수 없습니다. ";
    formattedDate = releaseDate;
  }
  document.getElementById("releaseDate").innerText = formattedDate;
});

//트레일러 컨트롤러 등장
document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("trailer");

  let controlsTimeout;

  const showControls = () => {
    video.controls = true;
  };

  video.addEventListener("mousemove", showControls);

  video.addEventListener("play", showControls);

  video.addEventListener("pause", showControls);
});
