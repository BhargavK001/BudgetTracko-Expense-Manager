import { useGlobalContext } from '../context/GlobalContext';
import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

// Animated counting number component
const AnimatedNumber = ({ value, prefix = '', suffix = '' }) => {
    const [display, setDisplay] = useState(0);
    const numericValue = parseFloat(value) || 0;

    useEffect(() => {
        let start = 0;
        const end = numericValue;
        const duration = 1200;
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * eased;
            setDisplay(current.toFixed(2));

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }, [numericValue]);

    return <span>{prefix}{display}{suffix}</span>;
};

const Dashboard = () => {
    const { transactions } = useGlobalContext();

    const amounts = transactions.map(transaction => transaction.amount);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);

    const expense = (
        amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
        -1
    ).toFixed(2);

    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

    // Spending trend: by week for current month (or last 4 weeks)
    const spendingTrendData = useMemo(() => {
        const now = new Date();
        const weeks = [
            { week: 'W1', spending: 0, full: 'Week 1' },
            { week: 'W2', spending: 0, full: 'Week 2' },
            { week: 'W3', spending: 0, full: 'Week 3' },
            { week: 'W4', spending: 0, full: 'Week 4' },
        ];
        transactions.forEach((t) => {
            if (t.amount >= 0) return;
            const d = t.date ? new Date(t.date) : new Date();
            const day = d.getDate();
            const wIndex = Math.min(Math.floor((day - 1) / 7), 3);
            weeks[wIndex].spending += Math.abs(t.amount);
        });
        // If no expenses, show a gentle placeholder trend
        const hasData = weeks.some((w) => w.spending > 0);
        if (!hasData) {
            return [
                { week: 'W1', spending: 3200, full: 'Week 1' },
                { week: 'W2', spending: 4100, full: 'Week 2' },
                { week: 'W3', spending: 2800, full: 'Week 3' },
                { week: 'W4', spending: 3500, full: 'Week 4' },
            ];
        }
        return weeks;
    }, [transactions]);

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    variants={staggerItem}
                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
                    className="p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 transition-all"
                >
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Balance</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">
                        <AnimatedNumber value={total} prefix="₹" />
                    </p>
                </motion.div>
                <motion.div
                    variants={staggerItem}
                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(76,175,80,0.15)' }}
                    className="p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 transition-all"
                >
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Income</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-success">
                        <AnimatedNumber value={income} prefix="+₹" />
                    </p>
                </motion.div>
                <motion.div
                    variants={staggerItem}
                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(244,67,54,0.15)' }}
                    className="p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 transition-all"
                >
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Expenses</h3>
                    <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-danger">
                        <AnimatedNumber value={expense} prefix="-₹" />
                    </p>
                </motion.div>
            </motion.div>

            {/* Spending this month - trend line */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800"
            >
                <h2 className="text-lg font-bold mb-4">Spending this month</h2>
                <div className="h-52 sm:h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={spendingTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                            <XAxis dataKey="week" tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-500" />
                            <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} className="text-gray-500" tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000) + 'k' : v}`} />
                            <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Spent']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <Area type="monotone" dataKey="spending" stroke="#ef4444" strokeWidth={2} fill="url(#spendGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Weekly spending trend. Add more transactions to see your pattern.</p>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800"
            >
                <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
                {transactions.length > 0 ? (
                    <motion.ul
                        className="divide-y divide-gray-200 dark:divide-gray-700"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {transactions.slice(0, 5).map((transaction, index) => (
                            <motion.li
                                key={transaction.id}
                                variants={staggerItem}
                                whileHover={{ x: 4, backgroundColor: 'rgba(0,0,0,0.02)' }}
                                className="py-2 sm:py-3 flex justify-between items-center rounded-lg px-1 sm:px-2 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-sm sm:text-base">{transaction.text}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">{transaction.date}</p>
                                </div>
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 + index * 0.1 }}
                                    className={`font-bold text-sm sm:text-base ${transaction.amount < 0 ? 'text-danger' : 'text-success'}`}
                                >
                                    {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount)}
                                </motion.span>
                            </motion.li>
                        ))}
                    </motion.ul>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="text-gray-500 dark:text-gray-400 text-center py-8"
                    >
                        No transactions yet
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
