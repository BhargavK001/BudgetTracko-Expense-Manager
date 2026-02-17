const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    registrationMethod: {
        type: String,
        enum: ['normal', 'google', 'github'],
        default: 'normal'
    },
    accountStatus: {
        type: String,
        enum: ['active', 'deactivated'],
        default: 'active'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        select: false // Don't return password by default
    },
    avatar: {
        type: String
    },
    phone: {
        type: String,
        default: ''
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    preferences: {
        notifications: {
            type: Boolean,
            default: true
        }
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'pro', 'squad'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'canceled', 'past_due', 'created', 'authenticated'],
            default: 'active'
        },
        expiresAt: {
            type: Date
        },
        razorpayCustomerId: {
            type: String
        },
        razorpaySubscriptionId: {
            type: String
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
