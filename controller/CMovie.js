const db = require('../model/index');
const { requestAPI, manufactureAPI } = require('../utils/apiHandler');
const { Op } = require('sequelize'); // sequelize Operator(연산자)

/** 
 *  정보를 DB에 추가하는 공통 기능을 함수로 분리,
 *  data 에 담겨야할 정보들 : ( 포스터,  제목,  vod,  줄거리, 개봉일 ,출연진, 판매액, 평점 ) 추후 추가 가능
 *  이 함수의 사용전후엔 트랜잭션이 필요해요오
 *  genres, 는 다른 테이블에 담길 것이므로, 미리 분리해둠.
 *  t 는 트랜지션 객체
 * 
*/
const insertToDb = async (data, genres, t) => {
  try {
    const movie = await db.Movie.create({
      posterUrl: data.posterUrl,
      movieTitle: data.movieTitle,
      vodUrl: data.vodUrl,
      movieSynopsys: data.movieSynopsys,
      movieCast: data.movieCast,
      moviereleaseDate: data.moviereleaseDate,
      movie_salesAcc: data.movie_salesAcc,
      directorNm: data.directorNm,
      reviewMovieRating: data.reviewMovieRating || 0,
    
    }, { transaction: t });
    // 장르는 중복값은 필요없고 새로 발견된 녀석들만 저장하려고 함.
    for (const genreName of genres) {
      let [genre] = await db.Genre.findOrCreate({ // 찾거나 없으면 새로 생성하기!
        where: { genreType: genreName },
        defaults: { genreType: genreName },
        transaction: t
      });

      await db.MovieGenre.create({
        movieId: movie.movieId,
        genreId: genre.genreId
      }, { transaction: t });
    }

    return movie;
  } catch (error) {
    console.error('DB 저장 중 오류 발생 controller/CMovie/insertToDb:', error);
    throw error;
  }
};
/**
 * 사이에 공백이 존재하는 검색어를 처리하기 위한 함수 
 */
function searchWordFunc(searchTerm) {
  // 문자열 앞뒤의 공백을 제거하고, 연속된 공백을 하나의 공백으로 변경
  const step1 = searchTerm.trim().replace(/\s+/g, ' ');
  // 공백을 기준으로 단어들을 분리
  const step2 = step1.split(' ');
  // 각 단어 사이에 '%'를 삽입하고, 전체 문자열의 앞뒤에도 '%' 추가
  const result = '%' + step2.join('%') + '%'; 
  return result;
}
/**
 * 에러처리 함수. 상태코드 400, 404, 500에 대응
 * 
 */
const errorHandler = (statusCode, res, msg) => {
  switch (statusCode) {
    case 400:
      console.error('잘못된 요청:', msg);
      res.status(statusCode).render('404',{ message: msg || '잘못된 요청입니다.' });
      break;
    case 404:
      console.error('오류 발생:', msg);
      res.status(statusCode).render('404',{ message: msg || '존재하지 않는 페이지 입니다.' });
      break;
    case 500:
      console.error('서버 오류 발생:', msg);
      res.status(statusCode).render('404',{ message: msg || '서버 오류가 발생했습니다.' });
      break;
    default:
      console.error('알 수 없는 오류 발생:', msg);
      res.status(500).render('404',{ message: '알 수 없는 오류가 발생했습니다.' });
      break;
  }
};

/**
 * movies 객체를 page 안에 moviesInpage 숫자만큼 나눠서 저장하기 위한함수
 * 
*/
const pagingMovie = (movies) => {
  const totalMovie = movies.length; // 객체의 총 길이
  const moviesInPage = 10; // 한 페이지당 저장될 객체의 데이터 수
  let book = {};
  
  for (let i = 0; i < Math.ceil(totalMovie / moviesInPage); i++) {
    let page = [];  
    let nowIndex = i * moviesInPage;
    
    for (let j = nowIndex; j < Math.min(nowIndex + moviesInPage, totalMovie); j++) {
      page.push(movies[j]);
    }
    book[`page${i+1}`] = page;
  }
  return book;
}

