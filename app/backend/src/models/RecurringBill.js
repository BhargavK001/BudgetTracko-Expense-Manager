const mongoose = require('mongoose');

const RecurringBillSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    dueDate: {
        type: Number,
        required: true,
        min: 1,
        max: 31
    },
    category: {
        type: String,
        default: 'Bills',
        trim: true
    },
    frequency: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    autoPay: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RecurringBill', RecurringBillSchema);
