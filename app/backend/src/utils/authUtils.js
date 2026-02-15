const jwt = require('jsonwebtoken');

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

module.exports = {
    getCookieOptions,
    generateToken
};
