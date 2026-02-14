import { useGlobalContext } from '../context/GlobalContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { format, parseISO, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { BsArrowDownLeft, BsArrowUpRight, BsGraphUp, BsPieChartFill } from 'react-icons/bs';

const Analytics = () => {
    const { transactions } = useGlobalContext();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [timeRange, setTimeRange] = useState('6m'); // 6m, 1y, all

    // ─── Filter & Sort Data ───
    const sortedTransactions = useMemo(() => {
        return [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [transactions]);

    // ─── Monthly Trend Data (Income vs Expense) ───
    const trendData = useMemo(() => {
        const data = [];
        const now = new Date();
        const monthsToShow = timeRange === '6m' ? 6 : timeRange === '1y' ? 12 : 24;

        for (let i = monthsToShow - 1; i >= 0; i--) {
            const d = subMonths(now, i);
            const monthLabel = format(d, 'MMM yyyy');

            const monthTxns = sortedTransactions.filter(t => isSameMonth(parseISO(t.date), d));
            const inc = monthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
            const exp = monthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

            data.push({
                name: format(d, 'MMM'),
                fullDate: monthLabel,
                income: inc,
                expense: exp,
                savings: inc - exp
            });
        }
        return data;
    }, [sortedTransactions, timeRange]);

    // ─── Category Analysis ───
    const categoryData = useMemo(() => {
        const cats = {};
        sortedTransactions.filter(t => t.amount < 0).forEach(t => {
            const c = t.category || 'Uncategorized';
            cats[c] = (cats[c] || 0) + Math.abs(t.amount);
        });
        return Object.entries(cats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value); // Highest first
    }, [sortedTransactions]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1971', '#EF4444', '#10B981'];
    const axisColor = isDark ? '#666' : '#999';
    const gridColor = isDark ? '#333' : '#e5e5e5';

    // ─── Tooltip Component ───
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`p-3 rounded-lg border-2 shadow-xl ${isDark ? 'bg-dark-card border-gray-700 text-dark-text' : 'bg-white border-brand-black text-light-text'}`}>
                    <p className="font-bold text-sm mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="text-xs font-semibold">
                            {entry.name}: ₹{entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Analytics</h2>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary font-semibold text-sm">Financial insights & trends</p>
                </div>

                {/* Time Range Toggle */}
                <div className="flex bg-light-card dark:bg-dark-card border-2 border-brand-black dark:border-gray-700 rounded-xl p-1 neo-shadow-sm">
                    {['6m', '1y', 'all'].map(r => (
                        <button key={r} onClick={() => setTimeRange(r)}
                            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${timeRange === r
                                    ? 'bg-brand-yellow text-brand-black border-2 border-brand-black neo-shadow-sm'
                                    : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                                }`}
                        >{r}</button>
                    ))}
                </div>
            </motion.div>

            {/* Income vs Expense Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="neo-card p-5 h-80"
            >
                <div className="flex items-center gap-2 mb-4">
                    <BsGraphUp size={18} />
                    <h3 className="text-base font-black uppercase tracking-tight">Income vs Expense Trend</h3>
                </div>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Category Breakdown Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Pie Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="neo-card p-5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <BsPieChartFill size={18} />
                        <h3 className="text-base font-black uppercase tracking-tight">Expense Distribution</h3>
                    </div>
                    <div className="h-64 w-full relative">
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
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Top Categories Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="neo-card p-5"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <BsArrowUpRight size={18} />
                        <h3 className="text-base font-black uppercase tracking-tight">Top Expenses</h3>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700, fill: axisColor }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                                    {categoryData.slice(0, 5).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Savings Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="neo-card p-5"
            >
                <h3 className="text-base font-black uppercase tracking-tight mb-4">Monthly Savings</h3>
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: axisColor, fontWeight: 700 }} axisLine={false} tickLine={false} />
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
