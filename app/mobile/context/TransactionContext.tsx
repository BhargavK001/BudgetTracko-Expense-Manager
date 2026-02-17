import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ───────────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

export type Category =
    | 'Food and Dining'
    | 'Transport'
    | 'Shopping'
    | 'Entertainment'
    | 'Bills & Utilities'
    | 'Health'
    | 'Education'
    | 'Salary'
    | 'Freelance'
    | 'Investment'
    | 'Gift'
    | 'Other';

export const EXPENSE_CATEGORIES: Category[] = [
    'Food and Dining',
    'Transport',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Health',
    'Education',
    'Other',
];

export const INCOME_CATEGORIES: Category[] = [
    'Salary',
    'Freelance',
    'Investment',
    'Gift',
    'Other',
];

export const CATEGORY_ICONS: Record<Category, string> = {
    'Food and Dining': 'restaurant-outline',
    Transport: 'car-outline',
    Shopping: 'cart-outline',
    Entertainment: 'headset-outline',
    'Bills & Utilities': 'receipt-outline',
    Health: 'heart-outline',
    Education: 'school-outline',
    Salary: 'briefcase-outline',
    Freelance: 'laptop-outline',
    Investment: 'trending-up-outline',
    Gift: 'gift-outline',
    Other: 'ellipsis-horizontal-circle-outline',
};

export const CATEGORY_COLORS: Record<Category, string> = {
    'Food and Dining': '#FF9800',
    Transport: '#2196F3',
    Shopping: '#E91E63',
    Entertainment: '#4CAF50',
    'Bills & Utilities': '#9C27B0',
    Health: '#F44336',
    Education: '#00BCD4',
    Salary: '#4CAF50',
    Freelance: '#7C4DFF',
    Investment: '#FF5722',
    Gift: '#FFD700',
    Other: '#795548',
};

export interface Transaction {
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    category: Category;
    date: string; // ISO string
    account: string; // e.g. 'Cash', 'Bank Account', 'Slice'
}

// ─── Context Shape ───────────────────────────────────────
interface TransactionContextType {
    transactions: Transaction[];
    isLoading: boolean;
    addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    getTotalIncome: (month?: number, year?: number) => number;
    getTotalExpense: (month?: number, year?: number) => number;
    getBalance: () => number;
    getTransactionsForMonth: (month: number, year: number) => Transaction[];
    getCategoryBreakdown: (month: number, year: number) => { name: Category; amount: number; color: string; icon: string }[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const STORAGE_KEY = '@budgettracko_transactions';

// ─── Provider ────────────────────────────────────────────
export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from AsyncStorage on mount
    useEffect(() => {
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    setTransactions(JSON.parse(raw));
                }
            } catch (e) {
                console.error('Failed to load transactions', e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // Persist helper
    const persist = async (txs: Transaction[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
        } catch (e) {
            console.error('Failed to persist transactions', e);
        }
    };

    const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
        const newTx: Transaction = {
            ...tx,
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        };
        setTransactions((prev) => {
            const updated = [newTx, ...prev];
            persist(updated);
            return updated;
        });
    }, []);

    const deleteTransaction = useCallback(async (id: string) => {
        setTransactions((prev) => {
            const updated = prev.filter((t) => t.id !== id);
            persist(updated);
            return updated;
        });
    }, []);

    const getTransactionsForMonth = useCallback(
        (month: number, year: number) => {
            return transactions.filter((t) => {
                const d = new Date(t.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });
        },
        [transactions]
    );

    const getTotalIncome = useCallback(
        (month?: number, year?: number) => {
            const list = month !== undefined && year !== undefined ? getTransactionsForMonth(month, year) : transactions;
            return list.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        },
        [transactions, getTransactionsForMonth]
    );

    const getTotalExpense = useCallback(
        (month?: number, year?: number) => {
            const list = month !== undefined && year !== undefined ? getTransactionsForMonth(month, year) : transactions;
            return list.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        },
        [transactions, getTransactionsForMonth]
    );

    const getBalance = useCallback(() => {
        return getTotalIncome() - getTotalExpense();
    }, [getTotalIncome, getTotalExpense]);

    const getCategoryBreakdown = useCallback(
        (month: number, year: number) => {
            const monthly = getTransactionsForMonth(month, year).filter((t) => t.type === 'expense');
            const map = new Map<Category, number>();
            monthly.forEach((t) => {
                map.set(t.category, (map.get(t.category) || 0) + t.amount);
            });
            return Array.from(map.entries())
                .map(([name, amount]) => ({
                    name,
                    amount,
                    color: CATEGORY_COLORS[name] || '#795548',
                    icon: CATEGORY_ICONS[name] || 'ellipsis-horizontal-circle-outline',
                }))
                .sort((a, b) => b.amount - a.amount);
        },
        [getTransactionsForMonth]
    );

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                isLoading,
                addTransaction,
                deleteTransaction,
                getTotalIncome,
                getTotalExpense,
                getBalance,
                getTransactionsForMonth,
                getCategoryBreakdown,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────
export function useTransactions() {
    const ctx = useContext(TransactionContext);
    if (!ctx) throw new Error('useTransactions must be used within a TransactionProvider');
    return ctx;
}
