const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
require('dotenv').config();

const session = require('express-session'); // ✅ ADD THIS

const app = express();

const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ✅ ENABLE EXPRESS SESSION
app.use(session({
  secret: 'thinkstorm_secret_key_123', // replace with secure value in production
  resave: false,
  saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/', userRouter);

app.use((req, res) => {
  res.status(404).render('error', {
    message: 'Page Not Found',
    error: {}
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ ThinkStorm Quiz App running at http://localhost:${PORT}`);
});
