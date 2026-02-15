const express = require('express');
const router = express.Router();
const passport = require('passport');
const paymentController = require('../controllers/paymentController');

// Middleware to protect routes
const auth = require('../middleware/authMiddleware');

router.post('/create-order', auth, paymentController.createOrder);
router.post('/verify', auth, paymentController.verifyPayment);
router.post('/cancel', auth, paymentController.cancelSubscription);
router.get('/history', auth, paymentController.getPaymentHistory);
router.post('/webhook', paymentController.handleWebhook); // Webhooks typically don't use user auth, they verify signature

module.exports = router;
