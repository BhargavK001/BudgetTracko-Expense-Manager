
const STORAGE_KEY = 'budget_tracko_transactions';

const getTransactions = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveTransactions = (transactions) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const mockApi = {
    fetchTransactions: async () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(getTransactions());
            }, 500); // Simulate network delay
        });
    },

    addTransaction: async (transaction) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = getTransactions();
                const newTransaction = { ...transaction, id: Date.now().toString() };
                transactions.unshift(newTransaction);
                saveTransactions(transactions);
                resolve(newTransaction);
            }, 500);
        });
    },

    deleteTransaction: async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = getTransactions();
                const filtered = transactions.filter(t => t.id !== id);
                saveTransactions(filtered);
                resolve(id);
            }, 500);
        });
    },

    updateTransaction: async (updatedTransaction) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const transactions = getTransactions();
                const index = transactions.findIndex(t => t.id === updatedTransaction.id);
                if (index !== -1) {
                    transactions[index] = updatedTransaction;
                    saveTransactions(transactions);
                    resolve(updatedTransaction);
                } else {
                    resolve(null); // Or reject
                }
            }, 500);
        });
    }
};
