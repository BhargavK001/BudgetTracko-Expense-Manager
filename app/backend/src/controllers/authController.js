const User = require('../models/User');
const { generateToken, getCookieOptions } = require('../utils/authUtils');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

// Password validation regex: 8+ chars, 1 capital, 1 number, 1 symbol
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
// Strict email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Blacklisted dummy email patterns
const dummyKeywords = ['demo', 'test', 'example', 'dummy', 'guest'];

/**
 * @desc    Register a new user
 * @route   POST /auth/signup
 * @access  Public
 */
exports.signup = async (req, res) => {
    try {
        const { displayName, email, password } = req.body;

        // Validation
        if (!displayName || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
        }

        // Check for dummy email patterns
        const lowerEmail = email.toLowerCase();
        const isDummy = dummyKeywords.some(keyword => lowerEmail.includes(keyword));
        if (isDummy) {
            return res.status(400).json({
                success: false,
                message: 'Dummy or demo email addresses are not allowed. Please use a real email address.'
            });
        }

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one symbol.'
            });
        }

        // Check if user already exists
        const exitingUser = await User.findOne({ email });
        if (exitingUser) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({
            displayName,
            email,
            password
        });

        // Generate token and set cookie
        const token = generateToken(user);
        res.cookie('token', token, getCookieOptions());

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                displayName: user.displayName,
                email: user.email
            },
            token
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        const { email, password, expectedRole } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Find user by email and select password (since it's hidden by default in schema)
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if account is deactivated
        if (user.accountStatus === 'deactivated') {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
        }

        // Enforce role separation if expectedRole is provided
        if (expectedRole) {
            if (expectedRole === 'admin' && user.role !== 'admin') {
                return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
            }
            if (expectedRole === 'user' && user.role === 'admin') {
                return res.status(403).json({ success: false, message: 'Admins must login via the Admin Portal.' });
            }
        }

        // Generate token and set cookie
        const token = generateToken(user);
        res.cookie('token', token, getCookieOptions());

        res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                id: user._id,
                displayName: user.displayName,
                email: user.email
            },
            token
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

/**
 * @desc    Forgot Password
 * @route   POST /auth/forgotpassword
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Dev: Log reset URL
        console.log('--- PASSWORD RESET URL ---');
        console.log(resetUrl);
        console.log('--------------------------');

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
        const html = `
            <h1>Password Reset Request</h1>
            <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you did not request this, please ignore this email.</p>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
                html
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (err) {
        console.error('Forgot Password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Reset Password
 * @route   PUT /auth/resetpassword/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        // Log user in immediately
        const token = generateToken(user);
        res.cookie('token', token, getCookieOptions());

        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                displayName: user.displayName,
                email: user.email
            },
            token
        });
    } catch (err) {
        console.error('Reset Password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
