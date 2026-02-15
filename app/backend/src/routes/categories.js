const express = require('express');
const router = express.Router();
const passport = require('passport');
const { getCategories, addCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

const auth = require('../middleware/authMiddleware');

router.get('/', auth, getCategories);
router.post('/', auth, addCategory);
router.put('/:id', auth, updateCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;
