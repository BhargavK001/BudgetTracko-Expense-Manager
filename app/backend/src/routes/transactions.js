const express = require('express');
const router = express.Router();
const passport = require('passport');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const {
    getTransactions,
    createTransaction,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    getAccountTransactions
} = require('../controllers/transactionController');

// All routes are protected
const auth = require('../middleware/authMiddleware');

// Account-specific transactions (must be before /:id to avoid conflict)
router.get('/account/:accountId', auth, getAccountTransactions);

router.route('/')
    .get(auth, getTransactions)
    .post(auth, uploadMiddleware, createTransaction);

router.route('/:id')
    .get(auth, getTransaction)
    .put(auth, uploadMiddleware, updateTransaction)
    .delete(auth, deleteTransaction);

module.exports = router;
