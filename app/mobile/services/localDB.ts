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

/**
 * Generic KV Storage (for settings, auth, etc.)
 */
export const setItem = (key: string, value: string) => {
    getStorage().set(key, value);
};

export const getItem = (key: string): string | null => {
    return getStorage().getString(key) || null;
};

export const removeItem = (key: string) => {
    getStorage().remove(key);
};

// ─── Types ───────────────────────────────────────────────
export type SyncAction = 'create' | 'update' | 'delete';
export type EntityType = 'transaction' | 'budget' | 'category' | 'account' | 'recurring-bill' | 'debt';

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
    TRANSACTIONS: 'sync:transactions', // Deprecated: use TRANSACTIONS_PARTITIONED
    TRANSACTIONS_PREFIX: 'sync:tx:',
    YEARS: 'sync:tx_years',
    BUDGETS: 'sync:budgets',
    CATEGORIES: 'sync:categories',
    ACCOUNTS: 'sync:accounts',
    RECURRING_BILLS: 'sync:recurring_bills',
    DEBTS: 'sync:debts', // Deprecated: use DEBTS_PARTITIONED
    DEBTS_PREFIX: 'sync:debt:',
    DEBT_YEARS: 'sync:debt_years',
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
    getStorage().set(key, JSON.stringify(data || []));
}

// ─── Transactions (Partitioned by Year) ──────────────────

/** Returns all recorded years that have transactions */
export function getAvailableYears(): number[] {
    const years = getArray<number>(KEYS.YEARS);
    // Be defensive: filter out nulls, NaNs, or non-numbers
    return years.filter(y => y !== null && typeof y === 'number' && !isNaN(y));
}

function updateAvailableYears(year: number): void {
    if (year === null || typeof year !== 'number' || isNaN(year)) return;
    const years = getAvailableYears();
    if (!years.includes(year)) {
        years.push(year);
        years.sort((a, b) => b - a);
        setArray(KEYS.YEARS, years);
    }
}

/** Get transactions for a specific year */
export function getTransactionsByYear(year: number): any[] {
    return getArray(`${KEYS.TRANSACTIONS_PREFIX}${year}`);
}

/** Get ALL transactions (merged from all year partitions) */
export function getTransactions(): any[] {
    // Migration check: if legacy transactions exist, migrate them first
    const legacy = getArray(KEYS.TRANSACTIONS);
    if (legacy.length > 0) {
        migrateTransactions(legacy);
        getStorage().remove(KEYS.TRANSACTIONS);
    }

    let years = getAvailableYears();

    // Self-repair: If no VALID years are found, check if common years (2020-2030) have data
    if (years.length === 0) {
        const foundYears: number[] = [];
        const currentYear = new Date().getFullYear();
        // Check a wider range of years to be absoluteley sure
        for (let y = 2020; y <= currentYear + 5; y++) {
            const data = getTransactionsByYear(y);
            if (data.length > 0) {
                foundYears.push(y);
                updateAvailableYears(y);
            }
        }

        // EMERGENCY: Check for any transactions accidentally stored under "NaN" partition
        const nanData = getArray(`${KEYS.TRANSACTIONS_PREFIX}NaN`);
        if (nanData.length > 0) {
            console.log(`Recovering ${nanData.length} transactions from NaN partition`);
            migrateTransactions(nanData);
            getStorage().remove(`${KEYS.TRANSACTIONS_PREFIX}NaN`);
            // Re-run the year scan to pick up newly migrated years
            for (let y = 2020; y <= currentYear + 5; y++) {
                if (!foundYears.includes(y)) {
                    const data = getTransactionsByYear(y);
                    if (data.length > 0) foundYears.push(y);
                }
            }
        }
        years = foundYears;
    }

    if (years.length === 0) return [];

    // Merge all years, strictly filtering out any accidental junk
    return years
        .filter(y => y !== null && typeof y === 'number' && !isNaN(y))
        .flatMap(y => getTransactionsByYear(y));
}

/** Internal migration logic */
function migrateTransactions(txs: any[]): void {
    const byYear: Record<number, any[]> = {};
    txs.forEach(t => {
        let y = t.year;
        if (y === undefined || y === null || isNaN(parseInt(String(y)))) {
            const d = new Date(t.date || Date.now());
            y = d.getFullYear();
            t.year = y;
            if (t.month === undefined) t.month = d.getMonth();
            if (t.day === undefined) t.day = d.getDate();
        }
        if (!byYear[y]) byYear[y] = [];
        byYear[y].push(t);
    });

    Object.entries(byYear).forEach(([year, list]) => {
        const y = parseInt(year);
        if (!isNaN(y)) {
            setArray(`${KEYS.TRANSACTIONS_PREFIX}${y}`, list);
            updateAvailableYears(y);
        }
    });
}

function setTransactionsForYear(year: number, txs: any[]): void {
    setArray(`${KEYS.TRANSACTIONS_PREFIX}${year}`, txs);
    updateAvailableYears(year);
}

