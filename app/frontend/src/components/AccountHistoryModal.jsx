import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsX, BsArrowUpRight, BsArrowDownLeft, BsArrowLeftRight } from 'react-icons/bs';
import { format } from 'date-fns';
import { useGlobalContext } from '../context/GlobalContext';

const AccountHistoryModal = ({ account, onClose }) => {
    const modalRef = useRef(null);
    const { getAccountTransactions } = useGlobalContext();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            const data = await getAccountTransactions(account._id);
            setTransactions(data);
            setLoading(false);
        };
        fetchHistory();
    }, [account._id]);

    if (!account) return null;

    const typeIcon = {
        income: <BsArrowDownLeft className="text-green-500" />,
        expense: <BsArrowUpRight className="text-red-500" />,
        transfer: <BsArrowLeftRight className="text-blue-500" />
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                ref={modalRef}
                initial={{ scale: 0.95, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 40 }}
                className="w-full sm:max-w-lg bg-white dark:bg-dark-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border-2 border-brand-black dark:border-gray-700 max-h-[92vh] sm:max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className="p-4 sm:p-6 bg-gradient-to-r from-brand-black to-gray-900 text-white flex justify-between items-center shrink-0">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account History</p>
                        <h3 className="text-xl font-black">{account.name}</h3>
                        <p className="text-sm font-bold text-gray-400 mt-0.5">
                            Balance: <span className={`${account.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>₹{Number(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <BsX size={24} />
                    </button>
                </div>

                {/* Transaction List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400 font-bold text-sm">Loading...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-3 text-gray-300">📭</div>
                            <p className="font-bold text-gray-400">No transactions yet</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {transactions.map((t, i) => {
                                const isTransfer = t.type === 'transfer';
                                const isCredit = isTransfer
                                    ? t.toAccountId?._id === account._id || t.toAccountId === account._id
                                    : t.type === 'income';
                                const displayAmount = isTransfer
                                    ? (isCredit ? `+₹${Number(Math.abs(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `-₹${Number(Math.abs(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                                    : `${t.amount > 0 ? '+' : ''}₹${Number(Math.abs(t.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                const amountColor = isCredit ? 'text-green-500' : 'text-red-500';

                                return (
                                    <motion.div
                                        key={t._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                {typeIcon[t.type]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold truncate">{t.text}</p>
                                                <p className="text-[10px] font-semibold text-gray-400">
                                                    {format(new Date(t.date), 'MMM dd, yyyy')}
                                                    {t.time && ` · ${t.time}`}
                                                    {isTransfer && (
                                                        <span className="ml-1">
                                                            · {isCredit ? `From ${t.fromAccountId?.name || '?'}` : `To ${t.toAccountId?.name || '?'}`}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`font-black text-sm shrink-0 ml-2 ${amountColor}`}>
                                            {displayAmount}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AccountHistoryModal;
