const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
    getAccounts,
    createAccount,
    getAccount,
    updateAccount,
    deleteAccount
} = require('../controllers/accountController');

// All routes are protected
const auth = require('../middleware/authMiddleware');

router.route('/')
    .get(auth, getAccounts)
    .post(auth, createAccount);

router.route('/:id')
    .get(auth, getAccount)
    .put(auth, updateAccount)
    .delete(auth, deleteAccount);

module.exports = router;
