import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { format, isSameMonth, isSameYear, parseISO, isYesterday } from 'date-fns';
import { BsArrowDownLeft, BsArrowUpRight, BsWallet2, BsLightningChargeFill, BsCalendarCheck, BsPiggyBank, BsActivity } from 'react-icons/bs';
import { toast } from 'sonner';

import SkeletonLoader from '../components/SkeletonLoader';
import WelcomeModal from '../components/WelcomeModal';
import SEO from '../components/common/SEO';

/* ─── animation variants ─── */
const fadeUp = (delay = 0) => ({
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
});

/* ─── Animated Number ─── */
const AnimatedNumber = ({ value, prefix = '' }) => {
    const [display, setDisplay] = useState('0.00');
    const num = parseFloat(value) || 0;

    useEffect(() => {
        const duration = 1000;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setDisplay((num * eased).toFixed(2));
            if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [num]);

    return <span>{prefix}{display}</span>;
};

/* ─── Category → Emoji ─── */
const CAT_ICON = {
    Food: '🍔', Transport: '🚌', Bills: '💡', Shopping: '🛍️',
    Entertainment: '🎬', Health: '🏥', Education: '📚', Salary: '💰',
    Investment: '📈', Gift: '🎁', Other: '📦',
};

/* ─── Custom Tooltip ─── */
const ChartTooltip = ({ active, payload, label, isDark }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className={`px-3 py-2 rounded-lg border-2 text-xs font-bold ${isDark ? 'bg-dark-card border-gray-700 text-dark-text' : 'bg-light-card border-brand-black text-light-text'}`}
            style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.15)' }}>
            <p className="opacity-60 mb-0.5">{label || payload[0].name}</p>
            <p>₹{payload[0].value?.toLocaleString()}</p>
        </div>
    );
};

