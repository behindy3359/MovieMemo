const axios = require('axios');
require('dotenv').config(); // dotenv모듈을 호출하고 루트경로에 있는 .env 를 참조함


// api 요청함수를 통합 현재는 두가지의 메소드밖에 존재하지 않고 이들을 통해서 검색을 받기 때문에 삼항연산자로 처리 
exports.requestAPI = async ( method , searchWord ) => {
  const apiKey = process.env.KMDBAPIKEY;
  const encodedSearchWord = encodeURIComponent( searchWord );
  
  let requestURL = method === 'searchA' 
    ? `https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?collection=kmdb_new2&listCount=300&detail=Y&query=actor="${encodedSearchWord}"&actor="${encodedSearchWord}"&sort=RANK,1&ServiceKey=${apiKey}`
    : `https://api.koreafilm.or.kr/openapi-data2/wisenut/search_api/search_json2.jsp?collection=kmdb_new2&listCount=300&detail=Y&query=title="${encodedSearchWord}"&title="${encodedSearchWord}"&sort=RANK,1&ServiceKey=${apiKey}`;
    
  try {
    const apiResponse = await axios.get(
      requestURL
    );
    // console.log(apiResponse);
    // 응답 데이터가 문자열로 오기 때문에, JSON.parse 하기 전에 문자열을 수정
    let responseDataStr = apiResponse.data;
    responseDataStr = method === 'searchA'
    ? responseDataStr.replace(/actor="(.+?)"/g, 'actor=$1')
    : responseDataStr.replace(/title="(.+?)"/g, 'title=$1');
    
    // 문자열을 객체로 변환
    let responseData = JSON.parse(responseDataStr);
    // 가공된 응답 데이터 확인용 log
    // console.log(JSON.stringify(responseData).slice(0, 100) + '...');
    console.log('api 요청함 수 내에서 검색된 결과의 수',responseData.Data[0].Result.length);
    return responseData.Data[0];

  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    return null;
  }
};

/**
 * 영화 데이터를 가공하는 함수
 */
exports.manufactureAPI = (method, movieDataList) => {
  const processedMovies = movieDataList.Result.map(movieData => {
    return {
      posterUrl: movieData.posters ? movieData.posters.split('|')[0] : '',
      vodUrl: movieData.vods?.vod[0]?.vodUrl || '',
      movieSynopsys: movieData.plots?.plot[0]?.plotText.replace(/!HS|!HE/g, '').trim() || '',
      moviereleaseDate: movieData.repRlsDate || '',
      movie_salesAcc: movieData.salesAcc || '',
      reviewMovieRating: 0,
      genre: movieData.genre || '',
      directorNm: movieData.directors?.director?.map(dir => dir.directorNm).join(', ').replace(/!HS|!HE/g, '').trim() || '',
      movieTitle: movieData.title ? movieData.title.replace(/!HS|!HE/g, '').trim() : '' ,
      movieCast: movieData.actors?.actor?.slice(0, 10).map(actor => actor.actorNm).join(', ').replace(/!HS|!HE/g, '').trim() || ''
    };
  });
  return processedMovies;
};

