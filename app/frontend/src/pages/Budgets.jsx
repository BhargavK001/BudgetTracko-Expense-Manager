import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BsPencil, BsPlus, BsWallet, BsExclamationTriangleFill, BsCheckCircleFill } from 'react-icons/bs';

const Budgets = () => {
    const { transactions } = useGlobalContext();
    const { theme } = useTheme();
    // Mock budget limits for now
    const [budgets, setBudgets] = useState({
        Food: 5000,
        Transport: 3000,
        Shopping: 4000,
        Entertainment: 2000,
        Bills: 8000,
        Health: 5000,
        Education: 10000,
        Other: 2000
    });

    const [isEditing, setIsEditing] = useState(null);
    const [editValue, setEditValue] = useState('');

    // Calculate spending per category for current month
    const categorySpending = useMemo(() => {
        const now = new Date();
        const spending = {};
        transactions.forEach(t => {
            if (new Date(t.date).getMonth() === now.getMonth() &&
                new Date(t.date).getFullYear() === now.getFullYear() &&
                t.amount < 0) {
                const cat = t.category || 'Other';
                spending[cat] = (spending[cat] || 0) + Math.abs(t.amount);
            }
        });
        return spending;
    }, [transactions]);

    const totalBudget = Object.values(budgets).reduce((a, b) => a + b, 0);
    const totalSpent = Object.values(categorySpending).reduce((a, b) => a + b, 0);
    const totalPercent = Math.min((totalSpent / totalBudget) * 100, 100);

    const handleEdit = (category, limit) => {
        setIsEditing(category);
        setEditValue(limit);
    };

    const handleSave = (category) => {
        setBudgets(prev => ({ ...prev, [category]: Number(editValue) }));
        setIsEditing(null);
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-3xl font-black uppercase tracking-tight">Budgets</h2>
                <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-sm">Manage your monthly spending limits</p>
            </motion.div>

            {/* Total Budget Overview */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="neo-card p-6 bg-brand-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow blur-[80px] opacity-10 pointer-events-none" />
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Monthly Budget</p>
                            <h3 className="text-3xl font-black">₹{totalSpent.toLocaleString()} <span className="text-lg text-gray-500 font-bold">/ ₹{totalBudget.toLocaleString()}</span></h3>
                        </div>
                        <div className="text-right">
                            <span className={`text-sm font-black px-2 py-1 rounded bg-white/10 ${totalPercent > 90 ? 'text-red-400' : 'text-green-400'}`}>
                                {totalPercent.toFixed(0)}% Used
                            </span>
                        </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                        <div
                            className={`h-full transition-all duration-700 ease-out ${totalPercent > 90 ? 'bg-red-500' : totalPercent > 70 ? 'bg-brand-yellow' : 'bg-green-500'}`}
                            style={{ width: `${totalPercent}%` }}
                        />
                    </div>
                    {totalPercent > 90 && (
                        <div className="flex items-center gap-2 mt-3 text-red-400 text-sm font-bold bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                            <BsExclamationTriangleFill />
                            <span>You are close to exceeding your total budget!</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Category Budgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Object.entries(budgets).map(([category, limit], index) => {
                    const spent = categorySpending[category] || 0;
                    const percent = Math.min((spent / limit) * 100, 100);
                    const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-brand-yellow' : 'bg-green-500';
                    const textColor = percent > 90 ? 'text-red-500' : percent > 70 ? 'text-yellow-600' : 'text-green-500';

                    return (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 + 0.2 }}
                            className="neo-card p-5"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-black text-lg">{category}</h4>
                                    <p className="text-xs font-bold text-gray-400">Monthly Limit</p>
                                </div>
                                <button
                                    onClick={() => handleEdit(category, limit)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                >
                                    <BsPencil size={14} />
                                </button>
                            </div>

                            {isEditing === category ? (
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full neo-input py-1 px-2 text-sm"
                                        autoFocus
                                    />
                                    <button onClick={() => handleSave(category)} className="neo-btn neo-btn-primary px-3 py-1 text-xs">Save</button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-2xl font-black">₹{spent.toLocaleString()}</span>
                                    <span className="text-sm font-bold text-gray-400">/ ₹{limit.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                                <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
                            </div>

                            <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs font-black ${textColor}`}>
                                    {percent > 100 ? 'Over Budget!' : `${(100 - percent).toFixed(0)}% left`}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400">
                                    ₹{(limit - spent).toLocaleString()} remaining
                                </span>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Create New Budget Card */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all gap-2"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BsPlus size={24} />
                    </div>
                    <span className="font-black text-sm uppercase">Add New Category</span>
                </motion.button>
            </div>
        </div>
    );
};

export default Budgets;
