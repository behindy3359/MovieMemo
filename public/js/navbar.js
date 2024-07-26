function isOnMyPage() {
  return window.location.pathname === "/mypage";
}

function navigateTo(url) {
  window.location.href = url;
}

const adminButton = document.getElementById("adminButton");
const signupBtn = document.getElementById("signupBtn");

if (adminButton) {
  adminButton.addEventListener("click", function () {
    navigateTo("/adminpage");
  });
}

if (signupBtn) {
  signupBtn.addEventListener("click", function () {
    navigateTo("/register");
  });
}

//nav-bar search Area
const SmethodElement = document.querySelector(".search-box-Smethod");
const mSmethodElement = document.querySelector(".m-search-box-Smethod");

SmethodElement.addEventListener("click", () => {
  let Smethod = SmethodElement.textContent.trim();
  if (Smethod === "Title") {
    SmethodElement.innerHTML = `<span style="color: red; font-size: 2rem;">A</span>ctor`;
    document
      .querySelector(".search-box-word")
      .setAttribute("placeholder", "배우 이름을 입력해주세요");
  } else {
    SmethodElement.innerHTML = `<span style="color: red; font-size: 2rem;">T</span>itle`;
    document
      .querySelector(".search-box-word")
      .setAttribute("placeholder", "영화 제목을 입력해주세요");
  }
});
mSmethodElement.addEventListener("click", () => {
  let mSmethod = mSmethodElement.textContent.trim();
  if (mSmethod === "Title") {
    mSmethodElement.innerHTML = `<span style="color: red; font-size: 2rem;">A</span>ctor`;
    document
      .querySelector(".m-search-box-word")
      .setAttribute("placeholder", "배우 이름을 입력해주세요");
  } else {
    mSmethodElement.innerHTML = `<span style="color: red; font-size: 2rem;">T</span>itle`;
    document
      .querySelector(".m-search-box-word")
      .setAttribute("placeholder", "영화 제목을 입력해주세요");
  }
});

const searchBtn = document.querySelector(".search-box-btn");
const searchInput = document.querySelector(".search-box-word");
const msearchBtn = document.querySelector(".m-search-box-btn");
const msearchInput = document.querySelector(".m-search-box-word");

function performSearch() {
  const searchTerm = searchInput.value;
  if(!searchTerm){
    return alert('검색어를 입력해주세요');
  }
  const searchMethod =
    SmethodElement.textContent === "Title" ? "searchT" : "searchA";
  window.location.href = `/movie/${searchMethod}/${searchTerm}`;
}
function mperformSearch() {
  const msearchTerm = msearchInput.value;
  if(!msearchTerm){
    return alert('검색어를 입력해주세요');
  }
  const msearchMethod =
    mSmethodElement.textContent === "Title" ? "searchT" : "searchA";
  window.location.href = `/movie/${msearchMethod}/${msearchTerm}`;
}
searchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    performSearch();
  }
});
msearchInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    mperformSearch();
  }
});

// 버튼 클릭 이벤트
searchBtn.addEventListener("click", performSearch);
msearchBtn.addEventListener("click", mperformSearch);

function updateUIForLoggedInUser(isAdmin) {
  if (loginBtn) {
    loginBtn.textContent = "로그아웃";
    loginBtn.removeEventListener("click", openLoginModal); // Remove login modal event listener
    loginBtn.addEventListener("click", logoutUser); // Add logout event listener
  }
  removeSignUpButton(); // Remove the sign-up button
  updateNavBarForLoggedInUser();

  // 관리자 버튼을 보이거나 숨기는 로직 추가
  const adminButton = document.getElementById("adminButton");
  if (isAdmin) {
    adminButton.classList.remove("hidden");
  } else {
    adminButton.classList.add("hidden");
    updateNavBarForLoggedInUser();
  }
}

// Function to update UI for logged-out users
function updateUIForLoggedOutUser() {
  if (loginBtn) {
    loginBtn.textContent = "로그인";
    loginBtn.removeEventListener("click", logoutUser); // Remove logout event listener
    loginBtn.addEventListener("click", openLoginModal); // Add login modal event listener
  }
  addSignUpButton(); // Re-add the sign-up button
  removeMyPageButton(); // Remove "마이페이지" button

  // 로그아웃 시 관리자 버튼 숨김
  const adminButton = document.getElementById("adminButton");
  adminButton.classList.add("hidden");
}

function updateNavBarForLoggedInUser() {
  const existingMyPageButton = document.querySelector("#myPageButton");
  if (!existingMyPageButton) {
    const myPageButton = document.createElement("button");
    myPageButton.id = "myPageButton";
    myPageButton.textContent = "마이페이지";
    myPageButton.addEventListener("click", function () {
      navigateTo("/mypage");
    });

    const navList = document.querySelector("nav ul");

    const logoutButton = navList.querySelector("#openLoginModal");

    if (logoutButton) {
      navList.insertBefore(myPageButton, logoutButton);
    } else {
      navList.appendChild(myPageButton);
    }
  }
}

// Function to handle user logout
function logoutUser() {
  localStorage.removeItem("token"); // Remove token from local storage
  axios.defaults.headers.common["Authorization"] = ""; // Clear the Authorization header
  updateUIForLoggedOutUser(); // Update UI
  window.location.reload(); // Reload page to reset state
}

// Function to remove the sign-up button
function removeSignUpButton() {
  const signUpButton = document.getElementById("signupBtn");
  if (signUpButton) {
    signUpButton.remove();
  }
}

// Function to add back the sign-up button
function addSignUpButton() {
  const existingSignUpButton = document.getElementById("signupBtn");
  if (!existingSignUpButton) {
    const signUpButton = document.createElement("button");
    signUpButton.id = "signupBtn";
    signUpButton.textContent = "회원가입";
    signUpButton.addEventListener("click", function () {
      navigateTo("/register");
    });

    const navList = document.querySelector("nav ul");
    navList.appendChild(signUpButton);
  }
}

// Function to remove "마이페이지" button
function removeMyPageButton() {
  const myPageButton = document.querySelector("#myPageButton");
  if (myPageButton) {
    myPageButton.remove();
  }
}

// 초기화 함수에서 토큰을 확인하고 로그인 상태와 관리자 권한에 따라 UI 업데이트
function initializeUI() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      updateUIForLoggedInUser(decoded.isAdmin);
    } catch (error) {
      console.error("Invalid token:", error);
      updateUIForLoggedOutUser();
    }
  } else {
    updateUIForLoggedOutUser();
  }
}

initializeUI(); // 초기화 함수 호출

if (isOnMyPage()) {
  removeMyPageButton();
}
