import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as localDB from '@/services/localDB';

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
    dayOfWeek?: number;
    time?: string;
    account: string;
    updatedAt?: string;
}

export interface Budget {
    id: string;
    _id?: string;
    category: string;
    amount: number;
    period: 'weekly' | 'monthly' | 'yearly';
    updatedAt?: string;
}

export interface CategoryItem {
    _id: string;
    name: string;
    type: 'expense' | 'income' | 'both';
    icon?: string;
    color?: string;
    userId: string;
    updatedAt?: string;
}

// ─── Context Shape ───────────────────────────────────────
export interface CategoryMeta {
    icon: string;
    color: string;
    isLucide: boolean;
}

interface TransactionContextType {
    transactions: Transaction[];
    transactionsByMonth: Record<string, Transaction[]>;
    budgets: Budget[];
    isLoading: boolean;
    // Transactions
    addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string, year: number) => Promise<void>;
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
    getCategoryMeta: (categoryName: string) => CategoryMeta;
    // Analytics
    getTotalIncome: (month?: number, year?: number) => number;
    getTotalExpense: (month?: number, year?: number) => number;
    getBalance: () => number;
    getTransactionsForMonth: (month: number, year: number) => Transaction[];
    getTransactionsByYear: (year: number) => Transaction[];
    getTransactionsForRange: (start: Date, end: Date) => Transaction[];
    getCategoryBreakdown: (month: number, year: number) => { name: string; amount: number; color: string; icon: string; isLucide: boolean }[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// ─── Normalizer ──────────────────────────────────────────
export function mapCategoryIcon(iconName: string): string {
    if (!iconName) return 'ellipsis-horizontal-circle-outline';
    if (!iconName.startsWith('Bs')) return iconName;

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
    const d = new Date(tx.date || Date.now());
    return {
        id: tx._id || tx.id || '',
        _id: tx._id,
        title: tx.text || tx.title || '',
        amount: Math.abs(tx.amount || 0),
        type: tx.type || 'expense',
        category: tx.category || 'Other',
        date: tx.date || d.toISOString(),
        month: d.getMonth(),
        year: d.getFullYear(),
        day: d.getDate(),
        dayOfWeek: d.getDay(),
        account: tx.account || '',
        updatedAt: tx.updatedAt,
    };
}

// ─── Generate a local ID ────────────────────────────────
function generateLocalId(): string {
    return 'local_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// ─── Provider ────────────────────────────────────────────
export function TransactionProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionsByMonth, setTransactionsByMonth] = useState<Record<string, Transaction[]>>({});
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ── Load from local DB (synchronous MMKV reads) ─────
    const refreshTransactions = useCallback(async () => {
        try {
            // Priority 1: Refresh category states and metadata maps
            // This prevents "Ghost Categories" where icons are missing after a sync
            const catRaw = localDB.getCategories();
            const catList = Array.isArray(catRaw) ? catRaw : [];
            setCategories(catList);

            // Priority 2: Load and normalize partitioning-aware transactions
            const raw = localDB.getTransactions();
            const list = (Array.isArray(raw) ? raw : []).map(normalizeTransaction);
            
            // Priority 3: Build indices for fast month-switching
            const index: Record<string, Transaction[]> = {};
            list.forEach(t => {
                const key = `${t.year}-${t.month}`;
                if (!index[key]) index[key] = [];
                index[key].push(t);
            });

            setTransactionsByMonth(index);
            setTransactions(list);
        } catch (e) {
            console.log('Failed to load local transactions:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshBudgets = useCallback(async () => {
        try {
            const data = localDB.getBudgets();
            const fetchedBudgets = Array.isArray(data) ? data : [];
            setBudgets(fetchedBudgets.map((b: any) => ({
                id: b._id || b.id,
                _id: b._id,
                category: b.category,
                amount: Math.abs(b.amount || 0),
                period: b.period || 'monthly',
                updatedAt: b.updatedAt,
            })));
        } catch (e) {
            console.log('Failed to load local budgets:', e);
        }
    }, []);

    const refreshCategories = useCallback(async () => {
        try {
            const raw = localDB.getCategories();
            const list = Array.isArray(raw) ? raw : [];
            setCategories(list);
        } catch (e) {
            console.log('Failed to load local categories:', e);
        }
    }, []);

    useEffect(() => {
        // Immediate load on mount ensures data is visible while auth is initializing
        refreshTransactions();
        refreshCategories();
        refreshBudgets();
    }, [refreshTransactions, refreshCategories, refreshBudgets]);

    useEffect(() => {
        // Re-refresh when auth definitely completes (to sync etc)
        if (isAuthenticated) {
            refreshTransactions();
            refreshCategories();
            refreshBudgets();
        }
    }, [isAuthenticated, refreshTransactions, refreshCategories, refreshBudgets]);

    // ── Local-First CRUD: Transactions ──────────────────
    const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
        const localId = generateLocalId();
        const now = new Date().toISOString();
        const newTx = {
            ...tx,
            _id: localId,
            id: localId,
            updatedAt: now,
        };

        // Write to local DB
        localDB.upsertTransaction(newTx);

        // Add to sync queue
        localDB.addToSyncQueue({
            id: localId,
            action: 'create',
            entityType: 'transaction',
            data: newTx,
            clientUpdatedAt: now,
        });

        // Refresh in-memory state
        await refreshTransactions();
    }, [refreshTransactions]);

    const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
        const now = new Date().toISOString();
        
        // 1. Get original to handle year-partitioning if date changes (though usually we keep the same year in simple edits)
        const existing = transactions.find(t => t.id === id || t._id === id);
        if (!existing) return;

        const updatedTx = { ...existing, ...updates, updatedAt: now };

        // 2. Write to local DB
        localDB.upsertTransaction(updatedTx);

        // 3. Add to sync queue
        localDB.addToSyncQueue({
            id: id,
            action: 'update',
            entityType: 'transaction',
            data: updatedTx,
            clientUpdatedAt: now,
        });

        // 4. Refresh in-memory state
        await refreshTransactions();
    }, [transactions, refreshTransactions]);

    const deleteTransaction = useCallback(async (id: string, year: number) => {
        const now = new Date().toISOString();

        // Remove from local DB
        localDB.removeTransaction(id, year);

        // Add to sync queue
        localDB.addToSyncQueue({
            id,
            action: 'delete',
            entityType: 'transaction',
            data: { _id: id },
            clientUpdatedAt: now,
        });

        // Update in-memory state
        setTransactionsByMonth(prev => {
            const next = { ...prev };
            // We don't know the month here easily without searching, 
            // so we'll just refresh or filter the whole year if we want to be precise.
            // But for now, we'll iterate the months of that year in the index.
            for (let m = 0; m < 12; m++) {
                const key = `${year}-${m}`;
                if (next[key]) {
                    next[key] = next[key].filter(t => t.id !== id && t._id !== id);
                }
            }
            return next;
        });
        setTransactions(prev => prev.filter(t => t.id !== id && t._id !== id));
    }, []);

    // ── Local-First CRUD: Budgets ───────────────────────
    const addBudget = useCallback(async (b: Omit<Budget, 'id' | '_id'>) => {
        const localId = generateLocalId();
        const now = new Date().toISOString();
        const newBudget = { ...b, _id: localId, id: localId, updatedAt: now };

        localDB.upsertBudget(newBudget);
        localDB.addToSyncQueue({
            id: localId,
            action: 'create',
            entityType: 'budget',
            data: newBudget,
            clientUpdatedAt: now,
        });

        await refreshBudgets();
    }, [refreshBudgets]);

    const updateBudget = useCallback(async (id: string, b: Omit<Budget, 'id' | '_id'>) => {
        const now = new Date().toISOString();
        const updatedBudget = { ...b, _id: id, id, updatedAt: now };

        localDB.upsertBudget(updatedBudget);
        localDB.addToSyncQueue({
            id,
            action: 'update',
            entityType: 'budget',
            data: updatedBudget,
            clientUpdatedAt: now,
        });

        await refreshBudgets();
    }, [refreshBudgets]);

    const deleteBudget = useCallback(async (id: string) => {
        const now = new Date().toISOString();

        localDB.removeBudget(id);
        localDB.addToSyncQueue({
            id,
            action: 'delete',
            entityType: 'budget',
            data: { _id: id },
            clientUpdatedAt: now,
        });

        setBudgets(prev => prev.filter(b => b.id !== id && b._id !== id));
    }, []);

    // ── Local-First CRUD: Categories ────────────────────
    const addCategory = useCallback(async (cat: Omit<CategoryItem, '_id' | 'userId'>) => {
        const localId = generateLocalId();
        const now = new Date().toISOString();
        const newCat = { ...cat, _id: localId, userId: '', updatedAt: now };

        localDB.upsertCategory(newCat);
        localDB.addToSyncQueue({
            id: localId,
            action: 'create',
            entityType: 'category',
            data: newCat,
            clientUpdatedAt: now,
        });

        await refreshCategories();
    }, [refreshCategories]);

    const updateCategory = useCallback(async (id: string, cat: Partial<CategoryItem>) => {
        const now = new Date().toISOString();
        const updatedCat = { ...cat, _id: id, updatedAt: now };

        localDB.upsertCategory(updatedCat);
        localDB.addToSyncQueue({
            id,
            action: 'update',
            entityType: 'category',
            data: updatedCat,
            clientUpdatedAt: now,
        });

        await refreshCategories();
    }, [refreshCategories]);

    const deleteCategory = useCallback(async (id: string) => {
        const now = new Date().toISOString();

        localDB.removeCategory(id);
        localDB.addToSyncQueue({
            id,
            action: 'delete',
            entityType: 'category',
            data: { _id: id },
            clientUpdatedAt: now,
        });

        await refreshCategories();
    }, [refreshCategories]);

    const getTotalBudget = useCallback((period: 'weekly' | 'monthly' | 'yearly') => {
        return budgets.filter(b => b.period === period).reduce((sum, b) => sum + (b.amount || 0), 0);
    }, [budgets]);

    const getTransactionsForMonth = useCallback(
        (month: number, year: number) => {
            const key = `${year}-${month}`;
            return transactionsByMonth[key] || [];
        },
        [transactionsByMonth]
    );

    const getTransactionsByYear = useCallback(
        (year: number) => {
            let result: Transaction[] = [];
            for (let m = 0; m < 12; m++) {
                const key = `${year}-${m}`;
                if (transactionsByMonth[key]) {
                    result = result.concat(transactionsByMonth[key]);
                }
            }
            return result;
        },
        [transactionsByMonth]
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

    // ── Resolve category icon + color from dynamic list first, then hardcoded ──
    const categoryMap = useMemo(() => {
        const map = new Map<string, CategoryMeta>();
        categories.forEach(c => {
            if (c.name) {
                const isLucide = /^[A-Z]/.test(c.icon || '');
                map.set(c.name, {
                    icon: c.icon || 'ellipsis-horizontal-circle-outline',
                    color: c.color || CATEGORY_COLORS[c.name] || '#795548',
                    isLucide
                });
            }
        });
        return map;
    }, [categories]);

    const getCategoryMeta = useCallback((categoryName: string): CategoryMeta => {
        const cached = categoryMap.get(categoryName);
        if (cached) return cached;

        return {
            icon: CATEGORY_ICONS[categoryName] || 'ellipsis-horizontal-circle-outline',
            color: CATEGORY_COLORS[categoryName] || '#795548',
            isLucide: false,
        };
    }, [categoryMap]);

    const getCategoryBreakdown = useCallback(
        (month: number, year: number) => {
            const monthly = getTransactionsForMonth(month, year).filter(t => t.type === 'expense');
            const map = new Map<string, number>();
            monthly.forEach(t => {
                const cat = t.category || 'Other';
                map.set(cat, (map.get(cat) || 0) + t.amount);
            });
            return Array.from(map.entries())
                .map(([name, amount]) => {
                    const meta = getCategoryMeta(name);
                    return {
                        name,
                        amount,
                        color: meta.color,
                        icon: meta.icon,
                        isLucide: meta.isLucide,
                    };
                })
                .sort((a, b) => b.amount - a.amount);
        },
        [getTransactionsForMonth, getCategoryMeta]
    );

    const getTransactionsForRange = useCallback((start: Date, end: Date) => {
        const result: Transaction[] = [];
        const startY = start.getFullYear();
        const endY = end.getFullYear();

        for (let y = startY; y <= endY; y++) {
            for (let m = 0; m < 12; m++) {
                const key = `${y}-${m}`;
                if (transactionsByMonth[key]) {
                    const mDate = new Date(y, m, 1);
                    const mEnd = new Date(y, m + 1, 0);
                    if (mEnd < start || mDate > end) continue;

                    if (mDate >= start && mEnd <= end) {
                        result.push(...transactionsByMonth[key]);
                    } else {
                        result.push(...transactionsByMonth[key].filter(t => {
                            const d = new Date(t.date);
                            return d >= start && d <= end;
                        }));
                    }
                }
            }
        }
        return result;
    }, [transactionsByMonth]);

    const contextValue = useMemo(() => ({
        transactions,
        transactionsByMonth,
        budgets,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,
        addBudget,
        updateBudget,
        deleteBudget,
        refreshBudgets,
        getCategoryMeta,
        getTransactionsForMonth,
        getTransactionsByYear,
        getTransactionsForRange,
        getCategoryBreakdown,
        getTotalIncome,
        getTotalExpense,
        getBalance,
        getTotalBudget,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories
    }), [
        transactions,
        transactionsByMonth,
        budgets,
        isLoading,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,
        addBudget,
        updateBudget,
        deleteBudget,
        refreshBudgets,
        getCategoryMeta,
        getTransactionsForMonth,
        getTransactionsByYear,
        getTransactionsForRange,
        getCategoryBreakdown,
        getTotalIncome,
        getTotalExpense,
        getBalance,
        getTotalBudget,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshCategories
    ]);

    return (
        <TransactionContext.Provider value={contextValue}>
            {children}
        </TransactionContext.Provider>
    );
}

export function useTransactions() {
    const ctx = useContext(TransactionContext);
    if (!ctx) throw new Error('useTransactions must be used within a TransactionProvider');
    return ctx;
}
