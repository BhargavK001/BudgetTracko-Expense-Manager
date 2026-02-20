import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BsCalendarCheck,
    BsPlusLg,
    BsThreeDotsVertical,
    BsCalendar3,
    BsCashCoin,
    BsPencilSquare,
    BsTrash,
    BsX
} from 'react-icons/bs';
import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'sonner';

const DEFAULT_BILLS = [
    { name: 'Rent', category: 'Housing', amount: 15000, frequency: 'monthly' },
    { name: 'Mess', category: 'Food', amount: 3000, frequency: 'monthly' },
    { name: 'Netflix', category: 'Entertainment', amount: 649, frequency: 'monthly' },
    { name: 'Prime Video', category: 'Entertainment', amount: 299, frequency: 'monthly' },
    { name: 'Mobile Recharge', category: 'Utilities', amount: 299, frequency: 'monthly' },
    { name: 'Public Transport', category: 'Transport', amount: 1000, frequency: 'monthly' },
    { name: 'Internet', category: 'Utilities', amount: 999, frequency: 'monthly' }
];

const RecurringBills = () => {
    const { recurringBills = [], addRecurringBill, updateRecurringBill, deleteRecurringBill } = useGlobalContext();
    const { isDark } = useTheme();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: 1,
        category: 'Bills',
        frequency: 'monthly',
        autoPay: false
    });

    const categories = useMemo(() => {
        return ['Housing', 'Food', 'Entertainment', 'Utilities', 'Transport', 'Bills', 'Other'];
    }, []);

    const handleOpenModal = (bill = null) => {
        if (bill) {
            setEditingBill(bill);
            setFormData({
                name: bill.name,
                amount: bill.amount,
                dueDate: bill.dueDate,
                category: bill.category || 'Bills',
                frequency: bill.frequency || 'monthly',
                autoPay: bill.autoPay || false
            });
        } else {
            setEditingBill(null);
            setFormData({
                name: '',
                amount: '',
                dueDate: 1,
                category: 'Bills',
                frequency: 'monthly',
                autoPay: false
            });
        }
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBill(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                ...formData,
                amount: Number(formData.amount),
                dueDate: Number(formData.dueDate)
            };

            if (editingBill) {
                await updateRecurringBill(editingBill._id, dataToSubmit);
            } else {
                await addRecurringBill(dataToSubmit);
            }
            handleCloseModal();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        toast('Confirm Deletion', {
            description: 'Are you sure you want to delete this bill?',
            action: {
                label: 'Delete',
                onClick: async () => {
                    await deleteRecurringBill(id);
                    setActiveMenuId(null);
                    toast.success('Bill deleted successfully');
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => setActiveMenuId(null)
            }
        });
    };

    const handlePreFill = (defBill) => {
        setFormData({
            ...formData,
            name: defBill.name,
            category: defBill.category,
            amount: defBill.amount.toString(),
            frequency: defBill.frequency
        });
    };

    const sortedBills = useMemo(() => {
        return [...recurringBills].sort((a, b) => a.dueDate - b.dueDate);
    }, [recurringBills]);

    const totalMonthly = useMemo(() => {
        return recurringBills.reduce((acc, curr) => {
            return acc + (curr.frequency === 'yearly' ? curr.amount / 12 : curr.amount);
        }, 0);
    }, [recurringBills]);

    return (
        <div className="space-y-6">
            {/* Header / Action Bar */}
            <div className="flex justify-between items-center bg-transparent mb-2 gap-4">
                <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-brand-primary/10 rounded-xl border-2 border-brand-primary/20 neo-shadow-sm">
                    <div className="p-2 sm:p-2.5 bg-white dark:bg-black rounded-lg shadow-sm border border-brand-primary/30">
                        <BsCalendarCheck className="text-brand-primary text-lg sm:text-xl" />
                    </div>
                    <div>
                        <p className="text-[9px] sm:text-[10px] uppercase font-black text-gray-500 tracking-widest leading-none mb-1">Monthly Est.</p>
                        <p className="font-black text-brand-black dark:text-white text-base sm:text-lg leading-none tracking-tight">
                            ₹{totalMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>

                {!isModalOpen && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleOpenModal()}
                        className="bg-brand-yellow text-brand-black dark:border-brand-black border-2 shadow-[4px_4px_0_0_#000000] rounded-xl font-black py-2.5 px-4 sm:px-5 text-xs sm:text-sm h-fit flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000000] transition-all"
                    >
                        <BsPlusLg strokeWidth={1.5} size={14} />
                        <span>Add Bill</span>
                    </motion.button>
                )}
            </div>

            {/* Empty State or List View */}
            {sortedBills.length === 0 ? (
                <div className="neo-card p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <BsCalendarCheck size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-black text-brand-black dark:text-white mb-2">No bills added yet</h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-6">Keep track of your subscriptions, rent, and other fixed expenses.</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleOpenModal()}
                        className="btn-primary"
                    >
                        Add Your First Bill
                    </motion.button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {sortedBills.map(bill => (
                            <motion.div
                                key={bill._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="neo-card p-5 relative group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-black text-brand-black dark:text-white text-lg">{bill.name}</h3>
                                        <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                                            {bill.category}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={() => setActiveMenuId(activeMenuId === bill._id ? null : bill._id)}
                                            className="p-1.5 text-gray-400 hover:text-brand-black dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <BsThreeDotsVertical />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                            {activeMenuId === bill._id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="absolute right-0 mt-1 w-32 bg-white dark:bg-dark-card border-2 border-brand-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10 overflow-hidden"
                                                >
                                                    <button
                                                        onClick={() => handleOpenModal(bill)}
                                                        className="w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 hover:bg-brand-yellow hover:text-brand-black dark:hover:bg-brand-yellow/80 transition-colors"
                                                    >
                                                        <BsPencilSquare /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bill._id)}
                                                        className="w-full text-left px-4 py-2 text-sm font-bold flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <BsTrash /> Delete
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div className="mt-auto space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                            <BsCashCoin />
                                        </div>
                                        <div>
                                            <p className="font-black text-brand-black dark:text-white flex items-baseline gap-1">
                                                ₹{bill.amount.toLocaleString()}
                                                <span className="text-[10px] text-gray-400 uppercase font-bold">/{bill.frequency.substring(0, 2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                            <BsCalendar3 />
                                        </div>
                                        <div className="flex-1 flex justify-between items-center">
                                            <p className="font-bold text-gray-600 dark:text-gray-300">
                                                Due on <span className="text-brand-black dark:text-white font-black">{bill.dueDate}{[1, 21, 31].includes(bill.dueDate) ? 'st' : [2, 22].includes(bill.dueDate) ? 'nd' : [3, 23].includes(bill.dueDate) ? 'rd' : 'th'}</span>
                                            </p>
                                            {bill.autoPay && (
                                                <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded font-bold uppercase">Auto</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add/Edit Form (Inline) */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="bg-white dark:bg-dark-card p-5 sm:p-6 border-2 border-brand-black dark:border-gray-700 rounded-2xl shadow-[6px_6px_0_0_#000000] dark:shadow-[6px_6px_0_0_#374151]">
                            <div className="flex justify-between items-center mb-5 pb-4 border-b-2 border-brand-black/10 dark:border-gray-800">
                                <h2 className="text-lg font-black text-brand-black dark:text-white uppercase tracking-tight">
                                    {editingBill ? 'Edit Bill' : 'Add Recurring Bill'}
                                </h2>
                                <button onClick={handleCloseModal} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 hover:text-brand-black dark:hover:text-white">
                                    <BsX size={20} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                {!editingBill && (
                                    <div className="mb-6">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Quick Add Presets</label>
                                        <div className="flex flex-wrap gap-2">
                                            {DEFAULT_BILLS.map(def => (
                                                <button
                                                    key={def.name}
                                                    type="button"
                                                    onClick={() => handlePreFill(def)}
                                                    className="px-3 py-1.5 text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-brand-yellow hover:text-black dark:hover:bg-brand-yellow transition-colors rounded-full border border-transparent hover:border-brand-black"
                                                >
                                                    {def.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <form id="billForm" onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Bill Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Netflix, Rent"
                                            className="w-full neo-input"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500/80 font-black z-10 px-1 bg-white dark:bg-dark-bg">₹</span>
                                                <input
                                                    type="number"
                                                    required
                                                    min="0"
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                    className="w-full neo-input !pl-9"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Due Date (1-31)</label>
                                            <input
                                                type="number"
                                                required
                                                min="1"
                                                max="31"
                                                value={formData.dueDate}
                                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                className="w-full neo-input"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                            {/* Allow custom category typing via datalist */}
                                            <input
                                                type="text"
                                                list="categoryOptions"
                                                required
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className="w-full neo-input"
                                                placeholder="Select or type..."
                                            />
                                            <datalist id="categoryOptions">
                                                {categories.map(c => <option key={c} value={c} />)}
                                            </datalist>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                                            <select
                                                value={formData.frequency}
                                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                                className="w-full neo-input"
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="yearly">Yearly</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-2 flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="autoPay"
                                            checked={formData.autoPay}
                                            onChange={(e) => setFormData({ ...formData, autoPay: e.target.checked })}
                                            className="w-4 h-4 text-brand-primary border-2 border-brand-black rounded focus:ring-brand-primary"
                                        />
                                        <label htmlFor="autoPay" className="text-sm font-bold cursor-pointer select-none">Mark as Auto-Pay</label>
                                    </div>
                                </form>
                            </div>

                            <div className="mt-6 pt-5 border-t-2 border-brand-black/10 dark:border-gray-800 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="font-black uppercase tracking-widest text-xs hover:text-brand-primary transition-colors py-3 px-4 w-full sm:w-auto text-center sm:text-left"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="billForm"
                                    className="bg-brand-yellow text-brand-black border-2 border-brand-black shadow-[4px_4px_0_0_#000000] rounded-xl font-black py-3 px-8 text-xs sm:text-sm hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000000] transition-all uppercase tracking-widest w-full sm:w-auto"
                                >
                                    {editingBill ? 'Save Changes' : 'Add Bill'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecurringBills;
