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
  // On failure, send user back to frontend home with a flag
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/?oauth=failed` }),
  (req, res) => {
    const token = req.user.generateAuthToken();
    // Redirect to frontend route that consumes the token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/success?token=${token}`);
  }
);

module.exports = router;