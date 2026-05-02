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
        recurringBills: any[];
        debts: any[];
        deletions: { entityType: string; entityId: string; deletedAt: string; year?: number }[];
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
        // First, migrate any legacy queue items if they exist
        await localDB.unifyQueues();

        const response = await api.get<PullResponse>('/api/sync/pull');
        const { data, serverTime } = response.data;

        if (!response.data.success) {
            return { success: false, error: 'Server returned unsuccessful response' };
        }

        // Store all data locally using partitioning-aware methods
        // Batching ensures this remains fast even for 1,000+ items
        localDB.batchUpsertTransactions(data.transactions || []);
        localDB.setBudgets(data.budgets || []);
        localDB.setCategories(data.categories || []);
        localDB.setAccounts(data.accounts || []);
        localDB.setRecurringBills(data.recurringBills || []);
        localDB.setDebts(data.debts || []);

        // Clear any pending queue since we just got fresh data
        localDB.clearSyncQueue();

        // Save the sync timestamp
        localDB.setLastSync(serverTime);

        return { success: true };
    } catch (error: any) {
        if (error.response?.status !== 401) {
            console.error('Full sync failed:', error.message);
        }
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
        if (error.response?.status !== 401) {
            console.error('Push changes failed:', error.message);
        }
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
        if (data.accounts && data.accounts.length > 0) {
            mergeEntities('account', data.accounts);
        }

        // Merge recurring bills
        if (data.recurringBills && data.recurringBills.length > 0) {
            mergeEntities('recurring-bill', data.recurringBills);
        }

        // Merge debts
        if (data.debts && data.debts.length > 0) {
            mergeEntities('debt', data.debts);
        }

        // Apply deletions
        if (data.deletions.length > 0) {
            applyDeletions(data.deletions);
        }

        // Update sync timestamp
        localDB.setLastSync(serverTime);

        return { success: true };
    } catch (error: any) {
        if (error.response?.status !== 401) {
            console.error('Pull changes failed:', error.message);
        }
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
    if (entityType === 'transaction') {
        localDB.batchUpsertTransactions(serverEntities);
        return;
    }

    const getLocal = () => {
        switch (entityType) {
            case 'budget': return localDB.getBudgets();
            case 'category': return localDB.getCategories();
            case 'account': return localDB.getAccounts();
            case 'recurring-bill': return localDB.getRecurringBills();
            case 'debt': return localDB.getDebts();
            default: return [];
        }
    };

    const setLocal = (data: any[]) => {
        switch (entityType) {
            case 'budget': localDB.setBudgets(data); break;
            case 'category': localDB.setCategories(data); break;
            case 'account': localDB.setAccounts(data); break;
            case 'recurring-bill': localDB.setRecurringBills(data); break;
            case 'debt': localDB.setDebts(data); break;
        }
    };

    const localEntities = getLocal();
    const localMap = new Map<string, any>();
    localEntities.forEach(e => {
        const id = e._id || e.id;
        if (id) localMap.set(id.toString(), e);
    });

    for (const serverEntity of serverEntities) {
        const id = (serverEntity._id || serverEntity.id)?.toString();
        if (!id) continue;

        const localEntity = localMap.get(id);
        if (!localEntity) {
            localMap.set(id, serverEntity);
        } else {
            const serverTime = new Date(serverEntity.updatedAt || 0).getTime();
            const localTime = new Date(localEntity.updatedAt || 0).getTime();

            if (serverTime >= localTime) {
                localMap.set(id, serverEntity);
            }
        }
    }

    setLocal(Array.from(localMap.values()));
}

function applyDeletions(deletions: { entityType: string; entityId: string; year?: number }[]): void {
    for (const del of deletions) {
        switch (del.entityType) {
            case 'transaction':
                if (del.year) {
                    localDB.removeTransaction(del.entityId, del.year);
                } else {
                    localDB.getAvailableYears().forEach(y => {
                        localDB.removeTransaction(del.entityId, y);
                    });
                }
                break;
            case 'budget':
                localDB.removeBudget(del.entityId);
                break;
            case 'category':
                localDB.removeCategory(del.entityId);
                break;
            case 'recurring-bill':
                localDB.removeRecurringBill(del.entityId);
                break;
            case 'debt':
                localDB.removeDebt(del.entityId, del.year);
                break;
            case 'account':
                localDB.removeAccount(del.entityId);
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
            case 'recurring-bill':
                localDB.upsertRecurringBill(conflict.serverVersion);
                break;
            case 'debt':
                localDB.upsertDebt(conflict.serverVersion);
                break;
            case 'account':
                localDB.upsertAccount(conflict.serverVersion);
                break;
        }
    }
}
