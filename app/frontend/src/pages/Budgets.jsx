import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsPencil, BsPlus, BsTrash, BsExclamationTriangleFill,
    BsCheckCircleFill, BsX, BsCalendarWeek, BsCalendar3, BsCalendar4
} from 'react-icons/bs';
import SEO from '../components/common/SEO';
import CategoryManager from '../components/CategoryManager';

const PERIOD_OPTIONS = [
    { key: 'weekly', label: 'Weekly', icon: BsCalendarWeek },
    { key: 'monthly', label: 'Monthly', icon: BsCalendar3 },
    { key: 'yearly', label: 'Yearly', icon: BsCalendar4 },
];

const Budgets = () => {
    const {
        budgets, categories,
        addBudget, updateBudget, deleteBudget
    } = useGlobalContext();
    const { theme } = useTheme();

    const [activePeriod, setActivePeriod] = useState('monthly');
    const [showForm, setShowForm] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');
    const [formPeriod, setFormPeriod] = useState('monthly');
    const [submitting, setSubmitting] = useState(false);

    // Filter budgets by selected period
    const filteredBudgets = useMemo(() => {
        return budgets.filter(b => b.period === activePeriod);
    }, [budgets, activePeriod]);

    const totalBudget = filteredBudgets.reduce((a, b) => a + b.amount, 0);
    const totalSpent = filteredBudgets.reduce((a, b) => a + (b.spent || 0), 0);
    const totalPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    // Get expense categories for the form dropdown
    const expenseCategories = useMemo(() => {
        const cats = categories.filter(c => c.type === 'expense' || c.type === 'both').map(c => c.name);
        return [...new Set(cats)];
    }, [categories]);

    const openAddForm = () => {
        setEditingBudget(null);
        setFormCategory('');
        setFormAmount('');
        setFormPeriod(activePeriod);
        setShowForm(true);
    };

    const openEditForm = (budget) => {
        setEditingBudget(budget);
        setFormCategory(budget.category);
        setFormAmount(String(budget.amount));
        setFormPeriod(budget.period);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formCategory || !formAmount) return;
        setSubmitting(true);
        try {
            if (editingBudget) {
                await updateBudget(editingBudget._id, {
                    category: formCategory,
                    amount: Number(formAmount),
                    period: formPeriod
                });
            } else {
                await addBudget({
                    category: formCategory,
                    amount: Number(formAmount),
                    period: formPeriod
                });
            }
            setShowForm(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this budget?')) {
            await deleteBudget(id);
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            <SEO title="Budgets | BudgetTracko" description="Set and manage your budget limits." />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Budgets</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-xs sm:text-sm">Manage your spending limits</p>
                        <button onClick={() => setShowCategoryManager(true)}
                            className="text-[10px] font-bold text-brand-primary uppercase hover:underline">
                            Manage Categories
                        </button>
                    </div>
                </div>

                {/* Period Toggle */}
                <div className="flex bg-light-card dark:bg-dark-card border-2 border-brand-black dark:border-gray-700 rounded-xl p-1 neo-shadow-sm">
                    {PERIOD_OPTIONS.map(p => (
                        <button key={p.key} onClick={() => setActivePeriod(p.key)}
                            className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${activePeriod === p.key
                                ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                                }`}>
                            <p.icon size={12} /> {p.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Total Budget Overview */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="neo-card p-4 sm:p-6 bg-brand-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-brand-yellow blur-[80px] opacity-10 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 sm:gap-0 mb-2">
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                                Total {activePeriod.charAt(0).toUpperCase() + activePeriod.slice(1)} Budget
                            </p>
                            <h3 className="text-xl sm:text-3xl font-black">
                                ₹{totalSpent.toLocaleString()} <span className="text-sm sm:text-lg text-gray-500 font-bold">/ ₹{totalBudget.toLocaleString()}</span>
                            </h3>
                        </div>
                        <div className="sm:text-right flex gap-2 items-center">
                            <span className={`text-xs sm:text-sm font-black px-2 py-1 rounded bg-white/10 ${totalPercent > 90 ? 'text-red-400' : 'text-green-400'}`}>
                                {totalPercent.toFixed(0)}% Used
                            </span>
                            <button onClick={openAddForm}
                                className="p-2 bg-brand-yellow text-brand-black rounded-lg hover:scale-105 transition-transform">
                                <BsPlus size={18} />
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-3 sm:h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalPercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full ${totalPercent > 90 ? 'bg-red-500' : totalPercent > 70 ? 'bg-brand-yellow' : 'bg-green-500'}`}
                        />
                    </div>
                    {totalPercent > 90 && (
                        <div className="flex items-center gap-2 mt-2.5 sm:mt-3 text-red-400 text-xs sm:text-sm font-bold bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                            <BsExclamationTriangleFill className="shrink-0" />
                            <span>You are close to exceeding your total budget!</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Budget Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowForm(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="neo-card p-5 sm:p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-black uppercase">{editingBudget ? 'Edit Budget' : 'New Budget'}</h3>
                                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                    <BsX size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Category */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Category</label>
                                    <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                                        className="w-full neo-input py-2 px-3" required>
                                        <option value="">Select category...</option>
                                        {expenseCategories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Budget Limit (₹)</label>
                                    <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                                        className="w-full neo-input py-2 px-3" placeholder="5000" min="1" required />
                                </div>

                                {/* Period */}
                                <div>
                                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Period</label>
                                    <div className="flex gap-2">
                                        {PERIOD_OPTIONS.map(p => (
                                            <button type="button" key={p.key} onClick={() => setFormPeriod(p.key)}
                                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all ${formPeriod === p.key
                                                    ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                                                    : 'border-2 border-gray-200 dark:border-gray-700 text-gray-500'
                                                    }`}>
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" disabled={submitting}
                                    className="w-full neo-btn neo-btn-primary py-2.5 font-black uppercase text-sm">
                                    {submitting ? 'Saving...' : editingBudget ? 'Update Budget' : 'Create Budget'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Budget Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {filteredBudgets.map((budget, index) => {
                    const percent = budget.percent || 0;
                    const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-brand-yellow' : 'bg-green-500';
                    const textColor = percent > 90 ? 'text-red-500' : percent > 70 ? 'text-yellow-600' : 'text-green-500';

                    return (
                        <motion.div
                            key={budget._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                            className="neo-card p-4 sm:p-5"
                        >
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <div>
                                    <h4 className="font-black text-base sm:text-lg">{budget.category}</h4>
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 capitalize">
                                        {budget.period} Limit
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => openEditForm(budget)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                        <BsPencil size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(budget._id)}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors">
                                        <BsTrash size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xl sm:text-2xl font-black">₹{(budget.spent || 0).toLocaleString()}</span>
                                <span className="text-xs sm:text-sm font-bold text-gray-400">/ ₹{budget.amount.toLocaleString()}</span>
                            </div>

                            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                                <motion.div
                                    className={`h-full ${color} rounded-full`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(percent, 100)}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs font-black ${textColor}`}>
                                    {percent > 100 ? (
                                        <span className="flex items-center gap-1"><BsExclamationTriangleFill /> Over Budget!</span>
                                    ) : `${(100 - percent).toFixed(0)}% left`}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">
                                    ₹{Math.max(0, budget.amount - (budget.spent || 0)).toLocaleString()} remaining
                                </span>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Add New Budget Card */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    onClick={openAddForm}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all gap-2 min-h-[160px]"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BsPlus size={24} />
                    </div>
                    <span className="font-black text-sm uppercase">Add Budget</span>
                </motion.button>
            </div>

            {filteredBudgets.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-center py-12 text-gray-400">
                    <BsCalendar3 className="mx-auto mb-3 text-3xl" />
                    <p className="font-bold text-sm">No {activePeriod} budgets set</p>
                    <p className="text-xs mt-1">Click "Add Budget" to create your first one.</p>
                </motion.div>
            )}

            {/* Category Manager Modal */}
            <AnimatePresence>
                {showCategoryManager && (
                    <CategoryManager onClose={() => setShowCategoryManager(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Budgets;
