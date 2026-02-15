import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsBank2, BsCashStack, BsPencilSquare, BsPlus, BsWallet2, BsCreditCard2Front, BsX, BsTrash } from 'react-icons/bs';
import { toast } from 'sonner';
import SEO from '../components/common/SEO';
import AccountHistoryModal from '../components/AccountHistoryModal';

const ACCOUNT_TYPES = [
    { value: 'bank', label: 'Bank Account', icon: BsBank2, color: 'bg-blue-600' },
    { value: 'cash', label: 'Cash', icon: BsCashStack, color: 'bg-green-600' },
    { value: 'wallet', label: 'Digital Wallet', icon: BsWallet2, color: 'bg-purple-600' },
    { value: 'credit_card', label: 'Credit Card', icon: BsCreditCard2Front, color: 'bg-brand-black' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1971', '#EF4444', '#10B981'];

const Accounts = () => {
    const { theme } = useTheme();
    const { accounts, addAccount, updateAccount, deleteAccount } = useGlobalContext();

    const [showForm, setShowForm] = useState(false);
    const [editAccount, setEditAccount] = useState(null);
    const [historyAccount, setHistoryAccount] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '', type: 'bank', balance: '', color: '#0088FE'
    });

    const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

    const getAccountIcon = (type) => {
        const found = ACCOUNT_TYPES.find(t => t.value === type);
        return found ? found.icon : BsBank2;
    };

    const getAccountColor = (type) => {
        const found = ACCOUNT_TYPES.find(t => t.value === type);
        return found ? found.color : 'bg-blue-600';
    };

    const openCreateForm = () => {
        setEditAccount(null);
        setFormData({ name: '', type: 'bank', balance: '', color: '#0088FE' });
        setShowForm(true);
    };

    const openEditForm = (acc, e) => {
        e.stopPropagation();
        setEditAccount(acc);
        setFormData({
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            color: acc.color || '#0088FE'
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error('Account name is required');
            return;
        }

        const data = {
            name: formData.name.trim(),
            type: formData.type,
            balance: Number(formData.balance) || 0,
            color: formData.color
        };

        if (editAccount) {
            await updateAccount(editAccount._id, data);
        } else {
            await addAccount(data);
        }

        setShowForm(false);
        setEditAccount(null);
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this account? This cannot be undone.')) {
            await deleteAccount(id);
        }
    };

    const inputClass = "mt-1 block w-full rounded-xl bg-light-bg dark:bg-dark-bg border-2 border-brand-black dark:border-gray-600 text-light-text dark:text-dark-text p-2.5 text-sm font-semibold focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30 transition-all";
    const labelClass = "block text-[11px] font-black uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1";

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            <SEO
                title="Accounts | BudgetTracko"
                description="Manage your bank accounts, wallets, and cards."
            />

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center gap-2"
            >
                <div className="min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Accounts</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-xs sm:text-sm">Manage your money sources</p>
                </div>
                <button onClick={openCreateForm} className="neo-btn neo-btn-primary flex items-center gap-1.5 sm:gap-2 shrink-0 text-[10px] sm:text-xs px-2.5 sm:px-4">
                    <BsPlus size={18} /> <span className="hidden sm:inline">Add Account</span>
                </button>
            </motion.div>

            {/* Total Net Worth */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="neo-card p-4 sm:p-6 bg-gradient-to-r from-brand-black to-gray-900 text-white relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10">
                    <BsBank2 size={140} className="sm:w-[200px] sm:h-[200px]" />
                </div>
                <div className="relative z-10">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Total Net Worth</p>
                    <h3 className="text-2xl sm:text-4xl font-black break-all sm:break-normal">₹{totalBalance.toLocaleString()}</h3>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1.5 sm:mt-2 font-medium">Across {accounts.length} accounts</p>
                </div>
            </motion.div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="neo-card p-4 sm:p-5 border-2 border-brand-primary/50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-black uppercase tracking-tight text-brand-primary">
                                    {editAccount ? 'Edit Account' : 'New Account'}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                                    <BsX size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div>
                                    <label className={labelClass}>Account Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                        className={inputClass}
                                        placeholder="e.g. HDFC Savings"
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Account Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData(p => ({ ...p, type: e.target.value }))}
                                            className={inputClass}
                                        >
                                            {ACCOUNT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Initial Balance (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.balance}
                                            onChange={(e) => setFormData(p => ({ ...p, balance: e.target.value }))}
                                            className={inputClass}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Color</label>
                                    <div className="flex gap-2 mt-1">
                                        {COLORS.map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setFormData(p => ({ ...p, color: c }))}
                                                className={`w-7 h-7 rounded-full border-2 transition-transform ${formData.color === c ? 'border-brand-black dark:border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full neo-btn neo-btn-primary py-2.5 text-sm">
                                    {editAccount ? 'Update Account' : 'Create Account'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                {accounts.map((acc, index) => {
                    const IconComponent = getAccountIcon(acc.type);
                    const colorClass = getAccountColor(acc.type);

                    return (
                        <motion.div
                            key={acc._id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            onClick={() => setHistoryAccount(acc)}
                            className="neo-card p-4 sm:p-5 group hover:border-brand-primary transition-colors cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3 sm:mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg`}
                                        style={{ backgroundColor: acc.color || undefined }}
                                        // fallback to class if no custom color
                                        {...(!acc.color && { className: `w-10 h-10 sm:w-12 sm:h-12 shrink-0 ${colorClass} rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow-lg` })}
                                    >
                                        <IconComponent />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm sm:text-lg truncate">{acc.name}</h4>
                                        <span className="text-[10px] sm:text-xs font-bold uppercase px-1.5 sm:px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                                            {ACCOUNT_TYPES.find(t => t.value === acc.type)?.label || acc.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={(e) => openEditForm(acc, e)} className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <BsPencilSquare size={14} />
                                    </button>
                                    <button onClick={(e) => handleDelete(acc._id, e)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <BsTrash size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-end gap-2">
                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs font-bold text-gray-400 mb-0.5">Current Balance</p>
                                    <h3 className={`text-lg sm:text-2xl font-black truncate ${acc.balance < 0 ? 'text-red-500' : 'text-light-text dark:text-dark-text'}`}>
                                        ₹{acc.balance?.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[9px] sm:text-[10px] font-bold text-brand-primary uppercase">View History →</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Add New Card */}
                <motion.button
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    onClick={openCreateForm}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center text-gray-400 hover:text-brand-primary hover:border-brand-primary hover:bg-brand-primary/5 transition-all gap-2 min-h-[120px] sm:min-h-[160px]"
                >
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <BsPlus size={30} />
                    </div>
                    <span className="font-black text-sm uppercase">Link New Account</span>
                </motion.button>
            </div>

            {/* Account History Modal */}
            <AnimatePresence>
                {historyAccount && (
                    <AccountHistoryModal
                        account={historyAccount}
                        onClose={() => setHistoryAccount(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Accounts;
