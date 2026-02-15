import { createContext, useReducer, useEffect, useContext } from 'react';
import { transactionApi, accountApi, categoryApi, budgetApi } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Initial State
const initialState = {
    transactions: [],
    accounts: [],
    categories: [],
    budgets: [],
    loading: true,
    error: null,
};

// Create Context
export const GlobalContext = createContext(initialState);

// Reducer
const AppReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: true };
        case 'GET_TRANSACTIONS':
            return { ...state, loading: false, transactions: action.payload };
        case 'ADD_TRANSACTION':
            return { ...state, transactions: [action.payload, ...state.transactions] };
        case 'DELETE_TRANSACTION':
            return { ...state, transactions: state.transactions.filter(t => t._id !== action.payload) };
        case 'UPDATE_TRANSACTION':
            return {
                ...state,
                transactions: state.transactions.map(t =>
                    t._id === action.payload._id ? action.payload : t
                ),
            };
        case 'GET_ACCOUNTS':
            return { ...state, accounts: action.payload };
        case 'ADD_ACCOUNT':
            return { ...state, accounts: [action.payload, ...state.accounts] };
        case 'UPDATE_ACCOUNT':
            return {
                ...state,
                accounts: state.accounts.map(a =>
                    a._id === action.payload._id ? action.payload : a
                ),
            };
        case 'DELETE_ACCOUNT':
            return { ...state, accounts: state.accounts.filter(a => a._id !== action.payload) };
        // ─── Categories ───
        case 'GET_CATEGORIES':
            return { ...state, categories: action.payload };
        case 'ADD_CATEGORY':
            return { ...state, categories: [...state.categories, action.payload] };
        case 'UPDATE_CATEGORY':
            return {
                ...state,
                categories: state.categories.map(c =>
                    c._id === action.payload._id ? action.payload : c
                ),
            };
        case 'DELETE_CATEGORY':
            return { ...state, categories: state.categories.filter(c => c._id !== action.payload) };
        // ─── Budgets ───
        case 'GET_BUDGETS':
            return { ...state, budgets: action.payload };
        case 'ADD_BUDGET':
            return { ...state, budgets: [...state.budgets, action.payload] };
        case 'UPDATE_BUDGET':
            return {
                ...state,
                budgets: state.budgets.map(b =>
                    b._id === action.payload._id ? action.payload : b
                ),
            };
        case 'DELETE_BUDGET':
            return { ...state, budgets: state.budgets.filter(b => b._id !== action.payload) };
        case 'ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

