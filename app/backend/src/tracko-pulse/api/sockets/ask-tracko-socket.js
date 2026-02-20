const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const Transaction = require('../../../models/Transaction');
const Budget = require('../../../models/Budget');
const Account = require('../../../models/Account');
const aiClient = require('../ai-client');
const { askTrackoTemplate } = require('../prompt-builder');
const { summarizeTransactionsForAI } = require('../../services/transaction-summarizer');

module.exports = (io) => {
    const pulseNamespace = io.of('/tracko-pulse');

    // Authentication middleware for WebSocket
    pulseNamespace.use((socket, next) => {
        try {
            // Parse JWT from the HTTP-only cookie sent during handshake
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies.token || socket.handshake.auth?.token;

            if (!token) {
                return next(new Error('Authentication Error: Token missing'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded; // Attach user payload to socket
            next();
        } catch (err) {
            console.error('[Tracko Pulse] Auth Error:', err.message);
            next(new Error('Authentication Error: Invalid token'));
        }
    });

    pulseNamespace.on('connection', (socket) => {
        console.log(`[Tracko Pulse] User connected via WebSocket: ${socket.user.id}`);

        socket.on('ask_question', async (data) => {
            try {
                const { question, chatHistory = [] } = data;
                if (!question || typeof question !== 'string') {
                    socket.emit('error', { message: "Invalid question format" });
                    return;
                }

                const userId = socket.user.id;

                // Acknowledge receipt
                socket.emit('status', { message: "Analyzing finances...", code: "ANALYZING" });

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

                // 3. Fetch all accounts to get the true Total Balance
                const accounts = await Account.find({ userId }).lean();
                const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

                socket.emit('status', { message: "Consulting Tracko...", code: "CONSULTING_AI" });

                // 4. Summarize transactions, now injecting true totalBalance
                const summary = summarizeTransactionsForAI(transactions, { amount: totalBudget }, [], totalBalance);

                // 4. Build prompt (with history context)
                const prompt = askTrackoTemplate(summary, question, chatHistory);

                // 5. Query AI Client (with 3-tier fallback)
                const aiResponse = await aiClient.generateResponse(prompt);

                // Send success response
                socket.emit('response', {
                    answer: aiResponse.text,
                    provider: aiResponse.provider,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error("[Tracko Pulse] WebSocket Error:", error);
                socket.emit('error', { message: "Failed to communicate with Tracko AI.", details: error.message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Tracko Pulse] User disconnected: ${socket.user.id}`);
        });
    });
};
