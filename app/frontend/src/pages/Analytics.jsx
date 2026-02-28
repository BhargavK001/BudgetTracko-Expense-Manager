import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend, ReferenceLine, LabelList
} from 'recharts';
import {
    format, parseISO, subMonths, subWeeks, subDays, isSameMonth, isSameWeek,
    startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear,
    isWithinInterval, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval
} from 'date-fns';
import {
    BsArrowDownLeft, BsArrowUpRight, BsGraphUp, BsGraphDown, BsPieChartFill,
    BsBarChartFill, BsCalendar3, BsCashCoin, BsWallet2,
    BsSpeedometer2, BsCalendarCheck, BsReceipt
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
    const { transactions, recurringBills = [] } = useGlobalContext();
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
            // Weekly for the current month - split into 4 parts roughly
            // 1-7, 8-14, 15-21, 22-End
            const startOfMonthDate = startOfMonth(now);
            const endOfMonthDate = endOfMonth(now);

            const ranges = [
                { start: 1, end: 7 },
                { start: 8, end: 14 },
                { start: 15, end: 21 },
                { start: 22, end: endOfMonthDate.getDate() }
            ];

            ranges.forEach((range, idx) => {
                const rangeStart = new Date(now.getFullYear(), now.getMonth(), range.start);
                const rangeEnd = new Date(now.getFullYear(), now.getMonth(), range.end);

                const weekTxns = filteredTransactions.filter(t => {
                    const d = safeParse(t.date);
                    return d >= rangeStart && d <= rangeEnd; // Simple day filtering might need safer bounds but works for demo
                });

                const inc = weekTxns.filter(t => t.type === 'income' || (t.type !== 'transfer' && t.amount > 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
                const exp = weekTxns.filter(t => t.type === 'expense' || (t.type !== 'transfer' && t.amount < 0)).reduce((s, t) => s + Math.abs(t.amount), 0);

                data.push({
                    name: `${format(rangeStart, 'd')}-${format(rangeEnd, 'd')} ${format(rangeStart, 'MMM')}`,
                    fullDate: `${format(rangeStart, 'MMM dd')} - ${format(rangeEnd, 'MMM dd')}`,
                    income: inc,
                    expense: exp,
                    savings: inc - exp
                });
            });

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
            return { category, budget: limit, actual, percent: limit > 0 ? ((actual / limit) * 100).toFixed(2) : '0.00' };
        }).sort((a, b) => b.actual - a.actual);
    }, [filteredTransactions]);

    // ─── Summary Stats ───
    const summary = useMemo(() => {
        const inc = filteredTransactions.filter(t => t.type === 'income' || (t.type !== 'transfer' && t.amount > 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
        const exp = filteredTransactions.filter(t => t.type === 'expense' || (t.type !== 'transfer' && t.amount < 0)).reduce((s, t) => s + Math.abs(t.amount), 0);
        return { income: inc, expense: exp, savings: inc - exp, savingsRate: inc > 0 ? (((inc - exp) / inc) * 100).toFixed(2) : '0.00' };
    }, [filteredTransactions]);

    // ─── Tooltip ───
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`px-4 py-3 rounded-xl border border-white/20 backdrop-blur-md shadow-xl text-xs font-bold ${isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-black'}`}>
                    <p className="opacity-70 mb-2 uppercase tracking-wider text-[10px]">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 mb-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.stroke || entry.fill }} />
                                <span className="text-sm">{entry.name}</span>
                            </div>
                            <span className="font-black text-sm" style={{ color: entry.stroke || entry.fill }}>₹{Number(entry.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
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

                {/* View Mode Toggle (Spending / Income) - Kept for Pie/Bar charts, but Trend shows EVERYTHING now */}
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
                </div>
            </motion.div>

            {/* Summary Cards (Mobile) */}
            <div className="grid grid-cols-3 gap-2 sm:hidden">
                {[
                    { label: 'Income', value: summary.income, color: 'text-green-500', icon: BsArrowDownLeft, trend: '+12%', trendColor: 'text-green-500', trendIcon: BsGraphUp },
                    { label: 'Expense', value: summary.expense, color: 'text-red-500', icon: BsArrowUpRight, trend: '+5%', trendColor: 'text-red-500', trendIcon: BsGraphUp },
                    { label: 'Net', value: summary.savings, color: summary.savings >= 0 ? 'text-blue-500' : 'text-red-500', icon: BsWallet2, trend: summary.savings >= 0 ? '+8%' : '-2%', trendColor: summary.savings >= 0 ? 'text-green-500' : 'text-red-500', trendIcon: summary.savings >= 0 ? BsGraphUp : BsGraphDown },
                ].map((s, i) => (
                    <div key={i} className="neo-card p-2.5 text-center relative overflow-hidden">
                        <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-60">
                            <s.trendIcon className={`${s.trendColor}`} size={8} />
                            <span className={`text-[8px] font-bold ${s.trendColor}`}>{s.trend}</span>
                        </div>
                        <s.icon className={`${s.color} mx-auto mb-1`} size={14} />
                        <p className="text-[8px] font-bold text-gray-400 uppercase">{s.label}</p>
                        <p className={`text-xs font-black ${s.color}`}>₹{Number(s.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                ))}
            </div>

            {/* Trend Chart (Premium Revamp) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="neo-card p-4 sm:p-6 h-80 sm:h-96 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6 z-10 relative">
                    <div className="flex items-center gap-2">
                        <BsGraphUp className="text-brand-primary" size={18} />
                        <div>
                            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Financial Trend</h3>
                            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider mt-0.5">Income vs Expense</p>
                        </div>
                    </div>
                </div>

                <div className="w-full h-60 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: isDark ? '#FFF' : axisColor, fontWeight: 700 }}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: isDark ? '#FFF' : axisColor, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(2)}k` : `₹${v}`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: isDark ? '#555' : '#ddd', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} fill="url(#incomeGrad)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
                            <Area type="monotone" dataKey="expense" name="Expense" stroke="#F43F5E" strokeWidth={3} fill="url(#expenseGrad)" activeDot={{ r: 6, strokeWidth: 0, fill: '#F43F5E' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Category Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Donut Chart (Distribution) */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="neo-card p-4 sm:p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <BsPieChartFill size={16} className="text-brand-primary" />
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                            {viewMode === 'spending' ? 'Expense' : 'Income'} Distribution
                        </h3>
                    </div>
                    <div className="flex-1 w-full min-h-[300px] flex flex-col items-center justify-center relative">
                        {categoryData.length > 0 ? (
                            <>
                                <div className="h-48 w-full relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={categoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {categoryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
                                        ₹{Number(categoryData.reduce((a, b) => a + b.value, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </div>
                                {/* Custom Legend with Percentages */}
                                <div className="w-full grid grid-cols-2 gap-2 mt-4">
                                    {categoryData.map((entry, index) => {
                                        const total = categoryData.reduce((a, b) => a + b.value, 0);
                                        const percent = ((entry.value / total) * 100).toFixed(2);
                                        return (
                                            <div key={index} className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                                    <span className="text-[10px] font-bold truncate text-gray-600 dark:text-gray-300">{entry.name}</span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-[10px] font-black">{percent}%</div>
                                                    <div className="text-[9px] text-gray-400">₹{Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No data for this period</div>
                        )}
                    </div>
                </motion.div>

                {/* Top Expenses (List View) */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="neo-card p-4 sm:p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <BsBarChartFill size={16} className="text-brand-primary" />
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">
                            {viewMode === 'spending' ? 'Top Expenses' : 'Top Income Sources'}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                        {categoryData.length > 0 ? (
                            categoryData.slice(0, 5).map((entry, index) => {
                                const maxVal = categoryData[0].value;
                                const percent = (entry.value / maxVal) * 100;
                                const color = COLORS[index % COLORS.length];

                                return (
                                    <div key={entry.name} className="group">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                                {entry.name}
                                            </span>
                                            <span className="text-sm font-black">₹{Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No data</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Quick Stats (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 ml-auto p-1.5 pr-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/5 backdrop-blur-md shadow-sm">

                {/* Income */}
                <div className="flex flex-col items-end px-4 border-r border-gray-200 dark:border-gray-700/50">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Income</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-800 dark:text-gray-100">₹{Number(summary.income).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <div className="bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <BsGraphUp size={10} />
                            <span className="text-[10px] font-bold">12%</span>
                        </div>
                    </div>
                </div>

                {/* Expense */}
                <div className="flex flex-col items-end px-4 border-r border-gray-200 dark:border-gray-700/50">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Expense</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-800 dark:text-gray-100">₹{Number(summary.expense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        <div className="bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <BsGraphUp size={10} />
                            <span className="text-[10px] font-bold">5%</span>
                        </div>
                    </div>
                </div>

                {/* Net */}
                <div className="flex flex-col items-end px-4">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Net Savings</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${summary.savings >= 0 ? 'text-brand-primary' : 'text-red-500'}`}>
                            {summary.savings >= 0 ? '+' : ''}₹{Number(summary.savings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <div className={`px-1.5 py-0.5 rounded-md flex items-center gap-1 ${summary.savings >= 0 ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
                            {summary.savings >= 0 ? <BsGraphUp size={10} /> : <BsGraphDown size={10} />}
                            <span className="text-[10px] font-bold">{summary.savings >= 0 ? '8%' : '2%'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget vs Actual Comparison */}
            {viewMode === 'spending' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="neo-card p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BsCashCoin size={18} className="text-brand-primary" />
                            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">Budget vs Actual</h3>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] sm:text-xs font-bold">
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 dark:bg-gray-700 inline-block" /> Budget</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-brand-primary inline-block" /> Actual</span>
                        </div>
                    </div>

                    {/* Chart: Overlay Bars (Actual on top of Budget) */}
                    <div className="w-full h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetCompareData} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                <XAxis
                                    dataKey="category"
                                    tick={{ fontSize: 10, fill: axisColor, fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={0}
                                    height={40}
                                />
                                <YAxis
                                    tick={{ fontSize: 10, fill: axisColor, fontWeight: 700 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(2)}k` : `₹${v}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                                {/* Budget Bar (Background) */}
                                <Bar dataKey="budget" name="Budget" fill={isDark ? '#374151' : '#E5E7EB'} radius={[4, 4, 0, 0]} barSize={32} />
                                {/* Actual Bar (Foreground - Overlay using negative margin technique or separate bar chart? Recharts handles stacked or grouped. Here we want grouped but centered? Or just custom shape?
                                    Actually, a simple way to do "overlay" in Recharts is to render two Bars with the same xAxisId.
                                */}
                                <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]} barSize={16} xAxisId={0}>
                                    {budgetCompareData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.percent > 100 ? '#EF4444' : entry.percent > 85 ? '#F59E0B' : '#10B981'} />
                                    ))}
                                    <LabelList dataKey="percent" position="top" formatter={(val) => `${val}%`} style={{ fontSize: '10px', fontWeight: 'bold', fill: axisColor }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            )}

            {/* Premium Analytics Grid: Health Score & Recurring Bills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Financial Health Score (Gauge) */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="neo-card p-4 sm:p-5 flex flex-col items-center justify-between">
                    <div className="w-full flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <BsSpeedometer2 size={18} className="text-brand-primary" />
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">Financial Health</h3>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${summary.savingsRate > 20 ? 'bg-green-100 text-green-700' : summary.savingsRate > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {summary.savingsRate > 20 ? 'Excellent' : summary.savingsRate > 0 ? 'Good' : 'Needs Action'}
                        </span>
                    </div>

                    <div className="relative w-48 h-24 my-4">
                        {/* Gauge Background */}
                        <div className="absolute inset-0 w-full h-full rounded-t-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            {/* Gauge Fill (Calculated Width based on Score) */}
                            <motion.div
                                initial={{ rotate: -180 }}
                                animate={{ rotate: (Math.min(Math.max(summary.savingsRate + 50, 0), 100) / 100) * 180 - 180 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="w-full h-full origin-bottom"
                                style={{
                                    background: `conic-gradient(from 180deg at 50% 100%, #EF4444 0deg, #F59E0B 60deg, #10B981 120deg, #10B981 180deg)`
                                }}
                            />
                        </div>
                        {/* Gauge Needle/Overlay mask to make it an arc */}
                        <div className="absolute top-4 left-4 right-4 bottom-0 bg-white dark:bg-[#1a1a1a] rounded-t-full flex items-end justify-center pb-2 z-10">
                            <div className="text-center">
                                <span className="text-3xl font-black block leading-none">{Math.min(Math.max(summary.savingsRate + 50, 0), 100)}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-center font-medium text-gray-500 max-w-[80%]">
                        Based on your savings rate ({summary.savingsRate}%) and budget adherence.
                    </p>
                </motion.div>

                {/* Recurring Bills Forecast */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="neo-card p-4 sm:p-5 flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                        <BsCalendarCheck size={16} className="text-brand-primary" />
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">Recurring Bills</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {/* Real recurring bills from context */}
                        {recurringBills
                            .slice()
                            .sort((a, b) => a.dueDate - b.dueDate)
                            .slice(0, 4)
                            .map((bill, i) => (
                                <div key={bill._id || i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <BsReceipt size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black truncate max-w-[100px]">{bill.name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">Due {bill.dueDate}{[1, 21, 31].includes(bill.dueDate) ? 'st' : [2, 22].includes(bill.dueDate) ? 'nd' : [3, 23].includes(bill.dueDate) ? 'rd' : 'th'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black text-red-500">-₹{Number(Math.abs(bill.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        {bill.autoPay && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500">Auto-Pay</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        {recurringBills.length === 0 && (
                            <div className="text-center text-gray-400 text-xs font-bold py-4">No recurring bills added.</div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Savings / Net Analysis (Existing) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="neo-card p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                    <BsWallet2 size={18} className="text-brand-primary" />
                    <h3 className="text-base sm:text-lg font-black uppercase tracking-tight">
                        {timeRange === 'week' ? 'Daily' : timeRange === 'month' ? 'Weekly' : 'Monthly'} Savings
                    </h3>
                </div>
                <div className="w-full h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData} margin={{ top: 10, right: 0, left: -15, bottom: 0 }}>
                            <defs>
                                <linearGradient id="savGreen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
                                </linearGradient>
                                <linearGradient id="savRed" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#EF4444" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#B91C1C" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: axisColor, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: axisColor, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={v => v >= 1000 ? `₹${(v / 1000).toFixed(2)}k` : `₹${v}`}
                            />
                            <ReferenceLine y={0} stroke={axisColor} strokeDasharray="3 3" />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
                            <Bar dataKey="savings" name="Savings" radius={[4, 4, 4, 4]} barSize={32}>
                                {trendData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.savings >= 0 ? 'url(#savGreen)' : 'url(#savRed)'} />
                                ))}
                                <LabelList dataKey="savings" position="top" formatter={(val) => `₹${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} style={{ fontSize: '10px', fontWeight: 'bold', fill: axisColor }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default Analytics;
