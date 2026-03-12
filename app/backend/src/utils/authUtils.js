const jwt = require('jsonwebtoken');

// Cookie options for secure HTTP-only cookies
const getCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';
    const isHttps = process.env.FRONTEND_URL?.startsWith('https');
    return {
        httpOnly: true,
        secure: isProd && isHttps, // Only secure if production AND https
        sameSite: isProd && isHttps ? 'none' : 'lax', // None required for cross-site, but lax is fine for http
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/',
    };
};

// Generate JWT Token (30-day expiry)
const generateToken = (user) => {
    return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    getCookieOptions,
    generateToken
};
