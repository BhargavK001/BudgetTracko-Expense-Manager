const express = require('express');
const router = express.Router();
const {
    getRecurringBills,
    addRecurringBill,
    updateRecurringBill,
    deleteRecurringBill
} = require('../controllers/recurringController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.route('/')
    .get(getRecurringBills)
    .post(addRecurringBill);

router.route('/:id')
    .put(updateRecurringBill)
    .delete(deleteRecurringBill);

module.exports = router;
