const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'transfer'],
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        default: 'Other'
    },
    // For income/expense — the linked account
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: null
    },
    // For transfers
    fromAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: null
    },
    toAccountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: null
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    time: {
        type: String,
        default: ''
    },
    paymentMode: {
        type: String,
        default: 'Cash'
    },
    note: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    attachments: [{
        url: String,
        publicId: String,
        name: String
    }]
}, {
    timestamps: true
});

// Index for faster queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, accountId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
