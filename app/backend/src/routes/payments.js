const express = require('express');
const router = express.Router();
const passport = require('passport');
const paymentController = require('../controllers/paymentController');

// Middleware to protect routes
const auth = require('../middleware/authMiddleware');

// Route to create subscription (renamed from create-order for clarity, but keeping endpoint same if needed, or update logic)
router.post('/create-order', auth, paymentController.createSubscription); // Mapped create-order to createSubscription for minimal frontend breaking if we want, OR better:
router.post('/verify', auth, paymentController.verifyPayment);
router.post('/cancel', auth, paymentController.cancelSubscription);
router.get('/history', auth, paymentController.getPaymentHistory);
router.post('/webhook', paymentController.handleWebhook); // Webhooks typically don't use user auth, they verify signature

module.exports = router;
