import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSync } from '@/context/SyncContext';
import { useTransactions } from '@/context/TransactionContext';

/**
 * Bridge component that triggers full sync on login and refreshes
 * local contexts after sync completes.
 * Must be rendered inside AuthProvider, SyncProvider, and TransactionProvider.
 */
export default function SyncOnLogin() {
    const { isAuthenticated } = useAuth();
    const { triggerFullSync } = useSync();
    const { refreshTransactions, refreshBudgets, refreshCategories } = useTransactions();
    const hasInitialSynced = useRef(false);

    useEffect(() => {
        if (isAuthenticated && !hasInitialSynced.current) {
            hasInitialSynced.current = true;
            console.log('[SyncOnLogin] User authenticated, triggering initial sync...');

            (async () => {
                const success = await triggerFullSync();
                console.log(`[SyncOnLogin] Full sync ${success ? 'succeeded' : 'failed'}`);
                if (success) {
                    // Refresh in-memory state from local DB after sync
                    console.log('[SyncOnLogin] Refreshing local contexts...');
                    await Promise.all([
                        refreshTransactions(),
                        refreshBudgets(),
                        refreshCategories(),
                    ]);
                }
            })();
        }

        if (!isAuthenticated) {
            hasInitialSynced.current = false;
        }
    }, [isAuthenticated, triggerFullSync, refreshTransactions, refreshBudgets, refreshCategories]);

    return null;
}
