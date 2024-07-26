const { CussWordFilter } = require('cuss-word-filter-ko');
const BadWordsFilterEng = require('badwords/regexp'); // 정규표현식

// CussWordFilter 클래스의 인스턴스를 생성합니다.
const cussWordFilter = new CussWordFilter({
    // 필요에 따라 옵션을 설정할 수 있습니다.
});

const checkBadWords = (text) => {
    
    // 한국어 필터
    if (cussWordFilter.isCussWord(text)) {
        return true;
    }

    // 영어 필터
    if (BadWordsFilterEng.test(text)) {
        return true;
    } 

    return false;
};

module.exports = checkBadWords;