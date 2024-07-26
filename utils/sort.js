const sort = (sortBy) => {
    let order = [];

    // 정렬 기준
    switch (sortBy) {
        case 'latest':
            order = [['createdAt', 'DESC']]; // 최신순
            break;
        case 'oldest':
            order = [['createdAt', 'ASC']]; // 등록일순
            break;
        case 'rating':
            order = [['reviewMovieRating', 'DESC'], ['createdAt', 'DESC']]; // 평점순, 평점이 같다면 최신순
            break;
        case 'popular':
            order = [['likeCount', 'DESC'], ['createdAt', 'DESC']]; // 좋아요 순, 좋아요가 같다면 최신순
            break;
        case 'report':
            order = [['reportCount', 'DESC'], ['createdAt', 'DESC']]; // 신고 순, 같다면 최신순
            break;
        default:
            order = [['createdAt', 'DESC']]; // 기본 정렬 기준, 최신순
            break;
    }

    return order;
}

module.exports = { sort };