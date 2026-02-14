import { useGlobalContext } from '../context/GlobalContext';
import TransactionForm from '../components/TransactionForm';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, parseISO, isToday, isYesterday, isSameMonth, subMonths } from 'date-fns';
import { BsPlus, BsX, BsSearch, BsFilter, BsTrash3, BsFunnel } from 'react-icons/bs';

/* ─── Category Icons ─── */
const CAT_ICON = {
    Food: '🍔', Transport: '🚌', Bills: '💡', Shopping: '🛍️',
    Entertainment: '🎬', Health: '🏥', Education: '📚', Salary: '💰',
    Investment: '📈', Gift: '🎁', Other: '📦',
};

/* ─── Animation variants ─── */
const listItem = {
    hidden: { opacity: 0, x: -12 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: 60, height: 0, transition: { duration: 0.25 } },
};

const Transactions = () => {
    const { transactions, deleteTransaction } = useGlobalContext();
    const [showForm, setShowForm] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [editMode, setEditMode] = useState(null); // Transaction object to edit

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDate, setFilterDate] = useState('all'); // all, thisMonth, lastMonth

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Search
            const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

            // Category
            const matchesCategory = filterCategory === 'All' || t.category === filterCategory;

            // Date
            let matchesDate = true;
            if (filterDate === 'thisMonth') {
                matchesDate = isSameMonth(parseISO(t.date), new Date());
            } else if (filterDate === 'lastMonth') {
                matchesDate = isSameMonth(parseISO(t.date), subMonths(new Date(), 1));
            }

            return matchesSearch && matchesCategory && matchesDate;
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
    }, [transactions, searchTerm, filterCategory, filterDate]);

    // Group by Date
    const grouped = useMemo(() => {
        const groups = {};
        filteredTransactions.forEach(t => {
            if (!t.date) return;
            const d = parseISO(t.date);
            let label;
            if (isToday(d)) label = 'Today';
            else if (isYesterday(d)) label = 'Yesterday';
            else label = format(d, 'MMM dd, yyyy');

            if (!groups[label]) groups[label] = [];
            groups[label].push(t);
        });
        return groups;
    }, [filteredTransactions]);

    const handleEdit = (transaction) => {
        setEditMode(transaction);
        setShowForm(true);
    };

    const categories = ['All', 'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Salary', 'Investment', 'Other'];

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Controls */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Transactions</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-sm mt-0.5">
                            {filteredTransactions.length} found
                        </p>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => { setShowForm(!showForm); setEditMode(null); }}
                        className={`neo-btn ${showForm ? 'neo-btn-dark' : 'neo-btn-primary'} flex items-center gap-1.5`}
                    >
                        {showForm ? <><BsX size={16} /> Close</> : <><BsPlus size={16} /> Add New</>}
                    </motion.button>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full neo-input pl-9 py-2 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <BsFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="neo-input pl-9 py-2 text-sm appearance-none pr-8 cursor-pointer"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <select
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="neo-input py-2 px-3 text-sm cursor-pointer"
                        >
                            <option value="all">All Time</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.97 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.97 }}
                        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <div className="neo-card p-5 mb-4 border-2 border-brand-primary/50">
                            <h3 className="text-sm font-black uppercase tracking-tight mb-4 text-brand-primary">
                                {editMode ? 'Edit Transaction' : 'New Transaction'}
                            </h3>
                            <TransactionForm
                                onClose={() => { setShowForm(false); setEditMode(null); }}
                                initialData={editMode}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            {filteredTransactions.length > 0 ? (
                <div className="space-y-5">
                    {Object.entries(grouped).map(([dateLabel, items]) => (
                        <div key={dateLabel}>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-[11px] font-black uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">
                                    {dateLabel}
                                </span>
                                <div className="flex-1 h-[2px] bg-gray-200 dark:bg-gray-800 rounded-full" />
                            </div>

                            <div className="neo-card overflow-hidden divide-y-2 divide-gray-100 dark:divide-gray-800">
                                <AnimatePresence>
                                    {items.map(t => (
                                        <motion.div
                                            key={t.id}
                                            variants={listItem}
                                            initial="hidden" animate="visible" exit="exit" layout
                                            onClick={() => setSelectedTransaction(t)}
                                            className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-10 h-10 flex-shrink-0 bg-light-bg dark:bg-dark-bg border-2 border-brand-black dark:border-gray-600 rounded-xl flex items-center justify-center text-lg">
                                                    {CAT_ICON[t.category] || '📦'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm truncate">{t.text}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded text-light-text-secondary dark:text-dark-text-secondary">
                                                            {t.category || 'General'}
                                                        </span>
                                                        {t.paymentMode && (
                                                            <span className="text-[10px] font-semibold text-gray-400 hidden sm:inline">
                                                                • {t.paymentMode}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className={`font-black text-sm ${t.amount < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-card p-12 text-center">
                    <div className="text-5xl mb-4 text-gray-300">🔍</div>
                    <p className="font-black text-lg text-gray-400">No transactions found</p>
                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </motion.div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedTransaction && (
                    <TransactionDetailModal
                        transaction={selectedTransaction}
                        onClose={() => setSelectedTransaction(null)}
                        onEdit={handleEdit}
                        onDelete={deleteTransaction}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transactions;
