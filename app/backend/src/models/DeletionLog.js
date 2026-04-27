const mongoose = require('mongoose');

const DeletionLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    entityType: {
        type: String,
        enum: ['transaction', 'budget', 'category', 'account'],
        required: true
    },
    entityId: {
        type: String,
        required: true
    },
    deletedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

DeletionLogSchema.index({ userId: 1, deletedAt: 1 });

module.exports = mongoose.model('DeletionLog', DeletionLogSchema);