export function setTransactions(txs: any[]): void {
    const byYear: Record<number, any[]> = {};
    txs.forEach(t => {
        const y = t.year || new Date(t.date || Date.now()).getFullYear();
        if (!byYear[y]) byYear[y] = [];
        byYear[y].push({ ...t, year: y });
    });

    const currentYears = getAvailableYears();
    currentYears.forEach(y => {
        if (!byYear[y]) setArray(`${KEYS.TRANSACTIONS_PREFIX}${y}`, []);
    });

    Object.entries(byYear).forEach(([year, list]) => {
        setTransactionsForYear(parseInt(year), list);
    });
}

/** Optimized batch update to prevent multiple writes to same partitions */
export function batchUpsertTransactions(txs: any[]): void {
    if (!txs || txs.length === 0) return;

    // 1. Group incoming transactions by year
    const incomingByYear: Record<number, any[]> = {};
    txs.forEach(t => {
        const y = t.year || new Date(t.date || Date.now()).getFullYear();
        if (!incomingByYear[y]) incomingByYear[y] = [];
        incomingByYear[y].push({ ...t, year: y });
    });

    // 2. To handle potential "year moves", we need a map of IDs being updated
    const incomingIds = new Set(txs.map(t => t._id || t.id));

    // 3. Process each year partition that is affected by incoming data
    Object.entries(incomingByYear).forEach(([yearStr, incomingList]) => {
        const year = parseInt(yearStr);
        const currentList = getTransactionsByYear(year);

        // Merge incoming into current
        const mergedList = [...currentList];
        incomingList.forEach(newTx => {
            const id = newTx._id || newTx.id;
            const idx = mergedList.findIndex((it: any) => (it._id || it.id) === id);
            if (idx >= 0) {
                mergedList[idx] = { ...mergedList[idx], ...newTx };
            } else {
                mergedList.push(newTx);
            }
        });

        setTransactionsForYear(year, mergedList);
    });

}

export function upsertTransaction(tx: any): void {
    let year = tx.year;
    // Safety check for year
    if (year === undefined || year === null || isNaN(parseInt(String(year)))) {
        const d = new Date(tx.date || Date.now());
        year = d.getFullYear();
        tx.year = year;
    }

    const id = tx._id || tx.id;

    // Check if transaction existing in OTHER years (for year-change scenarios)
    const years = getAvailableYears();
    years.forEach(y => {
        if (y !== year) {
            const otherList = getTransactionsByYear(y);
            const foundIdx = otherList.findIndex((t: any) => (t._id || t.id) === id);
            if (foundIdx >= 0) {
                otherList.splice(foundIdx, 1);
                setTransactionsForYear(y, otherList);
            }
        }
    });

    // Now upsert in the correct year
    const list = getTransactionsByYear(year);
    const idx = list.findIndex((t: any) => (t._id || t.id) === id);

    if (idx >= 0) {
        list[idx] = { ...list[idx], ...tx };
    } else {
        list.push(tx);
    }
    setTransactionsForYear(year, list);
}

export function removeTransaction(id: string, year: number): void {
    const list = getTransactionsByYear(year).filter((t: any) => (t._id || t.id) !== id);
    setTransactionsForYear(year, list);
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

export function upsertAccount(account: any): void {
    const list = getAccounts();
    const id = account._id || account.id;
    const idx = list.findIndex((a: any) => (a._id || a.id) === id);
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...account };
    } else {
        list.push(account);
    }
    setAccounts(list);
}

export function removeAccount(id: string): void {
    const list = getAccounts().filter((a: any) => (a._id || a.id) !== id);
    setAccounts(list);
}

// ─── Recurring Bills ─────────────────────────────────────
export function getRecurringBills(): any[] {
    return getArray(KEYS.RECURRING_BILLS);
}

export function setRecurringBills(bills: any[]): void {
    setArray(KEYS.RECURRING_BILLS, bills);
}

export function upsertRecurringBill(bill: any): void {
    const list = getRecurringBills();
    const id = bill._id || bill.id;
    const idx = list.findIndex((b: any) => (b._id || b.id) === id);
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...bill };
    } else {
        list.push(bill);
    }
    setRecurringBills(list);
}

export function removeRecurringBill(id: string): void {
    const list = getRecurringBills().filter((b: any) => (b._id || b.id) !== id);
    setRecurringBills(list);
}

// ─── Debts (Partitioned) ─────────────────────────────────
export function getAvailableDebtYears(): number[] {
    return getArray<number>(KEYS.DEBT_YEARS).filter(y => !isNaN(y));
}

function updateAvailableDebtYears(year: number): void {
    if (isNaN(year)) return;
    const years = getAvailableDebtYears();
    if (!years.includes(year)) {
        years.push(year);
        years.sort((a, b) => b - a);
        setArray(KEYS.DEBT_YEARS, years);
    }
}

export function getDebtsByYear(year: number): any[] {
    return getArray(`${KEYS.DEBTS_PREFIX}${year}`);
}

