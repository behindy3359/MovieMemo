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
    const patchContent = document.getElementById('patch-content');

    const currentPasswordInput = document.getElementById('current-password');
    const changePasswordInput = document.getElementById('change-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordMessage = document.getElementById('passwordMessage');

    function checkPasswordMatch() {
        const newPassword = changePasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (newPassword === confirmPassword) {
            confirmPasswordMessage.textContent = '일치';
            confirmPasswordMessage.style.color = 'green';
        } else {
            confirmPasswordMessage.textContent = '불일치';
            confirmPasswordMessage.style.color = 'red';
        }
    }

    changePasswordInput.addEventListener('input', checkPasswordMatch);
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    currentPasswordInput.addEventListener('focusout', () => {
        const currentPassword = currentPasswordInput.value;
        if (currentPassword) {
            verifyCurrentPassword(currentPassword);
        } else {
            passwordMessage.textContent = '';
        }
    });

    // 정보수정 이벤트 리스너
    document.querySelector('.member-patch-btn').addEventListener('click', () => {
        const form = document.querySelector('.member-info-form');
    
        form.addEventListener('submit', patchMemberInfo);
    });

    // 회원탈퇴 이벤트 리스너
    document.querySelector('.member-delete-btn').addEventListener('click', () => {
        const form = document.querySelector('.member-info-form');
    
        form.addEventListener('submit', deleteMember);
    });

    async function patchMemberInfo(e) {
        e.preventDefault();
        
        const currentPassword = currentPasswordInput.value;
        const newPassword = changePasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
    
        if (currentPassword) {
            try {
                const verifyResponse = await axios.post('/member/verifyPassword', { currentPassword });
                
                if (verifyResponse.status === 200) {
                    const updateResponse = await axios.patch('/member/password', {
                        currentPassword,
                        password: newPassword,
                        age,
                        gender
                    });
                    alert('회원 정보가 수정되었습니다.');
                    return window.location.reload();
                }
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    alert('올바른 비밀번호 양식을 지켜주세요.');
                    document.getElementById('chgPasswordMessage').textContent = error.response.data.errors[0].msg;
                    document.getElementById('chgPasswordMessage').style.color = 'red';
                } else {
                    console.error('회원 정보를 수정하는 중 오류가 발생했습니다.', error);
                    alert('회원 정보를 수정하는 중 오류가 발생했습니다.');
                }
            }
        } else {
            alert('현재 비밀번호를 입력해주세요.');
        }
    }
    
    async function deleteMember(e) {
        e.preventDefault();
        
        const currentPassword = currentPasswordInput.value;
    
        if (currentPassword) {
            try {
                const verifyResponse = await axios.post('/member/verifyPassword', { currentPassword });
                
                if (verifyResponse.status === 200) {
                    await axios.delete(`/member`);
                    alert('회원 탈퇴 처리되었습니다.');
                    return window.location.href = '/';
                }
            } catch (error) {
                if (error.response) {
                    alert('회원 탈퇴가 실패하였습니다.');
                } else {
                    console.error('회원 탈퇴를 진행 하는 중 오류가 발생했습니다.', error);
                    alert('회원 탈퇴를 진행 하는 중 오류가 발생했습니다.');
                }
            }
        } else {
            alert('현재 비밀번호를 입력해주세요.');
        }
    }

    reviewList.addEventListener('click', (e) => {
        if (e.target.classList.contains('read-more')) {
            const reviewContent = e.target.previousElementSibling;
            if (e.target.textContent === '더보기') {
                reviewContent.classList.add('full');
                e.target.textContent = '간략히';
            } else {
                reviewContent.classList.remove('full');
                e.target.textContent = '더보기';
            }
        }

        if (e.target.classList.contains('del-btn')) {
            const reviewElement = e.target.closest('.review-title');
            if (reviewElement) {
                currentReviewId = reviewElement.getAttribute('data-review-id');
                deleteModal.style.display = 'block'; // 모달 창 열기
            } else {
                console.error('Review element not found');
            }
        }

        if (e.target.classList.contains('patch-btn')) {
            const reviewElement = e.target.closest('.review-title');
            if (reviewElement) {
                currentReviewId = reviewElement.getAttribute('data-review-id');
                currentReviewElement = reviewElement;
                const reviewContent = reviewElement.querySelector('.review-content').innerHTML;
                patchContent.value = reviewContent;
                patchModal.style.display = 'block'; // 모달 창 열기
            } else {
                console.error('Review element not found');
            }
        }
    });

    confirmDeleteBtn.addEventListener('click', () => {
        if (currentReviewId) {
            deleteReview(currentReviewId);
            deleteModal.style.display = 'none'; // 모달 창 닫기
        }
    });

    cancelDeleteBtn.addEventListener('click', () => {
        deleteModal.style.display = 'none'; // 모달 창 닫기
    });

    confirmPatchBtn.addEventListener('click', () => {
        if (currentReviewId && currentReviewElement) {
            const updatedContent = patchContent.value;
            currentReviewElement.querySelector('.review-content').textContent = updatedContent;
            patchReview(currentReviewId, updatedContent);
            patchModal.style.display = 'none'; // 모달 창 닫기
        }
    });

    cancelPatchBtn.addEventListener('click', () => {
        patchModal.style.display = 'none'; // 모달 창 닫기
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
        axios.get(`/mypage`, {
            params: {
                sortBy,
                page
            }
        })
        .then(response => {
            const reviews = response.data.reviews;
            const pagination = response.data.pagination;
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
            getReviews(sortOrder.value); // 삭제 후 리뷰 목록을 다시 로드
        })
        .catch(error => {
            console.error('리뷰를 삭제할 수 없습니다.', error);
        });
    }
    
    function patchReview(reviewId, content) {
        axios.patch(`/review/${reviewId}`, { content })
        .then(response => {
            getReviews(sortOrder.value); // 수정 후 리뷰 목록을 다시 로드
        })
        .catch(error => {
            console.error('리뷰를 수정할 수 없습니다.', error); // 에러 메시지 출력
        });
    }

    function renderReviews(reviews) {
        reviewList.innerHTML = '';
        reviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review-title');
            reviewElement.setAttribute('data-review-id', review.reviewId);
            reviewElement.innerHTML = 
             `<div class="review-title-row">${review.Movie.movieTitle}</div>
                <div class="review-content-row">
                    <div class="review-content">${review.content}</div>
                    <span class="read-more">더보기</span>
                    <div class="likes-count">
                        <img class="like-img" src="/img/icon-heart-full.png" alt="LikeIcon">
                        <div class="like-num">${review.likeCount}</div>
                    </div>
                    <div class="review-btn">
                        <button class="patch-btn" type="button">수정</button>
                        <button class="del-btn" type="button">삭제</button>
                    </div>
                </div>
            `;
            reviewList.appendChild(reviewElement);

            const reviewContent = reviewElement.querySelector('.review-content');
            const readMoreBtn = reviewElement.querySelector('.read-more');

            // 임시로 스타일을 변경하여 scrollHeight를 올바르게 계산
            reviewContent.style.whiteSpace = 'nowrap';
            reviewContent.style.overflow = 'hidden';
            const contentIsOverflowing = reviewContent.scrollWidth > reviewContent.clientWidth;

            if (!contentIsOverflowing) {
                readMoreBtn.textContent = '';
            } else {
                reviewContent.style.whiteSpace = 'normal';
                reviewContent.style.overflow = 'visible';
            }
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
                pageLink.href = `#`;
                pageLink.classList.add('page-number');
                pageLink.textContent = i;
                pageLink.setAttribute('data-page', i);
                pageElement.appendChild(pageLink);
            }
            paginationContainer.appendChild(pageElement);
        }
    }

    function verifyCurrentPassword(currentPassword) {
        axios.post('/member/verifyPassword', { currentPassword })
            .then(response => {
                if (response.status === 200) {
                    passwordMessage.textContent = '변경 가능';
                    passwordMessage.style.color = 'green';
                    passwordMessage.style.borderColor = 'green';
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 400) {
                    passwordMessage.textContent = '변경불가능.';
                    passwordMessage.style.color = 'red';
                    passwordMessage.style.borderColor = 'red';
                } else {
                    console.error('비밀번호 확인 중 오류가 발생했습니다.', error);
                }
            });
    }

    // 초기 데이터 로드
    getReviews(sortOrder.value);
});
