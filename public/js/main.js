
//first slide

async function fetchTopReviews(limit = 3) {
  try {
      const response = await axios.get(`/review/getTopReviews/${limit}`);
      return response.data;
  } catch (error) {
      console.error("Error fetching top reviews:", error);
      return [];
  }
}

// to check the data we got
async function logTopReviews() {
  const reviews = await fetchTopReviews();
  console.log("Fetched Reviews:", reviews);
}
logTopReviews();

async function initializeSwiper() {
  const reviews = await fetchTopReviews();

  const swiperWrapper = document.querySelector('.swiper-wrapper');
  
  reviews.forEach(review => {
      const slide = document.createElement('div');
      slide.classList.add('swiper-slide');

      const img = document.createElement('img');
      img.src = review.Movie.posterUrl;
      img.alt = review.title;
      img.classList.add('firstSlide-image');
      img.id = review.movieId;

      const textContainer = document.createElement('div');
      textContainer.classList.add('firstSlide-text-container');

      const content = document.createElement('p')
      content.textContent = review.content;
      content.classList.add('firstSlide-text')
      
      textContainer.appendChild(content)
      slide.appendChild(img);
      slide.appendChild(textContainer);

      swiperWrapper.appendChild(slide);

      img.addEventListener("click", (e) => {
        let targetE =e.target;
        const movieId = e.target.id;
        if (movieId) {
          sendMovieIdToBackend(movieId); // Send movie ID to backend
          window.location.href = `/movie/movieInfo/${(movieId)}`;
        } else {
          console.error("No movieId for this movie", movieData);
        }
      });
    

  });

  const swiper = new Swiper('.first-swiper', {
      // Optional parameters
      loop: true,
      pagination: {
          el: '.swiper-pagination',
      },
      navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
      },
      scrollbar: {
          el: '.swiper-scrollbar',
      },
  });
}

document.addEventListener('DOMContentLoaded', initializeSwiper);


// modal
const loginBtn = document.querySelector("#openLoginModal");
const navList = document.querySelector("nav ul");
const modal = document.querySelector(".loginModal");
const overlay = document.querySelector(".overlay");

function openLoginModal() {
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
}


//movie slider
function shuffleArraysInSync(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    throw new Error('Arrays must have the same length');
  }

  for (let i = arr1.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // Swap elements in both arrays
    [arr1[i], arr1[j]] = [arr1[j], arr1[i]];
    [arr2[i], arr2[j]] = [arr2[j], arr2[i]];
  }
}

// Function to create sections with shuffled genres and section classes
async function createSection() {
  const genres = ['액션', '코메디','드라마','판타지','SF','어드벤처'];
  const sectionClasses = ['action-section', 'comedy-section', 'drama-section','fantasy-section', 'sf-section','adventure-section'];

  shuffleArraysInSync(genres, sectionClasses);

  const sections = document.querySelectorAll('.second-swiper');


  sections.forEach(async(section, index) => {
    const genre = genres[index];
    const sectionClass = sectionClasses[index];
    let moviesFromBackend;
    section.innerHTML = ''; // Clear existing content

    // Set the genre as the section title (h3 element)
    const h3 = document.createElement('h3');
    h3.textContent = genre;
    section.appendChild(h3);
    // Fetch movies by genre and populate swiper slides
    const result = await axios({
      method : 'get',
      url : `/movie/genreList/${genre}`,
    }).then((res)=>{
      moviesFromBackend = res.data.data;
    })
    const swiperWrapper = document.createElement('div');
    swiperWrapper.classList.add('swiper-wrapper');
    await moviesFromBackend.forEach((movie) => {
      const posterUrls = movie.posterUrl
      dynamicSlides(posterUrls, sectionClass, movie, swiperWrapper);
      });
    
    section.appendChild(swiperWrapper);

    const prevButton = document.createElement('div');
    prevButton.classList.add('swiper-button-prev');
    section.appendChild(prevButton);

    const nextButton = document.createElement('div');
    nextButton.classList.add('swiper-button-next');
    section.appendChild(nextButton);

    new Swiper(section, {
      slidesPerView: 3,
      spaceBetween: 0,

      // Responsive breakpoints
      // 화면 크기가 500px 이상이면 아래처럼 설정된다.
      breakpoints: {
        500: {
          slidesPerView: 6,
          spaceBetween: 0,
        }
      },
      loop: true,
      navigation: {
        nextEl: section.querySelector('.swiper-button-next'),
        prevEl: section.querySelector('.swiper-button-prev'),
      },
    });


  }); 

  
}

async function fetchMoviesByGenre(genre){
  try {
    const response = await axios.get(`/movie/genreList/${(genre)}`)
    return response.data.movies;
  }catch(error){
    console.error(error)
    throw error
  }
}
async function sendMovieIdToBackend(movieId) {
  try {
    const response = await axios.get(
      `/movie/movieInfo/${(movieId)}`
    );
    // console.log("Movie ID sent to backend successfully", response.data);
  } catch (error) {
    console.error("Error sending movie ID to backend", error);
  }
}


function dynamicSlides(url, sectionClass, movieData, swiperWrapper) {
  const swiperSlide = document.createElement('div');
  swiperSlide.classList.add('swiper-slide');

  const cardContainer = document.createElement('div');
  cardContainer.classList.add('card-container');

  const cardContent = document.createElement('div');
  cardContent.classList.add('card-content');

  const image = document.createElement('img');
  image.src = url;
  image.alt = alt="포스터 이미지" 
  image.setAttribute('onerror',"this.onerror=null; this.src='/img/sample_poster.png';");
  image.id = movieData.movieId;
  
  cardContent.appendChild(image);
  cardContainer.appendChild(cardContent);
  swiperSlide.appendChild(cardContainer);
  swiperWrapper.appendChild(swiperSlide);

  image.addEventListener("click", (e) => {
    let targetE =e.target;
    const movieId = e.target.id;
    if (movieId) {
      sendMovieIdToBackend(movieId); // Send movie ID to backend
      window.location.href = `/movie/movieInfo/${(movieId)}`;
    } else {
      console.error("No movieId for this movie", movieData);
    }
  });

}

createSection();