/**
 *  검색을 통한 영화 목록 조회를 통합
 * 
 *  제목을 통한 요청 url router.get('/searchT/:movieTitle', controller.getMovieBySearch);
 *  배우를 통한 요청 url router.get('/searchA/:movieActor', controller.getMovieBySearch);
 *   
 *    요청을 받았을때
 *   1) DB에 해당 영화 검색 결과와 일치하거나 유사한 영화 데이터가 존재하는지 확인
 *   2) DB에 영화 정보가 없는 경우 API 에 영화 정보 요청 후 저장 DB에 영화 정보 저장
 *   3) 정보가 성공적으로 저장된 후 , 트랜잭션 종료, 재검색 후 결과를 반환
 *   
 *   API 호출 후 데이터베이스에 저장하는 작업이 동반되는 경우 함수의 시작부터 종료까지 3초 이상 걸릴 수도 있었음.
 *   성공적 호출시 응답 res.status(200).render('searchResult',movie);
 * 
 *  아직 제목, 배우 두가지 방식으로만 검색을 받기 때문에 삼항연산자를 사용해서 구분
 */
exports.getMovieBySearch = async (req, res) => {
  const urlParts = req.url.split('/'); 
  const searchType = urlParts[1]; // searchT 또는 searchA 가 담길 예정
  let reqPage = parseInt(req.query.nowPage) || 0;
  console.log('reqpage>>>>>>>>>>>>',reqPage);
  console.time('getMovieList'); // 함수의 성능 측정을 위한 타이머
  try {
    const searchWord = searchType==='searchA'? req.params.movieActor: req.params.movieTitle;
    if (!searchWord || searchWord.trim() === '') {    //빈 문자열을 입력한 경우를 걸러냄   
      console.timeEnd('getMovieList');
      return errorHandler(400, res, '배우 이름이 누락되었습니다.');
    }
    let searchWordMF = searchWordFunc(searchWord);
    // DB에서 영화 목록 을 확인
    let movies = searchType === 'searchA'
    ? await db.Movie.findAll({
        where: {
          movieCast: {
            [Op.like]: `${searchWordMF}`// [Op.like]: %${searchWord.trim()}%는 SQL의 like 검색을 위한 부분, searchWord.trim() 이 포함된 모든 값을 검색
          }
        },
        include: [{ model: db.Genre, through: { attributes: [] } }] //관계 중간 테이블의 속성과 값은 가져오지 않음
      })
    : await db.Movie.findAll({
        where: {
          movieTitle: {
            [Op.like]: `${searchWordMF}` // [Op.like]: %${searchWord.trim()}%는 SQL의 like 검색을 위한 부분, searchWord.trim() 이 포함된 모든 값을 검색
          }
        },
        include: [{ model: db.Genre, through: { attributes: [] } }] //관계 중간 테이블의 속성과 값은 가져오지 않음
      });
    ;
    
    // 검색 결과가 없는 경우에만 API 호출
    if (!movies || movies.length < 5) {
      const movieDataList = await requestAPI( searchType, searchWord ); // utils/apiHandler.js 의 api 요청함수
      if (!movieDataList || movieDataList.length === 0) { // API검색 결과가 모두 없는 경우를 걸러냄
        console.timeEnd('getMovieList');
        return errorHandler(404, res, 'API에 일치하거나 유사한 제목을 가진 영화가 존재하지 않습니다.');
      }

      const dataToInsert = manufactureAPI( searchType, movieDataList);  // utils/apiHandler.js 의 데이터 가공함수 성공적으로 여기까지 도달했으면 여러 객체가 담겨있을것, 제목 또는 배우 이름을 을 통해 검색, 가공함수에 검색어의 종류를 알리고, 데이터를 보내 가공함


      // 트랜잭션 시작
      const t = await db.sequelize.transaction();

      try {
        for (const movieData of dataToInsert) {
          const genres = movieData.genre.split(',').map(g => g.trim());// 장르는 여러 문자열 공포,코미디,멜로 처럼 하나의 문자열로 응답받았기 때문에 ,를 기준으로 잘라서 객체화함

          // 중복 체크, 하나씩 확인해서 DB에 같은 이름의 영화가 이미 존재하면 입력하지 않음
          const existingMovie = await db.Movie.findOne({
            where: { movieTitle: movieData.movieTitle },
            transaction: t
          });

          if (!existingMovie) {
            await insertToDb(movieData, genres, t); //파일 상단에 위치한 DB 에 입력하는 함수. 
          }
        }

        // 트랜잭션 종료 DB 입력, 수정, 삭제 하는 작업은 모두 종료되었음
        await t.commit();
        
        // 저장된 영화 정보 다시 조회, 함수의 응답 형식을 일정하게 하기 위해서, DB 에서 재검색 후 반환할 것
        movies = searchType ==='searchA'
        ? await db.Movie.findAll({
            where: {
              movieCast: {
                [Op.like]: `${searchWordMF}`
              }
            },
            include: [{ model: db.Genre, through: { attributes: [] } }],
          })
        : await db.Movie.findAll({ 
            where: {
              movieTitle: {
                [Op.like]: `${searchWordMF}`
              }
            },
            include: [{ model: db.Genre, through: { attributes: [] } }],
          });
        ;
      } catch (error) {
        // 오류 발생 시 롤백
        await t.rollback();// 트랜잭션의 경우 실패했기 때문에 다시 롤백, DB 의 일관성을 유지
        console.timeEnd('getMovieList');
        return errorHandler(500, res, '영화 정보 저장 중 오류가 발생했습니다.');
      }
    }
    let book = pagingMovie(movies);

    // console.log(book);
    console.timeEnd('getMovieList');// 여기까지 도달했으면 함수는 성공적으로 작동한 것, 의도하지 않은 작동의 확인 위해 다양한 검색을 시도해 볼것
    reqPage === 0 
    ? res.status(200).render('searchresult',{  // 상태코드 200 ! 성공적! 나의 작고 소중한 movies 객체를 반환한다.
        message: '1 영화 목록을 성공적으로 조회했습니다.',
        totalCount : movies.length,
        searchType,
        searchWord,
        data: book[`page${reqPage+1}`]
      })
    : res.status(200).send({
        message: '2 영화 목록을 성공적으로 조회했습니다.',
        totalCount : movies.length,
        searchType,
        searchWord,
        data: book[`page${reqPage+1}`]
      });
  } catch (err) {
    console.timeEnd('getMovieList');
    return errorHandler(500, res, err);
  }
};


