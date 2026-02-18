import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsCreditCardFill, BsDownload, BsArrowLeft, BsArrowRight, BsFilter, BsCalendar3, BsXCircle } from 'react-icons/bs';
import { adminApi } from '../../services/adminApi';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

const AdminTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all'); // all, daily, weekly, monthly, custom
    const [customRange, setCustomRange] = useState({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
    });

    const fetchTransactions = async (page = 1, forceParams = null) => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };

            const activeFilter = forceParams?.filterType || filterType;
            const activeRange = forceParams?.customRange || customRange;

            if (activeFilter !== 'all') {
                let start, end = new Date();

                if (activeFilter === 'daily') {
                    start = startOfDay(new Date());
                    end = endOfDay(new Date());
                } else if (activeFilter === 'weekly') {
                    start = startOfWeek(new Date(), { weekStartsOn: 1 });
                    end = endOfWeek(new Date(), { weekStartsOn: 1 });
                } else if (activeFilter === 'monthly') {
                    start = startOfMonth(new Date());
                    end = endOfMonth(new Date());
                } else if (activeFilter === 'custom') {
                    start = startOfDay(new Date(activeRange.startDate));
                    end = endOfDay(new Date(activeRange.endDate));
                }

                if (start && end) {
                    params.startDate = start.toISOString();
                    params.endDate = end.toISOString();
                }
            }

            const res = await adminApi.getTransactions(params);
            setTransactions(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    useEffect(() => {
        if (filterType !== 'custom') {
            fetchTransactions(1);
        }
    }, [filterType]);

    const handleExportPDF = () => {
        // Generate PDF using browser print
        const printContent = document.getElementById('transactions-table');
        if (!printContent) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>BudgetTracko - Transactions Report</title>
                    <style>
                        body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1a1a1a; }
                        h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 8px; }
                        .subtitle { font-size: 12px; color: #666; margin-bottom: 24px; }
                        table { width: 100%; border-collapse: collapse; font-size: 13px; }
                        th { background: #1a1a1a; color: #facc15; padding: 10px 12px; text-align: left; font-weight: 800; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
                        td { padding: 10px 12px; border-bottom: 1px solid #e0e0e0; }
                        tr:nth-child(even) { background: #f9f9f9; }
                        .status-captured { color: #22c55e; font-weight: 700; }
                        .status-created { color: #f59e0b; font-weight: 700; }
                        .status-failed { color: #ef4444; font-weight: 700; }
                        .status-refunded { color: #6366f1; font-weight: 700; }
                        .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>BudgetTracko Transactions Report</h1>
                    <p class="subtitle">Generated on ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })} | Total: ${pagination.total} transactions</p>
                    ${printContent.outerHTML}
                    <p class="footer">BudgetTracko &bull; Confidential</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'captured': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800';
            case 'created': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800';
            case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800';
            case 'refunded': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-800';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300 dark:border-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <BsCreditCardFill size={24} /> Transactions
                    </h1>
                    <p className="text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        {pagination.total} total payment records
                    </p>
                </div>
                <motion.button
                    onClick={handleExportPDF}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="neo-btn neo-btn-primary flex items-center gap-2"
                >
                    <BsDownload size={14} />
                    <span>Export PDF</span>
                </motion.button>
            </motion.div>

            {/* Filters Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="neo-card p-4 sm:p-6"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-2">
                        <BsFilter size={20} className="text-brand-black dark:text-brand-yellow" />
                        <h2 className="text-lg font-black uppercase tracking-tight">Filters</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${filterType === 'all'
                                    ? 'bg-brand-black text-brand-yellow border-brand-black dark:bg-brand-yellow dark:text-brand-black'
                                    : 'bg-transparent border-gray-200 dark:border-gray-800 hover:border-brand-black dark:hover:border-brand-yellow'
                                }`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => setFilterType('daily')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${filterType === 'daily'
                                    ? 'bg-brand-black text-brand-yellow border-brand-black dark:bg-brand-yellow dark:text-brand-black'
                                    : 'bg-transparent border-gray-200 dark:border-gray-800 hover:border-brand-black dark:hover:border-brand-yellow'
                                }`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setFilterType('weekly')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${filterType === 'weekly'
                                    ? 'bg-brand-black text-brand-yellow border-brand-black dark:bg-brand-yellow dark:text-brand-black'
                                    : 'bg-transparent border-gray-200 dark:border-gray-800 hover:border-brand-black dark:hover:border-brand-yellow'
                                }`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setFilterType('monthly')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${filterType === 'monthly'
                                    ? 'bg-brand-black text-brand-yellow border-brand-black dark:bg-brand-yellow dark:text-brand-black'
                                    : 'bg-transparent border-gray-200 dark:border-gray-800 hover:border-brand-black dark:hover:border-brand-yellow'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setFilterType('custom')}
                            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all border-2 ${filterType === 'custom'
                                    ? 'bg-brand-black text-brand-yellow border-brand-black dark:bg-brand-yellow dark:text-brand-black'
                                    : 'bg-transparent border-gray-200 dark:border-gray-800 hover:border-brand-black dark:hover:border-brand-yellow'
                                }`}
                        >
                            Custom Range
                        </button>
                    </div>

                    {filterType === 'custom' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">Start Date</label>
                                <input
                                    type="date"
                                    value={customRange.startDate}
                                    onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                                    className="neo-input w-full sm:w-auto text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-light-text-secondary dark:text-dark-text-secondary">End Date</label>
                                <input
                                    type="date"
                                    value={customRange.endDate}
                                    onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                                    className="neo-input w-full sm:w-auto text-sm"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fetchTransactions(1)}
                                className="neo-btn neo-btn-primary py-2.5 px-6 flex items-center gap-2"
                            >
                                <BsCalendar3 size={14} />
                                <span>Apply Range</span>
                            </motion.button>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Loading */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-4 border-brand-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : transactions.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="neo-card p-12 text-center"
                >
                    <BsCreditCardFill size={40} className="mx-auto mb-3 text-light-text-secondary dark:text-dark-text-secondary" />
                    <p className="font-bold text-light-text-secondary dark:text-dark-text-secondary">No transactions found</p>
                </motion.div>
            ) : (
                <>
                    {/* Mobile Card View (visible below lg) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:hidden space-y-3"
                    >
                        {transactions.map((tx) => (
                            <div key={tx._id} className="neo-card p-4 space-y-3">
                                {/* Top row: User + Amount */}
                                <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-black truncate">{tx.userId?.displayName || 'Deleted User'}</p>
                                        <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary truncate">{tx.userId?.email || 'N/A'}</p>
                                    </div>
                                    <p className="text-base font-black ml-3 flex-shrink-0">
                                        {tx.currency === 'INR' ? '₹' : tx.currency}{tx.amount}
                                    </p>
                                </div>

                                {/* Badges row: Plan + Status + Date */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-brand-yellow text-brand-black px-2 py-1 rounded-md border border-brand-black">
                                        {tx.plan}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${getStatusStyle(tx.status)}`}>
                                        {tx.status}
                                    </span>
                                    <span className="text-[10px] font-bold text-light-text-secondary dark:text-dark-text-secondary ml-auto">
                                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>

                                {/* IDs row */}
                                {(tx.orderId || tx.subscriptionId || tx.paymentId) && (
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
                                        {(tx.orderId || tx.subscriptionId) && (
                                            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
                                                <span className="font-black uppercase tracking-wider">Order:</span>{' '}
                                                <span className="font-mono font-bold break-all">{tx.orderId || tx.subscriptionId}</span>
                                            </p>
                                        )}
                                        {tx.paymentId && (
                                            <p className="text-[10px] text-light-text-secondary dark:text-dark-text-secondary">
                                                <span className="font-black uppercase tracking-wider">Payment:</span>{' '}
                                                <span className="font-mono font-bold break-all">{tx.paymentId}</span>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </motion.div>

                    {/* Desktop Table View (visible at lg+) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="hidden lg:block neo-card overflow-hidden"
                    >
                        <div className="overflow-x-auto">
                            <table id="transactions-table" className="w-full text-left">
                                <thead>
                                    <tr className="bg-brand-black text-brand-yellow dark:bg-gray-800 dark:text-brand-yellow">
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">User</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Order ID</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Payment ID</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Plan</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Amount</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Status</th>
                                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx._id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-sm font-bold">{tx.userId?.displayName || 'Deleted User'}</p>
                                                    <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary">{tx.userId?.email || 'N/A'}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-mono font-bold text-light-text-secondary dark:text-dark-text-secondary">{tx.orderId || tx.subscriptionId || '-'}</td>
                                            <td className="px-4 py-3 text-xs font-mono font-bold text-light-text-secondary dark:text-dark-text-secondary">{tx.paymentId || '-'}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-black uppercase tracking-wider bg-brand-yellow text-brand-black px-2 py-1 rounded-md border border-brand-black">
                                                    {tx.plan}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-black">
                                                {tx.currency === 'INR' ? '₹' : tx.currency}{tx.amount}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${getStatusStyle(tx.status)}`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchTransactions(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="neo-btn neo-btn-dark disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <BsArrowLeft size={14} /> Prev
                    </motion.button>
                    <span className="text-sm font-black">
                        {pagination.page} / {pagination.pages}
                    </span>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchTransactions(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="neo-btn neo-btn-dark disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next <BsArrowRight size={14} />
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default AdminTransactions;
