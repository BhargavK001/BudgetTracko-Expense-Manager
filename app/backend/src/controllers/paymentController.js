const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Coupon = require('../models/Coupon');


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
        const { plan, couponCode } = req.body;

        if (!plan) {
            return res.status(400).json({ message: 'Plan is required' });
        }

        // Prevent duplicate subscription to the same plan
        const currentUser = await User.findById(req.user.id);
        if (currentUser && currentUser.subscription) {
            const isActive = ['active', 'authenticated'].includes(currentUser.subscription.status);
            if (isActive && currentUser.subscription.plan === plan) {
                return res.status(400).json({ message: `You are already subscribed to the ${plan} plan.` });
            }
        }

        let planId;
        let originalPrice = 0;
        if (plan === 'pro') {
            planId = process.env.RAZORPAY_PLAN_ID_PRO;
            originalPrice = 49;
        } else if (plan === 'squad') {
            planId = process.env.RAZORPAY_PLAN_ID_SQUAD;
            originalPrice = 99;
        } else {
            return res.status(400).json({ message: 'Invalid plan selected' });
        }

        if (!planId) {
            return res.status(500).json({ message: 'Plan ID not configured on server' });
        }

        const razorpay = getRazorpayInstance();

        // Validate coupon if provided
        let appliedCoupon = null;
        if (couponCode) {
            appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: 'active' });

            if (!appliedCoupon) {
                return res.status(400).json({ message: 'Invalid or expired coupon code' });
            }
            if (appliedCoupon.expiryDate && new Date(appliedCoupon.expiryDate) < new Date()) {
                return res.status(400).json({ message: 'This coupon has expired' });
            }
            if (!appliedCoupon.applicablePlans.includes(plan)) {
                return res.status(400).json({ message: `This coupon is not applicable to the ${plan} plan` });
            }
            // Check usage limit 
            if (appliedCoupon.usageLimit > 0 && appliedCoupon.usedCount >= appliedCoupon.usageLimit) {
                return res.status(400).json({ message: 'This coupon has reached its usage limit' });
            }
            // Check prior usage
            if (appliedCoupon.usedBy.some(id => id.toString() === req.user.id.toString())) {
                return res.status(400).json({ message: 'You have already used this coupon' });
            }
        }

        // Build subscription options
        const subscriptionOptions = {
            plan_id: planId,
            customer_notify: 1,
            total_count: 120, // 10 years
            quantity: 1,
            notes: {
                userId: req.user.id,
                planType: plan
            }
        };

        let initialChargeAmount = originalPrice;
        let shouldDelaySubscription = false;
        let delayMonths = 0;

        // Apply coupon effects
        if (appliedCoupon) {
            subscriptionOptions.notes.couponCode = appliedCoupon.code;

            if (appliedCoupon.type === 'trial') {
                // Free trial
                shouldDelaySubscription = true;
                delayMonths = 0; // Handled by days
                const trialEnd = new Date();
                trialEnd.setDate(trialEnd.getDate() + appliedCoupon.trialDays);
                subscriptionOptions.start_at = Math.floor(trialEnd.getTime() / 1000);
                initialChargeAmount = 0;
            } else if (appliedCoupon.type === 'nominal') {
                // Nominal price
                shouldDelaySubscription = true;
                delayMonths = appliedCoupon.nominalDurationMonths || 1;
                initialChargeAmount = appliedCoupon.nominalPrice;
            } else if (appliedCoupon.type === 'percentage') {
                // Percentage discount for first month (implied structure)
                // If it's a recurring discount, Razorpay requires a different Plan or Add-on, which is complex.
                // We assume coupons apply to the FIRST invoice only for simplicity in this flow, 
                // OR we accept that we only support "First Month X% Off".
                shouldDelaySubscription = true;
                delayMonths = 1;
                const discount = (originalPrice * appliedCoupon.value) / 100;
                initialChargeAmount = Math.max(0, originalPrice - discount);
            } else if (appliedCoupon.type === 'fixed') {
                // Fixed amount off first month
                shouldDelaySubscription = true;
                delayMonths = 1;
                initialChargeAmount = Math.max(0, originalPrice - appliedCoupon.value);
            }
        }

        // Handle Immediate Charge (Upfront Order) if needed
        // If there is ANY deviation from the standard plan price for the first payment, 
        // we create an Order for that amount and start the Sub later.
        // Handle Immediate Charge via Add-ons
        // If there is ANY deviation from the standard plan price for the first payment, 
        // we use an ADDON to charge that amount immediately, and delay the subscription start.
        if (shouldDelaySubscription && initialChargeAmount > 0) {
            // Delay subscription start
            if (!subscriptionOptions.start_at) { // If not already set by trial
                const startData = new Date();
                startData.setMonth(startData.getMonth() + delayMonths);
                // Add a small buffer (e.g. 5 mins) or just next month
                subscriptionOptions.start_at = Math.floor(startData.getTime() / 1000);
            }

            // Add the immediate charge as an add-on
            subscriptionOptions.addons = [
                {
                    item: {
                        name: 'Initial Subscription Charge',
                        amount: Math.round(initialChargeAmount * 100), // in paise
                        currency: 'INR',
                        description: appliedCoupon ? `Coupon ${appliedCoupon.code} applied` : 'Initial Charge'
                    }
                }
            ];
        } else if (shouldDelaySubscription && initialChargeAmount === 0 && !subscriptionOptions.start_at) {
            // 100% off first month (effectively a 1 month trial)
            const startData = new Date();
            startData.setMonth(startData.getMonth() + delayMonths);
            subscriptionOptions.start_at = Math.floor(startData.getTime() / 1000);
        }

        // Create Subscription
        const subscription = await razorpay.subscriptions.create(subscriptionOptions);

        // Record Payment Intent (Subscription)
        const payment = new Payment({
            userId: req.user.id,
            subscriptionId: subscription.id,
            orderId: null, // No separate order ID for subscriptions with addons
            paymentId: null, // Will be filled on success
            amount: initialChargeAmount, // The amount user pays NOW
            currency: 'INR',
            status: 'created',
            plan: plan
        });

        await payment.save();

        res.json({
            success: true,
            subscription_id: subscription.id,
            key: process.env.RAZORPAY_KEY_ID,
            plan_id: planId,
            couponApplied: appliedCoupon ? appliedCoupon.code : null,
            amount: initialChargeAmount // Frontend might use this for display
        });
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') console.error('Error creating subscription:', error);
        res.status(500).json({ message: 'Server error creating subscription' });
    }
};

