const RecurringBill = require('../models/RecurringBill');

exports.getRecurringBills = async (req, res) => {
    try {
        const bills = await RecurringBill.find({ user: req.user.id }).sort({ dueDate: 1 });
        res.status(200).json({ success: true, data: bills });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.addRecurringBill = async (req, res) => {
    try {
        const { name, amount, dueDate, category, frequency, autoPay } = req.body;
        const bill = await RecurringBill.create({
            user: req.user.id,
            name,
            amount,
            dueDate,
            category,
            frequency,
            autoPay
        });
        res.status(201).json({ success: true, data: bill });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ success: false, error: messages });
        }
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.updateRecurringBill = async (req, res) => {
    try {
        let bill = await RecurringBill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }
        if (bill.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }
        bill = await RecurringBill.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: bill });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

exports.deleteRecurringBill = async (req, res) => {
    try {
        const bill = await RecurringBill.findById(req.params.id);
        if (!bill) {
            return res.status(404).json({ success: false, error: 'Bill not found' });
        }
        if (bill.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }
        await bill.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};
