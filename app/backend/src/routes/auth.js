const express = require('express');
const passport = require('passport');
const router = express.Router();
const { generateToken, getCookieOptions } = require('../utils/authUtils');

// Google Auth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('token', token, getCookieOptions());
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }
);

// GitHub Auth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('token', token, getCookieOptions());
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }
);

// Logout - clear the cookie
router.get('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// Get Current User & Refresh Session
router.get(
    '/me',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Sliding session: Issue a new token and refresh the cookie
        const newToken = generateToken(req.user);
        res.cookie('token', newToken, getCookieOptions());

        res.json({
            user: req.user
        });
    }
);

module.exports = router;
