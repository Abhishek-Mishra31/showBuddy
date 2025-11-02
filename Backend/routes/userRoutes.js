const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, getCurrentUser } = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);

router.post('/login', login);

router.get('/me', auth, getCurrentUser);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    localStorage.setItem('token', token);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000/'}`);
  }
);

module.exports = router;