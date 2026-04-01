import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DebtType = 'lend' | 'borrow';
export type DebtStatus = 'active' | 'settled';

export interface Debt {
    id: string;
    personName: string;
    amount: number;
    type: DebtType;
    dueDate: string | null; // ISO Date string
    createdAt: string;      // ISO Date string
    notes?: string;
    accountId?: string;
    status: DebtStatus;
}

interface DebtContextData {
    debts: Debt[];
    loading: boolean;
    getDebtsByType: (type: DebtType | 'all') => Debt[];
    addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    markAsSettled: (id: string) => Promise<void>;
}

const DebtContext = createContext<DebtContextData>({} as DebtContextData);

export const DebtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);

    const loadDebts = async () => {
        try {
            const data = await AsyncStorage.getItem('@budgettracko_debts');
            if (data) {
                setDebts(JSON.parse(data));
            }
        } catch (error) {
            console.error('Failed to load debts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDebts();
    }, []);

    const saveDebts = async (newDebts: Debt[]) => {
        try {
            await AsyncStorage.setItem('@budgettracko_debts', JSON.stringify(newDebts));
            setDebts(newDebts);
        } catch (error) {
            console.error('Failed to save debts', error);
        }
    };

    const addDebt = async (debtData: Omit<Debt, 'id' | 'createdAt' | 'status'>) => {
        const newDebt: Debt = {
            ...debtData,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            status: 'active',
        };
        const updatedDebts = [...debts, newDebt];
        await saveDebts(updatedDebts);
    };

    const updateDebt = async (id: string, updates: Partial<Debt>) => {
        const updatedDebts = debts.map(d => d.id === id ? { ...d, ...updates } : d);
        await saveDebts(updatedDebts);
    };

    const deleteDebt = async (id: string) => {
        const updatedDebts = debts.filter(d => d.id !== id);
        await saveDebts(updatedDebts);
    };

    const markAsSettled = async (id: string) => {
        await updateDebt(id, { status: 'settled' });
    };

    const getDebtsByType = (type: DebtType | 'all') => {
        if (type === 'all') return debts;
        return debts.filter(d => d.type === type);
    };

    return (
        <DebtContext.Provider value={{
            debts,
            loading,
            getDebtsByType,
            addDebt,
            updateDebt,
            deleteDebt,
            markAsSettled
        }}>
            {children}
        </DebtContext.Provider>
    );
};

export const useDebts = () => useContext(DebtContext);
