const Account = require('../models/Account');

// @desc    Get all accounts for user
// @route   GET /api/accounts
exports.getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: accounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create account
// @route   POST /api/accounts
exports.createAccount = async (req, res) => {
    try {
        const { name, type, balance, currency, color, icon } = req.body;
        const account = await Account.create({
            userId: req.user._id,
            name,
            type,
            balance: balance || 0,
            currency: currency || 'INR',
            color: color || '#0088FE',
            icon: icon || 'bank'
        });
        res.status(201).json({ success: true, data: account });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
exports.getAccount = async (req, res) => {
    try {
        const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });
        if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
        res.json({ success: true, data: account });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
exports.updateAccount = async (req, res) => {
    try {
        const account = await Account.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
        res.json({ success: true, data: account });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
exports.deleteAccount = async (req, res) => {
    try {
        const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
        res.json({ success: true, message: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
