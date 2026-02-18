import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsEnvelopeFill, BsReplyFill, BsCheckCircleFill, BsArrowLeft, BsArrowRight, BsXLg } from 'react-icons/bs';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

const AdminContacts = () => {
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [replyModal, setReplyModal] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 15 };
            if (statusFilter) params.status = statusFilter;
            const res = await adminApi.getContactRequests(params);
            setRequests(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            console.error('Failed to fetch contact requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [statusFilter]);

    const handleMarkAsRead = async (id) => {
        try {
            await adminApi.markAsRead(id);
            fetchRequests(pagination.page);
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleReply = async () => {
        if (!replyContent.trim()) {
            toast.error('Reply content is required');
            return;
        }
        setReplying(true);
        try {
            await adminApi.replyToContact(replyModal._id, replyContent);
            toast.success('Reply sent successfully');
            setReplyModal(null);
            setReplyContent('');
            fetchRequests(pagination.page);
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setReplying(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'unread':
                return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case 'read':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
            case 'replied':
                return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const filters = [
        { label: 'All', value: '' },
        { label: 'Unread', value: 'unread' },
        { label: 'Read', value: 'read' },
        { label: 'Replied', value: 'replied' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <BsEnvelopeFill size={24} /> Contact Requests
                </h1>
                <p className="text-sm font-bold text-light-text-secondary dark:text-dark-text-secondary mt-1">
                    {pagination.total} total messages
                </p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2"
            >
                {filters.map((f) => (
                    <motion.button
                        key={f.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStatusFilter(f.value)}
                        className={`text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg border-2 transition-colors ${statusFilter === f.value
                                ? 'bg-brand-black text-brand-yellow border-brand-black dark:bg-brand-yellow dark:text-brand-black dark:border-brand-yellow'
                                : 'bg-white text-brand-black border-gray-300 dark:bg-dark-card dark:text-dark-text dark:border-gray-700 hover:border-brand-black'
                            }`}
                    >
                        {f.label}
                    </motion.button>
                ))}
            </motion.div>

            {/* Requests List */}
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
                ) : requests.length === 0 ? (
                    <div className="neo-card p-12 text-center">
                        <BsEnvelopeFill size={40} className="mx-auto mb-3 text-light-text-secondary dark:text-dark-text-secondary" />
                        <p className="font-bold text-light-text-secondary dark:text-dark-text-secondary">No contact requests found</p>
                    </div>
                ) : (
                    requests.map((req) => (
                        <motion.div
                            key={req._id}
                            whileHover={{ x: 3 }}
                            className={`neo-card p-5 ${req.status === 'unread' ? 'border-l-4 border-l-red-500' : ''}`}
                            onClick={() => req.status === 'unread' && handleMarkAsRead(req._id)}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-black">{req.name}</p>
                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-2 font-semibold">{req.email}</p>
                                    <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">{req.message}</p>

                                    {req.status === 'replied' && req.replyContent && (
                                        <div className="mt-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                                            <p className="text-[10px] font-black uppercase tracking-wider text-green-600 dark:text-green-400 mb-1 flex items-center gap-1">
                                                <BsCheckCircleFill size={10} /> Reply sent
                                            </p>
                                            <p className="text-xs text-green-800 dark:text-green-300">{req.replyContent}</p>
                                            {req.repliedAt && (
                                                <p className="text-[10px] text-green-600/70 dark:text-green-500/70 mt-1">
                                                    {new Date(req.repliedAt).toLocaleString('en-IN')}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-[10px] font-bold text-light-text-secondary dark:text-dark-text-secondary">
                                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                    {req.status !== 'replied' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setReplyModal(req);
                                            }}
                                            className="neo-btn neo-btn-primary text-[10px] py-1.5 px-3"
                                        >
                                            <BsReplyFill size={12} /> Reply
                                        </motion.button>
                                    )}
                                </div>
                            </div>
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
                        onClick={() => fetchRequests(pagination.page - 1)}
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
                        onClick={() => fetchRequests(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="neo-btn neo-btn-dark disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Next <BsArrowRight size={14} />
                    </motion.button>
                </div>
            )}

            {/* Reply Modal */}
            <AnimatePresence>
                {replyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                        onClick={() => setReplyModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-dark-card border-3 border-brand-black dark:border-gray-700 rounded-2xl neo-shadow-lg p-6 w-full max-w-lg"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black uppercase tracking-tighter">Reply to {replyModal.name}</h3>
                                <button onClick={() => setReplyModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <BsXLg size={16} />
                                </button>
                            </div>

                            <div className="bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-xl p-3 mb-4">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-light-text-secondary dark:text-dark-text-secondary mb-1">Original Message</p>
                                <p className="text-sm">{replyModal.message}</p>
                            </div>

                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Type your reply..."
                                rows={5}
                                className="neo-input resize-none mb-4"
                            />

                            <div className="flex gap-3 justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setReplyModal(null)}
                                    className="neo-btn border-gray-300 dark:border-gray-600"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleReply}
                                    disabled={replying}
                                    className="neo-btn neo-btn-primary disabled:opacity-70"
                                >
                                    {replying ? 'Sending...' : 'Send Reply'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminContacts;
