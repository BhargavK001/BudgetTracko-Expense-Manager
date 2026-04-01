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
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/adminRoutes');
const { getPublicVersion } = require('./controllers/adminController');
const maintenanceMiddleware = require('./middleware/maintenanceMiddleware');

// Helper to get domain for cookies
const getCookieDomain = () => {
    if (process.env.NODE_ENV !== 'production') return undefined;
    // Explicitly set the root domain for production to share cookies between api., www., and root
    return '.budgettracko.app';
};


// Initialize app
const app = express();

// Trust proxy is required for secure cookies and rate limiting behind load balancers/proxies
app.set('trust proxy', 1);

// ─── Security Headers (Helmet - strict config) ───
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],  // needed for inline styles
            imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://*.googleusercontent.com', 'https://avatars.githubusercontent.com'],
            connectSrc: ["'self'", process.env.FRONTEND_URL, "ws:", "wss:"],
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
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://budgettracko.app',
    'https://www.budgettracko.app',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(cookieParser()); // Parse cookies
app.use(express.json({ limit: '10mb' })); // Parse JSON with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse form data with size limit

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
    // Skip sanitization for webhooks to preserve signature
    if (req.originalUrl === '/api/payments/webhook') {
        return next();
    }
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
// Paths exempt from CSRF verification (e.g. external webhooks, login)
const csrfExemptPaths = ['/api/payments/webhook', '/auth/login', '/auth/signup', '/auth/forgotpassword', '/auth/resetpassword'];

const csrfCookieOptions = () => {
    const isProd = process.env.NODE_ENV === 'production';
    const isHttps = process.env.FRONTEND_URL?.startsWith('https');
    return {
        httpOnly: false,
        secure: isProd && isHttps,
        sameSite: isProd && isHttps ? 'none' : 'lax',
        domain: getCookieDomain(),
        maxAge: 3 * 24 * 60 * 60 * 1000,
        path: '/',
    };
};

app.use((req, res, next) => {
    // For GET/HEAD/OPTIONS: set or refresh the CSRF cookie
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        if (!req.cookies['csrf-token']) {
            const csrfToken = crypto.randomBytes(32).toString('hex');
            res.cookie('csrf-token', csrfToken, csrfCookieOptions());
            // Store on req so downstream handlers can access the newly generated token
            req.csrfToken = csrfToken;
        } else {
            req.csrfToken = req.cookies['csrf-token'];
        }
        return next();
    }

    // Skip CSRF for exempt paths (e.g. payment webhooks that verify their own signature)
    if (csrfExemptPaths.some(p => req.path === p || req.originalUrl.endsWith(p))) {
        return next();
    }

    // Bypass CSRF for requests with an Authorization header (API calls)
    if (req.headers.authorization) {
        return next();
    }

    // For POST/PUT/DELETE: verify the CSRF token
    const cookieToken = req.cookies['csrf-token'];
    const headerToken = req.headers['x-csrf-token'];

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        console.error(`CSRF Verification Failed for ${req.path}: cookie=${!!cookieToken}, header=${!!headerToken}, match=${cookieToken === headerToken}`);
        return res.status(403).json({
            success: false,
            message: 'CSRF token validation failed',
            debug: {
                reason: !cookieToken ? 'Cookie missing' : !headerToken ? 'Header missing' : 'Mismatch',
                cookieReceived: !!cookieToken,
                headerReceived: !!headerToken
            }
        });
    }

    next();
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // limit each IP to 500 requests per windowMs
});
app.use(limiter);

// Maintenance mode check (after rate limiter, before routes)
app.use(maintenanceMiddleware);

// Routes
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/recurring', require('./routes/recurring'));
app.use('/api/tracko-pulse', require('./tracko-pulse/api/routes/ask-tracko'));
app.use('/api/tracko-pulse', require('./tracko-pulse/api/routes/pulse-analysis'));
app.use('/api/tracko-pulse/notifications', require('./tracko-pulse/api/routes/smart-notifications'));

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' })); // Simple health check
// CSRF Token Endpoint - Explicitly fetch token
app.get('/api/csrf-token', (req, res) => {
    // req.csrfToken is set by the CSRF middleware (works even on first request)
    const token = req.csrfToken || req.cookies['csrf-token'];
    res.json({ csrfToken: token });
});
app.use('/api/status', statusRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/config/version', getPublicVersion);

// Public config endpoint (for maintenance mode, announcements)
app.get('/api/config/public', async (req, res) => {
    try {
        const AppConfig = require('./models/AppConfig');
        const configs = await AppConfig.find({
            key: { $in: ['maintenance_mode', 'maintenance_message', 'announcement', 'announcement_type'] }
        });
        const configMap = configs.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});
        res.json({ success: true, data: configMap });
    } catch (error) {
        res.status(500).json({ success: false, data: {} });
    }
});

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
