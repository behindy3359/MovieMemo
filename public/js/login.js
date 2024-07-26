document.addEventListener("DOMContentLoaded", function () {
  const openLoginModal = document.getElementById("openLoginModal");
  const modal = document.querySelector(".loginModal");
  const overlay = document.querySelector(".overlay");
  const closeModal = document.querySelector(".close");

  openLoginModal.addEventListener("click", function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
  });

  closeModal.addEventListener("click", function () {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
  });

  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = document.getElementById("user-id").value;
    const password = document.getElementById("password").value;

    try {
      const response = await axios.post("/member/login", {
        name: userId,
        password: password,
      });

      // 로그인 성공 시 토큰을 로컬 스토리지에 저장
      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);

        // 세션에 저장한 토큰을 서버에서 사용할 수 있도록 axios 설정
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        //   alert("로그인 성공");
        console.log("로그인 성공, 저장된 토큰:", token);

        // 세션 스토리지에 토큰 저장
        sessionStorage.setItem("token", token);

        // 로그인 성공 시 메인 페이지로 이동
        window.location.href = "/"; // 메인 페이지 경로로 수정
      } else {
        console.error("로그인 요청은 성공했으나 토큰이 없습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      if (error.response) {
        console.error("로그인 오류 응답 데이터:", error.response.data);
      }
      alert(
        "로그인 실패: " +
          (error.response ? error.response.data.message : error.message)
      );
    }
  });

  // 페이지 로드 시 토큰이 있는 경우 헤더에 설정
  const token = localStorage.getItem("token");
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("페이지 로드 시 저장된 토큰 설정:", token);
  } else {
    console.log("페이지 로드 시 토큰이 없습니다.");
  }
});
