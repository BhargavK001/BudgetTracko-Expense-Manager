const express = require('express');
const router = express.Router();
const passport = require('passport');
const { upload } = require('../config/cloudinary');
const {
    getTransactions,
    createTransaction,
    getTransaction,
    updateTransaction,
    deleteTransaction,
    getAccountTransactions
} = require('../controllers/transactionController');

// All routes are protected
const auth = passport.authenticate('jwt', { session: false });

// Account-specific transactions (must be before /:id to avoid conflict)
router.get('/account/:accountId', auth, getAccountTransactions);

router.route('/')
    .get(auth, getTransactions)
    .post(auth, upload.array('attachments', 3), createTransaction);

router.route('/:id')
    .get(auth, getTransaction)
    .put(auth, upload.array('attachments', 3), updateTransaction)
    .delete(auth, deleteTransaction);

module.exports = router;
