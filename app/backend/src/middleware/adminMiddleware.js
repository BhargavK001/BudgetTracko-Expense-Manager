const passport = require('passport');
const refreshSession = require('./session');

/**
 * Admin Authentication Middleware
 * 1. Authenticates using JWT (Passport)
 * 2. Refreshes the session/cookie (Sliding Expiration)
 * 3. Verifies the user has admin role
 */
const adminMiddleware = [
    passport.authenticate('jwt', { session: false }),
    refreshSession,
    (req, res, next) => {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }
        next();
    }
];

module.exports = adminMiddleware;
