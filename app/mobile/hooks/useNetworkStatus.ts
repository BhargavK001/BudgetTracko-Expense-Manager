import { useEffect, useRef, useState, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean;
}

export function useNetworkStatus(onReconnect?: () => void) {
    const [status, setStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
    });

    const wasOffline = useRef(false);
    const onReconnectRef = useRef(onReconnect);
    onReconnectRef.current = onReconnect;

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const connected = state.isConnected ?? false;
            const reachable = state.isInternetReachable ?? false;

            setStatus({ isConnected: connected, isInternetReachable: reachable });

            // Detect offline → online transition
            if (connected && reachable && wasOffline.current) {
                wasOffline.current = false;
                onReconnectRef.current?.();
            }

            if (!connected || !reachable) {
                wasOffline.current = true;
            }
        });

        return () => unsubscribe();
    }, []);

    const checkConnection = useCallback(async (): Promise<boolean> => {
        const state = await NetInfo.fetch();
        return (state.isConnected ?? false) && (state.isInternetReachable ?? false);
    }, []);

    return { ...status, checkConnection };
}
