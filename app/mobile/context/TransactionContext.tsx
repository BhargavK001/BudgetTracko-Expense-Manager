import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import { useAuth } from './AuthContext';

// ─── Types ───────────────────────────────────────────────
export type TransactionType = 'income' | 'expense' | 'transfer';

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
    | 'Transfer'
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

export const CATEGORY_ICONS: Record<string, string> = {
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
    Transfer: 'swap-horizontal-outline',
    Other: 'ellipsis-horizontal-circle-outline',
};

export const CATEGORY_COLORS: Record<string, string> = {
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
    Transfer: '#007AFF',
    Other: '#795548',
};

export interface Transaction {
    id: string;
    _id?: string;
    title: string;
    text?: string;
    amount: number;
    type: TransactionType;
    category: Category | string;
    date: string;
    month: number;
    year: number;
    day: number;
    time?: string;
    account: string;
    accountId?: any;
    fromAccountId?: any;
    toAccountId?: any;
    note?: string;
    attachments?: any[];
}

export interface Budget {
    id: string;
    _id?: string;
    category: string;
    amount: number;
    period: 'weekly' | 'monthly' | 'yearly';
}

export interface CategoryItem {
    _id: string;
    name: string;
    type: 'expense' | 'income' | 'both';
    icon?: string;
    color?: string;
    userId: string;
}

