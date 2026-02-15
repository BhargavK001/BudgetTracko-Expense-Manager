const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getBudgets, addBudget, updateBudget, deleteBudget } = require('../controllers/budgetController');

const auth = require('../middleware/authMiddleware');

router.get('/', auth, getBudgets);
router.post('/', auth, addBudget);
router.put('/:id', auth, updateBudget);
router.delete('/:id', auth, deleteBudget);

module.exports = router;