export function getDebts(): any[] {
    // Migration: AsyncStorage is handled by DebtContext initialization
    const legacy = getArray(KEYS.DEBTS);
    if (legacy.length > 0) {
        migrateDebts(legacy);
        getStorage().remove(KEYS.DEBTS);
    }

    const years = getAvailableDebtYears();
    if (years.length === 0) {
        // Emergency check: see if current year has data
        const cy = new Date().getFullYear();
        const data = getDebtsByYear(cy);
        if (data.length > 0) {
            updateAvailableDebtYears(cy);
            return data;
        }
    }
    return years.flatMap(y => getDebtsByYear(y));
}

function migrateDebts(debts: any[]): void {
    const byYear: Record<number, any[]> = {};
    debts.forEach(d => {
        const y = new Date(d.createdAt || d.date || Date.now()).getFullYear();
        if (!byYear[y]) byYear[y] = [];
        byYear[y].push(d);
    });
    Object.entries(byYear).forEach(([year, list]) => {
        const y = parseInt(year);
        setArray(`${KEYS.DEBTS_PREFIX}${y}`, list);
        updateAvailableDebtYears(y);
    });
}

export function setDebts(debts: any[]): void {
    const byYear: Record<number, any[]> = {};
    debts.forEach(d => {
        const y = new Date(d.createdAt || d.date || Date.now()).getFullYear();
        if (!byYear[y]) byYear[y] = [];
        byYear[y].push(d);
    });
    getAvailableDebtYears().forEach(y => {
        if (!byYear[y]) getStorage().remove(`${KEYS.DEBTS_PREFIX}${y}`);
    });
    Object.entries(byYear).forEach(([year, list]) => {
        const y = parseInt(year);
        setArray(`${KEYS.DEBTS_PREFIX}${y}`, list);
        updateAvailableDebtYears(y);
    });
}

export function upsertDebt(debt: any): void {
    const y = new Date(debt.createdAt || debt.date || Date.now()).getFullYear();
    const id = debt._id || debt.id;

    // Remove from other years if exists
    getAvailableDebtYears().forEach(yr => {
        if (yr !== y) {
            const other = getDebtsByYear(yr).filter(d => (d._id || d.id) !== id);
            setArray(`${KEYS.DEBTS_PREFIX}${yr}`, other);
        }
    });

    const list = getDebtsByYear(y);
    const idx = list.findIndex(d => (d._id || d.id) === id);
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...debt };
    } else {
        list.push(debt);
    }
    setArray(`${KEYS.DEBTS_PREFIX}${y}`, list);
    updateAvailableDebtYears(y);
}

export function removeDebt(id: string, year?: number): void {
    const yr = year || new Date().getFullYear(); // Fallback if year not provided
    const list = getDebtsByYear(yr).filter(d => (d._id || d.id) !== id);
    setArray(`${KEYS.DEBTS_PREFIX}${yr}`, list);

    // Also scan all other years just in case
    getAvailableDebtYears().forEach(y => {
        if (y !== yr) {
            const other = getDebtsByYear(y).filter(d => (d._id || d.id) !== id);
            setArray(`${KEYS.DEBTS_PREFIX}${y}`, other);
        }
    });
}

// ─── Sync Queue ──────────────────────────────────────────
// ─── Sync Queue ──────────────────────────────────────────

/** Internal: Helper to grab legacy items from AsyncStorage if they exist */
async function getLegacyAsyncStorageQueue(): Promise<SyncQueueItem[]> {
    try {
        // We do this purely to prevent data loss after the update
        // We dynamic import to avoid crashes if AsyncStorage is not present or causing issues
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const raw = await AsyncStorage.getItem('offline_queue');
        if (!raw) return [];
        const legacy = JSON.parse(raw);
        await AsyncStorage.removeItem('offline_queue'); // Cleanup immediately

        return legacy.map((it: any) => ({
            id: it.id || String(Date.now()),
            action: it.method === 'delete' ? 'delete' : (it.method === 'put' ? 'update' : 'create'),
            entityType: 'transaction', // Default to transaction as that was the main use
            data: it.data,
            clientUpdatedAt: new Date(it.timestamp || Date.now()).toISOString(),
            createdAt: new Date(it.timestamp || Date.now()).toISOString()
        }));
    } catch {
        return [];
    }
}

export function getSyncQueue(): SyncQueueItem[] {
    return getArray<SyncQueueItem>(KEYS.SYNC_QUEUE);
}

/** One-time task to unify queues */
export async function unifyQueues(): Promise<void> {
    const legacy = await getLegacyAsyncStorageQueue();
    if (legacy.length > 0) {
        console.log(`Migrating ${legacy.length} legacy sync items to MMKV`);
        const current = getSyncQueue();
        const unified = [...current, ...legacy];
        setArray(KEYS.SYNC_QUEUE, unified);
    }
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
    const years = getAvailableYears();
    years.forEach(y => s.remove(`${KEYS.TRANSACTIONS_PREFIX}${y}`));
    s.remove(KEYS.YEARS);
    s.remove(KEYS.TRANSACTIONS); // legacy
    s.remove(KEYS.BUDGETS);
    s.remove(KEYS.CATEGORIES);
    s.remove(KEYS.ACCOUNTS);
    s.remove(KEYS.SYNC_QUEUE);
    s.remove(KEYS.LAST_SYNC);
}

