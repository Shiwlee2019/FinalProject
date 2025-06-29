// Quiz logic
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let timer;
let timeLeft = 15;

async function startQuiz() {
  try {
    const response = await fetch('/api/questions?count=10');
    questions = await response.json();
    totalQuestions = questions.length;
    showQuestion();
    startTimer();
  } catch (err) {
    document.getElementById("question").innerText = "Failed to load questions.";
    console.error("Quiz Load Error:", err);
  }
}

function showQuestion() {
  if (currentQuestionIndex >= totalQuestions) {
    window.location.href = `/results?score=${score}&total=${totalQuestions}`;
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById("question").innerText = q.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";

  ['A', 'B', 'C', 'D'].forEach((label) => {
    const container = document.createElement("div");
    container.classList.add("choice-container");
    container.innerHTML = `
      <span class="choice-prefix">${label}</span>
      <span class="choice-text">${q[label]}</span>
    `;
    container.addEventListener("click", () => handleAnswer(label));
    choicesDiv.appendChild(container);
  });

  document.getElementById("question-counter").innerText = `Question: ${currentQuestionIndex + 1}`;
  document.getElementById("score").innerText = `Score: ${score}`;
  resetTimer();
}

function handleAnswer(selected) {
  const correct = questions[currentQuestionIndex].answer;
  if (selected === correct) {
    score++;
  }

  currentQuestionIndex++;
  showQuestion();
}

function startTimer() {
  timeLeft = 15;
  document.getElementById("timer").innerText = `${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      currentQuestionIndex++;
      showQuestion();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  startTimer();
}

// Automatically start quiz if on quiz page
document.addEventListener("DOMContentLoaded", () => {
  const quizPage = document.getElementById("quizPage");
  if (quizPage) {
    startQuiz();
  }
});
