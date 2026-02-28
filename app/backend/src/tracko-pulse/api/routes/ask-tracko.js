const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const Transaction = require('../../../models/Transaction');
const Budget = require('../../../models/Budget');
const aiClient = require('../ai-client');
const { askTrackoTemplate } = require('../prompt-builder');
const { summarizeTransactionsForAI } = require('../../services/transaction-summarizer');

// POST /api/tracko-pulse/ask
router.post('/ask', authMiddleware, async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ success: false, message: "Question is required" });
        }

        const userId = req.user.id;

        // 1. Fetch data for current month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

        const transactions = await Transaction.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean();

        // 2. Fetch budgets (total)
        const budgets = await Budget.find({ userId, isActive: true }).lean();
        const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);

        // 3. Summarize (we leave next7DaysBills empty for Phase 1 as it requires full recurring bill integration)
        const next7DaysBills = [];
        const summary = summarizeTransactionsForAI(transactions, { amount: totalBudget }, next7DaysBills);

        // 4. Build prompt
        const prompt = askTrackoTemplate(summary, question);

        // 5. Query AI Client (with 3-tier fallback)
        const aiResponse = await aiClient.generateResponse(prompt);

        return res.status(200).json({
            success: true,
            data: {
                answer: aiResponse.text,
                provider: aiResponse.provider,
                trace: aiResponse.trace
            }
        });
    } catch (error) {
        console.error("Ask Tracko Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to communicate with Tracko AI.",
            error: error.message
        });
    }
});

module.exports = router;
