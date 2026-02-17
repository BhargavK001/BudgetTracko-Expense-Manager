const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');


// Initialize Razorpay lazily or check for presence
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay keys are missing in environment variables');
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

// Create Subscription (Replacing createOrder)
exports.createSubscription = async (req, res) => {
    try {
        const { plan } = req.body;

        if (!plan) {
            return res.status(400).json({ message: 'Plan is required' });
        }

        let planId;
        if (plan === 'pro') {
            planId = process.env.RAZORPAY_PLAN_ID_PRO;
        } else if (plan === 'squad') {
            planId = process.env.RAZORPAY_PLAN_ID_SQUAD;
        } else {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        if (!planId) {
            return res.status(500).json({ message: 'Plan ID not configured on server' });
        }

        const razorpay = getRazorpayInstance();

        // Create Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: planId,
            customer_notify: 1,
            total_count: 120, // 10 years of monthly payments
            quantity: 1,
            notes: {
                userId: req.user.id,
                planType: plan
            }
        });

        // Create a pending payment/subscription record
        const payment = new Payment({
            userId: req.user.id,
            subscriptionId: subscription.id,
            amount: 0, // Will be updated on charge
            currency: 'INR',
            status: 'created',
            plan: plan
        });

        await payment.save();

        res.json({
            success: true,
            subscription_id: subscription.id,
            key: process.env.RAZORPAY_KEY_ID,
            plan_id: planId
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Server error creating subscription' });
    }
};

// Verify Subscription Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        // Verify Signature
        // content = razorpay_payment_id + '|' + razorpay_subscription_id
        const body = razorpay_payment_id + '|' + razorpay_subscription_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Update Payment Record
            const payment = await Payment.findOne({ subscriptionId: razorpay_subscription_id });
            if (payment) {
                payment.paymentId = razorpay_payment_id;
                payment.signature = razorpay_signature;
                payment.status = 'captured';
                await payment.save();
            }

            // Update User Subscription
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            user.subscription.plan = payment ? payment.plan : (req.body.plan || 'pro'); // Fallback if payment record missing
            user.subscription.status = 'active';
            user.subscription.razorpaySubscriptionId = razorpay_subscription_id;
            // We fetch authentication details to get customer ID if needed, but usually redundant here

            // Set expiry to 30 days from now approximately, though webhook will handle real updates
            user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

            await user.save();

            res.json({ success: true, message: 'Subscription activated successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server error verifying payment' });
    }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, payments });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error('Error fetching payment history:', error);
        res.status(500).json({ message: 'Server error fetching payment history' });
    }
};

// Cancel Subscription
exports.cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const subId = user.subscription.razorpaySubscriptionId;
        if (subId) {
            try {
                const razorpay = getRazorpayInstance();
                await razorpay.subscriptions.cancel(subId);
            } catch (rzpError) {
                console.error("Error cancelling at Razorpay:", rzpError.message);
                // Continue to cancel locally even if Razorpay fails (already cancelled case)
            }
        }

        user.subscription.plan = 'free';
        user.subscription.status = 'canceled';
        user.subscription.expiresAt = null;
        user.subscription.razorpaySubscriptionId = null;

        await user.save();

        res.json({
            success: true,
            message: 'Subscription canceled successfully',
            subscription: user.subscription
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        res.status(500).json({ message: 'Server error canceling subscription' });
    }
};

exports.handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify signature
        const shasum = crypto.createHmac('sha256', secret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        if (digest !== req.headers['x-razorpay-signature']) {
            console.error("Invalid webhook signature");
            return res.status(400).json({ status: 'invalid_signature' });
        }

        const event = req.body;
        console.log("Webhook Event:", event.event);

        // Handle Subscription Charged
        if (event.event === 'subscription.charged') {
            const paymentEntity = event.payload.payment.entity;
            const subscriptionEntity = event.payload.subscription.entity;

            const subscriptionId = subscriptionEntity.id;
            const paymentId = paymentEntity.id;
            const amount = paymentEntity.amount / 100; // Convert to main unit

            // Find user by subscription ID
            const user = await User.findOne({ 'subscription.razorpaySubscriptionId': subscriptionId });

            if (user) {
                // Update User Sub Status
                user.subscription.status = 'active';
                // Update expiry based on Razorpay's next charge date
                if (subscriptionEntity.current_end) {
                    user.subscription.expiresAt = new Date(subscriptionEntity.current_end * 1000);
                }
                user.subscription.razorpayCustomerId = subscriptionEntity.customer_id;
                await user.save();

                // Record Payment
                const newPayment = new Payment({
                    userId: user._id,
                    subscriptionId: subscriptionId,
                    paymentId: paymentId,
                    amount: amount,
                    currency: paymentEntity.currency,
                    status: 'captured',
                    plan: user.subscription.plan || 'pro', // Default or existing
                    receipt: paymentEntity.receipt
                });
                await newPayment.save();

                console.log(`Subscription charged and updated for user ${user._id}`);
            } else {
                console.warn(`User not found for subscription ID: ${subscriptionId}`);
            }

        } else if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
            const subscriptionEntity = event.payload.subscription.entity;
            const user = await User.findOne({ 'subscription.razorpaySubscriptionId': subscriptionEntity.id });
            if (user) {
                user.subscription.status = event.event === 'subscription.cancelled' ? 'canceled' : 'past_due';
                await user.save();
            }
        }
        // Note: 'payment.captured' is also fired for subscriptions, but 'subscription.charged' is better for recurring logic

        res.json({ status: 'ok' });
    } catch (error) {
        console.error("Webhook Error:", error.message);
        res.status(200).json({ status: 'error_logged' });
    }
};
