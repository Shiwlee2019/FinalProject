
document.addEventListener("DOMContentLoaded", () => {

    const user = localStorage.getItem("quizAppUserName");
  if (!user) {
    alert("Please sign in to review your answers.");
    window.location.href = "../signIn/signin.html";
    return;
  }

  const clickSound = document.getElementById("clickSound");
  const reviewList = document.getElementById("review-list");
  const filter = document.getElementById("filter");
  const correctCountEl = document.getElementById("correctCount");
  const incorrectCountEl = document.getElementById("incorrectCount");
  const totalCountEl = document.getElementById("totalCount");


  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log("Audio play failed:", e));
      }
    });
  });


  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }


  window.toggleMode = function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  };


  const reviewData = JSON.parse(localStorage.getItem("quizReview")) || [];
  let correctCount = 0;
  let incorrectCount = 0;

  if (reviewData.length === 0) {
    reviewList.innerHTML = `
      <div class="no-results">
        <i class="fas fa-info-circle"></i>
        <p>No review data available. Complete a quiz first.</p>
      </div>
    `;
    return;
  }


  reviewData.forEach(item => {
    if (item.chosen === item.correct) {
      correctCount++;
    } else {
      incorrectCount++;
    }
  });


  correctCountEl.textContent = correctCount;
  incorrectCountEl.textContent = incorrectCount;
  totalCountEl.textContent = reviewData.length;


  function renderQuestions(filterValue = "all") {
    reviewList.innerHTML = "";

    reviewData.forEach((item, index) => {
      const isCorrect = item.chosen === item.correct;

      if (filterValue === "correct" && !isCorrect) return;
      if (filterValue === "incorrect" && isCorrect) return;

      const questionEl = document.createElement("div");
      questionEl.className = `review-item ${isCorrect ? "correct" : "incorrect"}`;

      const chosenText = item.question?.["choice" + item.chosen] || "[N/A]";
      const correctText = item.question?.["choice" + item.correct] || "[N/A]";

      questionEl.innerHTML = `
        <div class="question-text">Q${index + 1}: ${item.question.question}</div>
        
        <div class="answer-section">
          <span class="your-answer">Your answer:</span>
          <span class="${isCorrect ? "correct-answer" : "incorrect-answer"}">
            ${chosenText} ${isCorrect ? "✅" : "❌"}
          </span>
        </div>
        
        ${!isCorrect ? `
          <div class="answer-section">
            <span>Correct answer:</span>
            <span class="correct-answer">${correctText}</span>
          </div>
        ` : ''}

        ${item.explanation ? `
          <div class="explanation">
            <strong>Explanation:</strong> ${item.explanation}
          </div>
        ` : ''}
      `;

      reviewList.appendChild(questionEl);
    });


    if (reviewList.children.length === 0) {
      reviewList.innerHTML = `
        <div class="no-results">
          <i class="fas fa-filter"></i>
          <p>No ${filterValue} answers found.</p>
        </div>
      `;
    }
  }


  renderQuestions();


  filter.addEventListener("change", () => {
    renderQuestions(filter.value);
  });
});