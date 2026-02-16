const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Budget = require('../models/Budget');
const { getCookieOptions } = require('../utils/authUtils');

const router = express.Router();

// ─── DELETE /api/user/account ───
// Delete user account and all associated data permanently
// Defined BEFORE authMiddleware to skip refreshSession (we don't want to set a new cookie while deleting!)
router.delete('/account', passport.authenticate('jwt', { session: false }), async (req, res) => {
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

        // Clear the auth cookie so the deleted user is fully logged out
        res.clearCookie('token', getCookieOptions());

        // Clear CSRF cookie too (options must match creation)
        res.clearCookie('csrf-token', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });

        res.json({ success: true, message: 'Account deleted permanently' });
    } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.error('Delete account error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Middleware: Authenticate all other routes
router.use(require('../middleware/authMiddleware'));

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
        if (process.env.NODE_ENV !== 'production') console.error('Get profile error:', err);
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
        if (process.env.NODE_ENV !== 'production') console.error('Update profile error:', err);
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
        if (process.env.NODE_ENV !== 'production') console.error('Change password error:', err);
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
        if (process.env.NODE_ENV !== 'production') console.error('Update preferences error:', err);
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
        if (process.env.NODE_ENV !== 'production') console.error('Export data error:', err);
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
        if (process.env.NODE_ENV !== 'production') console.error('Clear data error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});



const multer = require('multer');
const { toCSV, parseCSV } = require('../utils/csvUtils');
const upload = multer({ storage: multer.memoryStorage() });

// ─── GET /api/user/export/csv ───
// Export transactions as CSV
router.get('/export/csv', async (req, res) => {
    try {
        const userId = req.user._id;
        const transactions = await Transaction.find({ userId })
            .sort({ date: -1 })
            .populate('accountId', 'name')
            .populate('fromAccountId', 'name')
            .populate('toAccountId', 'name');

        const data = transactions.map(t => ({
            Date: t.date ? t.date.toISOString().split('T')[0] : '',
            Type: t.type,
            Category: t.category,
            Amount: t.amount,
            Text: t.text || '',
            Note: t.note || '',
            Account: t.accountId ? t.accountId.name : '',
            FromAccount: t.fromAccountId ? t.fromAccountId.name : '',
            ToAccount: t.toAccountId ? t.toAccountId.name : '',
            PaymentMode: t.paymentMode || ''
        }));

        const csv = toCSV(data);

        res.header('Content-Type', 'text/csv');
        res.attachment(`budget_tracko_export_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
    } catch (err) {
        console.error('Export CSV error:', err);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Server error' : 'Server error during export: ' + err.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
        });
    }
});

// ─── POST /api/user/import/csv ───
// Import transactions from CSV
router.post('/import/csv', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const stats = { imported: 0, skipped: 0, newAccounts: 0, newCategories: 0 };
        const parsedData = await parseCSV(req.file.buffer);

        if (!parsedData || parsedData.length === 0) {
            return res.status(400).json({ success: false, message: 'Empty or invalid CSV file' });
        }

        const userId = req.user._id;

        // Cache existing accounts/categories to minimize DB queries
        const userAccounts = await Account.find({ userId });
        const accountMap = new Map(userAccounts.map(a => [a.name.toLowerCase(), a]));

        // Process each row
        for (const row of parsedData) {
            // Basic validation
            if (!row.Date || !row.Amount || !row.Type) {
                stats.skipped++;
                continue;
            }

            const type = row.Type.toLowerCase();
            const amount = Math.abs(parseFloat(row.Amount));
            if (isNaN(amount)) {
                stats.skipped++;
                continue;
            }

            const parsedDate = new Date(row.Date);
            if (isNaN(parsedDate.getTime())) {
                stats.skipped++;
                continue;
            }

            // Resolve Account
            let accountId = null;
            let fromAccountId = null;
            let toAccountId = null;

            const getOrCreateAccount = async (name) => {
                if (!name) return null;
                const normalized = name.trim().toLowerCase();
                if (accountMap.has(normalized)) return accountMap.get(normalized)._id;

                // Create new account
                const newAcc = await Account.create({
                    userId,
                    name: name.trim(),
                    type: 'cash', // default
                    balance: 0,
                    color: '#7C3AED',
                    icon: 'BsWallet2'
                });
                accountMap.set(normalized, newAcc);
                stats.newAccounts++;
                return newAcc._id;
            };

            if (type === 'transfer') {
                fromAccountId = await getOrCreateAccount(row.FromAccount);
                toAccountId = await getOrCreateAccount(row.ToAccount);
                if (!fromAccountId || !toAccountId) {
                    // Fallback if transfer accounts missing
                    stats.skipped++;
                    continue;
                }

                // Update balances
                await Account.findByIdAndUpdate(fromAccountId, { $inc: { balance: -amount } });
                await Account.findByIdAndUpdate(toAccountId, { $inc: { balance: amount } });

            } else {
                accountId = await getOrCreateAccount(row.Account);
                if (accountId) {
                    const balanceChange = type === 'income' ? amount : -amount;
                    await Account.findByIdAndUpdate(accountId, { $inc: { balance: balanceChange } });
                }
            }

            // Create Transaction
            await Transaction.create({
                userId,
                type: type,
                amount: type === 'expense' ? -amount : amount,
                category: row.Category || 'Other',
                date: parsedDate,
                text: row.Text || row.Note || 'Imported Transaction',
                note: row.Note || 'Imported via CSV',
                paymentMode: row.PaymentMode || 'Cash',
                accountId,
                fromAccountId,
                toAccountId
            });

            stats.imported++;
        }

        res.json({
            success: true,
            message: `Import complete`,
            stats
        });

    } catch (err) {
        console.error('Import CSV error:', err);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'production' ? 'Server error' : 'Server error during import: ' + err.message,
            stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
        });
    }
});

module.exports = router;
