let nowPage = 0;
let isLoading = false;
const moreBtn = document.querySelector('.show-next-page-btn');

function seemore() {
  if (isLoading) return; // 이미 로딩 중이면 함수 종료
  isLoading = true; // 로딩 시작
  const searchT = document.querySelector('.searchType').textContent;
  const searchW = document.querySelector('.searchWord').textContent;
  
  nowPage = nowPage + 1;
  axios({
    method: 'get',
    url: searchT === '배우' ? `/movie/searchA/${searchW}` : `/movie/searchT/${searchW}`,
    params: {
      nowPage: nowPage
    }
  }).then((res) => {
    if (res.data.data.length < 10) { moreBtn.style.display = 'none'; }
    res.data.data.forEach(movie => {
      const movieHtml = `
        <div class="search-result-wrapper" id="result${movie.movieId}">
          <div class="search-result-image">
            <img src="${movie.posterUrl}" alt="포스터 이미지" onerror="this.onerror=null; this.src='/img/sample_poster.png';">
          </div>
          <div class="search-result-content-box">
            <span class="search-result-content search-result-content-title">
              제목 : ${movie.movieTitle}
            </span>
            <span class="search-result-content search-result-content-dir">
              감독 : ${movie.directorNm}
            </span>
            <span class="search-result-content search-result-content-star">
              평점 : ${movie.reviewMovieRating}
            </span>
            <span class="search-result-content search-result-content-cast">
              배우 : ${movie.movieCast}
            </span>
          </div>
        </div>`;
      moreBtn.insertAdjacentHTML('beforebegin', movieHtml);
    });
    isLoading = false; // 로딩 완료
  }).catch((err) => {
    console.log('정보를 불러오는 중이거나 오류가 발생해 불러오기에 실패했습니다.');
    isLoading = false; // 로딩 실패 시에도 완료 상태로 변경
  });
};
function handleIntersection(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      seemore();
    }
  });
}

const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver(handleIntersection, options);

observer.observe(moreBtn);

// function updateMovieInfo(data) {
//   document.querySelector('.movie_title .contents_title').textContent = data.data.movieTitle;
//   document.querySelector('.director').textContent = data.data.directorNm;
//   document.querySelector('.genre').textContent = data.data.genre;
//   document.querySelector('.release_date').textContent = data.data.releaseDate;
//   document.querySelector('.story_box .content_text').textContent = data.data.plotText;
// }

document.querySelectorAll('.search-result-wrapper').forEach(function(wrapper) {
  wrapper.addEventListener('click', function(e) {
      let targetE = e.target;
      let reqId = '';
      while (targetE && !targetE.classList.contains('search-result-wrapper')) {
          targetE = targetE.parentElement;
          reqId= targetE.id.replace('result','');
      }
      if (targetE) {
        window.location.href = `/movie/movieInfo/${reqId}`
      }  
  });
});
