const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
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
    icon: {
        type: String,
        default: 'BsBox'
    },
    color: {
        type: String,
        default: '#0088FE'
    },
    type: {
        type: String,
        enum: ['income', 'expense', 'both'],
        default: 'expense'
    }
}, {
    timestamps: true
});

// Unique category name per user
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
