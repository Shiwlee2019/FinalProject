# FinalProject

# ThinkStorm Quiz Application 🧠

A full-stack interactive quiz web application built using **Express.js**, **EJS**, **MongoDB**, and the **OpenTDB API**.  
This project was developed by **Shiwlee**, **Hanan**, and **Aysha** as part of **CSCI 355 - Project 3**.

---

## 🛠 Features

- 🎮 Choose number of questions, difficulty, and category
- ✅ Real-time quiz interface with timers, scores, and sound/emoji feedback
- 🗂 Leaderboard with top 10 scores
- 📈 Profile page with quiz history, top scores, and stats
- 🔁 Review mode for previously answered quizzes
- 👤 Secure sign-up & sign-in system with MongoDB
- 💾 All user data and scores are saved to **MongoDB Atlas**

---

## 👥 Team Contribution

| Member   | Responsibilities |
|----------|------------------|
| **Shiwlee** | 🧩 Handled MongoDB integration, leaderboard, and profile stats. Connected user history to profile page, added session support, and fixed routing issues. |
| **Hanan**   | 🎨 Styled the front-end components including quiz, sign-up, results, and navbar. Created EJS templates for leaderboard and review. |
| **Aysha**   | 📦 Set up routing, implemented question fetching from OpenTDB API, and worked on score tracking and review system logic. |

Everyone contributed equally to logic, design, testing, and debugging.

---

## Technologies Used

- Node.js
- Express.js
- EJS (Embedded JavaScript Templates)
- MongoDB Atlas
- Open Trivia DB API
- Bootstrap 5
- Font Awesome

---

##  Pages

- `/` – Homepage
- `/signup` – Sign up with name, email, password, DOB
- `/signin` – Login with email/password
- `/quizsetup` – Choose quiz options
- `/quiz` – Quiz interface with timer and sound
- `/results` – Quiz result summary
- `/leaderboard` – Top scores from all users
- `/profile` – User’s total quizzes, average score, top score, and full history
- `/review` – Replay previously attempted quizzes

---MONGO_URI=mongodb+srv://shiwleerahman:jdQJDURsCvpRt45M@cluster0.fc58ioh.mongodb.net/cs355db?retryWrites=true&w=majority
