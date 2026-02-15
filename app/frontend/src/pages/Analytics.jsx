import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend, ReferenceLine
} from 'recharts';
import {
    format, parseISO, subMonths, subWeeks, subDays, isSameMonth, isSameWeek,
    startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
    isWithinInterval, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval
} from 'date-fns';
import {
    BsArrowDownLeft, BsArrowUpRight, BsGraphUp, BsPieChartFill,
    BsBarChartFill, BsCalendar3, BsCashCoin, BsWallet2
} from 'react-icons/bs';
import SEO from '../components/common/SEO';

/* ─── Safe date parse ─── */
const safeParse = (d) => {
    if (!d) return new Date();
    try { return typeof d === 'string' ? parseISO(d) : new Date(d); } catch { return new Date(d); }
};

/* ─── Budget data (mirrors Budgets.jsx mock for now) ─── */
const BUDGET_LIMITS = {
    Food: 5000, Transport: 3000, Shopping: 4000,
    Entertainment: 2000, Bills: 8000, Health: 5000,
    Education: 10000, Other: 2000
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1971', '#EF4444', '#10B981'];

const Analytics = () => {
    const { transactions } = useGlobalContext();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // ─── State ───
    const [timeRange, setTimeRange] = useState('month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [viewMode, setViewMode] = useState('spending'); // 'spending' | 'income'

    // ─── Axis Colors ───
    const axisColor = isDark ? '#666' : '#999';
    const gridColor = isDark ? '#333' : '#e5e5e5';

    // ─── Filter transactions by time range ───
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(t => {
            if (!t.date) return false;
            const d = safeParse(t.date);
            switch (timeRange) {
                case 'week':
                    return isWithinInterval(d, { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) });
                case 'month':
                    return isWithinInterval(d, { start: startOfMonth(now), end: endOfMonth(now) });
                case 'year':
                    return isWithinInterval(d, { start: startOfYear(now), end: endOfYear(now) });
                case 'custom':
                    if (customStart && customEnd) {
                        return isWithinInterval(d, { start: new Date(customStart), end: new Date(customEnd) });
                    }
                    return true;
                default:
                    return true;
            }
        });
    }, [transactions, timeRange, customStart, customEnd]);

    // ─── Trend Data ───
    const trendData = useMemo(() => {
        const now = new Date();
        const data = [];

        if (timeRange === 'week') {
            // Daily for the current week
            const weekStart = startOfWeek(now, { weekStartsOn: 1 });
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            days.forEach(day => {
                const dayTxns = filteredTransactions.filter(t => {
                    const d = safeParse(t.date);
                    return d.toDateString() === day.toDateString();
                });
                const inc = dayTxns.filter(t => t.type === 'income' || (t.type !== 'transfer' && t.amount > 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
                const exp = dayTxns.filter(t => t.type === 'expense' || (t.type !== 'transfer' && t.amount < 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
                data.push({ name: format(day, 'EEE'), fullDate: format(day, 'MMM dd'), income: inc, expense: exp, savings: inc - exp });
            });
        } else if (timeRange === 'month') {
            // Weekly for the current month
            for (let w = 0; w < 4; w++) {
                const start = new Date(now.getFullYear(), now.getMonth(), w * 7 + 1);
                const end = new Date(now.getFullYear(), now.getMonth(), Math.min((w + 1) * 7, new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()));
                const weekTxns = filteredTransactions.filter(t => {
                    const d = safeParse(t.date);
                    return d >= start && d <= end;
                });
                const inc = weekTxns.filter(t => t.type === 'income' || (t.type !== 'transfer' && t.amount > 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
                const exp = weekTxns.filter(t => t.type === 'expense' || (t.type !== 'transfer' && t.amount < 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
                data.push({ name: `W${w + 1}`, fullDate: `${format(start, 'MMM dd')} - ${format(end, 'dd')}`, income: inc, expense: exp, savings: inc - exp });
            }
        } else {
            // Monthly for year/custom
            const monthsToShow = timeRange === 'year' ? 12 : 6;
            for (let i = monthsToShow - 1; i >= 0; i--) {
                const d = subMonths(now, i);
                const monthTxns = filteredTransactions.filter(t => isSameMonth(safeParse(t.date), d));
                const inc = monthTxns.filter(t => t.type === 'income' || (t.type !== 'transfer' && t.amount > 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
                const exp = monthTxns.filter(t => t.type === 'expense' || (t.type !== 'transfer' && t.amount < 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
                data.push({ name: format(d, 'MMM'), fullDate: format(d, 'MMM yyyy'), income: inc, expense: exp, savings: inc - exp });
            }
        }
        return data;
    }, [filteredTransactions, timeRange]);

    // ─── Category Analysis ───
    const categoryData = useMemo(() => {
        const cats = {};
        const isSpending = viewMode === 'spending';

        filteredTransactions
            .filter(t => {
                if (t.type === 'transfer') return false;
                return isSpending ? (t.amount < 0 || t.type === 'expense') : (t.amount > 0 || t.type === 'income');
            })
            .forEach(t => {
                const c = t.category || 'Uncategorized';
                cats[c] = (cats[c] || 0) + Math.abs(t.amount);
            });

        return Object.entries(cats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [filteredTransactions, viewMode]);

    // ─── Budget Comparison Data ───
    const budgetCompareData = useMemo(() => {
        return Object.entries(BUDGET_LIMITS).map(([category, limit]) => {
            const actual = filteredTransactions
                .filter(t => t.category === category && (t.amount < 0 || t.type === 'expense') && t.type !== 'transfer')
                .reduce((s, t) => s + Math.abs(t.amount), 0);
            return { category, budget: limit, actual, percent: limit > 0 ? Math.round((actual / limit) * 100) : 0 };
        }).sort((a, b) => b.actual - a.actual);
    }, [filteredTransactions]);

    // ─── Summary Stats ───
    const summary = useMemo(() => {
        const inc = filteredTransactions.filter(t => t.type === 'income' || (t.type !== 'transfer' && t.amount > 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
        const exp = filteredTransactions.filter(t => t.type === 'expense' || (t.type !== 'transfer' && t.amount < 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
        return { income: inc, expense: exp, savings: inc - exp, savingsRate: inc > 0 ? Math.round(((inc - exp) / inc) * 100) : 0 };
    }, [filteredTransactions]);

    // ─── Tooltip ───
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg border-2 shadow-xl ${isDark ? 'bg-dark-card border-gray-700 text-dark-text' : 'bg-white border-brand-black text-light-text'}`}>
                    <p className="font-bold text-sm mb-2">{payload[0]?.payload?.fullDate || label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-xs font-semibold">
                            {entry.name}: ₹{entry.value?.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const TIME_OPTIONS = [
        { key: 'week', label: 'Week' },
        { key: 'month', label: 'Month' },
        { key: 'year', label: 'Year' },
        { key: 'custom', label: 'Custom' },
    ];

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            <SEO title="Analytics | BudgetTracko" description="Visualize your financial data with detailed analytics and charts." />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:gap-4"
            >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Analytics</h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-xs sm:text-sm">Financial insights & trends</p>
                    </div>

                    {/* Time Range Toggle */}
                    <div className="flex bg-light-card dark:bg-dark-card border-2 border-brand-black dark:border-gray-700 rounded-xl p-1 neo-shadow-sm shrink-0">
                        {TIME_OPTIONS.map(r => (
                            <button key={r.key} onClick={() => setTimeRange(r.key)}
                                className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all ${timeRange === r.key
                                    ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                                    }`}
                            >{r.label}</button>
                        ))}
                    </div>
                </div>

                {/* Custom Date Range Picker */}
                <AnimatePresence>
                    {timeRange === 'custom' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 neo-card p-3 sm:p-4 border-2 border-brand-yellow/40">
                                <div className="flex items-center gap-2 flex-1">
                                    <BsCalendar3 className="text-gray-400 shrink-0" />
                                    <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                                        className="w-full neo-input py-2 px-3 text-sm" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 self-center hidden sm:block">→</span>
                                <div className="flex items-center gap-2 flex-1">
                                    <BsCalendar3 className="text-gray-400 shrink-0" />
                                    <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                                        className="w-full neo-input py-2 px-3 text-sm" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View Mode Toggle (Spending / Income) */}
                <div className="flex items-center gap-3">
                    <div className="flex bg-light-card dark:bg-dark-card border-2 border-brand-black dark:border-gray-700 rounded-xl p-1">
                        <button onClick={() => setViewMode('spending')}
                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${viewMode === 'spending'
                                ? 'bg-red-500 text-white border-2 border-brand-black neo-shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text'
                                }`}>
                            <BsArrowUpRight size={12} /> Spending
                        </button>
                        <button onClick={() => setViewMode('income')}
                            className={`px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${viewMode === 'income'
                                ? 'bg-green-500 text-white border-2 border-brand-black neo-shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text'
                                }`}>
                            <BsArrowDownLeft size={12} /> Income
                        </button>
                    </div>
                    {/* Quick Stats */}
                    <div className="hidden sm:flex items-center gap-4 ml-auto text-xs font-black">
                        <span className="text-green-500">Income: ₹{summary.income.toLocaleString()}</span>
                        <span className="text-red-500">Expense: ₹{summary.expense.toLocaleString()}</span>
                        <span className={summary.savings >= 0 ? 'text-blue-500' : 'text-red-500'}>
                            Net: {summary.savings >= 0 ? '+' : ''}₹{summary.savings.toLocaleString()}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards (Mobile) */}
            <div className="grid grid-cols-3 gap-2 sm:hidden">
                {[
                    { label: 'Income', value: summary.income, color: 'text-green-500', icon: BsArrowDownLeft },
                    { label: 'Expense', value: summary.expense, color: 'text-red-500', icon: BsArrowUpRight },
                    { label: 'Net', value: summary.savings, color: summary.savings >= 0 ? 'text-blue-500' : 'text-red-500', icon: BsWallet2 },
                ].map((s, i) => (
                    <div key={i} className="neo-card p-2.5 text-center">
                        <s.icon className={`${s.color} mx-auto mb-1`} size={14} />
                        <p className="text-[8px] font-bold text-gray-400 uppercase">{s.label}</p>
                        <p className={`text-xs font-black ${s.color}`}>₹{s.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Trend Chart */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neo-card p-3 sm:p-5 h-64 sm:h-80">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <BsGraphUp size={16} />
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                        {viewMode === 'spending' ? 'Spending' : 'Income'} Trend
                    </h3>
                </div>
                <div className="w-full h-48 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `₹${v / 1000}k` : `₹${v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {viewMode === 'spending' ? (
                                <>
                                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </>
                            ) : (
                                <>
                                    <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </>
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Category Breakdown Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Pie Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="neo-card p-3 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <BsPieChartFill size={16} />
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                            {viewMode === 'spending' ? 'Expense' : 'Income'} Distribution
                        </h3>
                    </div>
                    <div className="h-56 sm:h-64 w-full relative">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px', fontWeight: 700, right: 0 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No data for this period</div>
                        )}
                    </div>
                </motion.div>

                {/* Top Categories Bar Chart */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="neo-card p-3 sm:p-5">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <BsBarChartFill size={16} />
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                            {viewMode === 'spending' ? 'Top Expenses' : 'Top Income Sources'}
                        </h3>
                    </div>
                    <div className="h-56 sm:h-64 w-full">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700, fill: axisColor }} axisLine={false} tickLine={false} width={70} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" name={viewMode === 'spending' ? 'Spent' : 'Earned'} radius={[0, 4, 4, 0]} barSize={24}>
                                        {categoryData.slice(0, 5).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No data</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Budget vs Actual Comparison */}
            {viewMode === 'spending' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="neo-card p-3 sm:p-5">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2">
                            <BsCashCoin size={16} />
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">Budget vs Actual</h3>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-300 dark:bg-gray-600 inline-block" /> Budget</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-brand-primary inline-block" /> Actual</span>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="w-full h-56 sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetCompareData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis dataKey="category" tick={{ fontSize: 9, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={50} />
                                <YAxis tick={{ fontSize: 10, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1000 ? `₹${v / 1000}k` : `₹${v}`} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                                <Bar dataKey="budget" name="Budget" fill={isDark ? '#4B5563' : '#D1D5DB'} radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]} barSize={20}>
                                    {budgetCompareData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percent > 100 ? '#EF4444' : entry.percent > 75 ? '#FFBB28' : '#10B981'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Budget Status Pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {budgetCompareData.filter(b => b.actual > 0).map((b, i) => {
                            const color = b.percent > 100 ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                : b.percent > 75 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                    : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800';
                            return (
                                <span key={i} className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full border ${color}`}>
                                    {b.category}: {b.percent}%
                                </span>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Savings / Net Analysis */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="neo-card p-3 sm:p-5">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-tight mb-3 sm:mb-4">
                    {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Weekly' : 'Monthly'} Savings
                </h3>
                <div className="w-full h-40 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <ReferenceLine y={0} stroke={axisColor} strokeDasharray="3 3" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="savings" name="Savings" radius={[4, 4, 0, 0]} barSize={32}>
                                {trendData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.savings >= 0 ? '#10B981' : '#EF4444'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default Analytics;
