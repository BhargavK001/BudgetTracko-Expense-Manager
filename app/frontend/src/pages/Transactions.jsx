
import { useGlobalContext } from '../context/GlobalContext';
import TransactionForm from '../components/TransactionForm';
import { useState } from 'react';

const Transactions = () => {
    const { transactions, deleteTransaction } = useGlobalContext();
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Transactions</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    {showForm ? 'Close Form' : 'Add New'}
                </button>
            </div>

            {showForm && (
                <div className="p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Add New Transaction</h3>
                    <TransactionForm onClose={() => setShowForm(false)} />
                </div>
            )}

            <div className="bg-white dark:bg-dark-card rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                {transactions.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map(transaction => (
                            <li key={transaction.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${transaction.amount < 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <div>
                                        <p className="font-semibold text-lg">{transaction.text}</p>
                                        <p className="text-sm text-gray-500">{transaction.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`font-bold text-lg ${transaction.amount < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount)}
                                    </span>
                                    <button
                                        onClick={() => deleteTransaction(transaction.id)}
                                        className="text-red-400 hover:text-red-600 transition p-2"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found. Add one to get started!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
