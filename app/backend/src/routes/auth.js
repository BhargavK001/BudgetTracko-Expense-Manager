const express = require('express');
const passport = require('passport');
const router = express.Router();
const { generateToken, getCookieOptions } = require('../utils/authUtils');
const authController = require('../controllers/authController');

// Local Auth
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.put('/resetpassword/:resettoken', authController.resetPassword);

// Google Auth
// Google Auth
router.get('/google', (req, res, next) => {
    const state = req.query.state || 'web';
    passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('token', token, getCookieOptions());

        // Handle mobile redirection
        if (req.query.state === 'mobile' || req.cookies?.platform === 'mobile') {
            const userData = encodeURIComponent(JSON.stringify({
                id: req.user._id,
                displayName: req.user.displayName,
                email: req.user.email
            }));
            return res.redirect(`budgettracko://auth/callback?token=${token}&user=${userData}`);
        }

        res.redirect(`${process.env.FRONTEND_URL}/auth/callback`);
    }
);

// GitHub Auth
// GitHub Auth
router.get('/github', (req, res, next) => {
    const state = req.query.state || 'web';
    passport.authenticate('github', { scope: ['user:email'], state })(req, res, next);
});

router.get(
    '/github/callback',
    passport.authenticate('github', { failureRedirect: '/login', session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.cookie('token', token, getCookieOptions());

        // Handle mobile redirection
        if (req.query.state === 'mobile' || req.cookies?.platform === 'mobile') {
            const userData = encodeURIComponent(JSON.stringify({
                id: req.user._id,
                displayName: req.user.displayName,
                email: req.user.email
            }));
            return res.redirect(`budgettracko://auth/callback?token=${token}&user=${userData}`);
        }

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
