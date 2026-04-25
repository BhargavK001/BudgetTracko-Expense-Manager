import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState, useCallback } from 'react';
import api from './api';

const CACHE_PREFIX = 'cache_';
const QUEUE_KEY = 'offline_queue';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ── Types ────────────────────────────────────────────────────
type QueuedAction = {
    id: string;
    method: 'post' | 'put' | 'delete';
    url: string;
    data?: any;
    timestamp: number;
};

type CachedData<T = any> = {
    data: T;
    cachedAt: number;
};

// ── Cache Layer ──────────────────────────────────────────────
export async function getCached<T>(key: string): Promise<T | null> {
    try {
        const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;

        const cached: CachedData<T> = JSON.parse(raw);
        const isExpired = Date.now() - cached.cachedAt > CACHE_TTL_MS;

        if (isExpired) {
            await AsyncStorage.removeItem(CACHE_PREFIX + key);
            return null;
        }
        return cached.data;
    } catch {
        return null;
    }
}

export async function setCache<T>(key: string, data: T): Promise<void> {
    try {
        const entry: CachedData<T> = { data, cachedAt: Date.now() };
        await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (e) {
        console.warn('Cache write failed:', e);
    }
}

export async function clearCache(): Promise<void> {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
        if (cacheKeys.length > 0) {
            await AsyncStorage.multiRemove(cacheKeys);
        }
    } catch (e) {
        console.warn('Cache clear failed:', e);
    }
}

// ── Offline Queue ────────────────────────────────────────────
async function getQueue(): Promise<QueuedAction[]> {
    try {
        const raw = await AsyncStorage.getItem(QUEUE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueue(action: Omit<QueuedAction, 'id' | 'timestamp'>): Promise<void> {
    const queue = await getQueue();
    queue.push({
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
    });
    await saveQueue(queue);
}

export async function getQueueLength(): Promise<number> {
    const queue = await getQueue();
    return queue.length;
}

export async function syncQueue(): Promise<{ synced: number; failed: number }> {
    const queue = await getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    let synced = 0;
    let failed = 0;
    const remaining: QueuedAction[] = [];

    for (const action of queue) {
        try {
            switch (action.method) {
                case 'post':
                    await api.post(action.url, action.data);
                    break;
                case 'put':
                    await api.put(action.url, action.data);
                    break;
                case 'delete':
                    await api.delete(action.url);
                    break;
            }
            synced++;
        } catch (e) {
            failed++;
            remaining.push(action);
        }
    }

    await saveQueue(remaining);
    return { synced, failed };
}

// ── Fetch with Cache ─────────────────────────────────────────
export async function fetchWithCache<T>(
    cacheKey: string,
    url: string,
    forceRefresh = false
): Promise<{ data: T; fromCache: boolean }> {
    // Try network first
    const netState = await NetInfo.fetch();
    const isOnline = netState.isConnected && netState.isInternetReachable !== false;

    if (isOnline && !forceRefresh) {
        try {
            const res = await api.get(url);
            const data = res.data;
            await setCache(cacheKey, data);
            return { data, fromCache: false };
        } catch {
            // Fall through to cache
        }
    }

    if (isOnline && forceRefresh) {
        const res = await api.get(url);
        const data = res.data;
        await setCache(cacheKey, data);
        return { data, fromCache: false };
    }

    // Offline or network failed — serve cache
    const cached = await getCached<T>(cacheKey);
    if (cached) {
        return { data: cached, fromCache: true };
    }

    throw new Error('No internet connection and no cached data available.');
}

// ── React Hook: Network Status ──────────────────────────────
export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const connected = state.isConnected === true && state.isInternetReachable !== false;
            setIsConnected(connected);

            // Auto-sync when coming back online
            if (connected) {
                syncQueue().then(result => {
                    if (result.synced > 0) {
                        console.log(`Synced ${result.synced} queued actions`);
                    }
                    getQueueLength().then(setPendingCount);
                });
            }
        });

        // Initial queue count
        getQueueLength().then(setPendingCount);

        return () => unsubscribe();
    }, []);

    const refreshPendingCount = useCallback(async () => {
        const count = await getQueueLength();
        setPendingCount(count);
    }, []);

    return { isConnected, pendingCount, refreshPendingCount };
}
