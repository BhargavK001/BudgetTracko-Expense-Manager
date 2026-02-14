const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('./config/passport'); // Passport config

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');

// Initialize app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse form data (for multer)
app.use(morgan('dev')); // Logging
app.use(passport.initialize()); // Initialize Passport

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to BudgetTracko API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;
