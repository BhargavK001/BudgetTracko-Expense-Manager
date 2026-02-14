import { useGlobalContext } from '../context/GlobalContext';
import { useMemo } from 'react';

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

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Balance</h3>
                    <p className="text-3xl font-bold mt-2">₹{total}</p>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Income</h3>
                    <p className="text-3xl font-bold mt-2 text-success">+₹{income}</p>
                </div>
                <div className="p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Expenses</h3>
                    <p className="text-3xl font-bold mt-2 text-danger">-₹{expense}</p>
                </div>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-dark-card shadow-sm border border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
                {transactions.length > 0 ? (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.slice(0, 5).map(transaction => (
                            <li key={transaction.id} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{transaction.text}</p>
                                    <p className="text-sm text-gray-500">{transaction.date}</p>
                                </div>
                                <span className={`font-bold ${transaction.amount < 0 ? 'text-danger' : 'text-success'}`}>
                                    {transaction.amount < 0 ? '-' : '+'}₹{Math.abs(transaction.amount)}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No transactions yet
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
