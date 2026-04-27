import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import * as syncEngine from '@/services/syncEngine';
import * as localDB from '@/services/localDB';
import { useAuth } from './AuthContext';

// ─── Types ───────────────────────────────────────────────
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

interface SyncContextType {
    syncStatus: SyncStatus;
    lastSynced: Date | null;
    pendingChanges: number;
    triggerSync: () => Promise<void>;
    triggerFullSync: () => Promise<boolean>;
    isOnline: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────
export function SyncProvider({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [pendingChanges, setPendingChanges] = useState(0);

    const isSyncing = useRef(false);
    const syncDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Update pending count from localDB
    const refreshPendingCount = useCallback(() => {
        setPendingChanges(localDB.getSyncQueueCount());
    }, []);

    // ── Delta Sync ───────────────────────────────────────
    const triggerSync = useCallback(async () => {
        if (!isAuthenticated || isSyncing.current) return;

        isSyncing.current = true;
        setSyncStatus('syncing');

        try {
            const result = await syncEngine.performDeltaSync();
            if (result.success) {
                setSyncStatus('idle');
                const ts = localDB.getLastSync();
                setLastSynced(ts ? new Date(ts) : null);
            } else {
                setSyncStatus('error');
            }
        } catch {
            setSyncStatus('error');
        } finally {
            isSyncing.current = false;
            refreshPendingCount();
        }
    }, [isAuthenticated, refreshPendingCount]);

    // ── Full Sync (login) ────────────────────────────────
    const triggerFullSync = useCallback(async (): Promise<boolean> => {
        if (isSyncing.current) return false;

        isSyncing.current = true;
        setSyncStatus('syncing');

        try {
            const result = await syncEngine.performFullSync();
            if (result.success) {
                setSyncStatus('idle');
                const ts = localDB.getLastSync();
                setLastSynced(ts ? new Date(ts) : null);
                refreshPendingCount();
                return true;
            } else {
                setSyncStatus('error');
                return false;
            }
        } catch {
            setSyncStatus('error');
            return false;
        } finally {
            isSyncing.current = false;
        }
    }, [refreshPendingCount]);

    // ── Debounced sync trigger ───────────────────────────
    const debouncedSync = useCallback(() => {
        if (syncDebounceTimer.current) {
            clearTimeout(syncDebounceTimer.current);
        }
        syncDebounceTimer.current = setTimeout(() => {
            triggerSync();
        }, 2000);
    }, [triggerSync]);

    // ── Network status — auto-sync on reconnect ──────────
    const { isConnected, isInternetReachable } = useNetworkStatus(() => {
        if (isAuthenticated) {
            triggerSync();
        }
    });

    const isOnline = isConnected && isInternetReachable;

    // Update sync status based on connectivity
    useEffect(() => {
        if (!isOnline && syncStatus !== 'syncing') {
            setSyncStatus('offline');
        } else if (isOnline && syncStatus === 'offline') {
            setSyncStatus('idle');
        }
    }, [isOnline, syncStatus]);

    // ── App state — sync when app comes to foreground ────
    useEffect(() => {
        const handleAppState = (nextState: AppStateStatus) => {
            if (nextState === 'active' && isAuthenticated && isOnline) {
                debouncedSync();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppState);
        return () => subscription.remove();
    }, [isAuthenticated, isOnline, debouncedSync]);

    // ── Load last sync timestamp on mount ────────────────
    useEffect(() => {
        const ts = localDB.getLastSync();
        if (ts) setLastSynced(new Date(ts));
        refreshPendingCount();
    }, [refreshPendingCount]);

    // ── Cleanup ──────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (syncDebounceTimer.current) {
                clearTimeout(syncDebounceTimer.current);
            }
        };
    }, []);

    return (
        <SyncContext.Provider
            value={{
                syncStatus,
                lastSynced,
                pendingChanges,
                triggerSync,
                triggerFullSync,
                isOnline,
            }}
        >
            {children}
        </SyncContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────
export function useSync() {
    const ctx = useContext(SyncContext);
    if (!ctx) throw new Error('useSync must be used within a SyncProvider');
    return ctx;
}
