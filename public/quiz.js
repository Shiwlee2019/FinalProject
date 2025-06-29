const questionText = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-container"));
const scoreText = document.getElementById("score");
const progressBoxes = document.getElementById("progress-boxes");
const emojiBox = document.getElementById("emojiFeedback");
const timerDisplay = document.getElementById("timer");

const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");
const clickSound = document.getElementById("clickSound");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let timer = null;
let timeLeft = 15;

const QUESTION_BONUS = 10;
let MAX_QUESTIONS = Array.isArray(window.questions) ? window.questions.length : 0;
let reviewLog = [];

// === Helpers ===
function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function playSound(audioElement) {
  if (!audioElement) return;
  try {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.log("Audio play failed:", e));
  } catch (e) {
    console.error("Audio error:", e);
  }
}

function showEmoji(symbol) {
  if (!emojiBox) return;
  emojiBox.textContent = symbol;
  emojiBox.style.opacity = 1;
  setTimeout(() => {
    emojiBox.style.opacity = 0;
  }, 800);
}

function toggleMode() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
}

// === Game Logic ===
function initializeQuiz() {
  const user = localStorage.getItem("quizAppUserName");
  if (!user) {
    alert("Please sign in to play the quiz.");
    window.location.href = "/signin";
    return;
  }

  if (!Array.isArray(window.questions) || window.questions.length === 0) {
    alert("No questions available.");
    return;
  }

  // Shuffle and limit questions
  window.questions = window.questions.sort(() => Math.random() - 0.5);
  availableQuestions = [...window.questions];
  MAX_QUESTIONS = availableQuestions.length;

  startGame();
}

function startGame() {
  score = 0;
  questionCounter = 0;
  reviewLog = [];
  scoreText.innerText = score;
  renderProgressBoxes();
  getNewQuestion();
}

function renderProgressBoxes() {
  progressBoxes.innerHTML = "";
  for (let i = 0; i < MAX_QUESTIONS; i++) {
    const box = document.createElement("div");
    box.className = "progress-box";
    box.innerText = i + 1;
    progressBoxes.appendChild(box);
  }
}

function getNewQuestion() {
  if (questionCounter >= MAX_QUESTIONS) {
    saveResults();
    return;
  }

  currentQuestion = availableQuestions[questionCounter];
  questionCounter++;

  document.getElementById("question-counter").innerText = `Question: ${questionCounter}`;
  questionText.innerText = decodeHTML(currentQuestion.question);

  choices.forEach((choice, index) => {
    const letter = String.fromCharCode(65 + index); // A, B, C, D
    const choiceText = currentQuestion[letter];
    const textSpan = choice.querySelector(".choice-text");
    textSpan.innerText = decodeHTML(choiceText);
    textSpan.dataset.number = index + 1; // 1 to 4
  });

  acceptingAnswers = true;
  resetTimer();
  startTimer();
}

choices.forEach(choice => {
  choice.addEventListener("click", () => {
    if (!acceptingAnswers) return;

    playSound(clickSound);
    acceptingAnswers = false;
    clearInterval(timer);

    const selectedText = choice.querySelector(".choice-text").innerText.trim();
    const isCorrect = selectedText === currentQuestion[currentQuestion.answer];

    const classToApply = isCorrect ? "correct" : "incorrect";
    choice.classList.add(classToApply);

    if (isCorrect) {
      score += QUESTION_BONUS;
      scoreText.innerText = score;
      playSound(correctSound);
      showEmoji("😊");
    } else {
      playSound(wrongSound);
      showEmoji("😢");
    }

    if (progressBoxes && questionCounter > 0) {
      progressBoxes.children[questionCounter - 1].classList.add(classToApply);
    }

    reviewLog.push({
      question: currentQuestion.question,
      chosen: selectedText,
      correct: currentQuestion[currentQuestion.answer]
    });

    setTimeout(() => {
      choice.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});

function resetTimer() {
  clearInterval(timer);
  timeLeft = 15;
  if (timerDisplay) timerDisplay.textContent = `${timeLeft}s`;
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    if (timerDisplay) timerDisplay.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      acceptingAnswers = false;
      playSound(wrongSound);
      showEmoji("😢");

      if (progressBoxes && questionCounter > 0) {
        progressBoxes.children[questionCounter - 1].classList.add("incorrect");
      }

      setTimeout(getNewQuestion, 1000);
    }
  }, 1000);
}

function saveResults() {
  const name = localStorage.getItem("quizAppUserName") || "Anonymous";
  const percentage = Math.round((score / (MAX_QUESTIONS * QUESTION_BONUS)) * 100);
  const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");

  history.push({
    date: new Date().toISOString(),
    score: score,
    total: MAX_QUESTIONS,
    percentage: percentage
  });

  localStorage.setItem("quizHistory", JSON.stringify(history));
  localStorage.setItem("quizReview", JSON.stringify(reviewLog));

  fetch('/submit-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  }).finally(() => {
    window.location.href = `/results?name=${encodeURIComponent(name)}&score=${score}&total=${MAX_QUESTIONS}`;
  });
}

// Dark Mode Init
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark-mode");
}

// Start on page load
document.addEventListener("DOMContentLoaded", initializeQuiz);