/**
 * id 를 통해서 특정영화 한가지 불러오기 // url parameter 로 한가지 영화를 검색! 쉬움!
 */
exports.getMovieInfo = async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const result = await db.Movie.findOne({
      where: { movieId: movieId },
      include: [{
        model: db.Genre,
        through: { attributes: [] }
      }]
    });

    if (!result) {    
      return errorHandler(404, res, '삭제되거나 존재하지 않는 영화 데이터 입니다.');
    }

    const genres = result.Genres.map(genre => genre.genreType);
    
    let vodFileName;
    let filename;

    if(result.vodUrl){
      vodFileName = new URL(result.vodUrl);
      filename = vodFileName.searchParams.get('pFileNm');
    }
    console.log(filename);
    // 'pFileNm' 쿼리 파라미터 값 가져오기
    const movieData = {
      movieId: result.movieId,
      movieTitle: result.movieTitle,
      posterUrl: result.posterUrl,
      vodUrl: filename,
      reviewMovieRating: result.reviewMovieRating,
      movieSynopsys: result.movieSynopsys,
      moviereleaseDate: result.moviereleaseDate,
      directorNm: result.directorNm,
      movie_salesAcc: result.movie_salesAcc,
      movieCast: result.movieCast,
      genres: genres
    };

    res.status(200).render('review', {
      message: '영화 정보를 성공적으로 조회했습니다.',
      data: movieData
    });
  } catch (err) {
    errorHandler(500, res, err);
  }
}



/**
 *  특정 장르로 영화 리스트 불러오기
 *  요청 url : `/genreList/:genreId`
 *  성공적 처리 후 응답 res.status(200).json({ message: '영화 리스트를 성공적으로 불러왔습니다.', movies: movies });
 * 중간관계를 이어주는 테이블을 통해서 Movie 와 Genre 릴레이션을 연결하고, 검색받은 장르에 대해서 일치하거나 유사한 장르명을 가진 영화를 검색하고 반환함
*/
exports.getMovieType = async (req, res) => {
  try {
    const { genreType } = req.params;
    const movies = await db.Movie.findAll({ 
      where: {
        posterUrl: {
          [db.Sequelize.Op.ne]: '' 
        }
      },
      include: [{
        model: db.Genre,
        where: {
          genreType: {
            [db.Sequelize.Op.like]: `${genreType}`
          }
        },
        through: { attributes: [] }
      }],
      order: [
        ['reviewMovieRating', 'DESC']
      ]
    });
    if (movies.length === 0) {
      return errorHandler(404, res, '검색 결과가 없습니다.');
    }

    res.status(200).json({
      message: '영화 리스트를 성공적으로 불러왔습니다.',
      data: movies
    });

  } catch (err) {
    errorHandler(500, res, err);
  }
};

