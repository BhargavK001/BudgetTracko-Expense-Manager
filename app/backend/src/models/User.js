const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    displayName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    avatar: {
        type: String
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', UserSchema);
