const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    userId: {
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
    type: {
        type: String,
        enum: ['bank', 'cash', 'wallet', 'credit_card'],
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'INR'
    },
    color: {
        type: String,
        default: '#0088FE'
    },
    icon: {
        type: String,
        default: 'bank'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Account', AccountSchema);
