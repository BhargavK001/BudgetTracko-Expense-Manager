// src/tracko-pulse/api/routes/smart-notifications.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middleware/authMiddleware');
const { generateSmartNotification } = require('../../services/smart-notifications');

// GET /api/tracko-pulse/notifications
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Calculate the smart notification
        const notification = await generateSmartNotification(userId);

        // 2. Return the structured payload
        return res.status(200).json({
            success: true,
            data: {
                message: notification.insight,
                type: notification.type // 'warning', 'praise', 'neutral', 'error'
            }
        });

    } catch (error) {
        console.error("Smart Notification API Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate smart notification.",
            error: error.message
        });
    }
});

module.exports = router;