/**
 * 영화 정보 추가 생성( 관리자 권한일때 실행, session 체크 필요 ), 
 */
exports.postMovie = async (req, res) => {
  try {
    const { posterUrl, movieTitle, vodUrl, movieSynopsys, movieCast, genres, directorNm,moviereleaseDate, movie_salesAcc, reviewMovieRating } = req.body;
    
    if (!movieTitle) {
      return errorHandler(400, res, '필수 정보가 누락되었습니다.');
    }
    //트랜잭션 시작
    const t = await db.sequelize.transaction();

    const newMovie = await insertToDb({ posterUrl, movieTitle, vodUrl, movieSynopsys, directorNm, movieCast, moviereleaseDate, movie_salesAcc, reviewMovieRating }, genres, t);

    // 트랜잭션 종료
    await t.commit();

    const result = await db.Movie.findOne({
      where: { movieId: newMovie.movieId },
      include: [{ model: db.Genre, through: { attributes: [] } }]
    });

    res.status(201).json({
      message: '영화 정보가 성공적으로 추가되었습니다.',
      movie: result
    });
  } catch (err) {
    // 에러 발생 시 롤백
    await t.rollback();
    errorHandler(500, res, err);
  }
};

/**
 * 영화 정보 수정하기( 관리자 권한일떄 실행, session 체크 필요 )
 * 영화 제목을 입력받아 DB에서 검색 후 객체로 반환받고, 요청 에 담긴 정보를 업데이트
 *  성공적 처리 후 응답 res.status(200).json({ message: '영화 정보 수정 완료', movie: movie });
 * 
 */
exports.patchMovie = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { posterUrl, movieTitle, vodUrl, movieSynopsys, movieCast, genres, moviereleaseDate, directorNm, movie_salesAcc, reviewMovieRating } = req.body;

    if (!movieTitle) {
      return errorHandler(400, res, '필수 정보가 누락되었습니다.');
    }

    const movie = await db.Movie.findOne({
      where: { movieTitle },
      transaction: t
    });

    if (!movie) {
      return errorHandler(404, res, '해당 영화 정보를 찾을 수 없습니다.');
    }

    await movie.update({ posterUrl, vodUrl, movieSynopsys, movieCast, directorNm, moviereleaseDate, movie_salesAcc, reviewMovieRating }, { transaction: t });

    if (genres) {
      // 기존 장르 삭제
      await db.MovieGenre.destroy({
        where: { movieId: movie.movieId },
        transaction: t
      });

      // 새로운 장르 추가
      for (const genreName of genres) {
        let [genre] = await db.Genre.findOrCreate({
          where: { genreType: genreName },
          defaults: { genreType: genreName },
          transaction: t
        });

        await db.MovieGenre.create({
          movieId: movie.movieId,
          genreId: genre.genreId
        }, { transaction: t });
      }
    }

    // 트랜잭션 종료
    await t.commit();

    const result = await db.Movie.findOne({
      where: { movieId: movie.movieId },
      include: [{ model: db.Genre, through: { attributes: [] } }]
    });

    res.status(200).json({
      message: '영화 정보가 성공적으로 수정되었습니다.',
      movie: result
    });
  } catch (err) {
    // 에러 발생 시 롤백
    await t.rollback();
    errorHandler(500, res, err);
  }
};

/**
 * 영화 정보 삭제하기( 관리자 권한일떄 실행, session 체크 필요 )
 * 성공적 처리 후 응답 res.status(200).json({ message: '영화 정보 삭제 완료' });
 * 
 */
exports.deleteMovie = async (req, res) => {
  try {
    const { movieId } = req.body;
    
    if (!movieId) {
      return errorHandler(400, res, '필수 정보가 누락되었습니다.');
    }
    //트랜잭션 시작
    const t = await db.sequelize.transaction();    
    const movie = await db.Movie.findOne({ 
      where: { movieId },
      transaction: t 
    });
    
    if (!movie) {
      await t.rollback();
      return errorHandler(404, res, '해당 영화 정보를 찾을 수 없습니다.');
    }
    
    await db.MovieGenre.destroy({
      where: { movieId },
      transaction: t
    });

    await movie.destroy({ transaction: t });
    //트랜잭션 종료    
    await t.commit();
    
    res.status(200).json({ message: '영화 정보 삭제 완료' });
  } catch (err) {
    await t.rollback();
    errorHandler(500, res, err);
  }
};
