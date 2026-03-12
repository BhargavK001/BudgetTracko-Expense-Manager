import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, StatusBar, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function ShareAppScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const onShare = async () => {
        try {
            await Share.share({
                message: 'I use BudgetTracko to manage my expenses. It is an amazing app! Check it out at https://budgettracko.com',
            });
        } catch (error: any) {
            console.log(error.message);
        }
    };

    const socials = [
        { icon: 'close', color: '#000000', name: 'X', url: 'https://x.com/intent/tweet?text=I%20use%20BudgetTracko%20to%20manage%20finances!%20Check%20it%20out%20https://budgettracko.com' },
        { icon: 'logo-facebook', color: '#1877F2', name: 'Facebook', url: 'https://www.facebook.com/sharer/sharer.php?u=https://budgettracko.com' },
        { icon: 'logo-instagram', color: '#E1306C', name: 'Instagram', url: 'https://instagram.com/budgettracko' },
        { icon: 'logo-whatsapp', color: '#25D366', name: 'WhatsApp', url: 'https://wa.me/?text=I%20use%20BudgetTracko%20to%20manage%20my%20expenses.%20Check%20it%20out%20at%20https://budgettracko.com' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <Animated.View entering={FadeIn.delay(50)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Share App</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                    <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <Ionicons name="gift-outline" size={64} color="#FFF" style={{ marginBottom: 16 }} />
                        <Text style={styles.heroTitle}>Love BudgetTracko?</Text>
                        <Text style={styles.heroDesc}>
                            Share the app with your friends and family to help them take control of their finances.
                        </Text>

                        <TouchableOpacity style={styles.mainShareBtn} onPress={onShare} activeOpacity={0.9}>
                            <Text style={styles.mainShareText}>Share Now</Text>
                            <Ionicons name="share-social" size={20} color="#6366F1" />
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>


                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <Text style={styles.sectionTitle}>Follow Us</Text>
                    <View style={styles.socialGrid}>
                        {socials.map((social, index) => (
                            <Animated.View key={social.name} entering={FadeInDown.delay(250 + (index * 50)).duration(400).springify()} style={styles.socialBtnWrap}>
                                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.7} onPress={() => Linking.openURL(social.url)}>
                                    <View style={[styles.socialIconWrap, { backgroundColor: social.color + '15' }]}>
                                        <Ionicons name={social.icon as any} size={28} color={social.color} />
                                    </View>
                                    <Text style={styles.socialName}>{social.name}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                    <View style={styles.rateCard}>
                        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 }} activeOpacity={0.7} onPress={() => {
                            const storeUrl = Platform.OS === 'ios'
                                ? 'https://apps.apple.com/app/budgettracko/id000000'
                                : 'https://play.google.com/store/apps/details?id=com.budgettracko.app';
                            Linking.openURL(storeUrl);
                        }}>
                            <View style={styles.rateIconWrap}>
                                <Ionicons name="star" size={24} color="#F59E0B" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rateTitle}>Rate us on {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}</Text>
                                <Text style={styles.rateDesc}>Your feedback helps us improve.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
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
        paddingHorizontal: 24,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    heroCard: {
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 8,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 12,
        textAlign: 'center',
    },
    heroDesc: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    mainShareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 28,
        paddingVertical: 16,
        borderRadius: 20,
        gap: 12,
        width: '100%',
        justifyContent: 'center',
    },
    mainShareText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#6366F1',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    socialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
        rowGap: 12,
    },
    socialBtnWrap: {
        width: '48%',
    },
    socialBtn: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
    },
    socialIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    socialName: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },
    rateCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
    },
    rateIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(245,158,11,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rateTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
        marginBottom: 4,
    },
    rateDesc: {
        fontSize: 13,
        color: '#8E8E93',
    },
});
