import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BsPeopleFill, BsSearch, BsArrowLeft, BsArrowRight, BsGoogle, BsGithub, BsPersonFill } from 'react-icons/bs';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const fetchUsers = async (page = 1, searchQuery = search) => {
        setLoading(true);
        try {
            const res = await adminApi.getUsers({ page, limit: 15, search: searchQuery });
            setUsers(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (value) => {
        setSearch(value);
        if (searchTimeout) clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(() => fetchUsers(1, value), 400));
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'deactivated' : 'active';
        try {
            await adminApi.updateUserStatus(userId, newStatus);
            toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
            fetchUsers(pagination.page);
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'google': return <BsGoogle size={14} className="text-red-500" />;
            case 'github': return <BsGithub size={14} />;
            default: return <BsPersonFill size={14} className="text-blue-500" />;
        }
    };

    const getMethodLabel = (method) => {
        switch (method) {
            case 'google': return 'Google';
            case 'github': return 'GitHub';
            default: return 'Email';
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
                        <BsPeopleFill size={24} /> User Management
                    </h1>
                    <p className="text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        {pagination.total} registered users
                    </p>
                </div>
            </motion.div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative"
            >
                <BsSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary" size={16} />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search users by name or email..."
                    className="neo-input pl-11 pr-4 py-3"
                />
            </motion.div>

            {/* Users List */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-4 border-brand-black dark:border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="neo-card p-12 text-center">
                        <BsPeopleFill size={40} className="mx-auto mb-3 text-light-text-secondary dark:text-dark-text-secondary" />
                        <p className="font-bold text-light-text-secondary dark:text-dark-text-secondary">No users found</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <motion.div
                            key={user._id}
                            whileHover={{ x: 3 }}
                            className="neo-card p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                        >
                            {/* Avatar */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-full border-2 border-brand-black bg-brand-yellow text-brand-black flex items-center justify-center font-black text-sm flex-shrink-0">
                                    {user.displayName?.charAt(0) || '?'}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-black truncate">{user.displayName}</p>
                                    <p className="text-[11px] text-light-text-secondary dark:text-dark-text-secondary truncate">{user.email}</p>
                                </div>
                            </div>

                            {/* Info badges */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Registration Method */}
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-light-bg dark:bg-dark-bg px-2.5 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700">
                                    {getMethodIcon(user.registrationMethod)}
                                    {getMethodLabel(user.registrationMethod)}
                                </span>

                                {/* Plan */}
                                <span className="text-[10px] font-black uppercase tracking-wider bg-brand-yellow text-brand-black px-2.5 py-1.5 rounded-lg border border-brand-black">
                                    {user.subscription?.plan || 'free'}
                                </span>

                                {/* Status */}
                                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg border ${user.accountStatus === 'active'
                                        ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                        : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                    }`}>
                                    {user.accountStatus || 'active'}
                                </span>

                                {/* Join date */}
                                <span className="text-[10px] font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                    Joined {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                            </div>

                            {/* Action */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToggleStatus(user._id, user.accountStatus || 'active')}
                                className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg border-2 transition-colors flex-shrink-0 ${(user.accountStatus || 'active') === 'active'
                                        ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                        : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                                    }`}
                            >
                                {(user.accountStatus || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                            </motion.button>
                        </motion.div>
                    ))
                )}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => fetchUsers(pagination.page - 1)}
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
                        onClick={() => fetchUsers(pagination.page + 1)}
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

export default AdminUsers;
