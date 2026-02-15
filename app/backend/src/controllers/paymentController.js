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

// Create Order
exports.createOrder = async (req, res) => {
    try {
        const { plan, amount, currency = 'INR' } = req.body;

        if (!plan || !amount) {
            return res.status(400).json({ message: 'Plan and amount are required' });
        }

        const options = {
            amount: amount * 100, // amount in smallest currency unit
            currency,
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1 // Auto capture
        };

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);

        // Create a pending payment record
        const payment = new Payment({
            userId: req.user.id,
            orderId: order.id,
            amount: amount,
            currency: currency,
            status: 'created',
            plan: plan
        });

        await payment.save();

        res.json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error creating order' });
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    console.log("Verify Payment HIT with body:", req.body);
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error("Missing payment details in verify request");
            return res.status(400).json({ message: 'Missing payment details' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        console.log("Signatures:", { expected: expectedSignature, received: razorpay_signature });

        if (expectedSignature === razorpay_signature) {
            // Find payment and update
            const payment = await Payment.findOne({ orderId: razorpay_order_id });
            console.log("Found Payment Record:", payment);

            if (!payment) {
                console.error("Payment record not found for order:", razorpay_order_id);
                return res.status(404).json({ message: 'Payment record not found' });
            }

            payment.paymentId = razorpay_payment_id;
            payment.signature = razorpay_signature;
            payment.status = 'captured';
            await payment.save();
            console.log("Payment updated to captured");

            // Update User Subscription
            console.log("Updating user:", req.user.id);
            const user = await User.findById(req.user.id);
            if (!user) {
                console.error("User not found during payment verification:", req.user.id);
                return res.status(404).json({ message: 'User not found' });
            }

            user.subscription.plan = payment.plan;
            user.subscription.status = 'active';
            user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

            await user.save();
            console.log("User subscription updated successfully:", user.subscription);

            res.json({ success: true, message: 'Payment verified and subscription activated' });
        } else {
            console.error("Signature mismatch");
            // Update payment status to failed if signature mismatch
            const payment = await Payment.findOne({ orderId: razorpay_order_id });
            if (payment) {
                payment.status = 'failed';
                await payment.save();
            }
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment (CATCH BLOCK):', error);
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

        // Logic: specific requirements to just set plan to free and status to canceled immediately
        user.subscription.plan = 'free';
        user.subscription.status = 'canceled';
        user.subscription.expiresAt = null; // Or keep it if you want them to finish the term, but user asked for immediate cancel effectively

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
        // Log webhook payload
        console.log("Webhook Received:", req.body);

        // Always respond with 200 OK to keep Razorpay happy
        res.json({ status: 'ok' });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).send("Webhook Error");
    }
};
