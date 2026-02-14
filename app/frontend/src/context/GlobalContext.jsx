import { createContext, useReducer, useEffect, useContext } from 'react';
import { mockApi } from '../services/mockApi';
import { toast } from 'sonner';

// Initial State
const initialState = {
    transactions: [],
    loading: true,
    error: null,
};

// Create Context
export const GlobalContext = createContext(initialState);

// Reducer
const AppReducer = (state, action) => {
    switch (action.type) {
        case 'GET_TRANSACTIONS':
            return {
                ...state,
                loading: false,
                transactions: action.payload,
            };
        case 'ADD_TRANSACTION':
            return {
                ...state,
                transactions: [action.payload, ...state.transactions],
            };
        case 'DELETE_TRANSACTION':
            return {
                ...state,
                transactions: state.transactions.filter(
                    (transaction) => transaction.id !== action.payload
                ),
            };
        case 'UPDATE_TRANSACTION':
            return {
                ...state,
                transactions: state.transactions.map(
                    (transaction) => transaction.id === action.payload.id ? action.payload : transaction
                ),
            };
        case 'TRANSACTION_ERROR':
            return {
                ...state,
                error: action.payload,
                loading: false
            };
        default:
            return state;
    }
};

// Provider Component
export const GlobalProvider = ({ children }) => {
    const [state, dispatch] = useReducer(AppReducer, initialState);

    // Actions
    async function getTransactions() {
        try {
            const data = await mockApi.fetchTransactions();
            dispatch({
                type: 'GET_TRANSACTIONS',
                payload: data,
            });
        } catch (err) {
            toast.error('Failed to load transactions');
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: 'Error fetching transactions',
            });
        }
    }

    async function addTransaction(transaction) {
        try {
            const data = await mockApi.addTransaction(transaction);
            dispatch({
                type: 'ADD_TRANSACTION',
                payload: data,
            });
            toast.success('Transaction added successfully');
        } catch (err) {
            toast.error('Failed to add transaction');
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: 'Error adding transaction',
            });
        }
    }

    async function deleteTransaction(id) {
        try {
            await mockApi.deleteTransaction(id);
            dispatch({
                type: 'DELETE_TRANSACTION',
                payload: id,
            });
            toast.success('Transaction deleted');
        } catch (err) {
            toast.error('Failed to delete transaction');
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: 'Error deleting transaction',
            });
        }
    }

    async function updateTransaction(transaction) {
        try {
            const data = await mockApi.updateTransaction(transaction);
            dispatch({
                type: 'UPDATE_TRANSACTION',
                payload: data,
            });
            toast.success('Transaction updated successfully');
        } catch (err) {
            toast.error('Failed to update transaction');
            dispatch({
                type: 'TRANSACTION_ERROR',
                payload: 'Error updating transaction',
            });
        }
    }

    useEffect(() => {
        getTransactions();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                transactions: state.transactions,
                error: state.error,
                loading: state.loading,
                getTransactions,
                addTransaction,
                deleteTransaction,
                updateTransaction
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

export const useGlobalContext = () => {
    return useContext(GlobalContext);
};
