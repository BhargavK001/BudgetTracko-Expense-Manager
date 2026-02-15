const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Cookie options for secure HTTP-only cookies
const getCookieOptions = () => ({
    httpOnly: true,                              // Not accessible via JavaScript
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cross-site in prod
    maxAge: 3 * 24 * 60 * 60 * 1000,            // 3 days in milliseconds
    path: '/',
});

// Generate JWT Token (3-day expiry)
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '3d',
    });
};

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
