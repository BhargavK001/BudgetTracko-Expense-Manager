const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Budget = require('../models/Budget');

const router = express.Router();

// Middleware: Authenticate all routes
router.use(passport.authenticate('jwt', { session: false }));

// ─── GET /api/user/profile ───
// Get current user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            success: true,
            data: {
                _id: user._id,
                displayName: user.displayName,
                email: user.email,
                phone: user.phone || '',
                avatar: user.avatar || '',
                googleId: user.googleId || null,
                githubId: user.githubId || null,
                preferences: user.preferences || { notifications: true },
                hasPassword: !!(await User.findById(req.user._id).select('+password')).password,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── PUT /api/user/profile ───
// Update profile (displayName, email, phone)
router.put('/profile', async (req, res) => {
    try {
        const { displayName, email, phone } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email;
        }

        if (displayName) user.displayName = displayName;
        if (phone !== undefined) user.phone = phone;

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                displayName: user.displayName,
                email: user.email,
                phone: user.phone,
                avatar: user.avatar,
                preferences: user.preferences
            }
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── PUT /api/user/change-password ───
// Change password (or set password for OAuth-only users)
router.put('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // If user already has a password, verify the current one
        if (user.password) {
            if (!currentPassword) {
                return res.status(400).json({ success: false, message: 'Current password is required' });
            }
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect' });
            }
        }
        // If no password exists (OAuth-only user), allow setting one without current password

        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── PUT /api/user/preferences ───
// Update user preferences (notifications, etc.)
router.put('/preferences', async (req, res) => {
    try {
        const { notifications } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.preferences) {
            user.preferences = {};
        }
        if (notifications !== undefined) {
            user.preferences.notifications = notifications;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Preferences updated',
            data: { preferences: user.preferences }
        });
    } catch (err) {
        console.error('Update preferences error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── GET /api/user/export ───
// Export all user data
router.get('/export', async (req, res) => {
    try {
        const userId = req.user._id;

        const [transactions, accounts, categories, budgets] = await Promise.all([
            Transaction.find({ userId }).sort({ date: -1 }),
            Account.find({ userId }),
            Category.find({ userId }),
            Budget.find({ userId })
        ]);

        const user = await User.findById(userId);

        const exportData = {
            exportedAt: new Date().toISOString(),
            user: {
                displayName: user.displayName,
                email: user.email
            },
            transactions,
            accounts,
            categories,
            budgets,
            summary: {
                totalTransactions: transactions.length,
                totalAccounts: accounts.length,
                totalCategories: categories.length,
                totalBudgets: budgets.length
            }
        };

        res.json({ success: true, data: exportData });
    } catch (err) {
        console.error('Export data error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── DELETE /api/user/data ───
// Clear all user data (transactions, accounts, categories, budgets) but keep the user
router.delete('/data', async (req, res) => {
    try {
        const userId = req.user._id;

        const [txResult, accResult, catResult, budResult] = await Promise.all([
            Transaction.deleteMany({ userId }),
            Account.deleteMany({ userId }),
            Category.deleteMany({ userId }),
            Budget.deleteMany({ userId })
        ]);

        res.json({
            success: true,
            message: 'All data cleared successfully',
            deleted: {
                transactions: txResult.deletedCount,
                accounts: accResult.deletedCount,
                categories: catResult.deletedCount,
                budgets: budResult.deletedCount
            }
        });
    } catch (err) {
        console.error('Clear data error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ─── DELETE /api/user/account ───
// Delete user account and all associated data permanently
router.delete('/account', async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete all user data
        await Promise.all([
            Transaction.deleteMany({ userId }),
            Account.deleteMany({ userId }),
            Category.deleteMany({ userId }),
            Budget.deleteMany({ userId })
        ]);

        // Delete the user
        await User.findByIdAndDelete(userId);

        res.json({ success: true, message: 'Account deleted permanently' });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
