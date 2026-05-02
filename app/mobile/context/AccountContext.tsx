import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import * as localDB from '@/services/localDB';

// ─── Types ───────────────────────────────────────────────
export interface Account {
  _id?: string;
  id?: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  creditLimit?: number;
  updatedAt?: string;
}

interface AccountContextType {
  accounts: Account[];
  isLoading: boolean;
  refreshAccounts: () => Promise<void>;
  addAccount: (acc: Account) => Promise<void>;
  updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────
export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAccounts = useCallback(async () => {
    try {
      const data = localDB.getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.log('Failed to load local accounts:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAccounts();
  }, [refreshAccounts]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAccounts();
    }
  }, [isAuthenticated, refreshAccounts]);

  const addAccount = useCallback(async (acc: Account) => {
    const localId = 'local_' + Date.now().toString(36);
    const now = new Date().toISOString();
    const newAcc = { ...acc, _id: localId, id: localId, updatedAt: now };

    localDB.upsertAccount(newAcc);
    localDB.addToSyncQueue({
      id: localId,
      action: 'create',
      entityType: 'account',
      data: newAcc,
      clientUpdatedAt: now,
    });

    await refreshAccounts();
  }, [refreshAccounts]);

  const updateAccount = useCallback(async (id: string, updates: Partial<Account>) => {
    const now = new Date().toISOString();
    const existing = accounts.find(a => a._id === id || a.id === id);
    if (!existing) return;

    const updatedAcc = { ...existing, ...updates, updatedAt: now };

    localDB.upsertAccount(updatedAcc);
    localDB.addToSyncQueue({
      id,
      action: 'update',
      entityType: 'account',
      data: updatedAcc,
      clientUpdatedAt: now,
    });

    await refreshAccounts();
  }, [accounts, refreshAccounts]);

  const deleteAccount = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    localDB.removeAccount(id);
    localDB.addToSyncQueue({
      id,
      action: 'delete',
      entityType: 'account',
      data: { _id: id },
      clientUpdatedAt: now,
    });

    setAccounts(prev => prev.filter(a => a._id !== id && a.id !== id));
  }, []);

  const contextValue = useMemo(() => ({
    accounts,
    isLoading,
    refreshAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  }), [
    accounts,
    isLoading,
    refreshAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  ]);

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccounts() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccounts must be used within an AccountProvider');
  return ctx;
}
