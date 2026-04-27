import type { MMKV } from 'react-native-mmkv';
import { createMMKV } from 'react-native-mmkv';

// ─── MMKV Instance (lazy singleton) ─────────────────────
let _storage: MMKV | null = null;

function getStorage(): MMKV {
    if (!_storage) {
        _storage = createMMKV({ id: 'budgettracko-local-db' });
    }
    return _storage;
}

/** Expose for any direct-access consumers */
export { getStorage };

// ─── Types ───────────────────────────────────────────────
export type SyncAction = 'create' | 'update' | 'delete';
export type EntityType = 'transaction' | 'budget' | 'category' | 'account';

export interface SyncQueueItem {
    id: string;
    action: SyncAction;
    entityType: EntityType;
    data: any;
    clientUpdatedAt: string;
    createdAt: string;
}

// ─── Storage Keys ────────────────────────────────────────
const KEYS = {
    TRANSACTIONS: 'sync:transactions',
    BUDGETS: 'sync:budgets',
    CATEGORIES: 'sync:categories',
    ACCOUNTS: 'sync:accounts',
    SYNC_QUEUE: 'sync:queue',
    LAST_SYNC: 'sync:lastSyncTimestamp',
} as const;

// ─── Generic MMKV Helpers ────────────────────────────────
function getArray<T>(key: string): T[] {
    const raw = getStorage().getString(key);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as T[];
    } catch {
        return [];
    }
}

function setArray<T>(key: string, data: T[]): void {
    const json = JSON.stringify(data || []);
    console.log(`[localDB] Setting ${key} with ${data?.length || 0} items`);
    getStorage().set(key, json);
}

// ─── Transactions ────────────────────────────────────────
export function getTransactions(): any[] {
    return getArray(KEYS.TRANSACTIONS);
}

export function setTransactions(txs: any[]): void {
    setArray(KEYS.TRANSACTIONS, txs);
}

export function upsertTransaction(tx: any): void {
    const list = getTransactions();
    const id = tx._id || tx.id;
    const idx = list.findIndex((t: any) => (t._id || t.id) === id);
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...tx };
    } else {
        list.push(tx);
    }
    setTransactions(list);
}

export function removeTransaction(id: string): void {
    const list = getTransactions().filter((t: any) => (t._id || t.id) !== id);
    setTransactions(list);
}

// ─── Budgets ─────────────────────────────────────────────
export function getBudgets(): any[] {
    return getArray(KEYS.BUDGETS);
}

export function setBudgets(budgets: any[]): void {
    setArray(KEYS.BUDGETS, budgets);
}

export function upsertBudget(budget: any): void {
    const list = getBudgets();
    const id = budget._id || budget.id;
    const idx = list.findIndex((b: any) => (b._id || b.id) === id);
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...budget };
    } else {
        list.push(budget);
    }
    setBudgets(list);
}

export function removeBudget(id: string): void {
    const list = getBudgets().filter((b: any) => (b._id || b.id) !== id);
    setBudgets(list);
}

// ─── Categories ──────────────────────────────────────────
export function getCategories(): any[] {
    return getArray(KEYS.CATEGORIES);
}

export function setCategories(cats: any[]): void {
    setArray(KEYS.CATEGORIES, cats);
}

export function upsertCategory(cat: any): void {
    const list = getCategories();
    const id = cat._id || cat.id;
    const idx = list.findIndex((c: any) => (c._id || c.id) === id);
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...cat };
    } else {
        list.push(cat);
    }
    setCategories(list);
}

export function removeCategory(id: string): void {
    const list = getCategories().filter((c: any) => (c._id || c.id) !== id);
    setCategories(list);
}

// ─── Accounts ────────────────────────────────────────────
export function getAccounts(): any[] {
    return getArray(KEYS.ACCOUNTS);
}

export function setAccounts(accounts: any[]): void {
    setArray(KEYS.ACCOUNTS, accounts);
}

// ─── Sync Queue ──────────────────────────────────────────
export function getSyncQueue(): SyncQueueItem[] {
    return getArray<SyncQueueItem>(KEYS.SYNC_QUEUE);
}

export function addToSyncQueue(item: Omit<SyncQueueItem, 'createdAt'>): void {
    const queue = getSyncQueue();
    // Deduplicate: if same entity + action exists, replace with latest
    const existingIdx = queue.findIndex(
        q => q.entityType === item.entityType && q.id === item.id && q.action === item.action
    );

    const entry: SyncQueueItem = {
        ...item,
        createdAt: new Date().toISOString(),
    };

    if (existingIdx >= 0) {
        queue[existingIdx] = entry;
    } else {
        // If creating then deleting the same item, just remove both
        if (item.action === 'delete') {
            const createIdx = queue.findIndex(
                q => q.entityType === item.entityType && q.id === item.id && q.action === 'create'
            );
            if (createIdx >= 0) {
                queue.splice(createIdx, 1);
                setArray(KEYS.SYNC_QUEUE, queue);
                return;
            }
        }
        queue.push(entry);
    }
    setArray(KEYS.SYNC_QUEUE, queue);
}

export function clearSyncQueue(): void {
    getStorage().set(KEYS.SYNC_QUEUE, '[]');
}

export function getSyncQueueCount(): number {
    return getSyncQueue().length;
}

// ─── Last Sync Timestamp ─────────────────────────────────
export function getLastSync(): string | null {
    return getStorage().getString(KEYS.LAST_SYNC) || null;
}

export function setLastSync(timestamp: string): void {
    getStorage().set(KEYS.LAST_SYNC, timestamp);
}

// ─── Clear All (Logout) ─────────────────────────────────
export function clearAll(): void {
    const s = getStorage();
    s.remove(KEYS.TRANSACTIONS);
    s.remove(KEYS.BUDGETS);
    s.remove(KEYS.CATEGORIES);
    s.remove(KEYS.ACCOUNTS);
    s.remove(KEYS.SYNC_QUEUE);
    s.remove(KEYS.LAST_SYNC);
}

