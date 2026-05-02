import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSecurity } from '@/context/SecurityContext';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as localDB from '@/services/localDB';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStyles } from '@/components/more/DesignSystem';
import { useSettings } from '@/context/SettingsContext';
import { Spacing, BorderRadius } from '@/constants/Theme';

export default function SecurityScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAppLockEnabled, setAppLockEnabled } = useSecurity();
    const { tokens } = useThemeStyles();
    const { isDarkMode } = useSettings();
    const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
    const [offlineEnabled, setOfflineEnabled] = useState(false);

    React.useEffect(() => {
        const loadSettings = async () => {
            // Priority 1: Check MMKV (Primary)
            let analytics = localDB.getItem('BT_analyticsEnabled');
            let offline = localDB.getItem('BT_offlineEnabled');

            // Priority 2: One-time migration from AsyncStorage
            if (analytics === null) {
                const legacyAnalytics = await AsyncStorage.getItem('BT_analyticsEnabled');
                if (legacyAnalytics !== null) {
                    analytics = legacyAnalytics;
                    localDB.setItem('BT_analyticsEnabled', legacyAnalytics);
                }
            }
            if (offline === null) {
                const legacyOffline = await AsyncStorage.getItem('BT_offlineEnabled');
                if (legacyOffline !== null) {
                    offline = legacyOffline;
                    localDB.setItem('BT_offlineEnabled', legacyOffline);
                }
            }

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
        localDB.setItem('BT_analyticsEnabled', v.toString());
    };

    const toggleOffline = async (v: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOfflineEnabled(v);
        localDB.setItem('BT_offlineEnabled', v.toString());
    };

    return (
        <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            {/* Minimal Header */}
            <Animated.View entering={FadeInDown.delay(50).duration(300)} style={[styles.header, { backgroundColor: tokens.bgPrimary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Privacy & Security</Text>
                <View style={{ width: 44 }} />
            </Animated.View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Hero / Info Section */}
                <Animated.View entering={ZoomIn.delay(100).duration(400).springify()}>
                    <LinearGradient
                        colors={isDarkMode ? ['#1A1C20', '#0F1014'] : ['#2DCA72', '#16A34A']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <MaterialCommunityIcons 
                            name="shield-check" 
                            size={48} 
                            color={isDarkMode ? '#2DCA72' : '#fff'} 
                            style={{ marginBottom: 12 }} 
                        />
                        <Text style={[styles.heroTitle, { color: '#fff' }]}>Bank-Grade Security</Text>
                        <Text style={[styles.heroDesc, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.9)' }]}>
                            Your financial data is encrypted, stored locally when possible, and never sold to third parties. You maintain full control.
                        </Text>
                    </LinearGradient>
                </Animated.View>

                {/* App Protection Settings */}
                <Animated.View entering={FadeInUp.delay(200).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: tokens.textMuted }]}>App Protection</Text>
                    <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                        <View style={styles.settingRow}>
                            <View style={[styles.iconWrap, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F7' }]}>
                                <Ionicons name="finger-print-outline" size={20} color={tokens.textPrimary} />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={[styles.settingTitle, { color: tokens.textPrimary }]}>Biometric App Lock</Text>
                                <Text style={[styles.settingSub, { color: tokens.textMuted }]}>Require FaceID or Fingerprint on launch</Text>
                            </View>
                            <Switch
                                value={isAppLockEnabled}
                                onValueChange={toggleAppLock}
                                trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Data Privacy Settings */}
                <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: tokens.textMuted }]}>Data Handling</Text>
                    <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                        <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: tokens.borderSubtle }]}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(0,122,255,0.08)' }]}>
                                <Ionicons name="analytics-outline" size={20} color="#007AFF" />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={[styles.settingTitle, { color: tokens.textPrimary }]}>Analytics Collection</Text>
                                <Text style={[styles.settingSub, { color: tokens.textMuted }]}>Share anonymous crash data</Text>
                            </View>
                            <Switch
                                value={analyticsEnabled}
                                onValueChange={toggleAnalytics}
                                trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                                thumbColor="#fff"
                            />
                        </View>
                        <View style={styles.settingRow}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(244,63,94,0.08)' }]}>
                                <Ionicons name="cloud-offline-outline" size={20} color="#F43F5E" />
                            </View>
                            <View style={styles.textWrap}>
                                <Text style={[styles.settingTitle, { color: tokens.textPrimary }]}>Offline Only Mode</Text>
                                <Text style={[styles.settingSub, { color: tokens.textMuted }]}>Prevent data from leaving this device</Text>
                            </View>
                            <Switch
                                value={offlineEnabled}
                                onValueChange={toggleOffline}
                                trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                                thumbColor="#fff"
                            />
                        </View>
                    </View>
                </Animated.View>

                {/* Info List */}
                <Animated.View entering={FadeInUp.delay(400).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: tokens.textMuted }]}>More Information</Text>
                    <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                        <TouchableOpacity style={[styles.infoRow]} onPress={() => router.push('/privacy-security' as any)}>
                            <Text style={[styles.infoTitle, { color: tokens.textPrimary }]}>Read Full Privacy Policy</Text>
                            <Ionicons name="open-outline" size={16} color={tokens.textMuted} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        zIndex: 10,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    scrollContent: { padding: 24, paddingTop: 10 },

    heroCard: {
        borderRadius: 24, padding: 28, marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1, shadowRadius: 24, elevation: 6,
    },
    heroTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
    heroDesc: { fontSize: 13, lineHeight: 20 },

    sectionLabel: {
        fontSize: 12, fontWeight: '800',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 10, marginLeft: 8,
    },
    card: {
        borderRadius: 20,
        marginBottom: 24, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
    },
    iconWrap: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    textWrap: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    settingSub: { fontSize: 11, fontWeight: '500' },

    infoRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 16,
    },
    infoTitle: { fontSize: 14, fontWeight: '600' },
});