// Verify Subscription Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_order_id, razorpay_signature } = req.body;

        if (!razorpay_payment_id || !razorpay_signature || (!razorpay_subscription_id && !razorpay_order_id)) {
            return res.status(400).json({ message: 'Missing payment details' });
        }

        let isValid = false;
        let paymentRecord = null;
        let paymentBody = '';

        if (razorpay_subscription_id) {
            // Subscription Flow Verification
            // content = razorpay_payment_id + '|' + razorpay_subscription_id
            paymentBody = razorpay_payment_id + '|' + razorpay_subscription_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(paymentBody.toString())
                .digest('hex');

            if (expectedSignature === razorpay_signature) {
                isValid = true;
                paymentRecord = await Payment.findOne({ subscriptionId: razorpay_subscription_id });
            }
        } else if (razorpay_order_id) {
            // Order Flow Verification (Upfront)
            // content = razorpay_order_id + '|' + razorpay_payment_id
            paymentBody = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET) // Order signature uses Key Secret
                .update(paymentBody.toString())
                .digest('hex');

            if (expectedSignature === razorpay_signature) {
                isValid = true;
                paymentRecord = await Payment.findOne({ orderId: razorpay_order_id });
            }
        }

        if (isValid) {
            // Update Payment Record
            if (paymentRecord) {
                paymentRecord.paymentId = razorpay_payment_id;
                paymentRecord.signature = razorpay_signature;
                paymentRecord.status = 'captured';
                await paymentRecord.save();
            }

            // Update User Subscription
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Logic to consume coupon if linked to this payment/order
            try {
                // Try to find coupon from notes in payment or subscription
                // Since we have the paymentRecord, we know the codes.
                // But we didn't save coupon in Payment.
                // We can infer from the subscription or the order notes.
                let couponCode = null;
                const razorpay = getRazorpayInstance();

                if (razorpay_order_id) {
                    const order = await razorpay.orders.fetch(razorpay_order_id);
                    couponCode = order.notes && order.notes.couponCode;
                } else if (razorpay_subscription_id) {
                    const subscription = await razorpay.subscriptions.fetch(razorpay_subscription_id);
                    couponCode = subscription.notes && subscription.notes.couponCode;
                }

                if (couponCode) {
                    await Coupon.findOneAndUpdate(
                        {
                            code: couponCode,
                            usedBy: { $ne: user._id }
                        },
                        {
                            $inc: { usedCount: 1 },
                            $addToSet: { usedBy: user._id }
                        }
                    );
                }
            } catch (err) {
                console.error('Error consuming coupon during verification:', err);
            }

            user.subscription.plan = paymentRecord ? paymentRecord.plan : (req.body.plan || 'pro');
            user.subscription.status = 'active';
            // If paying via Order (one-time), we link the Future Sub ID but it might not be active at Razorpay yet.
            // But we give access.
            if (razorpay_subscription_id) {
                user.subscription.razorpaySubscriptionId = razorpay_subscription_id;
            } else if (paymentRecord && paymentRecord.subscriptionId) {
                user.subscription.razorpaySubscriptionId = paymentRecord.subscriptionId;
            }

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
        const payments = await Payment.find({
            userId: req.user.id,
            status: 'captured' // Only show completed payments
        }).sort({ createdAt: -1 });
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

                // Check if payment record already exists (avoid duplicates)
                let existingPayment = await Payment.findOne({ paymentId });

                if (existingPayment) {
                    console.log(`Payment record already exists for ${paymentId}, updating...`);
                    existingPayment.status = 'captured';
                    existingPayment.receipt = paymentEntity.receipt;
                    if (existingPayment.amount === 0) existingPayment.amount = amount; // Fix legacy 0 amounts
                    await existingPayment.save();
                } else {
                    // Record New Payment
                    const newPayment = new Payment({
                        userId: user._id,
                        subscriptionId: subscriptionId,
                        paymentId: paymentId,
                        amount: amount,
                        currency: paymentEntity.currency,
                        status: 'captured',
                        plan: user.subscription.plan || 'pro',
                        receipt: paymentEntity.receipt
                    });
                    await newPayment.save();
                    console.log(`New subscription payment recorded for user ${user._id}`);
                }
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
