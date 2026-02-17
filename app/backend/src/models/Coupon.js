const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'trial', 'nominal'],
        required: true
        // percentage: e.g. 50% off
        // fixed: e.g. ₹20 off
        // trial: free trial for X days (no charge during trial)
        // nominal: pay ₹1 for X months, then full price automatically
    },
    value: {
        type: Number,
        default: 0
        // For percentage: the % discount (e.g. 50)
        // For fixed: the flat amount off (e.g. 20)
        // For trial/nominal: not used directly
    },
    trialDays: {
        type: Number,
        default: 0
        // For 'trial' type: number of free days (e.g. 60 for 2 months)
    },
    nominalPrice: {
        type: Number,
        default: 0
        // For 'nominal' type: the initial price (e.g. 1 for ₹1)
    },
    nominalDurationMonths: {
        type: Number,
        default: 0
        // For 'nominal' type: how many months at the nominal price (e.g. 3)
    },
    applicablePlans: {
        type: [String],
        enum: ['pro', 'squad'],
        default: ['pro', 'squad']
    },
    expiryDate: {
        type: Date,
        default: null
    },
    usageLimit: {
        type: Number,
        default: 0 // 0 = unlimited
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active'
    },
    description: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-expire coupons
CouponSchema.pre('find', function () {
    // This doesn't modify, just a note - expiry is checked in controller
});

module.exports = mongoose.model('Coupon', CouponSchema);
