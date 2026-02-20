const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } = require('date-fns');

// Helper: get date range for a budget period
const getDateRange = (period) => {
    const now = new Date();
    switch (period) {
        case 'weekly':
            return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        case 'yearly':
            return { start: startOfYear(now), end: endOfYear(now) };
        case 'monthly':
        default:
            return { start: startOfMonth(now), end: endOfMonth(now) };
    }
};

// GET /api/budgets
exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user._id });

        // Enrich each budget with actual spending
        const enriched = await Promise.all(budgets.map(async (budget) => {
            const { start, end } = getDateRange(budget.period);
            const spending = await Transaction.aggregate([
                {
                    $match: {
                        userId: req.user._id,
                        category: budget.category,
                        type: { $ne: 'transfer' },
                        amount: { $lt: 0 },
                        date: { $gte: start, $lte: end }
                    }
                },
                { $group: { _id: null, total: { $sum: { $abs: '$amount' } } } }
            ]);

            const spent = spending[0]?.total || 0;
            return {
                ...budget.toObject(),
                spent,
                percent: budget.amount > 0 ? Number(((spent / budget.amount) * 100).toFixed(2)) : 0
            };
        }));

        res.json(enriched);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/budgets
exports.addBudget = async (req, res) => {
    try {
        const { category, amount, period } = req.body;
        if (!category || !amount) {
            return res.status(400).json({ error: 'Category and amount are required' });
        }

        const budget = await Budget.create({
            userId: req.user._id,
            category: category.trim(),
            amount: Number(amount),
            period: period || 'monthly'
        });

        res.status(201).json(budget);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: `A ${req.body.period || 'monthly'} budget for "${req.body.category}" already exists` });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/budgets/:id
exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        if (!budget) return res.status(404).json({ error: 'Budget not found' });
        res.json(budget);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'A budget with this category and period already exists' });
        }
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/budgets/:id
exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!budget) return res.status(404).json({ error: 'Budget not found' });
        res.json({ message: 'Budget deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
