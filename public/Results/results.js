document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("quizAppUserName");
  if (!user) {
    alert("Please sign in to view your quiz results.");
    window.location.href = "../signIn/signin.html";
    return;
  }

  const clickSound = document.getElementById("clickSound");
  const winSound = document.getElementById("winSound");
  const urlParams = new URLSearchParams(window.location.search);

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  window.toggleMode = function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  };

  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => playSound(clickSound));
  });

  let score = parseInt(urlParams.get("score"));
  let total = parseInt(urlParams.get("total"));
  const currentDate = new Date().toLocaleDateString();

  if (isNaN(score) || isNaN(total)) {
    const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    const last = history[history.length - 1];
    if (last) {
      score = last.score;
      total = last.total;
    } else {
      score = 0;
      total = 10;
    }
  }

  const percentage = total > 0 ? Math.round((score / (total * 10)) * 100) : 0;
  const correctCount = score / 10;


  if (score === 0 && percentage === 0) return;

  updateText("currentUser", user);
  updateText("score", `${correctCount} / ${total}`);
  updateText("resultDate", currentDate);
  updateText("percentageDisplay", `${percentage}%`);

  const circle = document.querySelector(".circle-progress");
  if (circle) {
    circle.style.background = `conic-gradient(var(--accent) ${percentage}%, var(--primary) ${percentage}%)`;
    if (percentage >= 80) {
      circle.classList.add("success-animation");
    }
  }

  const feedback = getFeedback(percentage);
  const feedbackEl = document.getElementById("feedback");
  if (feedbackEl) {
    feedbackEl.textContent = feedback.text;
    feedbackEl.style.color = feedback.color;
  }

  if (percentage >= 80) {
    celebrate(percentage);
  }
});

function updateText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function playSound(audioElement) {
  if (!audioElement) return;
  try {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => console.warn("Audio failed:", e));
  } catch (e) {
    console.error("Audio error:", e);
  }
}

function getFeedback(percentage) {
  if (percentage >= 90) {
    return { text: "🏆 Quiz Master! Perfect or near-perfect score!", color: "#ffdf00" };
  } else if (percentage >= 75) {
    return { text: "🎉 Excellent! You really know your stuff!", color: "#90ee90" };
  } else if (percentage >= 50) {
    return { text: "👍 Good effort! You're getting there!", color: "#add8e6" };
  } else {
    return { text: "💪 Keep practicing! You'll improve next time!", color: "#ff8080" };
  }
}

function celebrate(percentage) {
  playSound(document.getElementById("winSound"));

  if (typeof confetti !== "function") return;

  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#ff4081", "#6a11cb", "#2575fc", "#ffdf00"],
  });

  if (percentage === 100) {
    setTimeout(() => {
      confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } });
    }, 300);
  }
}document.addEventListener('DOMContentLoaded', () => {
  const score = document.getElementById("score").innerText;
  const total = document.getElementById("total").innerText;
  const shareText = `🎯 I scored ${score}/${total} on the ThinkStorm Quiz App!`;

  document.getElementById("fbShare").href =
    `https://www.facebook.com/sharer/sharer.php?u=https://yourquizsite.com&quote=${encodeURIComponent(shareText)}`;

  document.getElementById("waShare").href =
    `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}%20https://yourquizsite.com`;
});
