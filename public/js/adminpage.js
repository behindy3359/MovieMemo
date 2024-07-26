document.addEventListener('DOMContentLoaded', () => {
    const reviewList = document.getElementById('review-list');
    const sortOrder = document.getElementById('sortBy');
    const paginationContainer = document.querySelector('.pagination');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const patchModal = document.getElementById('patch-modal');
    const confirmPatchBtn = document.getElementById('confirm-patch');
    const cancelPatchBtn = document.getElementById('cancel-patch');
    const reviewModal = document.getElementById('review-modal');
    const closeReviewModal = document.getElementById('close-review-modal');
    const reviewModalContent = document.getElementById('review-modal-content');
    let currentReviewId = null;
    let currentMemberId = null;

    window.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
        if (e.target === patchModal) {
            patchModal.style.display = 'none';
        }
        if (e.target === reviewModal) {
            reviewModal.style.display = 'none';
        }
    });

    function onDeleteButtonClick(button) {
        currentReviewId = button.getAttribute('data-review-id');
        deleteModal.style.display = 'block';
    }

    function onPatchButtonClick(button) {
        currentMemberId = button.getAttribute('data-member-id');
        patchModal.style.display = 'block';
    }

    function onReadMoreButtonClick(button) {
        const reviewContent = button.getAttribute('data-review-content');
        reviewModalContent.textContent = reviewContent;
        reviewModal.style.display = 'block';
    }

    reviewList.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more')) {
            onReadMoreButtonClick(e.target);
        }
        if (e.target.classList.contains('del-btn')) {
            onDeleteButtonClick(e.target);
        }
        if (e.target.classList.contains('patch-btn')) {
            onPatchButtonClick(e.target);
        }
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (currentReviewId) {
            deleteReview(currentReviewId);
            deleteModal.style.display = 'none';
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none';
    });

    confirmPatchBtn.addEventListener('click', () => {
        if (currentMemberId) {
            checkAndPatchMember(currentMemberId);
            patchModal.style.display = 'none';
        }
    });

    cancelPatchBtn.addEventListener('click', () => {
        patchModal.style.display = 'none';
    });

    closeReviewModal.addEventListener('click', () => {
        reviewModal.style.display = 'none';
    });

    sortOrder.addEventListener('click', (e) => {
        const sortBy = e.target.value;
        getReviews(sortBy);
    });

    sortOrder.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        getReviews(sortBy);
    });

    paginationContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('page-number')) {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            getReviews(sortOrder.value, page);
        }
    });

    function getReviews(sortBy, page = 1) {
        axios.get(`/adminpage`, {
            params: {
                sortBy,
                page
            },
            headers: {
                'Accept': 'application/json' // JSON 응답을 기대
            }
        })
        .then(response => {
            const reviews = response.data.data.reviews; // 수정된 경로 사용
            console.log("🚀 ~ getReviews ~ reviews:", reviews);
            const pagination = response.data.pagination;
            console.log("🚀 ~ getReviews ~ pagination:", pagination);
            renderReviews(reviews);
            renderPagination(pagination);
        })
        .catch(error => {
            console.error('리뷰를 가져올 수 없습니다.', error);
        });
    }

    function deleteReview(reviewId) {
        axios.delete(`/review/${reviewId}`)
        .then(response => {
            console.log('리뷰삭제성공', response);
            getReviews(sortOrder.value); // 리뷰 삭제 후 리뷰 목록 갱신
        })
        .catch(error => {
            console.error('리뷰를 삭제할 수 없습니다.', error);
        });
    }

    function checkAndPatchMember(memberId) {
        const token = sessionStorage.getItem('token');
        const decodedToken = parseJwt(token);
        const memberIdFromToken = decodedToken ? decodedToken.memberId : null;

        if (memberId === memberIdFromToken) {
            alert('본인은 본인을 강제퇴장시킬 수 없습니다.');
            return;
        }

        patchMember(memberId);
    }

    function patchMember(memberId) {
        axios.delete(`/member/${memberId}`)
        .then(response => {
            console.log('회원 강퇴 성공', response);
            getReviews(sortOrder.value); // 회원 강퇴 후 리뷰 목록 갱신
        })
        .catch(error => {
            console.error('회원을 강퇴할 수 없습니다.', error);
        });
    }

    function renderReviews(reviews) {
        reviewList.innerHTML = '';
        reviews.forEach(review => {
            const reviewRow = document.createElement('tr');
            reviewRow.innerHTML = `
                <td>${review.Member.nick}</td>
                <td>${review.Movie.movieTitle}</td>
                <td><a href="#" class="read-more" data-review-content="${review.content}">자세히 보기</a></td>
                <td>${review.likeCount}</td>
                <td>${review.reportCount}</td>
                <td>${formatDate(review.createdAt)}</td>
                <td>${formatDate(review.updatedAt)}</td>
                <td><button class="del-btn" type="submit" data-review-id="${review.reviewId}">삭제</button></td>
                <td><button class="patch-btn" type="submit" data-member-id="${review.memberId}">추방</button></td>
            `;
            reviewList.appendChild(reviewRow);
        });
    }

    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= pagination.totalPages; i++) {
            const pageElement = document.createElement('span');
            if (i === pagination.currentPage) {
                pageElement.classList.add('page-number', 'active');
                pageElement.textContent = i;
            } else {
                const pageLink = document.createElement('a');
                pageLink.href = '#';
                pageLink.classList.add('page-number');
                pageLink.textContent = i;
                pageLink.setAttribute('data-page', i);
                pageElement.appendChild(pageLink);
            }
            paginationContainer.appendChild(pageElement);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('토큰을 파싱할 수 없습니다.', error);
            return null;
        }
    }

    getReviews(sortOrder.value);
});
