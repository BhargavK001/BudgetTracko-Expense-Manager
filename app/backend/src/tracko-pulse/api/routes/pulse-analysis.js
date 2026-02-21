const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const Transaction = require('../../../models/Transaction');
const Budget = require('../../../models/Budget');
const aiClient = require('../ai-client');
const { pulseAnalysisTemplate } = require('../prompt-builder');
const { summarizeTransactionsForAI } = require('../../services/transaction-summarizer');

// GET /api/tracko-pulse/monthly-analysis
router.get('/monthly-analysis', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch data for current month
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);

        const transactions = await Transaction.find({
            userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
        }).lean();

        // 2. Fetch budgets
        const budgets = await Budget.find({ userId, isActive: true }).lean();
        const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount || 0), 0);

        // 3. Summarize (Leaving next7DaysBills empty for Phase 3 initially as we just need spending data)
        const summary = summarizeTransactionsForAI(transactions, { amount: totalBudget }, []);

        // 4. Build prompt enforcement for the 4 JSON keys
        const prompt = pulseAnalysisTemplate(summary);

        // 5. Query AI Client
        const aiResponse = await aiClient.generateResponse(prompt);

        // 6. Robust JSON Parsing & Regex Extraction
        // Sometimes AI hallucinates ```json ... ``` blocks around the response. We must strip those.
        let jsonPayload;
        try {
            // First try to parse it raw just in case it obeyed perfectly
            jsonPayload = JSON.parse(aiResponse.text.trim());
        } catch (initialError) {
            // It failed. Let's try aggressive regex extraction to pull out the first { ... } block
            console.log("Tracko Pulse: Raw JSON parse failed, attempting regex sanitization...");
            const jsonRegex = /{[\s\S]*}/;
            const match = aiResponse.text.match(jsonRegex);

            if (match && match[0]) {
                try {
                    jsonPayload = JSON.parse(match[0]);
                } catch (secondaryError) {
                    throw new Error("Failed to parse AI output into valid JSON even after sanitization.");
                }
            } else {
                throw new Error("No JSON structure found in AI response.");
            }
        }

        // 7. Verify all 4 keys exist so frontend doesn't crash mapping undefined values
        const requiredKeys = ['roast', 'praise', 'hustleTip', 'investmentTip'];
        for (const key of requiredKeys) {
            if (!jsonPayload[key]) {
                jsonPayload[key] = "Tracko is speechless... (Data generation failed for this section).";
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                analysis: jsonPayload,
                provider: aiResponse.provider,
                trace: aiResponse.trace
            }
        });

    } catch (error) {
        console.error("Pulse Analysis Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate monthly pulse.",
            error: error.message
        });
    }
});

module.exports = router;
