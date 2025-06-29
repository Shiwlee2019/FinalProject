const express = require('express');
const router = express.Router();
const axios = require('axios');
const connectToMongo = require('../model/db');
const he = require('he');

let sessionToken = '';

// Fetch token at startup
const fetchToken = async () => {
  try {
    const res = await axios.get('https://opentdb.com/api_token.php?command=request');
    if (res.data.response_code === 0) {
      sessionToken = res.data.token;
      console.log('✅ Token fetched:', sessionToken);
    } else {
      console.error('❌ Failed to get token');
    }
  } catch (err) {
    console.error('❌ Error fetching token:', err);
  }
};
fetchToken();

// Home
router.get('/', (req, res) => {
  res.render('index');
});

// Quiz Setup Page
router.get('/quizsetup', (req, res) => {
  res.render('quizsetup');
});

// Fetch Questions
router.get('/quiz', async (req, res) => {
  const amount = req.query.amount || 10;
  const category = req.query.category || '';
  const difficulty = req.query.difficulty || '';

  let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple&token=${sessionToken}`;
  if (category) apiUrl += `&category=${category}`;
  if (difficulty) apiUrl += `&difficulty=${difficulty}`;

  try {
    const response = await axios.get(apiUrl);

    if (response.data.response_code === 3) {
      await fetchToken(); // refresh token
      apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple&token=${sessionToken}`;
      if (category) apiUrl += `&category=${category}`;
      if (difficulty) apiUrl += `&difficulty=${difficulty}`;
      const retryRes = await axios.get(apiUrl);
      if (retryRes.data.response_code !== 0) return res.status(429).send('Retry failed');
      const questions = formatQuestions(retryRes.data.results);
      req.session.questions = questions;
      return res.render('quiz', { questions });
    }

    if (response.data.response_code !== 0) return res.status(429).send('Quota exceeded');

    const questions = formatQuestions(response.data.results);
    req.session.questions = questions;
    res.render('quiz', { questions });
  } catch (err) {
    console.error('Quiz error:', err);
    res.status(500).send('Failed to load quiz');
  }
});

// Helper to format OpenTDB questions
function formatQuestions(results) {
  return results.map((q) => {
    const allChoices = [...q.incorrect_answers];
    const answerIndex = Math.floor(Math.random() * 4);
    allChoices.splice(answerIndex, 0, q.correct_answer);

    const choiceMap = {
      A: he.decode(allChoices[0]),
      B: he.decode(allChoices[1]),
      C: he.decode(allChoices[2]),
      D: he.decode(allChoices[3])
    };

    return {
      question: he.decode(q.question),
      A: choiceMap.A,
      B: choiceMap.B,
      C: choiceMap.C,
      D: choiceMap.D,
      answer: Object.keys(choiceMap).find(k => choiceMap[k] === he.decode(q.correct_answer)),
      correctAnswerText: he.decode(q.correct_answer)
    };
  });
}

// Submit Quiz
router.post('/submit', async (req, res) => {
  const userAnswers = req.body;
  const questions = req.session.questions || [];

  const reviewData = questions.map((q, i) => {
    const userChoice = userAnswers[i]; // A, B, etc.
    const userAnswer = userChoice && q[userChoice] ? q[userChoice] : '[N/A]';
    const correctAnswer = q[q.answer] || '[N/A]';
    return {
      question: q.question || '[N/A]',
      userAnswer,
      correctAnswer,
      isCorrect: userChoice === q.answer
    };
  });

  req.session.reviewData = reviewData;

  const correct = reviewData.filter(r => r.isCorrect).length;
  const total = questions.length;
  const name = req.session.user?.name || 'Guest';

  try {
    const db = await connectToMongo();
    await db.collection('scores').insertOne({ name, score: correct, total, date: new Date() });
    res.redirect(`/results?name=${name}&score=${correct}&total=${total}`);
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).send('Score save failed');
  }
});

// Results
router.get('/results', (req, res) => {
  const { name = 'Guest', score = 0, total = 10 } = req.query;
  res.render('results', { name, score: parseInt(score), total: parseInt(total) });
});

// Review Answers
router.get('/review', (req, res) => {
  const reviewData = req.session.reviewData || [];
  res.render('review', { reviewData });
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const db = await connectToMongo();
    const topScores = await db.collection('scores').find().sort({ score: -1, date: 1 }).limit(10).toArray();
    res.render('leaderboard', { topScores });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).send('Leaderboard failed');
  }
});

// Profile
router.get('/profile', async (req, res) => {
  try {
    const db = await connectToMongo();
    const user = req.session?.user || { name: 'Guest' };
    const history = await db.collection('scores').find({ name: user.name }).sort({ date: -1 }).toArray();
    const total = history.length;
    const topScore = Math.max(...history.map(h => h.score), 0);
    const avg = total > 0 ? (history.reduce((sum, h) => sum + (h.score / h.total) * 100, 0) / total).toFixed(1) : 0;
    res.render('profile', { user, stats: { total, topScore, avg }, history });
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).send('Profile load failed');
  }
});

module.exports = router;