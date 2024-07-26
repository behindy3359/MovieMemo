const paginate = (page = 1, pageSize = 8) => {
    const limit = parseInt(pageSize, 10); // 문자열 방지
    const offset = (page - 1) * limit;
    return { limit, offset };
};

const paginateResponse = (rows, count, page, pageSize, key = "data") => {
    const limit = parseInt(pageSize, 10);
    const totalPages = Math.ceil(count / limit);
    return {
        [key]: rows, // 동적 사용
        currentPage: parseInt(page, 10),
        totalPages,
        totalReviews: count,
    };
};

module.exports = { paginate, paginateResponse };
