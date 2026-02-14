
import { useGlobalContext } from '../context/GlobalContext';
import TransactionForm from '../components/TransactionForm';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const staggerContainer = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

const Transactions = () => {
    const { transactions, deleteTransaction } = useGlobalContext();
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-between items-center"
            >
                <h2 className="text-xl sm:text-2xl font-bold">Transactions</h2>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                >
                    {showForm ? 'Close Form' : 'Add New'}
                </motion.button>
            </motion.div>

            {/* Animated form expand/collapse */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 sm:p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 mb-4 sm:mb-6">
                            <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
                            <TransactionForm onClose={() => setShowForm(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
                {transactions.length > 0 ? (
                    <motion.ul
                        className="divide-y divide-gray-200 dark:divide-gray-700"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        <AnimatePresence>
                            {transactions.map(transaction => (
                                <motion.li
                                    key={transaction.id}
                                    variants={staggerItem}
                                    exit={{
                                        opacity: 0,
                                        x: 100,
                                        height: 0,
                                        transition: { duration: 0.3 },
                                    }}
                                    layout
                                    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)', x: 4 }}
                                    className="p-3 sm:p-4 flex justify-between items-center transition"
                                >
                                    <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                                        <motion.div
                                            initial={{ scaleY: 0 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className={`w-1.5 sm:w-2 h-10 sm:h-12 rounded-full ${transaction.amount < 0 ? 'bg-red-500' : 'bg-green-500'}`}
                                        />
                                        <div>
                                            <p className="font-semibold text-base sm:text-lg truncate">{transaction.text}</p>
                                            <p className="text-xs sm:text-sm text-gray-500">{transaction.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                                        <span className={`font-bold text-sm sm:text-lg ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount)}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.3, rotate: 10 }}
                                            whileTap={{ scale: 0.8 }}
                                            onClick={() => deleteTransaction(transaction.id)}
                                            className="text-red-400 hover:text-red-600 transition p-1 sm:p-2"
                                            title="Delete"
                                        >
                                            🗑️
                                        </motion.button>
                                    </div>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </motion.ul>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="p-8 text-center text-gray-500 dark:text-gray-400"
                    >
                        No transactions found. Add one to get started!
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default Transactions;
