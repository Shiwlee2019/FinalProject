
document.addEventListener("DOMContentLoaded", () => {
  const signInForm = document.getElementById("signInForm");
  const emailInput = document.getElementById("signInEmail");
  const passwordInput = document.getElementById("signInPassword");
  const errorMessage = document.getElementById("signInError");
  const togglePassword = document.querySelector(".toggle-password");
  const clickSound = document.getElementById("clickSound");
  const forgotPasswordLink = document.getElementById("forgotPassword");


  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }


  window.toggleMode = function() {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  };


  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound(clickSound);
    });
  });


  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.innerHTML = isPassword 
      ? '<i class="fas fa-eye-slash"></i>' 
      : '<i class="fas fa-eye"></i>';
  });


  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Password reset functionality coming soon!");
  });


  signInForm.addEventListener("submit", (e) => {
    e.preventDefault();
    playSound(clickSound);
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!validateEmail(email)) {
      showError("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }
    
    authenticateUser(email, password);
  });


  function playSound(audioElement) {
    if (!audioElement) return;
    try {
      audioElement.currentTime = 0;
      audioElement.play().catch(e => console.log("Audio play failed:", e));
    } catch (e) {
      console.error("Audio error:", e);
    }
  }

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(message) {
    errorMessage.querySelector("span").textContent = message;
    errorMessage.style.display = "flex";
    setTimeout(() => {
      errorMessage.style.display = "none";
    }, 5000);
  }

  function authenticateUser(email, password) {
    const users = JSON.parse(localStorage.getItem("quizAppUsers") || "[]");
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {

        localStorage.setItem("quizAppUserEmail", email);
      localStorage.setItem("quizAppUserName", user.name);
      

      window.location.href = "/quizsetup";

    } else {
      showError("Invalid email or password. Please try again.");
      passwordInput.value = "";
      passwordInput.focus();
    }
  }
});