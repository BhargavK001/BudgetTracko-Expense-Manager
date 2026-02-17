const User = require('../models/User');
const Payment = require('../models/Payment');
const ContactRequest = require('../models/ContactRequest');
const AppConfig = require('../models/AppConfig');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Admin
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            deactivatedUsers,
            totalPayments,
            totalRevenue,
            recentSignups,
            pendingContacts
        ] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'user', accountStatus: 'active' }),
            User.countDocuments({ role: 'user', accountStatus: 'deactivated' }),
            Payment.countDocuments({ status: 'captured' }),
            Payment.aggregate([
                { $match: { status: 'captured' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.countDocuments({
                role: 'user',
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            ContactRequest.countDocuments({ status: 'unread' })
        ]);

        const registrationBreakdown = await User.aggregate([
            { $match: { role: 'user' } },
            { $group: { _id: '$registrationMethod', count: { $sum: 1 } } }
        ]);

        const subscriptionBreakdown = await User.aggregate([
            { $match: { role: 'user' } },
            { $group: { _id: '$subscription.plan', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                deactivatedUsers,
                totalPayments,
                totalRevenue: totalRevenue[0]?.total || 0,
                recentSignups,
                pendingContacts,
                registrationBreakdown: registrationBreakdown.reduce((acc, item) => {
                    acc[item._id || 'normal'] = item.count;
                    return acc;
                }, {}),
                subscriptionBreakdown: subscriptionBreakdown.reduce((acc, item) => {
                    acc[item._id || 'free'] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Admin Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
};

/**
 * @desc    Get analytics data (signups and revenue per day for last 30 days)
 * @route   GET /api/admin/analytics
 * @access  Admin
 */
exports.getAnalyticsData = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [signupTrend, revenueTrend] = await Promise.all([
            User.aggregate([
                { $match: { role: 'user', createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Payment.aggregate([
                { $match: { status: 'captured', createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        revenue: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Fill in missing dates with zero values
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            days.push(date.toISOString().split('T')[0]);
        }

        const signupMap = signupTrend.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {});
        const revenueMap = revenueTrend.reduce((acc, item) => ({ ...acc, [item._id]: { revenue: item.revenue, count: item.count } }), {});

        const analytics = days.map(date => ({
            date,
            signups: signupMap[date] || 0,
            revenue: revenueMap[date]?.revenue || 0,
            payments: revenueMap[date]?.count || 0
        }));

        res.json({ success: true, data: analytics });
    } catch (error) {
        console.error('Admin Analytics Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch analytics data' });
    }
};

/**
 * @desc    Get all transactions (payments)
 * @route   GET /api/admin/transactions
 * @access  Admin
 */
exports.getTransactions = async (req, res) => {
    try {
        const { page: qPage, limit: qLimit, startDate, endDate } = req.query;
        const page = parseInt(qPage) || 1;
        const limit = parseInt(qLimit) || 20;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // To include the entire end date, we set it to the beginning of the next day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const [transactions, total] = await Promise.all([
            Payment.find(query)
                .populate('userId', 'displayName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Payment.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin Transactions Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Admin
 */
exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const query = { role: 'user' };
        if (search) {
            query.$or = [
                { displayName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select('displayName email avatar registrationMethod accountStatus subscription createdAt googleId githubId')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin Users Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

/**
 * @desc    Toggle user account status (active/deactivated)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Admin
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'deactivated'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot modify admin accounts' });
        }

        user.accountStatus = status;
        await user.save();

        res.json({
            success: true,
            message: `User account ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
            data: { id: user._id, accountStatus: user.accountStatus }
        });
    } catch (error) {
        console.error('Admin Update User Status Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user status' });
    }
};

/**
 * @desc    Get app config
 * @route   GET /api/admin/config
 * @access  Admin
 */
exports.getAppConfig = async (req, res) => {
    try {
        const configs = await AppConfig.find();
        const configMap = configs.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
        }, {});

        // Set defaults if not found
        if (!configMap.siteVersion) {
            configMap.siteVersion = '1.0.0';
        }

        res.json({ success: true, data: configMap });
    } catch (error) {
        console.error('Admin Config Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch config' });
    }
};

/**
 * @desc    Update app config
 * @route   PUT /api/admin/config
 * @access  Admin
 */
exports.updateAppConfig = async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined || value === null) {
            return res.status(400).json({ success: false, message: 'Key and value are required' });
        }

        const config = await AppConfig.findOneAndUpdate(
            { key },
            { value, updatedAt: new Date() },
            { upsert: true, returnDocument: 'after' }
        );

        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Admin Update Config Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update config' });
    }
};

/**
 * @desc    Get public site version (no auth required)
 * @route   GET /api/config/version
 * @access  Public
 */
exports.getPublicVersion = async (req, res) => {
    try {
        const config = await AppConfig.findOne({ key: 'siteVersion' });
        res.json({ success: true, version: config?.value || '1.0.0' });
    } catch (error) {
        res.status(500).json({ success: false, version: '1.0.0' });
    }
};