// Provider Component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);
    const { user } = useAuth();

    // ─── Transaction Actions ───
    async function getTransactions() {
        try {
            dispatch({ type: 'SET_LOADING' });
            const res = await transactionApi.getAll();
            dispatch({ type: 'GET_TRANSACTIONS', payload: res.data.data });
        } catch (err) {
            toast.error('Failed to load transactions');
            dispatch({ type: 'ERROR', payload: 'Error fetching transactions' });
        }
    }

    async function addTransaction(formData) {
        try {
            const res = await transactionApi.create(formData);
            dispatch({ type: 'ADD_TRANSACTION', payload: res.data.data });
            getAccounts();
            getBudgets(); // Refresh budget spending
            toast.success('Transaction added successfully');
            return res.data.data;
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add transaction';
            toast.error(msg);
            dispatch({ type: 'ERROR', payload: msg });
        }
    }

    async function deleteTransaction(id) {
        try {
            await transactionApi.delete(id);
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
            getAccounts();
            getBudgets();
            toast.success('Transaction deleted');
        } catch (err) {
            toast.error('Failed to delete transaction');
            dispatch({ type: 'ERROR', payload: 'Error deleting transaction' });
        }
    }

    async function updateTransaction(id, formData) {
        try {
            const res = await transactionApi.update(id, formData);
            dispatch({ type: 'UPDATE_TRANSACTION', payload: res.data.data });
            getAccounts();
            getBudgets();
            toast.success('Transaction updated successfully');
            return res.data.data;
        } catch (err) {
            toast.error('Failed to update transaction');
            dispatch({ type: 'ERROR', payload: 'Error updating transaction' });
        }
    }

    // ─── Account Actions ───
    async function getAccounts() {
        try {
            const res = await accountApi.getAll();
            dispatch({ type: 'GET_ACCOUNTS', payload: res.data.data });
        } catch (err) {
            // Silently fail — UI will show empty state
        }
    }

    async function addAccount(data) {
        try {
            const res = await accountApi.create(data);
            dispatch({ type: 'ADD_ACCOUNT', payload: res.data.data });
            toast.success('Account created successfully');
            return res.data.data;
        } catch (err) {
            toast.error('Failed to create account');
        }
    }

    async function updateAccount(id, data) {
        try {
            const res = await accountApi.update(id, data);
            dispatch({ type: 'UPDATE_ACCOUNT', payload: res.data.data });
            toast.success('Account updated');
            return res.data.data;
        } catch (err) {
            toast.error('Failed to update account');
        }
    }

    async function deleteAccount(id) {
        try {
            await accountApi.delete(id);
            dispatch({ type: 'DELETE_ACCOUNT', payload: id });
            toast.success('Account deleted');
        } catch (err) {
            toast.error('Failed to delete account');
        }
    }

    async function getAccountTransactions(accountId) {
        try {
            const res = await transactionApi.getByAccount(accountId);
            return res.data.data;
        } catch (err) {
            toast.error('Failed to load account history');
            return [];
        }
    }

    // ─── Category Actions ───
    async function getCategories() {
        try {
            const res = await categoryApi.getAll();
            dispatch({ type: 'GET_CATEGORIES', payload: res.data });
        } catch (err) {
            // Silently fail — UI will show empty state
        }
    }

    async function addCategory(data) {
        try {
            const res = await categoryApi.create(data);
            dispatch({ type: 'ADD_CATEGORY', payload: res.data });
            toast.success('Category created');
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to create category';
            toast.error(msg);
        }
    }

    async function updateCategory(id, data) {
        try {
            const res = await categoryApi.update(id, data);
            dispatch({ type: 'UPDATE_CATEGORY', payload: res.data });
            toast.success('Category updated');
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to update category';
            toast.error(msg);
        }
    }

    async function deleteCategory(id) {
        try {
            await categoryApi.delete(id);
            dispatch({ type: 'DELETE_CATEGORY', payload: id });
            toast.success('Category deleted');
        } catch (err) {
            toast.error('Failed to delete category');
        }
    }

    // ─── Budget Actions ───
    async function getBudgets() {
        try {
            const res = await budgetApi.getAll();
            dispatch({ type: 'GET_BUDGETS', payload: res.data });
        } catch (err) {
            // Silently fail — UI will show empty state
        }
    }

    async function addBudget(data) {
        try {
            const res = await budgetApi.create(data);
            dispatch({ type: 'ADD_BUDGET', payload: res.data });
            toast.success('Budget created');
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to create budget';
            toast.error(msg);
        }
    }

    async function updateBudget(id, data) {
        try {
            const res = await budgetApi.update(id, data);
            dispatch({ type: 'UPDATE_BUDGET', payload: res.data });
            toast.success('Budget updated');
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to update budget';
            toast.error(msg);
        }
    }

    async function deleteBudget(id) {
        try {
            await budgetApi.delete(id);
            dispatch({ type: 'DELETE_BUDGET', payload: id });
            toast.success('Budget deleted');
        } catch (err) {
            toast.error('Failed to delete budget');
        }
    }

    // Load data when user is authenticated
    useEffect(() => {
        if (user) {
            getTransactions();
            getAccounts();
            getCategories();
            getBudgets();
        } else {
            dispatch({ type: 'GET_TRANSACTIONS', payload: [] });
            dispatch({ type: 'GET_ACCOUNTS', payload: [] });
            dispatch({ type: 'GET_CATEGORIES', payload: [] });
            dispatch({ type: 'GET_BUDGETS', payload: [] });
        }
    }, [user]);

    return (
        <GlobalContext.Provider
            value={{
                transactions: state.transactions,
                accounts: state.accounts,
                categories: state.categories,
                budgets: state.budgets,
                error: state.error,
                loading: state.loading,
                getTransactions,
                addTransaction,
                deleteTransaction,
                updateTransaction,
                getAccounts,
                addAccount,
                updateAccount,
                deleteAccount,
                getAccountTransactions,
                getCategories,
                addCategory,
                updateCategory,
                deleteCategory,
                getBudgets,
                addBudget,
                updateBudget,
                deleteBudget
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
