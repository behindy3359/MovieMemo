const form = document.querySelector("form");
const errorMessageElement = document.querySelector(".error-message");

// Function to display errors
function showErrors(errors) {
  let errorMessageHTML = '';
  errors.forEach((error) => {
    errorMessageHTML += `<p>${error.msg}</p>`;
  });
  errorMessageElement.innerHTML = errorMessageHTML;
  errorMessageElement.style.display = 'block';
}

// Function to clear errors
function clearErrors() {
  errorMessageElement.innerHTML = '';
  errorMessageElement.style.display = 'none';
}

// Function to validate a single field
async function validateField(field) {
  const data = new FormData();
  data.append(field.name, field.value);

  try {
    if (field.value.trim() === '') {
      // Handle empty field client-side
      showErrors([{ msg: `${field.placeholder}을(를) 입력해주세요.` }]);
    } else {
      const response = await axios.post(`/member/validate/${field.name}`, data);
      if (response.data.errors.length > 0) {
        showErrors(response.data.errors);
      } else {
        clearErrors();
      }
    }
  } catch (error) {
    console.error('Validation error:', error);
    clearErrors();
  }
}

// Handle blur event on inputs
document.querySelectorAll('input').forEach(input => {
  input.addEventListener('blur', (e) => {
    validateField(e.target);
  });
});

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById('user-id').value, 
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    nick: document.getElementById('username').value, 
    email: document.getElementById('email').value,
    gender: document.querySelector('input[name="gender"]:checked')?.value,
    age: document.querySelector('input[name="age"]:checked')?.value,
  };

  try {
    const response = await axios.post("/member/register", data);
    console.log('Registration successful:', response);
    window.location.href = '/';
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response && error.response.status === 400) {
      const errorArrays = error.response.data.errors;
      showErrors(errorArrays);
    } else {
      errorMessageElement.innerHTML = '<p>나이와 성별을 선택해 주세요.</p>';
      errorMessageElement.style.display = 'block';
    }
  }
});
