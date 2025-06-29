document.addEventListener("DOMContentLoaded", async () => {
  const clickSound = document.getElementById("clickSound");
  const usernameSpan = document.getElementById("username");
  const totalQuizzesSpan = document.getElementById("totalQuizzes");
  const topScoreSpan = document.getElementById("topScore");
  const avgScoreSpan = document.getElementById("avgScore");
  const tableBody = document.getElementById("historyBody");

  const QUESTION_BONUS = 10;
  const MAX_QUESTIONS = 10;

  // Dark mode setup
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Toggle sound on button click
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log("Audio play failed:", e));
      }
    });
  });

  // Theme toggle
  window.toggleMode = function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  };

  await loadProfileData();

  async function loadProfileData() {
    try {
      const nameParam = new URLSearchParams(window.location.search).get("name") || "Guest";
      const response = await fetch(`/api/profile?name=${encodeURIComponent(nameParam)}`);
      if (!response.ok) throw new Error("Failed to fetch user profile");

      const data = await response.json();
      const { userName = "Guest", quizHistory = [] } = data;

      if (usernameSpan) usernameSpan.textContent = userName;
      if (totalQuizzesSpan) totalQuizzesSpan.textContent = quizHistory.length;

      if (!quizHistory.length) {
        if (tableBody) {
          tableBody.innerHTML = `<tr><td colspan="5" class="no-data">No quiz attempts recorded yet</td></tr>`;
        }
        return;
      }

      const scores = quizHistory.map(entry => entry.score);
      const topScore = Math.max(...scores);
      const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const avgPercentage = Math.round((avgScore / (MAX_QUESTIONS * QUESTION_BONUS)) * 100);

      if (topScoreSpan) topScoreSpan.textContent = topScore;
      if (avgScoreSpan) avgScoreSpan.textContent = avgPercentage;

      const recentAttempts = quizHistory.slice(-10).reverse();
      if (tableBody) tableBody.innerHTML = '';

      recentAttempts.forEach((attempt, index) => {
        const row = document.createElement('tr');
        const percentage = Math.round((attempt.score / (attempt.total * QUESTION_BONUS)) * 100);

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${attempt.score}</td>
          <td>${attempt.total * QUESTION_BONUS}</td>
          <td>${percentage}%</td>
          <td>${new Date(attempt.date).toLocaleDateString()}</td>
        `;

        if (attempt.score === topScore) {
          row.classList.add('highlight-row');
        }

        tableBody.appendChild(row);
      });

      initPerformanceChart(quizHistory);
    } catch (error) {
      console.error("Error loading profile data:", error);
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="5" class="no-data">Unable to load profile. Please sign in again.</td></tr>`;
      }
    }
  }

  function initPerformanceChart(history) {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    const labels = history.map((_, i) => `Attempt ${i + 1}`);
    const scores = history.map(entry => entry.score);
    const percentages = history.map(entry =>
      Math.round((entry.score / (entry.total * QUESTION_BONUS)) * 100)
    );

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Score',
            data: scores,
            borderColor: '#ff4081',
            backgroundColor: 'rgba(255, 64, 129, 0.1)',
            tension: 0.3,
            yAxisID: 'y'
          },
          {
            label: 'Percentage %',
            data: percentages,
            borderColor: '#2575fc',
            backgroundColor: 'rgba(37, 117, 252, 0.1)',
            tension: 0.3,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
              color: '#ff4081'
            },
            grid: {
              color: 'rgba(255, 64, 129, 0.1)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
              color: '#2575fc'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }
});