// ─── Context Shape ───────────────────────────────────────
interface TransactionContextType {
    transactions: Transaction[];
    budgets: Budget[];
    isLoading: boolean;
    // Transactions
    addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    refreshTransactions: () => Promise<void>;
    // Budgets
    addBudget: (budget: Omit<Budget, 'id' | '_id'>) => Promise<void>;
    updateBudget: (id: string, budget: Omit<Budget, 'id' | '_id'>) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    refreshBudgets: () => Promise<void>;
    getTotalBudget: (period: 'weekly' | 'monthly' | 'yearly') => number;
    // Categories
    categories: CategoryItem[];
    refreshCategories: () => Promise<void>;
    addCategory: (cat: Omit<CategoryItem, '_id' | 'userId'>) => Promise<void>;
    updateCategory: (id: string, cat: Partial<CategoryItem>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    // Analytics
    getTotalIncome: (month?: number, year?: number) => number;
    getTotalExpense: (month?: number, year?: number) => number;
    getBalance: () => number;
    getTransactionsForMonth: (month: number, year: number) => Transaction[];
    getCategoryBreakdown: (month: number, year: number) => { name: string; amount: number; color: string; icon: string }[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// ─── Normalizer ──────────────────────────────────────────
export function mapCategoryIcon(iconName: string): string {
    if (!iconName) return 'ellipsis-horizontal-circle-outline';
    if (!iconName.startsWith('Bs')) return iconName;

    // Map common Bootstrap icons to Ionicons
    const mapping: Record<string, string> = {
        'BsHouse': 'home-outline',
        'BsShop': 'business-outline',
        'BsBox': 'cube-outline',
        'BsCart3': 'cart-outline',
        'BsBag': 'bag-outline',
        'BsLightningCharge': 'flash-outline',
        'BsHeart': 'heart-outline',
        'BsBook': 'book-outline',
        'BsFilm': 'film-outline',
        'BsCurrencyDollar': 'cash-outline',
        'BsCashCoin': 'cash-outline',
        'BsBusFront': 'bus-outline',
        'BsCarFront': 'car-outline',
        'BsAirplane': 'airplane-outline',
        'BsCupHot': 'cafe-outline',
        'BsController': 'game-controller-outline',
        'BsMusicNoteBeamed': 'musical-notes-outline',
        'BsGraphUpArrow': 'trending-up-outline',
        'BsShieldCheck': 'shield-checkmark-outline',
        'BsLaptop': 'laptop-outline',
        'BsPhone': 'phone-portrait-outline',
        'BsBicycle': 'bicycle-outline',
        'BsWrench': 'build-outline',
        'BsScissors': 'cut-outline',
        'BsPalette': 'color-palette-outline'
    };

    return mapping[iconName] || 'ellipsis-horizontal-circle-outline';
}

function normalizeTransaction(tx: any): Transaction {
    return {
        id: tx._id || tx.id || '',
        _id: tx._id,
        title: tx.text || tx.title || '',
        text: tx.text,
        amount: Math.abs(tx.amount || 0),
        type: tx.type || 'expense',
        category: tx.category || 'Other',
        date: tx.date || new Date().toISOString(),
        month: new Date(tx.date || Date.now()).getMonth(),
        year: new Date(tx.date || Date.now()).getFullYear(),
        day: new Date(tx.date || Date.now()).getDate(),
        time: tx.time,
        account: tx.accountId?.name || tx.account || '',
        accountId: tx.accountId,
        fromAccountId: tx.fromAccountId,
        toAccountId: tx.toAccountId,
        note: tx.note,
        attachments: tx.attachments,
    };
}

// ─── Provider ────────────────────────────────────────────
export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refreshTransactions = useCallback(async () => {
        try {
            const res = await api.get('/api/transactions');
            const raw = res.data;
            const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
            setTransactions(list.map(normalizeTransaction));
        } catch (e) {
            console.log('Failed to fetch transactions:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshBudgets = useCallback(async () => {
        try {
            const res = await api.get('/api/budgets');
            const data = res.data;
            const fetchedBudgets = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
            setBudgets(fetchedBudgets.map((b: any) => ({
                id: b._id || b.id,
                _id: b._id,
                category: b.category,
                amount: Math.abs(b.amount || 0),
                period: b.period || 'monthly'
            })));
        } catch (e) {
            console.log('Failed to fetch budgets:', e);
        }
    }, []);

    const refreshCategories = useCallback(async () => {
        try {
            const res = await api.get('/api/categories');
            const raw = res.data;
            const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
            setCategories(list);
        } catch (e) {
            console.log('Failed to fetch categories:', e);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            refreshTransactions();
            refreshCategories();
            refreshBudgets();
        } else {
            setTransactions([]);
            setCategories([]);
            setBudgets([]);
            setIsLoading(false);
        }
    }, [isAuthenticated, refreshTransactions, refreshCategories, refreshBudgets]);

    const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
        // The AddTransactionModal now handles the API call directly.
        // This is kept for backward compatibility with other screens.
        await refreshTransactions();
    }, [refreshTransactions]);

    const deleteTransaction = useCallback(async (id: string) => {
        try {
            await api.delete(`/api/transactions/${id}`);
            setTransactions(prev => prev.filter(t => t.id !== id && t._id !== id));
        } catch (e: any) {
            console.log('Failed to delete transaction:', e);
            throw e;
        }
    }, []);

    const addBudget = useCallback(async (b: Omit<Budget, 'id' | '_id'>) => {
        try {
            await api.post('/api/budgets', b);
            await refreshBudgets();
        } catch (e) {
            console.log('Failed to add budget:', e);
            throw e;
        }
    }, [refreshBudgets]);

    const updateBudget = useCallback(async (id: string, b: Omit<Budget, 'id' | '_id'>) => {
        try {
            await api.put(`/api/budgets/${id}`, b);
            await refreshBudgets();
        } catch (e) {
            console.log('Failed to update budget:', e);
            throw e;
        }
    }, [refreshBudgets]);

    const deleteBudget = useCallback(async (id: string) => {
        try {
            await api.delete(`/api/budgets/${id}`);
            setBudgets(prev => prev.filter(b => b.id !== id && b._id !== id));
        } catch (e) {
            console.log('Failed to delete budget:', e);
            throw e;
        }
    }, []);

    const addCategory = useCallback(async (cat: Omit<CategoryItem, '_id' | 'userId'>) => {
        try {
            await api.post('/api/categories', cat);
            await refreshCategories();
        } catch (e) {
            console.log('Failed to add category:', e);
            throw e;
        }
    }, [refreshCategories]);

    const updateCategory = useCallback(async (id: string, cat: Partial<CategoryItem>) => {
        try {
            await api.put(`/api/categories/${id}`, cat);
            await refreshCategories();
        } catch (e) {
            console.log('Failed to update category:', e);
            throw e;
        }
    }, [refreshCategories]);

    const deleteCategory = useCallback(async (id: string) => {
        try {
            await api.delete(`/api/categories/${id}`);
            await refreshCategories();
        } catch (e) {
            console.log('Failed to delete category:', e);
            throw e;
        }
    }, [refreshCategories]);

    const getTotalBudget = useCallback((period: 'weekly' | 'monthly' | 'yearly') => {
        return budgets.filter(b => b.period === period).reduce((sum, b) => sum + (b.amount || 0), 0);
    }, [budgets]);

    const getTransactionsForMonth = useCallback(
        (month: number, year: number) => {
            return transactions.filter(t => t.month === month && t.year === year);
        },
        [transactions]
    );

    const getTotalIncome = useCallback(
        (month?: number, year?: number) => {
            const list = month !== undefined && year !== undefined ? getTransactionsForMonth(month, year) : transactions;
            return list.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        },
        [transactions, getTransactionsForMonth]
    );

    const getTotalExpense = useCallback(
        (month?: number, year?: number) => {
            const list = month !== undefined && year !== undefined ? getTransactionsForMonth(month, year) : transactions;
            return list.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        },
        [transactions, getTransactionsForMonth]
    );

    const getBalance = useCallback(() => {
        return getTotalIncome() - getTotalExpense();
    }, [getTotalIncome, getTotalExpense]);

    const getCategoryBreakdown = useCallback(
        (month: number, year: number) => {
            const monthly = getTransactionsForMonth(month, year).filter(t => t.type === 'expense');
            const map = new Map<string, number>();
            monthly.forEach(t => {
                const cat = t.category || 'Other';
                map.set(cat, (map.get(cat) || 0) + t.amount);
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
                budgets,
                isLoading,
                addTransaction,
                deleteTransaction,
                refreshTransactions,
                addBudget,
                updateBudget,
                deleteBudget,
                refreshBudgets,
                getTotalBudget,
                categories,
                refreshCategories,
                addCategory,
                updateCategory,
                deleteCategory,
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
