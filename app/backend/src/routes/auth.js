const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// GitHub Auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    }
);

// Logout
router.get('/logout', (req, res) => {
    // Client-side: remove token from storage
    res.status(200).json({ message: 'Logged out successfully' });
});

// Get Current User
router.get(
    '/me',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            user: req.user
        });
    }
);

module.exports = router;
