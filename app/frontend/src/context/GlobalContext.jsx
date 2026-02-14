import { createContext, useReducer, useEffect, useContext } from 'react';
import { transactionApi, accountApi } from '../services/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Initial State
const initialState = {
    transactions: [],
    accounts: [],
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
        case 'ERROR':
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

// Provider Component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);
    const { token } = useAuth();

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
            // Refresh accounts to get updated balances
            getAccounts();
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
            getAccounts(); // Refresh balances
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
            getAccounts(); // Refresh balances
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
            // Silently fail for accounts — not critical on first load
            console.error('Failed to load accounts:', err);
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

    // Load data when token is available
    useEffect(() => {
        if (token) {
            getTransactions();
            getAccounts();
        } else {
            dispatch({ type: 'GET_TRANSACTIONS', payload: [] });
            dispatch({ type: 'GET_ACCOUNTS', payload: [] });
        }
    }, [token]);

    return (
        <GlobalContext.Provider
            value={{
                transactions: state.transactions,
                accounts: state.accounts,
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
                getAccountTransactions
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
