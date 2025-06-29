
document.addEventListener("DOMContentLoaded", () => {

    const currentName = localStorage.getItem("quizAppUserName");
  if (!currentName) {
    alert("Please sign in to view the leaderboard.");
    window.location.href = "../signIn/signin.html";
    return;
  }

  const clickSound = document.getElementById("clickSound");
  const allScoresBtn = document.getElementById("allScores");
  const myScoresBtn = document.getElementById("myScores");
  let leaderboardData = [];

  // Play click sound for buttons
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log("Audio play failed:", e));
      }
    });
  });

  // Initialize dark mode
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  // Toggle dark mode
  window.toggleMode = function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  };

  // Filter buttons functionality
  allScoresBtn.addEventListener('click', () => {
    allScoresBtn.classList.add('active');
    myScoresBtn.classList.remove('active');
    renderLeaderboard(leaderboardData);
  });

  myScoresBtn.addEventListener('click', () => {
    myScoresBtn.classList.add('active');
    allScoresBtn.classList.remove('active');
    const filtered = leaderboardData.filter(entry => entry.name === currentName);
    renderLeaderboard(filtered);
  });


  loadLeaderboard();

  function loadLeaderboard() {
    const tbody = document.querySelector('#leaderboard tbody');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading leaderboard...</td></tr>';


    fetch('/api/leaderboard')
      .then(res => {
        if (!res.ok) throw new Error('API response not OK');
        return res.json();
      })
      .then(data => {
        console.log('Leaderboard data loaded from API');
        leaderboardData = processData(data);
        renderLeaderboard(leaderboardData);
      })
      .catch(err => {
        console.log('Using local storage (API failed)');
        // Fallback to local storage
        const localData = JSON.parse(localStorage.getItem("quizHistory") || "[]");
        leaderboardData = processData(localData);
        renderLeaderboard(leaderboardData);
      });
  }

  function processData(data) {
    return data
      .map(entry => ({
        name: entry.name || "Anonymous",
        score: entry.score || 0,
        percentage: entry.percentage || 0,
        date: entry.date ? new Date(entry.date).toLocaleDateString() : "N/A"
      }))
      .sort((a, b) => b.score - a.score);
  }

  function renderLeaderboard(data) {
    const tbody = document.querySelector('#leaderboard tbody');

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="error-message">No scores available</td></tr>';
      return;
    }

    tbody.innerHTML = '';

    data.slice(0, 20).forEach((entry, index) => {
      const row = document.createElement('tr');

      if (entry.name === currentName) {
        row.classList.add('highlight-user');
      }

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.score}</td>
        <td>${entry.percentage}%</td>
        <td>${entry.date}</td>
      `;

      tbody.appendChild(row);
    });
  }
});
