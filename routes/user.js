const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const connectToMongo = require('../model/db');

// GET: Sign Up page
router.get('/signup', (req, res) => {
  res.render('signup', { error: null, success: null });
});

// POST: Handle Sign Up
router.post('/signup', async (req, res) => {
  const { name, email, password, dob } = req.body;

  try {
    const db = await connectToMongo();
    const users = db.collection('users');

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'Email already exists', success: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await users.insertOne({
      name,
      email,
      password: hashedPassword,
      dob,
      createdAt: new Date()
    });

    return res.render('signup', {
      success: true,
      error: null
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.render('signup', { error: 'Internal server error', success: null });
  }
});

// GET: Sign In page
router.get('/signin', (req, res) => {
  res.render('signin', { error: null });
});

// POST: Handle Sign In
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const db = await connectToMongo();
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) {
      return res.render('signin', { error: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('signin', { error: 'Incorrect password' });
    }

    req.session.user = {
      name: user.name,
      email: user.email
    };

    res.redirect('/profile');
  } catch (err) {
    console.error('Signin error:', err);
    res.render('signin', { error: 'Something went wrong' });
  }
});

// GET: Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
