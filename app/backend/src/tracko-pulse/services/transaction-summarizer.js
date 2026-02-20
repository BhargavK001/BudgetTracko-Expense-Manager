// src/tracko-pulse/services/transaction-summarizer.js

/**
 * Summarizes an array of transactions and budget data into a compact payload 
 * for the AI to process. This prevents sending raw, massive arrays to the APIs.
 */
const summarizeTransactionsForAI = (transactions, budget, next7DaysBills = [], trueTotalBalance = null) => {
    if (!transactions || !Array.isArray(transactions)) {
        return { error: "No transaction data provided." };
    }
    const currentMonth = new Date().toLocaleString('en-IN', {
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    });

    // Calculate total spent
    const totalSpent = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
    const totalBudget = Number(budget?.amount) || 0;

    // If we passed the actual Account balance, use it. Otherwise guess based on budget.
    const remainingBalance = trueTotalBalance !== null ? trueTotalBalance : (totalBudget - totalSpent);

    // Aggregate by category
    const categoryTotals = {};
    transactions.forEach(tx => {
        const cat = tx.category?.name || tx.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(tx.amount) || 0);
    });

    // Map to array and sort to find top 3
    const sortedCategories = Object.entries(categoryTotals)
        .map(([name, amount]) => ({
            name,
            amount: Number(amount.toFixed(2)),
            percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
        }))
        .sort((a, b) => b.amount - a.amount);

    const top3Categories = sortedCategories.slice(0, 3);

    // Filter upcoming bills to summarize
    const upcomingBillsSummary = next7DaysBills.map(bill => ({
        title: bill.title,
        amount: Number(bill.amount),
        dueDate: bill.dueDate
    }));

    return {
        month: currentMonth,
        totalBudget: totalBudget,
        totalSpent: Number(totalSpent.toFixed(2)),
        remainingBalance: Number(remainingBalance.toFixed(2)),
        topCategories: top3Categories,
        upcomingBillsNext7Days: upcomingBillsSummary.length > 0 ? upcomingBillsSummary : "No upcoming bills in the next 7 days"
    };
};

module.exports = {
    summarizeTransactionsForAI
};