/* ─── Main Dashboard ─── */
const Dashboard = () => {
    const { transactions, loading } = useGlobalContext();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [dateRange, setDateRange] = useState('month');
    const [hasNotifiedDaily, setHasNotifiedDaily] = useState(false);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        const now = new Date();
        return transactions.filter(t => {
            if (!t.date) return false;
            const d = parseISO(t.date);
            if (dateRange === 'month') return isSameMonth(d, now) && isSameYear(d, now);
            if (dateRange === 'year') return isSameYear(d, now);
            return true;
        });
    }, [transactions, dateRange]);

    // Financial totals
    const { income, expense, total } = useMemo(() => {
        const amounts = filteredTransactions.map(t => t.amount);
        const inc = amounts.filter(a => a > 0).reduce((s, a) => s + a, 0);
        const exp = amounts.filter(a => a < 0).reduce((s, a) => s + a, 0) * -1;
        return { income: inc.toFixed(2), expense: exp.toFixed(2), total: (inc - exp).toFixed(2) };
    }, [filteredTransactions]);

    // Daily Spend & Savings Rate
    const { dailyAvg, savingsRate } = useMemo(() => {
        if (!filteredTransactions.length) return { dailyAvg: '0', savingsRate: '0' };

        const days = new Date().getDate(); // approximate for current month
        const yearlyDays = 365; // approximate

        const avg = dateRange === 'month'
            ? (expense / days)
            : (expense / yearlyDays);

        const rate = income > 0 ? ((parseFloat(income) - parseFloat(expense)) / parseFloat(income)) * 100 : 0;

        return {
            dailyAvg: avg.toFixed(0),
            savingsRate: Math.max(0, rate).toFixed(0)
        };
    }, [expense, income, dateRange, filteredTransactions]);

    // Charts Data
    const spendingData = useMemo(() => {
        const data = dateRange === 'year'
            ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({
                name: m,
                spending: filteredTransactions.filter(t => parseISO(t.date).getMonth() === i && t.amount < 0)
                    .reduce((s, t) => s + Math.abs(t.amount), 0),
            }))
            : [{ name: 'W1', spending: 0 }, { name: 'W2', spending: 0 }, { name: 'W3', spending: 0 }, { name: 'W4', spending: 0 }];

        if (dateRange === 'month') {
            filteredTransactions.filter(t => t.amount < 0).forEach(t => {
                const idx = Math.min(Math.floor((parseISO(t.date).getDate() - 1) / 7), 3);
                data[idx].spending += Math.abs(t.amount);
            });
        }
        return data;
    }, [filteredTransactions, dateRange]);

    const categoryData = useMemo(() => {
        const cats = {};
        filteredTransactions.filter(t => t.amount < 0).forEach(t => {
            const c = t.category || 'Other';
            cats[c] = (cats[c] || 0) + Math.abs(t.amount);
        });
        return Object.entries(cats).map(([name, value]) => ({ name, value }));
    }, [filteredTransactions]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1971'];

    // Mock Data for new widgets
    const budgetData = [
        { category: 'Food', limit: 5000, spent: categoryData.find(c => c.name === 'Food')?.value || 0 },
        { category: 'Transport', limit: 2000, spent: categoryData.find(c => c.name === 'Transport')?.value || 0 },
        { category: 'Shopping', limit: 3000, spent: categoryData.find(c => c.name === 'Shopping')?.value || 0 },
    ];

    const upcomingBills = [
        { name: 'Netflix', date: 'Oct 18', amount: 649, icon: '🎬' },
        { name: 'Electricity', date: 'Oct 22', amount: 1450, icon: '⚡' },
    ];

    const axisColor = isDark ? '#666' : '#999';
    const gridColor = isDark ? '#333' : '#e5e5e5';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    // ─── Notification Logic ───
    useEffect(() => {
        if (loading || hasNotifiedDaily) return;

        // 1. Daily Summary
        const yesterdaySpend = transactions
            .filter(t => isYesterday(parseISO(t.date)) && t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        if (yesterdaySpend > 0) {
            toast.info(`You spent ₹${yesterdaySpend.toLocaleString()} yesterday.`, {
                description: 'Keep tracking to stay on budget! 📉',
                duration: 5000,
                icon: '📅'
            });
        }

        // 2. Budget Warnings (Mock for now)
        budgetData.forEach(b => {
            const percent = (b.spent / b.limit) * 100;
            if (percent >= 90) {
                toast.warning(`Budget Alert: ${b.category}`, {
                    description: `You've used ${Math.round(percent)}% of your limit! 🚨`,
                    duration: 6000,
                });
            }
        });

        // 3. Achievement Badges (Example)
        const totalSaved = parseFloat(income) - parseFloat(expense);
        if (totalSaved >= 1000 && !localStorage.getItem('badge_saver_1000')) {
            toast.success('Achievement Unlocked! 🏆', {
                description: 'First ₹1,000 Saved! Keep it up!',
                duration: 8000,
            });
            localStorage.setItem('badge_saver_1000', 'true');
        }

        setHasNotifiedDaily(true);
    }, [loading, transactions, income, expense, hasNotifiedDaily, budgetData]);


    if (loading) {
        return (
            <div className="space-y-4 sm:space-y-6 pb-20">
                <div className="flex justify-between items-end mb-6 sm:mb-8">
                    <div className="space-y-2">
                        <SkeletonLoader width={150} height={20} />
                        <SkeletonLoader width={250} height={36} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} height={100} />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        <SkeletonLoader height={280} />
                        <SkeletonLoader height={200} />
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                        <SkeletonLoader height={260} />
                        <SkeletonLoader height={220} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 pb-20">
            <SEO
                title="Dashboard | BudgetTracko"
                description="View your financial overview, track spending trends, and manage your budget on the BudgetTracko dashboard."
            />
            <WelcomeModal />

            {/* Header with Greeting & Date */}
            <motion.div variants={fadeUp(0)} initial="hidden" animate="visible"
                className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4 mb-1 sm:mb-2">
                <div className="min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs sm:text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                            {format(new Date(), 'EEEE, dd MMM')}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">
                        {greeting}, <span className="text-brand-primary">Student</span> 👋
                    </h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary font-medium mt-1 text-xs sm:text-sm">
                        You've saved <span className="text-green-500 font-bold">{savingsRate}%</span> of your income this {dateRange}.
                    </p>
                </div>

                {/* Date Range Toggle */}
                <div className="flex bg-light-card dark:bg-dark-card border-2 border-brand-black dark:border-gray-700 rounded-xl p-1 neo-shadow-sm self-start sm:self-auto shrink-0">
                    {['month', 'year', 'all'].map(r => (
                        <button key={r} onClick={() => setDateRange(r)}
                            className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all ${dateRange === r
                                ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                                }`}
                        >{r}</button>
                    ))}
                </div>
            </motion.div>

            {/* Quick Stats Bar */}
            <motion.div variants={fadeUp(0.1)} initial="hidden" animate="visible"
                className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {[
                    { label: 'Total Balance', value: total, icon: BsWallet2, color: 'text-blue-500' },
                    { label: 'Monthly Income', value: income, icon: BsArrowDownLeft, color: 'text-green-500' },
                    { label: 'Monthly Expense', value: expense, icon: BsArrowUpRight, color: 'text-red-500' },
                    { label: 'Daily Avg Spend', value: dailyAvg, icon: BsLightningChargeFill, color: 'text-brand-yellow' }
                ].map((stat, i) => (
                    <div key={i} className="neo-card p-3 sm:p-4 flex flex-col justify-between min-h-[100px] sm:h-28">
                        <div className={`p-1.5 sm:p-2 w-fit rounded-lg bg-light-bg dark:bg-dark-bg ${stat.color} mb-1.5 sm:mb-2`}>
                            <stat.icon size={16} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] uppercase font-bold text-light-text-secondary dark:text-dark-text-secondary truncate">{stat.label}</p>
                            <h4 className="text-base sm:text-xl font-black truncate">
                                <AnimatedNumber value={stat.value} prefix="₹" />
                            </h4>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                {/* Left Column (Charts - Takes 2/3 width on large screens) */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    {/* Spending Trends */}
                    <motion.div variants={fadeUp(0.2)} initial="hidden" animate="visible" className="neo-card p-3 sm:p-5 h-64 sm:h-80">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
                                <BsActivity /> Spending Trends
                            </h3>
                        </div>
                        <div className="h-48 sm:h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={spendingData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} dy={8} />
                                    <YAxis tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                                    <Tooltip content={<ChartTooltip isDark={isDark} />} />
                                    <Area type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={2.5} fill="url(#spendGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Recent Transactions List */}
                    <motion.div variants={fadeUp(0.3)} initial="hidden" animate="visible" className="neo-card p-3 sm:p-5">
                        <div className="flex justify-between items-center mb-3 sm:mb-5 pb-2 sm:pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight">Recent Activity</h3>
                            <Link className="neo-btn neo-btn-primary text-[10px]" to="/transactions">View All</Link>
                        </div>

                        <div className="space-y-1 sm:space-y-2">
                            {filteredTransactions.length === 0 && (
                                <div className="text-center py-8 sm:py-10 text-light-text-secondary dark:text-dark-text-secondary font-bold text-sm">
                                    No transactions found for this period
                                </div>
                            )}
                            {filteredTransactions.slice(0, 5).map(t => (
                                <div key={t.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors group">
                                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-light-card dark:bg-dark-bg border-2 border-brand-black dark:border-gray-600 rounded-xl flex items-center justify-center text-base sm:text-lg neo-shadow-sm">
                                            {CAT_ICON[t.category] || '📦'}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-xs sm:text-sm truncate">{t.text}</h4>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1 sm:px-1.5 py-0.5 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded text-light-text-secondary dark:text-dark-text-secondary">
                                                    {t.category || 'General'}
                                                </span>
                                                <span className="text-[9px] sm:text-[10px] font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                                                    {format(parseISO(t.date), 'MMM dd')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`font-black text-xs sm:text-sm shrink-0 ml-2 ${t.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                        {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column (Widgets - Takes 1/3 width) */}
                <div className="space-y-4 sm:space-y-6">

                    {/* Category Donut Chart */}
                    <motion.div variants={fadeUp(0.25)} initial="hidden" animate="visible" className="neo-card p-3 sm:p-5">
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight mb-3 sm:mb-4">Expenses by Category</h3>
                        <div className="h-40 sm:h-48 w-full relative">
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltip isDark={isDark} />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-sm font-bold text-gray-400">No data</div>
                            )}
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs font-bold text-gray-500 uppercase">Total</span>
                                <span className="text-lg font-black">{parseFloat(expense) > 0 ? `₹${Math.round(expense)}` : '-'}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Budget Progress */}
                    <motion.div variants={fadeUp(0.3)} initial="hidden" animate="visible" className="neo-card p-3 sm:p-5">
                        <div className="flex justify-between items-center mb-3 sm:mb-4">
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-tight flex items-center gap-2">
                                <BsPiggyBank /> Monthly Budgets
                            </h3>
                            <button className="text-[10px] font-bold text-brand-primary uppercase hover:underline">Manage</button>
                        </div>
                        <div className="space-y-4">
                            {budgetData.map((b, i) => {
                                const percent = Math.min((b.spent / b.limit) * 100, 100);
                                const color = percent > 90 ? 'bg-red-500' : percent > 70 ? 'bg-yellow-500' : 'bg-green-500';
                                return (
                                    <div key={i}>
                                        <div className="flex justify-between text-xs font-bold mb-1">
                                            <span>{b.category}</span>
                                            <span className={percent > 90 ? 'text-red-500' : 'text-gray-500'}>
                                                {Math.round(percent)}%
                                            </span>
                                        </div>
                                        <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                                            <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-semibold text-gray-400 mt-0.5">
                                            <span>₹{b.spent}</span>
                                            <span>₹{b.limit}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Upcoming Bills */}
                    <motion.div variants={fadeUp(0.35)} initial="hidden" animate="visible" className="neo-card p-3 sm:p-5">
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-tight mb-3 sm:mb-4 flex items-center gap-2">
                            <BsCalendarCheck /> Upcoming Bills
                        </h3>
                        <div className="space-y-3">
                            {upcomingBills.map((bill, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center text-lg bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                            {bill.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs">{bill.name}</p>
                                            <p className="text-[10px] font-semibold text-gray-500">Due {bill.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-xs">₹{bill.amount}</p>
                                        <button className="text-[10px] font-bold text-brand-primary uppercase hover:underline">Pay</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
