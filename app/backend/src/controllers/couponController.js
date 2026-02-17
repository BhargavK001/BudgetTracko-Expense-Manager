const Coupon = require('../models/Coupon');

/**
 * @desc    Get all coupons
 * @route   GET /api/admin/coupons
 * @access  Admin
 */
exports.getCoupons = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status || '';

        const query = {};
        if (status) query.status = status;

        const [coupons, total] = await Promise.all([
            Coupon.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Coupon.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: coupons,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Get Coupons Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
    }
};

/**
 * @desc    Create a coupon
 * @route   POST /api/admin/coupons
 * @access  Admin
 */
exports.createCoupon = async (req, res) => {
    try {
        const { code, type, value, trialDays, nominalPrice, nominalDurationMonths, applicablePlans, expiryDate, usageLimit, description } = req.body;

        if (!code || !type) {
            return res.status(400).json({ success: false, message: 'Code and type are required' });
        }

        // Check for duplicate
        const existing = await Coupon.findOne({ code: code.toUpperCase() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            type,
            value: value || 0,
            trialDays: trialDays || 0,
            nominalPrice: Math.max(5, nominalPrice || 5),
            nominalDurationMonths: nominalDurationMonths || 0,
            applicablePlans: applicablePlans || ['pro', 'squad'],
            expiryDate: expiryDate || null,
            usageLimit: usageLimit || 0,
            description: description || ''
        });

        await coupon.save();
        res.status(201).json({ success: true, data: coupon });
    } catch (error) {
        console.error('Create Coupon Error:', error);
        res.status(500).json({ success: false, message: 'Failed to create coupon' });
    }
};

/**
 * @desc    Update coupon status
 * @route   PATCH /api/admin/coupons/:id
 * @access  Admin
 */
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { returnDocument: 'after' }
        );

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.json({ success: true, data: coupon });
    } catch (error) {
        console.error('Update Coupon Error:', error);
        res.status(500).json({ success: false, message: 'Failed to update coupon' });
    }
};

/**
 * @desc    Delete a coupon
 * @route   DELETE /api/admin/coupons/:id
 * @access  Admin
 */
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Delete Coupon Error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
};

/**
 * @desc    Validate a coupon code (public-facing for users)
 * @route   POST /api/payments/validate-coupon
 * @access  Authenticated User
 */
exports.validateCoupon = async (req, res) => {
    try {
        const { code, plan } = req.body;

        if (!code || !plan) {
            return res.status(400).json({ success: false, message: 'Coupon code and plan are required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: 'active' });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
        }

        // Check expiry
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({ success: false, message: 'This coupon has expired' });
        }

        // Check usage limit
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
        }

        // Check if user already used this coupon
        if (coupon.usedBy.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'You have already used this coupon' });
        }

        // Check applicable plans
        if (!coupon.applicablePlans.includes(plan)) {
            return res.status(400).json({ success: false, message: `This coupon is not applicable to the ${plan} plan` });
        }

        // Calculate discount info for the user
        const planPrices = { pro: 49, squad: 99 };
        const originalPrice = planPrices[plan];
        let discountInfo = {};

        switch (coupon.type) {
            case 'percentage':
                discountInfo = {
                    type: 'percentage',
                    discount: coupon.value,
                    finalPrice: Math.max(0, originalPrice - (originalPrice * coupon.value / 100)),
                    description: `${coupon.value}% off`
                };
                break;
            case 'fixed':
                discountInfo = {
                    type: 'fixed',
                    discount: coupon.value,
                    finalPrice: Math.max(0, originalPrice - coupon.value),
                    description: `₹${coupon.value} off`
                };
                break;
            case 'trial':
                discountInfo = {
                    type: 'trial',
                    trialDays: coupon.trialDays,
                    finalPrice: 0,
                    description: `${coupon.trialDays} days free trial`
                };
                break;
            case 'nominal':
                discountInfo = {
                    type: 'nominal',
                    nominalPrice: coupon.nominalPrice,
                    nominalDurationMonths: coupon.nominalDurationMonths,
                    finalPrice: coupon.nominalPrice,
                    description: `₹${coupon.nominalPrice} for first ${coupon.nominalDurationMonths} month(s), then ₹${originalPrice}/mo`
                };
                break;
        }

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                type: coupon.type,
                description: coupon.description || discountInfo.description
            },
            discountInfo,
            originalPrice
        });
    } catch (error) {
        console.error('Validate Coupon Error:', error);
        res.status(500).json({ success: false, message: 'Failed to validate coupon' });
    }
};
