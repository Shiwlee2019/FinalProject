document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const nameInput = document.getElementById("signupName");
  const emailInput = document.getElementById("signupEmail");
  const passwordInput = document.getElementById("signupPassword");
  const dobInput = document.getElementById("signupDob");
  const successMsg = document.getElementById("signupSuccess");

  successMsg.style.display = "none";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const dob = dobInput.value;


    if (!name || !email || !password) {
      alert("Please fill in all required fields");
      return;
    }

    //net code, check back
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }


    if (password.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem("quizAppUsers") || "[]");
      const userExists = users.some(user => user.email === email);
      
      if (userExists) {
        alert("This email is already registered. Please sign in.");
        window.location.href = "../signin/signin.html";
        return;
      }

      const newUser = {
        name,
        email,
        password,
        dob,
        joinDate: new Date().toISOString(),
        scores: []
      };

      users.push(newUser);
      localStorage.setItem("quizAppUsers", JSON.stringify(users));
      localStorage.setItem("quizAppCurrentUser", JSON.stringify(newUser));
      localStorage.setItem("quizAppUserName", name); // ✅ Needed for quiz/results/review

      successMsg.style.display = "block";
      setTimeout(() => {
        window.location.href = "../Game/quiz.html";
      }, 1500);

    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred during signup. Please try again.");
    }
  });


  const today = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(today.getFullYear() - 13);
  dobInput.max = maxDate.toISOString().split('T')[0];
});