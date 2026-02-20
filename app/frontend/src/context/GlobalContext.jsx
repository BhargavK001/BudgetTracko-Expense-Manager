import { createContext, useReducer, useEffect, useContext } from 'react';
import { transactionApi, accountApi, categoryApi, budgetApi, recurringApi } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { demoData } from '../data/demoData';

// Initial State
const initialState = {
    transactions: [],
    accounts: [],
    categories: [],
    budgets: [],
    loading: true,
    error: null,
    recurringBills: [],
};

// Create Context
export const GlobalContext = createContext(initialState);

// Reducer
const AppReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload !== undefined ? action.payload : true };
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
        // ─── Recurring Bills ───
        case 'GET_RECURRING_BILLS':
            return { ...state, recurringBills: action.payload };
        case 'ADD_RECURRING_BILL':
            return { ...state, recurringBills: [...state.recurringBills, action.payload] };
        case 'UPDATE_RECURRING_BILL':
            return {
                ...state,
                recurringBills: state.recurringBills.map(b =>
                    b._id === action.payload._id ? action.payload : b
                ),
            };
        case 'DELETE_RECURRING_BILL':
            return { ...state, recurringBills: state.recurringBills.filter(b => b._id !== action.payload) };
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
        if (user?.isDemo) {
            dispatch({ type: 'GET_TRANSACTIONS', payload: demoData.transactions });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }
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
        if (user?.isDemo) {
            const data = formData instanceof FormData ? Object.fromEntries(formData) : formData;

            // Populate accounts for UI
            let populatedData = { ...data };
            if (data.accountId) {
                const account = state.accounts.find(a => a._id === data.accountId);
                if (account) populatedData.accountId = account;
            }
            if (data.type === 'transfer') {
                if (data.fromAccountId) {
                    const fromAcc = state.accounts.find(a => a._id === data.fromAccountId);
                    if (fromAcc) populatedData.fromAccountId = fromAcc;
                }
                if (data.toAccountId) {
                    const toAcc = state.accounts.find(a => a._id === data.toAccountId);
                    if (toAcc) populatedData.toAccountId = toAcc;
                }
            }

            const newTx = {
                ...populatedData,
                _id: Math.random().toString(36).substr(2, 9),
                date: data.date || new Date().toISOString()
            };
            dispatch({ type: 'ADD_TRANSACTION', payload: newTx });
            toast.success('Transaction added (Demo)');
            return newTx;
        }
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
        if (user?.isDemo) {
            dispatch({ type: 'DELETE_TRANSACTION', payload: id });
            toast.success('Transaction deleted (Demo)');
            return;
        }
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
        if (user?.isDemo) {
            const data = formData instanceof FormData ? Object.fromEntries(formData) : formData;
            // Populate accounts for UI
            let populatedData = { ...data };
            if (data.accountId) {
                const account = state.accounts.find(a => a._id === data.accountId);
                if (account) populatedData.accountId = account;
            }
            if (data.type === 'transfer') {
                if (data.fromAccountId) {
                    const fromAcc = state.accounts.find(a => a._id === data.fromAccountId);
                    if (fromAcc) populatedData.fromAccountId = fromAcc;
                }
                if (data.toAccountId) {
                    const toAcc = state.accounts.find(a => a._id === data.toAccountId);
                    if (toAcc) populatedData.toAccountId = toAcc;
                }
            }

            const updatedTx = { ...populatedData, _id: id };
            dispatch({ type: 'UPDATE_TRANSACTION', payload: updatedTx });
            toast.success('Transaction updated (Demo)');
            return updatedTx;
        }
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
        if (user?.isDemo) {
            dispatch({ type: 'GET_ACCOUNTS', payload: demoData.accounts });
            return;
        }
        try {
            const res = await accountApi.getAll();
            dispatch({ type: 'GET_ACCOUNTS', payload: res.data.data });
        } catch (err) {
            // Silently fail — UI will show empty state
        }
    }

    async function addAccount(data) {
        if (user?.isDemo) {
            const newAcc = { ...data, _id: Math.random().toString(36).substr(2, 9) };
            dispatch({ type: 'ADD_ACCOUNT', payload: newAcc });
            toast.success('Account created (Demo)');
            return newAcc;
        }
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
        if (user?.isDemo) {
            const updatedAcc = { ...data, _id: id };
            dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAcc });
            toast.success('Account updated (Demo)');
            return updatedAcc;
        }
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
        if (user?.isDemo) {
            dispatch({ type: 'DELETE_ACCOUNT', payload: id });
            toast.success('Account deleted (Demo)');
            return;
        }
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
        if (user?.isDemo) {
            dispatch({ type: 'GET_CATEGORIES', payload: demoData.categories });
            return;
        }
        try {
            const res = await categoryApi.getAll();
            dispatch({ type: 'GET_CATEGORIES', payload: res.data });
        } catch (err) {
            // Silently fail — UI will show empty state
        }
    }

    async function addCategory(data) {
        if (user?.isDemo) {
            const newCat = { ...data, _id: Math.random().toString(36).substr(2, 9) };
            dispatch({ type: 'ADD_CATEGORY', payload: newCat });
            toast.success('Category created (Demo)');
            return newCat;
        }
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
        if (user?.isDemo) {
            const updatedCat = { ...data, _id: id };
            dispatch({ type: 'UPDATE_CATEGORY', payload: updatedCat });
            toast.success('Category updated (Demo)');
            return updatedCat;
        }
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
        if (user?.isDemo) {
            dispatch({ type: 'DELETE_CATEGORY', payload: id });
            toast.success('Category deleted (Demo)');
            return;
        }
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
        if (user?.isDemo) {
            dispatch({ type: 'GET_BUDGETS', payload: demoData.budgets });
            return;
        }
        try {
            const res = await budgetApi.getAll();
            dispatch({ type: 'GET_BUDGETS', payload: res.data });
        } catch (err) {
            // Silently fail — UI will show empty state
        }
    }

    async function addBudget(data) {
        if (user?.isDemo) {
            const newBud = { ...data, _id: Math.random().toString(36).substr(2, 9) };
            dispatch({ type: 'ADD_BUDGET', payload: newBud });
            toast.success('Budget created (Demo)');
            return newBud;
        }
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
        if (user?.isDemo) {
            const updatedBud = { ...data, _id: id };
            dispatch({ type: 'UPDATE_BUDGET', payload: updatedBud });
            toast.success('Budget updated (Demo)');
            return updatedBud;
        }
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
        if (user?.isDemo) {
            dispatch({ type: 'DELETE_BUDGET', payload: id });
            toast.success('Budget deleted (Demo)');
            return;
        }
        try {
            await budgetApi.delete(id);
            dispatch({ type: 'DELETE_BUDGET', payload: id });
            toast.success('Budget deleted');
        } catch (err) {
            toast.error('Failed to delete budget');
        }
    }

    // ─── Recurring Bill Actions ───
    async function getRecurringBills() {
        if (user?.isDemo) {
            dispatch({ type: 'GET_RECURRING_BILLS', payload: demoData.recurringBills || [] });
            return;
        }
        try {
            const res = await recurringApi.getAll();
            dispatch({ type: 'GET_RECURRING_BILLS', payload: res.data.data });
        } catch (err) {
            // Silently fail UI will show empty list
        }
    }

    async function addRecurringBill(data) {
        if (user?.isDemo) {
            const newBill = { ...data, _id: Math.random().toString(36).substr(2, 9) };
            dispatch({ type: 'ADD_RECURRING_BILL', payload: newBill });
            toast.success('Bill created (Demo)');
            return newBill;
        }
        try {
            const res = await recurringApi.create(data);
            dispatch({ type: 'ADD_RECURRING_BILL', payload: res.data.data });
            toast.success('Bill added');
            return res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.error?.[0] || 'Failed to add bill');
        }
    }

    async function updateRecurringBill(id, data) {
        if (user?.isDemo) {
            const updatedBill = { ...data, _id: id };
            dispatch({ type: 'UPDATE_RECURRING_BILL', payload: updatedBill });
            toast.success('Bill updated (Demo)');
            return updatedBill;
        }
        try {
            const res = await recurringApi.update(id, data);
            dispatch({ type: 'UPDATE_RECURRING_BILL', payload: res.data.data });
            toast.success('Bill updated');
            return res.data.data;
        } catch (err) {
            toast.error(err.response?.data?.error?.[0] || 'Failed to update bill');
        }
    }

    async function deleteRecurringBill(id) {
        if (user?.isDemo) {
            dispatch({ type: 'DELETE_RECURRING_BILL', payload: id });
            toast.success('Bill deleted (Demo)');
            return;
        }
        try {
            await recurringApi.delete(id);
            dispatch({ type: 'DELETE_RECURRING_BILL', payload: id });
            toast.success('Bill deleted');
        } catch (err) {
            toast.error('Failed to delete bill');
        }
    }

    // Load data when user is authenticated
    // Load data when user is authenticated
    useEffect(() => {
        if (user?.isDemo) {
            dispatch({ type: 'GET_TRANSACTIONS', payload: demoData.transactions });
            dispatch({ type: 'GET_ACCOUNTS', payload: demoData.accounts });
            dispatch({ type: 'GET_CATEGORIES', payload: demoData.categories });
            dispatch({ type: 'GET_BUDGETS', payload: demoData.budgets });
            dispatch({ type: 'GET_RECURRING_BILLS', payload: demoData.recurringBills || [] });
            dispatch({ type: 'SET_LOADING', payload: false });
        } else if (user) {
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
                deleteBudget,
                recurringBills: state.recurringBills,
                getRecurringBills,
                addRecurringBill,
                updateRecurringBill,
                deleteRecurringBill
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
