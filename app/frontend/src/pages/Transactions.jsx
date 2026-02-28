import { useGlobalContext } from '../context/GlobalContext';
import TransactionForm from '../components/TransactionForm';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { format, parseISO, isToday, isYesterday, isSameMonth, subMonths } from 'date-fns';
import { BsPlus, BsX, BsSearch, BsFilter, BsTrash3, BsFunnel, BsCalendar3, BsListUl } from 'react-icons/bs';
import { getCategoryIcon } from '../utils/iconMap';
import SEO from '../components/common/SEO';
import CalendarView from '../components/CalendarView';
import RecurringBills from './RecurringBills';
import Budgets from './Budgets';

/* ─── Render Category Icon ─── */
const RenderCatIcon = ({ category, size = 16 }) => {
    const Icon = getCategoryIcon(category || 'Other');
    return <Icon size={size} />;
};

const safeParse = (d) => {
    if (!d) return new Date();
    try { return typeof d === 'string' ? parseISO(d) : new Date(d); } catch { return new Date(d); }
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
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
    const [activeTab, setActiveTab] = useState('history'); // 'history' | 'recurring' | 'budgets'

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterDate, setFilterDate] = useState('all'); // all, thisMonth, lastMonth

    // Filter Logic
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Search
            const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.note && t.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

            // Category
            const matchesCategory = filterCategory === 'All' || t.category === filterCategory;

            // Date (Only apply in List View, Calendar has its own range)
            let matchesDate = true;
            if (viewMode === 'list') {
                const d = safeParse(t.date);
                if (filterDate === 'thisMonth') {
                    matchesDate = isSameMonth(d, new Date());
                } else if (filterDate === 'lastMonth') {
                    matchesDate = isSameMonth(d, subMonths(new Date(), 1));
                }
            }

            return matchesSearch && matchesCategory && matchesDate;
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
    }, [transactions, searchTerm, filterCategory, filterDate, viewMode]);

    // Group by Date
    const grouped = useMemo(() => {
        const groups = {};
        filteredTransactions.forEach(t => {
            if (!t.date) return;
            const d = safeParse(t.date);
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

    const categories = ['All', 'Food', 'Transport', 'Bills', 'Shopping', 'Entertainment', 'Health', 'Education', 'Salary', 'Investment', 'Transfer', 'Other'];

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            <SEO
                title="Transactions | BudgetTracko"
                description="View and manage your income and expense transactions."
            />
            {/* Header & Controls */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center gap-2">
                    <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight">Transactions</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-xs sm:text-sm mt-0.5">
                            {filteredTransactions.length} found
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* View Toggle */}
                        <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-black shadow-sm text-brand-black dark:text-white' : 'text-gray-400'}`}
                            >
                                <BsListUl size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-1.5 sm:p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-black shadow-sm text-brand-black dark:text-white' : 'text-gray-400'}`}
                            >
                                <BsCalendar3 size={16} />
                            </button>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={() => { setShowForm(!showForm); setEditMode(null); }}
                            className={`neo-btn ${showForm ? 'neo-btn-dark' : 'neo-btn-primary'} flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs px-2.5 sm:px-4 py-2 sm:py-2.5 shrink-0`}
                        >
                            {showForm ? <><BsX size={14} /> <span className="hidden xs:inline">Close</span></> : <><BsPlus size={14} /> <span className="hidden xs:inline">Add New</span></>}
                        </motion.button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b-2 border-gray-100 dark:border-gray-800 font-black uppercase tracking-wider text-xs sm:text-sm">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'history' ? 'border-brand-primary text-brand-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        History
                    </button>
                    <button
                        onClick={() => setActiveTab('recurring')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'recurring' ? 'border-brand-primary text-brand-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Recurring Bills
                    </button>
                    <button
                        onClick={() => setActiveTab('budgets')}
                        className={`pb-2 border-b-2 transition-colors ${activeTab === 'budgets' ? 'border-brand-primary text-brand-black dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Budgets
                    </button>
                </div>

                {activeTab === 'history' && (
                    <div className="flex flex-col gap-2 sm:gap-3">
                        <div className="relative">
                            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full neo-input !pl-10 py-2.5 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1 sm:flex-none">
                                <BsFunnel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="neo-input !pl-10 py-2.5 text-xs sm:text-sm appearance-none pr-8 cursor-pointer w-full"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            {viewMode === 'list' && (
                                <select
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="neo-input py-2.5 px-2 sm:px-3 text-xs sm:text-sm cursor-pointer flex-1 sm:flex-none"
                                >
                                    <option value="all">All Time</option>
                                    <option value="thisMonth">This Month</option>
                                    <option value="lastMonth">Last Month</option>
                                </select>
                            )}
                        </div>
                    </div>
                )}
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
                        <div className="neo-card p-3 sm:p-5 mb-4 border-2 border-brand-primary/50">
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

            {/* Content */}
            <div className="relative overflow-visible">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab + viewMode}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="w-full h-full"
                    >
                        {activeTab === 'budgets' ? (
                            <Budgets />
                        ) : activeTab === 'recurring' ? (
                            <RecurringBills />
                        ) : viewMode === 'list' ? (
                            filteredTransactions.length > 0 ? (
                                <div className="space-y-4 sm:space-y-5">
                                    {Object.entries(grouped).map(([dateLabel, items]) => (
                                        <div key={dateLabel}>
                                            <div className="flex items-center gap-3 mb-2 sm:mb-3">
                                                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary shrink-0">
                                                    {dateLabel}
                                                </span>
                                                <div className="flex-1 h-[2px] bg-gray-200 dark:bg-gray-800 rounded-full" />
                                            </div>

                                            <div className="neo-card overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                                                <AnimatePresence>
                                                    {items.map(t => (
                                                        <motion.div
                                                            key={t._id || t.id}
                                                            variants={listItem}
                                                            initial="hidden" animate="visible" exit="exit" layout
                                                            onClick={() => setSelectedTransaction(t)}
                                                            className="flex items-center justify-between p-3 sm:p-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                                        >
                                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                                                <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-light-bg dark:bg-dark-bg border-2 border-brand-black dark:border-gray-600 rounded-xl flex items-center justify-center">
                                                                    <RenderCatIcon category={t.category} size={16} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-xs sm:text-sm truncate">{t.text}</p>
                                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1 sm:px-1.5 py-0.5 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded text-light-text-secondary dark:text-dark-text-secondary">
                                                                            {t.category || 'General'}
                                                                        </span>
                                                                        {t.paymentMode && (
                                                                            <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 hidden sm:inline">
                                                                                • {t.paymentMode}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                                                                <span className={`font-black text-xs sm:text-sm ${t.type === 'transfer' ? 'text-blue-500 dark:text-blue-400' : t.amount < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                                    {t.type === 'transfer' ? '' : t.amount > 0 ? '+' : ''}₹{Number(Math.abs(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neo-card p-12 text-center flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                        <BsSearch size={32} />
                                    </div>
                                    <p className="font-black text-lg text-gray-400">No transactions found</p>
                                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                                </motion.div>
                            )
                        ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <CalendarView
                                    transactions={filteredTransactions}
                                    onEdit={setSelectedTransaction}
                                />
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
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Transactions;
