import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useNetworkStatus } from '@/services/offlineManager';

export default function NetworkBanner() {
    const { isConnected, pendingCount } = useNetworkStatus();
    const insets = useSafeAreaInsets();

    if (isConnected && pendingCount === 0) return null;

    return (
        <Animated.View
            entering={FadeInUp.duration(300)}
            exiting={FadeOutUp.duration(300)}
            style={[
                styles.banner,
                { paddingTop: Platform.OS === 'ios' ? insets.top + 4 : 4 },
                !isConnected ? styles.offlineBanner : styles.syncBanner,
            ]}
        >
            <Ionicons
                name={!isConnected ? 'cloud-offline-outline' : 'sync-outline'}
                size={16}
                color="#fff"
            />
            <Text style={styles.bannerText}>
                {!isConnected
                    ? `You're offline${pendingCount > 0 ? ` · ${pendingCount} pending` : ''}`
                    : `Syncing ${pendingCount} item${pendingCount !== 1 ? 's' : ''}…`
                }
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingBottom: 8,
        zIndex: 99999,
    },
    offlineBanner: {
        backgroundColor: '#EF4444',
    },
    syncBanner: {
        backgroundColor: '#F59E0B',
    },
    bannerText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
});
