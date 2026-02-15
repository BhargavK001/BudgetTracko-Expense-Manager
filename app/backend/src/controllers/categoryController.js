const Category = require('../models/Category');

// Default categories seeded on first fetch
const DEFAULT_CATEGORIES = [
    { name: 'Food', icon: 'BsCart3', color: '#FF8042', type: 'expense' },
    { name: 'Transport', icon: 'BsBusFront', color: '#0088FE', type: 'expense' },
    { name: 'Bills', icon: 'BsLightningCharge', color: '#FFBB28', type: 'expense' },
    { name: 'Shopping', icon: 'BsBag', color: '#AF19FF', type: 'expense' },
    { name: 'Entertainment', icon: 'BsFilm', color: '#FF1971', type: 'expense' },
    { name: 'Health', icon: 'BsHeart', color: '#00C49F', type: 'expense' },
    { name: 'Education', icon: 'BsBook', color: '#0088FE', type: 'expense' },
    { name: 'Salary', icon: 'BsCashCoin', color: '#10B981', type: 'income' },
    { name: 'Investment', icon: 'BsGraphUpArrow', color: '#00C49F', type: 'income' },
    { name: 'Gift', icon: 'BsGift', color: '#FF8042', type: 'both' },
    { name: 'Other', icon: 'BsBox', color: '#999999', type: 'both' },
];

// GET /api/categories
exports.getCategories = async (req, res) => {
    try {
        let categories = await Category.find({ userId: req.user._id }).sort('name');

        // Seed defaults if user has no categories
        if (categories.length === 0) {
            const docs = DEFAULT_CATEGORIES.map(c => ({ ...c, userId: req.user._id }));
            categories = await Category.insertMany(docs);
        }

        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/categories
exports.addCategory = async (req, res) => {
    try {
        const { name, icon, color, type } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const category = await Category.create({
            userId: req.user._id,
            name: name.trim(),
            icon: icon || 'BsBox',
            color: color || '#0088FE',
            type: type || 'expense'
        });

        res.status(201).json(category);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Category already exists' });
        }
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Category name already exists' });
        }
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
