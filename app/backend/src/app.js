const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const passport = require('passport');
require('./config/passport'); // Passport config

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payments');
const statusRoutes = require('./routes/status.routes');


// Initialize app
const app = express();

// ─── Security Headers (Helmet - strict config) ───
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],  // needed for inline styles
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://*.googleusercontent.com', 'https://avatars.githubusercontent.com'],
            connectSrc: ["'self'", process.env.FRONTEND_URL],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false, // Allow cross-origin images (cloudinary, google)
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// ─── CORS with credentials ───
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '1mb' })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Parse form data with size limit

// ─── Input Sanitization (Express 5 compatible) ───
// Recursively strip keys starting with '$' or containing '.' (MongoDB injection)
// and escape HTML chars (XSS) in string values
const sanitizeValue = (val) => {
    if (typeof val === 'string') {
        return val
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    if (Array.isArray(val)) return val.map(sanitizeValue);
    if (val && typeof val === 'object') return sanitizeObject(val);
    return val;
};
const sanitizeObject = (obj) => {
    const clean = {};
    for (const key of Object.keys(obj)) {
        if (key.startsWith('$') || key.includes('.')) continue; // drop Mongo operators
        clean[key] = sanitizeValue(obj[key]);
    }
    return clean;
};
app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
});

// Prevent HTTP parameter pollution
app.use(hpp());

// ─── Logging (only in development) ───
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

app.use(passport.initialize()); // Initialize Passport

// ─── Cache-Control: prevent browsers from caching sensitive API responses ───
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});
app.use('/auth', (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// ─── CSRF Protection (Double-Submit Cookie Pattern) ───
// Generate CSRF token on every GET request (readable cookie + compared to header)
app.use((req, res, next) => {
    // For GET/HEAD/OPTIONS: set or refresh the CSRF cookie
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        if (!req.cookies['csrf-token']) {
            const csrfToken = crypto.randomBytes(32).toString('hex');
            res.cookie('csrf-token', csrfToken, {
                httpOnly: false,         // Frontend JS must read this
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days (same as auth cookie)
                path: '/',
            });
        }
        return next();
    }

    // For POST/PUT/DELETE: verify the CSRF token
    const cookieToken = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ success: false, message: 'CSRF token validation failed' });
    }

    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // limit each IP to 500 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' })); // Simple health check
app.use('/api/status', statusRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to BudgetTracko API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    // Only log errors in development
    if (process.env.NODE_ENV !== 'production') {
        console.error(err.stack);
    }
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        // Never leak error details in production
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

module.exports = app;
