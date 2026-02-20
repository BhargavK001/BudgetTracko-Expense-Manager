import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BsPencilSquare, BsTrash, BsX, BsCalendar3, BsTag, BsWallet2,
    BsSticky, BsArrowUpRight, BsArrowDownLeft, BsArrowLeftRight,
    BsClock, BsPaperclip, BsImage
} from 'react-icons/bs';
import { format, parseISO } from 'date-fns';

const TransactionDetailModal = ({ transaction, onClose, onEdit, onDelete }) => {
    const modalRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!transaction) return null;

    const isExpense = transaction.type === 'expense';
    const isTransfer = transaction.type === 'transfer';
    const colorClass = isTransfer ? 'text-blue-500' : isExpense ? 'text-red-500' : 'text-green-500';
    const bgClass = isTransfer ? 'bg-blue-50 dark:bg-blue-900/10' : isExpense ? 'bg-red-50 dark:bg-red-900/10' : 'bg-green-50 dark:bg-green-900/10';
    const Icon = isTransfer ? BsArrowLeftRight : isExpense ? BsArrowUpRight : BsArrowDownLeft;
    const txId = transaction._id || transaction.id;

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
                className="w-full sm:max-w-md bg-white dark:bg-dark-card rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden border-2 border-brand-black dark:border-gray-700 max-h-[92vh] sm:max-h-[85vh] flex flex-col"
            >
                {/* Header */}
                <div className={`p-4 sm:p-6 ${bgClass} flex justify-between items-start shrink-0`}>
                    <div className="flex gap-3 sm:gap-4 min-w-0">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-xl flex items-center justify-center text-xl sm:text-2xl bg-white dark:bg-dark-bg shadow-sm ${colorClass}`}>
                            <Icon />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-wider opacity-60">
                                {isTransfer ? 'Transfer' : transaction.category}
                            </p>
                            <h3 className="text-lg sm:text-2xl font-black truncate">{transaction.text}</h3>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                        <BsX size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                    {/* Amount */}
                    <div className="text-center">
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                        <h2 className={`text-2xl sm:text-4xl font-black ${colorClass}`}>
                            {isTransfer ? '' : isExpense ? '-' : '+'}₹{Number(Math.abs(transaction.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                    </div>

                    {/* Transfer Details */}
                    {isTransfer && (
                        <div className="neo-card p-3 sm:p-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Transfer Details</p>
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-center flex-1">
                                    <p className="text-xs font-black text-red-500">From</p>
                                    <p className="text-sm font-bold mt-1">
                                        {transaction.fromAccountId?.name || 'Unknown'}
                                    </p>
                                </div>
                                <BsArrowLeftRight className="text-blue-500 shrink-0" size={20} />
                                <div className="text-center flex-1">
                                    <p className="text-xs font-black text-green-500">To</p>
                                    <p className="text-sm font-bold mt-1">
                                        {transaction.toAccountId?.name || 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Meta Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="neo-card p-3 flex items-center gap-3">
                            <BsCalendar3 className="text-gray-400" />
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Date</p>
                                <p className="text-sm font-bold">
                                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                        {transaction.time && (
                            <div className="neo-card p-3 flex items-center gap-3">
                                <BsClock className="text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Time</p>
                                    <p className="text-sm font-bold">{transaction.time}</p>
                                </div>
                            </div>
                        )}
                        {!isTransfer && (
                            <div className="neo-card p-3 flex items-center gap-3">
                                <BsWallet2 className="text-gray-400" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Payment</p>
                                    <p className="text-sm font-bold">
                                        {transaction.accountId?.name || transaction.paymentMode || 'Cash'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    {transaction.tags && transaction.tags.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <BsTag /> Tags
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {transaction.tags.map((tag, i) => (
                                    <span key={i} className="px-2.5 py-1 rounded-lg bg-brand-yellow/15 text-brand-black dark:text-brand-yellow border border-brand-yellow/30 text-xs font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Attachments */}
                    {transaction.attachments && transaction.attachments.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <BsPaperclip /> Attachments
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {transaction.attachments.map((att, i) => (
                                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                                        className="block rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-brand-primary transition-colors group">
                                        <img src={att.url} alt={att.name || 'Receipt'} className="w-full h-20 object-cover group-hover:scale-105 transition-transform" />
                                        <div className="p-1.5 bg-gray-50 dark:bg-gray-800">
                                            <p className="text-[9px] font-bold text-gray-500 truncate flex items-center gap-1">
                                                <BsImage size={8} /> {att.name || 'Receipt'}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {(transaction.note || transaction.notes) && (
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <BsSticky /> Notes
                            </p>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm italic border-l-4 border-gray-300 dark:border-gray-600">
                                "{transaction.note || transaction.notes}"
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-3 sm:p-4 border-t-2 border-gray-100 dark:border-gray-800 flex gap-2 sm:gap-3 shrink-0">
                    <button
                        onClick={() => { onEdit(transaction); onClose(); }}
                        className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-sm bg-brand-yellow text-brand-black border-2 border-brand-black hover:translate-y-[-2px] transition-transform neo-shadow-sm flex items-center justify-center gap-2"
                    >
                        <BsPencilSquare /> Edit
                    </button>
                    <button
                        onClick={() => { onDelete(txId); onClose(); }}
                        className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-sm bg-white dark:bg-dark-card text-red-500 border-2 border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors flex items-center justify-center gap-2"
                    >
                        <BsTrash /> Delete
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default TransactionDetailModal;
