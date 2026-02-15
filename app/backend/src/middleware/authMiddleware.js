const passport = require('passport');
const refreshSession = require('./session');

/**
 * Composite Authentication Middleware
 * 1. Authenticates using JWT (Passport)
 * 2. Refreshes the session/cookie (Sliding Expiration)
 */
const authMiddleware = [
    passport.authenticate('jwt', { session: false }),
    refreshSession
];

module.exports = authMiddleware;
