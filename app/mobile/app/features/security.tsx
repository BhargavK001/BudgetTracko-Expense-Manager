import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSecurity } from '@/context/SecurityContext';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SecurityScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAppLockEnabled, setAppLockEnabled } = useSecurity();
    const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
    const [offlineEnabled, setOfflineEnabled] = useState(false);

    React.useEffect(() => {
        const loadSettings = async () => {
            const analytics = await AsyncStorage.getItem('BT_analyticsEnabled');
            const offline = await AsyncStorage.getItem('BT_offlineEnabled');
            if (analytics) setAnalyticsEnabled(analytics === 'true');
            if (offline) setOfflineEnabled(offline === 'true');
        };
        loadSettings();
    }, []);

    const toggleAppLock = (v: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAppLockEnabled(v);
    };

    const toggleAnalytics = async (v: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setAnalyticsEnabled(v);
        await AsyncStorage.setItem('BT_analyticsEnabled', v.toString());
    };

    const toggleOffline = async (v: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOfflineEnabled(v);
        await AsyncStorage.setItem('BT_offlineEnabled', v.toString());
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* Minimal Header */}
            <Animated.View entering={FadeInDown.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 44 }} />
            </Animated.View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Hero / Info Section */}
                <Animated.View entering={ZoomIn.delay(100).duration(400).springify()}>
                    <LinearGradient
                        colors={['#1A1C20', '#0F1014']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <MaterialCommunityIcons name="shield-check" size={48} color="#2DCA72" style={{ marginBottom: 12 }} />
                        <Text style={styles.heroTitle}>Bank-Grade Security</Text>
                        <Text style={styles.heroDesc}>
                            Your financial data is encrypted, stored locally when possible, and never sold to third parties. You maintain full control.
                        </Text>
                    </LinearGradient>
                </Animated.View>

                {/* App Protection Settings */}
                <Animated.View entering={FadeInUp.delay(200).duration(400)}>
                    <Text style={styles.sectionLabel}>App Protection</Text>
                    <View style={styles.card}>
                        <View style={styles.settingRow}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="finger-print-outline" size={20} color="#111" />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={styles.settingTitle}>Biometric App Lock</Text>
                                <Text style={styles.settingSub}>Require FaceID or Fingerprint on launch</Text>
                            </View>
                            <Switch
                                value={isAppLockEnabled}
                                onValueChange={toggleAppLock}
                                trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Data Privacy Settings */}
                <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                    <Text style={styles.sectionLabel}>Data Handling</Text>
                    <View style={styles.card}>
                        <View style={[styles.settingRow, styles.borderBottom]}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(0,122,255,0.08)' }]}>
                                <Ionicons name="analytics-outline" size={20} color="#007AFF" />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={styles.settingTitle}>Analytics Collection</Text>
                                <Text style={styles.settingSub}>Share anonymous crash data</Text>
                            </View>
                            <Switch
                                value={analyticsEnabled}
                                onValueChange={toggleAnalytics}
                                trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
                                thumbColor="#fff"
                            />
                        </View>
                        <View style={styles.settingRow}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(244,63,94,0.08)' }]}>
                                <Ionicons name="cloud-offline-outline" size={20} color="#F43F5E" />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={styles.settingTitle}>Offline Only Mode</Text>
                                <Text style={styles.settingSub}>Prevent data from leaving this device</Text>
                            </View>
                            <Switch
                                value={offlineEnabled}
                                onValueChange={toggleOffline}
                                trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Info List */}
                <Animated.View entering={FadeInUp.delay(400).duration(400)}>
                    <Text style={styles.sectionLabel}>More Information</Text>
                    <View style={styles.card}>
                        <TouchableOpacity style={[styles.infoRow]} onPress={() => router.push('/privacy-security')}>
                            <Text style={styles.infoTitle}>Read Full Privacy Policy</Text>
                            <Ionicons name="open-outline" size={16} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#FAFAFC' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#FAFAFC', zIndex: 10,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },

    scrollContent: { padding: 24, paddingTop: 10 },

    heroCard: {
        borderRadius: 24, padding: 28, marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1, shadowRadius: 24, elevation: 6,
    },
    heroTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 8 },
    heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },

    sectionLabel: {
        fontSize: 12, fontWeight: '800', color: '#8E8E93',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 10, marginLeft: 8,
    },
    card: {
        backgroundColor: '#fff', borderRadius: 20,
        marginBottom: 24, borderWidth: 1, borderColor: '#F2F2F7',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
    },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    iconWrap: {
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },
    textWrap: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
    settingSub: { fontSize: 11, fontWeight: '500', color: '#8E8E93' },

    infoRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16,
    },
    infoTitle: { fontSize: 14, fontWeight: '600', color: '#111' },
});
