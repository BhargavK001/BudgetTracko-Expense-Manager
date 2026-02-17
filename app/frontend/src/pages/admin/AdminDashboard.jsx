import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsPeopleFill, BsPersonCheckFill, BsCreditCard2FrontFill, BsCashCoin, BsPersonPlusFill, BsEnvelopeFill } from 'react-icons/bs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '../../services/adminApi';

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
    <motion.div
        variants={staggerItem}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="neo-card p-5"
    >
        <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 border-brand-black ${color}`}>
                <Icon size={20} />
            </div>
        </div>
        <p className="text-2xl sm:text-3xl font-black text-light-text dark:text-dark-text">{value}</p>
        <p className="text-xs font-bold text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mt-1">{label}</p>
        {subtext && <p className="text-[10px] font-semibold text-light-text-secondary dark:text-dark-text-secondary mt-1">{subtext}</p>}
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-dark-card border-2 border-brand-black dark:border-gray-700 p-3 rounded-xl neo-shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider mb-1">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm font-bold" style={{ color: entry.stroke || entry.fill }}>
                        {entry.name}: {entry.name === 'Revenue' ? `₹${entry.value}` : entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, analyticsRes] = await Promise.all([
                    adminApi.getDashboardStats(),
                    adminApi.getAnalyticsData()
                ]);
                setStats(statsRes.data.data);
                setAnalytics(analyticsRes.data.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-brand-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="font-bold text-sm text-light-text-secondary dark:text-dark-text-secondary">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const statCards = [
        { icon: BsPeopleFill, label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-brand-yellow text-brand-black' },
        { icon: BsPersonCheckFill, label: 'Active Users', value: stats?.activeUsers || 0, subtext: `${stats?.deactivatedUsers || 0} deactivated`, color: 'bg-green-400 text-brand-black' },
        { icon: BsCreditCard2FrontFill, label: 'Total Payments', value: stats?.totalPayments || 0, color: 'bg-blue-400 text-brand-black' },
        { icon: BsCashCoin, label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, color: 'bg-purple-400 text-brand-black' },
        { icon: BsPersonPlusFill, label: 'New Signups (7d)', value: stats?.recentSignups || 0, color: 'bg-orange-400 text-brand-black' },
        { icon: BsEnvelopeFill, label: 'Pending Contacts', value: stats?.pendingContacts || 0, color: 'bg-red-400 text-white' },
    ];

    // Format chart dates
    const chartData = analytics.map(item => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    }));

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Dashboard</h1>
                <p className="text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    Overview of your application metrics
                </p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                {statCards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </motion.div>

            {/* Registration Breakdown */}
            {stats?.registrationBreakdown && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="neo-card p-5"
                >
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4">Registration Methods</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.registrationBreakdown).map(([method, count]) => (
                            <div key={method} className="flex items-center gap-2 bg-light-bg dark:bg-dark-bg px-4 py-2 rounded-xl border-2 border-brand-black dark:border-gray-700">
                                <span className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">{method}</span>
                                <span className="text-base font-black">{count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Signups Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="neo-card p-5"
                >
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4">Signups (Last 30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} allowDecimals={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="signups" name="Signups" stroke="#1a1a1a" fill="#facc15" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Revenue Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="neo-card p-5"
                >
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4">Revenue (Last 30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fontWeight: 700 }} interval="preserveStartEnd" />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" fill="#a78bfa" strokeWidth={2} fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Subscription Breakdown */}
            {stats?.subscriptionBreakdown && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="neo-card p-5"
                >
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4">Subscription Plans</h3>
                    <div className="flex flex-wrap gap-3">
                        {Object.entries(stats.subscriptionBreakdown).map(([plan, count]) => (
                            <div key={plan} className="flex items-center gap-2 bg-light-bg dark:bg-dark-bg px-4 py-2 rounded-xl border-2 border-brand-black dark:border-gray-700">
                                <span className="text-xs font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary">{plan}</span>
                                <span className="text-base font-black">{count}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;
