const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const DeletionLog = require('../models/DeletionLog');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all transactions for user (with optional filters)
// @route   GET /api/transactions
exports.getTransactions = async (req, res) => {
    try {
        const { accountId, type, category, startDate, endDate } = req.query;
        const filter = { userId: req.user._id };

        if (accountId) {
            filter.$or = [
                { accountId },
                { fromAccountId: accountId },
                { toAccountId: accountId }
            ];
        }
        if (type) filter.type = type;
        if (category) filter.category = category;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const transactions = await Transaction.find(filter)
            .sort({ date: -1, createdAt: -1 })
            .populate('accountId', 'name type color')
            .populate('fromAccountId', 'name type color')
            .populate('toAccountId', 'name type color');

        res.json({ success: true, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Create transaction (income, expense, or transfer)
// @route   POST /api/transactions
exports.createTransaction = async (req, res) => {
    try {
        const {
            type, text, amount, category, accountId,
            fromAccountId, toAccountId,
            date, time, paymentMode, note, tags
        } = req.body;

        // Parse tags
        let parsedTags = [];
        try {
            parsedTags = typeof tags === 'string'
                ? tags.split(',').map(t => t.trim()).filter(Boolean)
                : (tags || []);
        } catch (tagError) {
            console.error('Error parsing tags:', tagError);
        }

        // Handle file attachments
        let attachments = [];
        try {
            if (req.files && Array.isArray(req.files)) {
                attachments = req.files.map(file => ({
                    url: file.path,
                    publicId: file.filename,
                    name: file.originalname
                }));
            }
        } catch (fileError) {
            console.error('Error processing files:', fileError);
        }

        // Build the transaction
        const txData = {
            userId: req.user._id,
            type,
            text,
            amount: type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
            category: type === 'transfer' ? 'Transfer' : category,
            date: date || new Date(),
            time: time || '',
            paymentMode: paymentMode || 'Cash',
            note: note || '',
            tags: parsedTags,
            attachments
        };

        // Handle types
        if (type === 'transfer') {
            if (!fromAccountId || !toAccountId) {
                return res.status(400).json({ success: false, message: 'Transfer requires fromAccountId and toAccountId' });
            }
            if (fromAccountId === toAccountId) {
                return res.status(400).json({ success: false, message: 'Cannot transfer to the same account' });
            }


            txData.fromAccountId = fromAccountId;
            txData.toAccountId = toAccountId;
            txData.amount = Math.abs(Number(amount));

            // Update account balances
            await Account.findByIdAndUpdate(fromAccountId, { $inc: { balance: -Math.abs(Number(amount)) } });
            await Account.findByIdAndUpdate(toAccountId, { $inc: { balance: Math.abs(Number(amount)) } });
        } else if (accountId) {
            if (!amount) {
                return res.status(400).json({ success: false, message: 'Amount is required' });
            }

            txData.accountId = accountId;
            const balanceChange = type === 'income' ? Math.abs(Number(amount)) : -Math.abs(Number(amount));
            await Account.findByIdAndUpdate(accountId, { $inc: { balance: balanceChange } });
        }

        const transaction = await Transaction.create(txData);

        const populated = await Transaction.findById(transaction._id)
            .populate('accountId', 'name type color')
            .populate('fromAccountId', 'name type color')
            .populate('toAccountId', 'name type color');

        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        console.error('Error creating transaction:', err);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
};


// @desc    Get single transaction
// @route   GET /api/transactions/:id
exports.getTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('accountId', 'name type color')
            .populate('fromAccountId', 'name type color')
            .populate('toAccountId', 'name type color');
        if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
        res.json({ success: true, data: transaction });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
    try {
        const existing = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
        if (!existing) return res.status(404).json({ success: false, message: 'Transaction not found' });

        // Reverse old balance changes
        if (existing.type === 'transfer') {
            await Account.findByIdAndUpdate(existing.fromAccountId, { $inc: { balance: existing.amount } });
            await Account.findByIdAndUpdate(existing.toAccountId, { $inc: { balance: -existing.amount } });
        } else if (existing.accountId) {
            await Account.findByIdAndUpdate(existing.accountId, { $inc: { balance: -existing.amount } });
        }

        const { type, text, amount, category, accountId, fromAccountId, toAccountId, date, time, paymentMode, note, tags } = req.body;
        const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || existing.tags);

        // Handle new file attachments safely
        let newAttachments = [];
        if (req.files && Array.isArray(req.files)) {
            newAttachments = req.files.map(file => ({
                url: file.path,
                publicId: file.filename,
                name: file.originalname
            }));
        }

        const attachments = [...(existing.attachments || []), ...newAttachments];

        const updateData = {
            type: type || existing.type,
            text: text || existing.text,
            amount: type === 'expense' ? -Math.abs(Number(amount || Math.abs(existing.amount))) : Math.abs(Number(amount || Math.abs(existing.amount))),
            category: category || existing.category,
            date: date || existing.date,
            time: time !== undefined ? time : existing.time,
            paymentMode: paymentMode || existing.paymentMode,
            note: note !== undefined ? note : existing.note,
            tags: parsedTags,
            attachments,
            accountId: accountId || existing.accountId,
            fromAccountId: fromAccountId || existing.fromAccountId,
            toAccountId: toAccountId || existing.toAccountId
        };

        // Apply new balance changes
        const effectiveType = updateData.type;
        const effectiveAmount = Number(updateData.amount);

        if (effectiveType === 'transfer') {
            updateData.amount = Math.abs(effectiveAmount);
            await Account.findByIdAndUpdate(updateData.fromAccountId, { $inc: { balance: -Math.abs(effectiveAmount) } });
            await Account.findByIdAndUpdate(updateData.toAccountId, { $inc: { balance: Math.abs(effectiveAmount) } });
        } else if (updateData.accountId) {
            await Account.findByIdAndUpdate(updateData.accountId, { $inc: { balance: effectiveAmount } });
        }

        const updated = await Transaction.findByIdAndUpdate(req.params.id, { $set: updateData }, { returnDocument: 'after' })
            .populate('accountId', 'name type color')
            .populate('fromAccountId', 'name type color')
            .populate('toAccountId', 'name type color');

        res.json({ success: true, data: updated });
    } catch (err) {
        console.error('Error updating transaction:', err);
        res.status(500).json({ success: false, message: 'Server Error: ' + err.message });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });

        // Check for user
        if (transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        // Delete images from Cloudinary
        if (transaction.attachments && transaction.attachments.length > 0) {
            for (const file of transaction.attachments) {
                if (file.publicId) {
                    try {
                        await cloudinary.uploader.destroy(file.publicId);
                    } catch (cloudErr) {
                        console.error(`Failed to delete image ${file.publicId} from Cloudinary:`, cloudErr);
                        // Continue deletion even if cloud delete fails
                    }
                }
            }
        }

        // Reverse balance changes
        if (transaction.type === 'transfer') {
            await Account.findByIdAndUpdate(transaction.fromAccountId, { $inc: { balance: transaction.amount } });
            await Account.findByIdAndUpdate(transaction.toAccountId, { $inc: { balance: -transaction.amount } });
        } else if (transaction.accountId) {
            // If income is deleted, subtract amount. If expense is deleted, add amount back (expense stored as negative)
            await Account.findByIdAndUpdate(transaction.accountId, { $inc: { balance: -transaction.amount } });
        }

        await transaction.deleteOne();

        // Log deletion for sync
        await DeletionLog.create({
            userId: req.user._id,
            entityType: 'transaction',
            entityId: req.params.id
        });

        res.json({ success: true, message: 'Transaction deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Get transactions for a specific account
// @route   GET /api/transactions/account/:accountId
exports.getAccountTransactions = async (req, res) => {
    try {
        const { accountId } = req.params;
        const transactions = await Transaction.find({
            userId: req.user._id,
            $or: [
                { accountId },
                { fromAccountId: accountId },
                { toAccountId: accountId }
            ]
        })
            .sort({ date: -1 })
            .populate('accountId', 'name type color')
            .populate('fromAccountId', 'name type color')
            .populate('toAccountId', 'name type color');

        res.json({ success: true, data: transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
