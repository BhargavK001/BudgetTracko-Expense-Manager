// src/tracko-pulse/services/smart-notifications.js
const Transaction = require('../../models/Transaction');

/**
 * Calculates a quick "Smart Notification" insight comparing the current week's 
 * spending to the previous week's spending.
 */
const generateSmartNotification = async (userId) => {
    try {
        const now = new Date();

        // Boundaries for "This Week" (last 7 days down to the millisecond)
        const thisWeekEnd = new Date(now);
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);

        // Boundaries for "Last Week" (the 7 days prior to "This Week")
        const lastWeekEnd = new Date(thisWeekStart);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        // Fetch transactions for the last 14 days
        const recentTransactions = await Transaction.find({
            userId,
            date: { $gte: lastWeekStart, $lte: thisWeekEnd },
            type: 'expense' // Only care about spending for the roast
        }).lean();

        // If not enough data, return a generic greeting
        if (!recentTransactions || recentTransactions.length === 0) {
            return {
                insight: "Tracko missed you! Go buy a coffee so I can judge you.",
                type: "neutral"
            };
        }

        // Tally spending
        let thisWeekTotal = 0;
        let lastWeekTotal = 0;

        recentTransactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const amount = Number(tx.amount) || 0;
            if (txDate >= thisWeekStart && txDate <= thisWeekEnd) {
                thisWeekTotal += amount;
            } else if (txDate >= lastWeekStart && txDate < thisWeekEnd) {
                lastWeekTotal += amount;
            }
        });

        // Calculate insight
        if (thisWeekTotal === 0 && lastWeekTotal === 0) {
            return { insight: "Zero spending this week? Are you fasting or just broke?", type: "praise" };
        }

        if (lastWeekTotal === 0) {
            return { insight: `You spent ₹${thisWeekTotal.toFixed(0)} this week. Off to a strong start!`, type: "neutral" };
        }

        const difference = thisWeekTotal - lastWeekTotal;
        const percentageChange = ((difference / lastWeekTotal) * 100).toFixed(0);

        if (difference > 0) {
            return {
                insight: `You spent ${percentageChange}% MORE this week than last week. Slow down there, Ambani.`,
                type: "warning"
            };
        } else if (difference < 0) {
            return {
                insight: `You spent ${Math.abs(percentageChange)}% LESS this week! Tracko is actually proud of you.`,
                type: "praise"
            };
        } else {
            return {
                insight: `You spent exactly the same as last week. Consistency is key, I guess?`,
                type: "neutral"
            };
        }

    } catch (error) {
        console.error("Error generating smart notification:", error);
        return {
            insight: "Tracko's brain is buffering... check your budget later.",
            type: "error"
        };
    }
};

module.exports = {
    generateSmartNotification
};
