import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { user } = useAuth();

    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

    const displayName = user?.displayName || 'BudgetTracko User';
    const email = user?.email || 'Authenticated mode';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    const plan = user?.subscription?.plan || 'Free Plan';
    const memberSince = 'Feb 2024';

    const stats = [
        { label: 'Transactions', value: '42', icon: 'list-outline', color: '#3B82F6' },
        { label: 'Accounts', value: '3', icon: 'wallet-outline', color: '#10B981' },
        { label: 'Budgets', value: '5', icon: 'pie-chart-outline', color: '#F59E0B' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            <Animated.View entering={FadeIn.delay(50).duration(300)} style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + 36,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>
                    <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
                        <LinearGradient
                            colors={['#F8FAFC', '#F1F5F9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.profileHero, isCompact && styles.profileHeroCompact]}
                        >
                            <View style={styles.heroBlobTL} />
                            <View style={styles.heroBlobBR} />

                            <View style={styles.profileHeaderRow}>
                                <View style={styles.avatar}>
                                    {initials ? (
                                        <Text style={styles.avatarInitials}>{initials}</Text>
                                    ) : (
                                        <Ionicons name="person" size={32} color="#6366F1" />
                                    )}
                                </View>
                                <View style={styles.profileTextWrap}>
                                    <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                                    <Text style={styles.userEmail} numberOfLines={1}>{email}</Text>
                                </View>
                            </View>

                            <View style={styles.badgeContainer}>
                                <View style={styles.premiumBadge}>
                                    <Ionicons name="diamond" size={12} color="#F59E0B" />
                                    <Text style={styles.premiumText}>{plan.toUpperCase()}</Text>
                                </View>
                                <View style={styles.memberSinceChip}>
                                    <Ionicons name="calendar-outline" size={12} color="#8E8E93" />
                                    <Text style={styles.memberSinceText}>Since {memberSince}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <Animated.View key={index} entering={FadeInDown.delay(150 + index * 100).duration(400).springify()} style={{ flex: 1 }}>
                                <View style={styles.statCard}>
                                    <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                        <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                                    </View>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

                    <Animated.View entering={FadeInDown.delay(350).duration(400)}>
                        <Text style={styles.sectionTitle}>Account Details</Text>
                        <View style={styles.detailsContainer}>
                            <DetailItem label="Member Since" value={memberSince} icon="calendar-outline" />
                            <DetailItem label="Account Type" value="Authenticated" icon="business-outline" />
                            <DetailItem label="Data Backup" value="Enabled" icon="cloud-done-outline" isLast />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(450).duration(400)}>
                        <View style={styles.profileActionsCard}>
                            <TouchableOpacity style={styles.profileActionBtn} activeOpacity={0.8}>
                                <Ionicons name="create-outline" size={16} color="#111" />
                                <Text style={styles.profileActionText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.profileActionBtn, styles.profileActionBtnAlt]} activeOpacity={0.8}>
                                <Ionicons name="sparkles-outline" size={16} color="#6366F1" />
                                <Text style={[styles.profileActionText, { color: '#6366F1' }]}>Manage Plan</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>
        </View>
    );
}

function DetailItem({ label, value, icon, isLast }: { label: string; value: string; icon: string; isLast?: boolean }) {
    return (
        <View style={[styles.detailItem, isLast && styles.detailItemLast]}>
            <View style={styles.detailLeft}>
                <Ionicons name={icon as any} size={18} color="#8E8E93" />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingTop: 8,
    },
    contentInner: {
        width: '100%',
    },
    contentInnerTablet: {
        maxWidth: 760,
        alignSelf: 'center',
    },

    profileHero: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    profileHeroCompact: {
        padding: 20,
    },
    heroBlobTL: {
        position: 'absolute',
        top: -35,
        left: -35,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(99,102,241,0.08)',
    },
    heroBlobBR: {
        position: 'absolute',
        bottom: -45,
        right: -35,
        width: 170,
        height: 170,
        borderRadius: 85,
        backgroundColor: 'rgba(56,189,248,0.08)',
    },
    profileHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarInitials: {
        fontSize: 24,
        fontWeight: '900',
        color: '#6366F1',
    },
    profileTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    userName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 13,
        fontWeight: '500',
        color: '#8E8E93',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FDE68A',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
    },
    memberSinceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    memberSinceText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#8E8E93',
    },
    premiumText: {
        fontSize: 11,
        fontWeight: '900',
        color: '#F59E0B',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
        gap: 12,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingVertical: 16,
        paddingHorizontal: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 1,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111',
    },
    statLabel: {
        fontSize: 10,
        color: '#8E8E93',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        textAlign: 'center',
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#8E8E93',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        paddingHorizontal: 4,
    },
    detailsContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    detailItemLast: {
        borderBottomWidth: 0,
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#111',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    profileActionsCard: {
        flexDirection: 'row',
        gap: 12,
    },
    profileActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingVertical: 16,
    },
    profileActionBtnAlt: {
        backgroundColor: 'rgba(99,102,241,0.08)',
    },
    profileActionText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#111',
    },
});
