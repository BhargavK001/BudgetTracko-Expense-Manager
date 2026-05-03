import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as localDB from '@/services/localDB';
import { performDeltaSync } from '@/services/syncEngine';
import { useAccounts } from './AccountContext';

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
    updatedAt?: string;
    _id?: string; // MongoDB ID if synced
}

interface DebtContextData {
    debts: Debt[];
    loading: boolean;
    getDebtsByType: (type: DebtType | 'all') => Debt[];
    addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'status'>) => Promise<void>;
    updateDebt: (id: string, updates: Partial<Debt>) => Promise<void>;
    deleteDebt: (id: string) => Promise<void>;
    markAsSettled: (id: string) => Promise<void>;
    refreshDebts: () => void;
}

const DebtContext = createContext<DebtContextData>({} as DebtContextData);

export const DebtProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { accounts, updateAccount } = useAccounts();
    const [debts, setDebts] = useState<Debt[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshDebts = useCallback(() => {
        setDebts(localDB.getDebts());
    }, []);

    const initDebts = async () => {
        try {
            // 1. One-time legacy migration from AsyncStorage
            const legacyData = await AsyncStorage.getItem('@budgettracko_debts');
            if (legacyData) {
                const legacyDebts = JSON.parse(legacyData);
                if (legacyDebts.length > 0) {
                    console.log('Migrating legacy debts from AsyncStorage to MMKV');
                    legacyDebts.forEach((d: Debt) => {
                        localDB.upsertDebt(d);
                        localDB.addToSyncQueue({
                            id: d.id,
                            entityType: 'debt',
                            action: 'create',
                            data: d,
                            clientUpdatedAt: new Date().toISOString()
                        });
                    });
                    await AsyncStorage.removeItem('@budgettracko_debts');
                }
            }

            // 2. Load from MMKV
            refreshDebts();
            
            // 3. Background delta sync
            performDeltaSync().then(() => refreshDebts()).catch(() => {});
        } catch (error) {
            console.error('Failed to init debts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initDebts();
    }, []);

    const addDebt = async (debtData: Omit<Debt, 'id' | 'createdAt' | 'status'>) => {
        const id = Date.now().toString();
        const now = new Date().toISOString();
        const newDebt: Debt = {
            ...debtData,
            id,
            createdAt: now,
            updatedAt: now,
            status: 'active',
        };
        
        localDB.upsertDebt(newDebt);
        localDB.addToSyncQueue({
            id,
            entityType: 'debt',
            action: 'create',
            data: newDebt,
            clientUpdatedAt: now
        });

        // Update Account Balance
        if (newDebt.accountId && updateAccount) {
            const account = accounts.find(a => a.id === newDebt.accountId || a._id === newDebt.accountId);
            if (account) {
                // Lend money OUT of account (-), Borrow money INTO account (+)
                const newBalance = newDebt.type === 'lend' 
                    ? account.balance - newDebt.amount 
                    : account.balance + newDebt.amount;
                await updateAccount(account.id || account._id!, { balance: newBalance });
            }
        }

        refreshDebts();
        performDeltaSync().catch(() => {});
    };

    const updateDebt = async (id: string, updates: Partial<Debt>) => {
        const debt = debts.find(d => d.id === id || d._id === id);
        if (!debt) return;

        const now = new Date().toISOString();
        const updatedDebt = { ...debt, ...updates, updatedAt: now };
        
        localDB.upsertDebt(updatedDebt);
        localDB.addToSyncQueue({
            id: id,
            entityType: 'debt',
            action: 'update',
            data: updatedDebt,
            clientUpdatedAt: now
        });
        refreshDebts();
        performDeltaSync().catch(() => {});
    };

    const deleteDebt = async (id: string) => {
        const debt = debts.find(d => d.id === id || d._id === id);
        if (!debt) return;

        const year = new Date(debt.createdAt).getFullYear();
        localDB.removeDebt(id, year);
        localDB.addToSyncQueue({
            id,
            entityType: 'debt',
            action: 'delete',
            data: { id },
            clientUpdatedAt: new Date().toISOString()
        });
        refreshDebts();
        performDeltaSync().catch(() => {});
    };

    const markAsSettled = async (id: string) => {
        const debt = debts.find(d => d.id === id || d._id === id);
        if (!debt || debt.status === 'settled') return;
        
        // Revert balance on settle
        if (debt.accountId && updateAccount) {
            const account = accounts.find(a => a.id === debt.accountId || a._id === debt.accountId);
            if (account) {
                // Lend settled: money back INTO account (+). Borrow settled: pay money OUT of account (-).
                const newBalance = debt.type === 'lend' 
                    ? account.balance + debt.amount 
                    : account.balance - debt.amount;
                await updateAccount(account.id || account._id!, { balance: newBalance });
            }
        }

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
            markAsSettled,
            refreshDebts
        }}>
            {children}
        </DebtContext.Provider>
    );
};

export const useDebts = () => useContext(DebtContext);
