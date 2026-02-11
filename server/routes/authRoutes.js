const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
  register,
  login,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
    session: false,
  }),
  (req, res) => {
    // Generate JWT token
    const token = req.user.generateToken();

    // Redirect to frontend with token
    // Note: (auth)/callback in Next.js App Router translates to /callback
    res.redirect(`${process.env.CLIENT_URL}/callback?token=${token}`);
  }
);

module.exports = router;