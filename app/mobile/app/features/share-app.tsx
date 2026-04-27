import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, BorderRadius } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { useThemeStyles } from '@/components/more/DesignSystem';
import { useSettings } from '@/context/SettingsContext';

export default function ShareAppScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { tokens } = useThemeStyles();
    const { isDarkMode } = useSettings();

    const handleShare = async () => {
        try {
            const url = Platform.OS === 'ios'
                ? 'https://apps.apple.com/app/budgettracko/id000000'
                : 'https://play.google.com/store/apps/details?id=com.budgettracko.app';

            const result = await Share.share({
                message: `Check out BudgetTracko! It's the best app I've found for tracking expenses, scanning bills, and saving money. Download it here: ${url}`,
                title: 'BudgetTracko Expense Manager',
                url: url, // iOS only
            }, {
                dialogTitle: 'Share BudgetTracko', // Android only
                tintColor: '#2DCA72',
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log('Shared via', result.activityType);
                } else {
                    console.log('Shared successfully');
                }
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error: any) {
            console.error('Error sharing:', error.message);
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingBottom: insets.bottom }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F7' }]} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={24} color={tokens.textPrimary} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>

                {/* Illustration / Graphic */}
                <Animated.View entering={SlideInUp.duration(500).springify()} style={styles.graphicWrap}>
                    <LinearGradient
                        colors={['#EC4899', '#8B5CF6']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.gradientCircle}
                    >
                        <Ionicons name="heart" size={56} color="#fff" />
                    </LinearGradient>
                    <View style={styles.floatingBubbles}>
                        <View style={[styles.bubble, { backgroundColor: '#2DCA72', top: 20, left: 10 }]} />
                        <View style={[styles.bubble, { backgroundColor: '#FBBF24', bottom: 10, right: 20, width: 14, height: 14 }]} />
                        <View style={[styles.bubble, { backgroundColor: '#3B82F6', top: 80, right: -10, width: 20, height: 20 }]} />
                    </View>
                </Animated.View>

                {/* Text Content */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.textContainer}>
                    <Text style={[styles.title, { color: tokens.textPrimary }]}>Love BudgetTracko?</Text>
                    <Text style={[styles.subtitle, { color: tokens.textMuted }]}>
                        Sharing is caring! Invite your friends and family to join BudgetTracko and start their journey toward financial freedom together.
                    </Text>
                </Animated.View>

                {/* Big Action Button */}
                <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.btnWrapper}>
                    <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
                        <LinearGradient
                            colors={['#EC4899', '#8B5CF6']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.btnGradient}
                        >
                            <Ionicons name="share-social" size={20} color="#fff" />
                            <Text style={styles.shareTxt}>Share with Friends</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={[styles.footerTxt, { color: tokens.textMuted, opacity: 0.6 }]}>
                        Your support helps us stay independent and ad-free.
                    </Text>
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        paddingHorizontal: Spacing.lg, paddingVertical: 10,
        alignItems: 'flex-start',
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center'
    },

    content: {
        flex: 1,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },

    graphicWrap: {
        width: 140, height: 140,
        marginBottom: 40,
        position: 'relative',
        justifyContent: 'center', alignItems: 'center',
    },
    gradientCircle: {
        width: 120, height: 120, borderRadius: 60,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#EC4899', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3, shadowRadius: 24, elevation: 8,
    },
    floatingBubbles: { ...StyleSheet.absoluteFillObject },
    bubble: { position: 'absolute', width: 12, height: 12, borderRadius: 10, opacity: 0.8 },

    textContainer: { alignItems: 'center', marginBottom: 60 },
    title: { fontSize: 28, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
    subtitle: {
        fontSize: 15, fontWeight: '500',
        textAlign: 'center', lineHeight: 24, paddingHorizontal: 10,
    },

    btnWrapper: { width: '100%', alignItems: 'center' },
    shareBtn: { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 24 },
    btnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, paddingVertical: 18,
    },
    shareTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },

    footerTxt: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
});
