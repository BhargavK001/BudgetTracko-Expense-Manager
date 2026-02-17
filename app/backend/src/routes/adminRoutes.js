const express = require('express');
const router = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');
const contactController = require('../controllers/contactController');
const couponController = require('../controllers/couponController');

// All routes require admin authentication
router.use(adminMiddleware);

// Dashboard & Analytics
router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalyticsData);

// Transactions
router.get('/transactions', adminController.getTransactions);

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Contact Requests
router.get('/contacts', contactController.getContactRequests);
router.patch('/contacts/:id/read', contactController.markAsRead);
router.post('/contacts/:id/reply', contactController.replyToContactRequest);

// Coupons & Promotions
router.get('/coupons', couponController.getCoupons);
router.post('/coupons', couponController.createCoupon);
router.patch('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);

// App Config
router.get('/config', adminController.getAppConfig);
router.put('/config', adminController.updateAppConfig);

module.exports = router;
