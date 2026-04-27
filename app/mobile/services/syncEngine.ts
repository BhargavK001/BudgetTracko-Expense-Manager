import api from './api';
import * as localDB from './localDB';

// ─── Types ───────────────────────────────────────────────
interface PullResponse {
    success: boolean;
    data: {
        transactions: any[];
        budgets: any[];
        categories: any[];
        accounts: any[];
        deletions: { entityType: string; entityId: string; deletedAt: string }[];
    };
    serverTime: string;
}

interface PushResponse {
    success: boolean;
    applied: number;
    conflicts: { entityType: string; entityId: string; serverVersion: any }[];
}

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

// ─── Full Sync (on login) ────────────────────────────────
export async function performFullSync(): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('[syncEngine] Starting full sync...');
        const response = await api.get<PullResponse>('/api/sync/pull');
        const { data, serverTime } = response.data;

        if (!response.data.success) {
            console.error('[syncEngine] Server returned success:false');
            return { success: false, error: 'Server returned unsuccessful response' };
        }

        console.log(`[syncEngine] Received data: ${data.transactions?.length || 0} txs, ${data.accounts?.length || 0} accounts`);

        // Store all data locally
        localDB.setTransactions(data.transactions || []);
        localDB.setBudgets(data.budgets || []);
        localDB.setCategories(data.categories || []);
        localDB.setAccounts(data.accounts || []);

        // Clear any pending queue since we just got fresh data
        localDB.clearSyncQueue();

        // Save the sync timestamp
        localDB.setLastSync(serverTime);

        return { success: true };
    } catch (error: any) {
        console.error('[syncEngine] Full sync failed:', error.message, error.response?.data);
        return { success: false, error: error.message };
    }
}

// ─── Push Local Changes ──────────────────────────────────
export async function pushLocalChanges(): Promise<{ success: boolean; conflicts?: any[] }> {
    const queue = localDB.getSyncQueue();

    if (queue.length === 0) {
        return { success: true, conflicts: [] };
    }

    try {
        const changes = queue.map(item => ({
            action: item.action,
            entityType: item.entityType,
            data: item.data,
            clientUpdatedAt: item.clientUpdatedAt,
        }));

        const response = await api.post<PushResponse>('/api/sync/push', { changes });

        if (response.data.success) {
            // Clear the queue on success
            localDB.clearSyncQueue();

            // Apply server-wins conflicts to local DB
            if (response.data.conflicts && response.data.conflicts.length > 0) {
                applyConflictResolutions(response.data.conflicts);
            }

            return { success: true, conflicts: response.data.conflicts };
        }

        return { success: false };
    } catch (error: any) {
        console.error('Push changes failed:', error.message);
        return { success: false };
    }
}

// ─── Pull Remote Changes (Delta) ─────────────────────────
export async function pullRemoteChanges(): Promise<{ success: boolean; error?: string }> {
    try {
        const lastSync = localDB.getLastSync();
        const params = lastSync ? `?since=${encodeURIComponent(lastSync)}` : '';

        const response = await api.get<PullResponse>(`/api/sync/pull${params}`);
        const { data, serverTime } = response.data;

        if (!response.data.success) {
            return { success: false, error: 'Server returned unsuccessful response' };
        }

        // Merge transactions
        if (data.transactions.length > 0) {
            mergeEntities('transaction', data.transactions);
        }

        // Merge budgets
        if (data.budgets.length > 0) {
            mergeEntities('budget', data.budgets);
        }

        // Merge categories
        if (data.categories.length > 0) {
            mergeEntities('category', data.categories);
        }

        // Merge accounts
        if (data.accounts.length > 0) {
            mergeEntities('account', data.accounts);
        }

        // Apply deletions
        if (data.deletions.length > 0) {
            applyDeletions(data.deletions);
        }

        // Update sync timestamp
        localDB.setLastSync(serverTime);

        return { success: true };
    } catch (error: any) {
        console.error('Pull changes failed:', error.message);
        return { success: false, error: error.message };
    }
}

// ─── Delta Sync (push + pull) ────────────────────────────
export async function performDeltaSync(): Promise<{ success: boolean; error?: string }> {
    // Step 1: Push local changes
    const pushResult = await pushLocalChanges();
    if (!pushResult.success) {
        return { success: false, error: 'Push failed' };
    }

    // Step 2: Pull remote changes
    const pullResult = await pullRemoteChanges();
    return pullResult;
}

// ─── Merge Helpers ───────────────────────────────────────
function mergeEntities(entityType: string, serverEntities: any[]): void {
    const getLocal = () => {
        switch (entityType) {
            case 'transaction': return localDB.getTransactions();
            case 'budget': return localDB.getBudgets();
            case 'category': return localDB.getCategories();
            case 'account': return localDB.getAccounts();
            default: return [];
        }
    };

    const setLocal = (data: any[]) => {
        switch (entityType) {
            case 'transaction': localDB.setTransactions(data); break;
            case 'budget': localDB.setBudgets(data); break;
            case 'category': localDB.setCategories(data); break;
            case 'account': localDB.setAccounts(data); break;
        }
    };

    const localEntities = getLocal();
    const localMap = new Map<string, any>();
    localEntities.forEach(e => {
        const id = e._id || e.id;
        if (id) localMap.set(id.toString(), e);
    });

    // Merge: server version wins if newer (last-write-wins)
    for (const serverEntity of serverEntities) {
        const id = (serverEntity._id || serverEntity.id)?.toString();
        if (!id) continue;

        const localEntity = localMap.get(id);
        if (!localEntity) {
            // New from server
            localMap.set(id, serverEntity);
        } else {
            // Compare timestamps
            const serverTime = new Date(serverEntity.updatedAt || 0).getTime();
            const localTime = new Date(localEntity.updatedAt || 0).getTime();

            if (serverTime >= localTime) {
                localMap.set(id, serverEntity);
            }
        }
    }

    setLocal(Array.from(localMap.values()));
}

function applyDeletions(deletions: { entityType: string; entityId: string }[]): void {
    for (const del of deletions) {
        switch (del.entityType) {
            case 'transaction':
                localDB.removeTransaction(del.entityId);
                break;
            case 'budget':
                localDB.removeBudget(del.entityId);
                break;
            case 'category':
                localDB.removeCategory(del.entityId);
                break;
        }
    }
}

function applyConflictResolutions(conflicts: { entityType: string; entityId: string; serverVersion: any }[]): void {
    for (const conflict of conflicts) {
        switch (conflict.entityType) {
            case 'transaction':
                localDB.upsertTransaction(conflict.serverVersion);
                break;
            case 'budget':
                localDB.upsertBudget(conflict.serverVersion);
                break;
            case 'category':
                localDB.upsertCategory(conflict.serverVersion);
                break;
        }
    }
}
