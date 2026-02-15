const { generateToken, getCookieOptions } = require('../utils/authUtils');

/**
 * Middleware to refresh the session (Sliding Expiration)
 * Must be used AFTER passport.authenticate()
 */
const refreshSession = (req, res, next) => {
    if (req.user) {
        // Issue a new token with fresh expiry
        const newToken = generateToken(req.user);

        // Reset the cookie with fresh maxAge
        res.cookie('token', newToken, getCookieOptions());
    }
    next();
};

module.exports = refreshSession;
