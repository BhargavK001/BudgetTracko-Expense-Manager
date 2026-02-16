
import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import Animated, { FadeInUp, ZoomIn, SlideInRight } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function OfflineFeature() {
    const router = useRouter();

    return (
        <Container backgroundColor="#FFFFFF">
            <StatusBar style="dark" />

            <View style={styles.content}>
                {/* Visual Section: Status Card */}
                <View style={styles.visualContainer}>
                    <Animated.View
                        entering={ZoomIn.delay(200).springify()}
                        style={styles.statusCard}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>SYSTEM STATUS</Text>
                            <View style={styles.liveIndicator}>
                                <View style={styles.liveDot} />
                                <Text style={styles.liveText}>LIVE</Text>
                            </View>
                        </View>

                        {/* Network Status */}
                        <View style={styles.statusRow}>
                            <View style={styles.statusIconBg}>
                                <MaterialCommunityIcons name="wifi-off" size={24} color="#666666" />
                            </View>
                            <View style={styles.statusInfo}>
                                <Text style={styles.statusLabel}>INTERNET</Text>
                                <Text style={styles.statusValueOffline}>DISCONNECTED</Text>
                            </View>
                            <MaterialCommunityIcons name="close-circle" size={24} color="#FF5252" />
                        </View>

                        <View style={styles.divider} />

                        {/* Tracking Status */}
                        <View style={styles.statusRow}>
                            <View style={[styles.statusIconBg, styles.activeIconBg]}>
                                <MaterialCommunityIcons name="flash" size={24} color="#000000" />
                            </View>
                            <View style={styles.statusInfo}>
                                <Text style={styles.statusLabel}>EXPENSE TRACKING</Text>
                                <Text style={styles.statusValueOnline}>ACTIVE</Text>
                            </View>
                            <Animated.View entering={SlideInRight.delay(600).springify()}>
                                <MaterialCommunityIcons name="check-circle" size={24} color="#4ADE80" />
                            </Animated.View>
                        </View>
                    </Animated.View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                    <Animated.View entering={FadeInUp.delay(300)} style={styles.stepContainer}>
                        <Text style={styles.step}>04 / 04</Text>
                    </Animated.View>

                    <Animated.Text entering={FadeInUp.delay(400)} style={styles.title}>
                        NO WIFI?
                        {'\n'}
                        NO PROBLEM.
                    </Animated.Text>

                    <Animated.Text entering={FadeInUp.delay(500)} style={styles.description}>
                        Your data saves locally and syncs automatically when you're back online.
                    </Animated.Text>
                </View>

                {/* Footer Navigation */}
                <View style={styles.footer}>
                    <View style={styles.pagination}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={[styles.dot, styles.activeDot]} />
                    </View>

                    <Button
                        title="GET STARTED"
                        onPress={() => router.push('/(auth)/signup')}
                        variant="primary"
                        style={styles.fullButton}
                        textStyle={{ fontSize: 18, letterSpacing: 1 }}
                    />
                    <Button
                        title="Login"
                        onPress={() => router.push('/(auth)/login')}
                        variant="outline"
                        style={styles.loginButton}
                        textStyle={{ fontSize: 14 }}
                    />
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        // Removed space-between to allow natural flow and prevent forcing overlaps
        paddingVertical: Platform.OS === 'ios' ? 20 : 40,
    },
    visualContainer: {
        alignItems: 'center',
        marginTop: 40, // Explicit top margin
        marginBottom: 20, // Explicit bottom margin
        zIndex: 1,
    },
    statusCard: {
        width: width * 0.85,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20, // Reduced padding slightly
        borderWidth: 3,
        borderColor: '#000000',
        shadowColor: '#000000',
        shadowOffset: { width: 6, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 14, // Slightly smaller
        fontWeight: '900',
        color: '#000000',
        letterSpacing: 1,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 6,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF5252',
    },
    liveText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#666666',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // Reduced gap
        marginVertical: 4, // Add vertical breathing room
    },
    statusIconBg: {
        width: 44,
        height: 44,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    activeIconBg: {
        backgroundColor: '#FFD700',
        borderColor: '#000000',
    },
    statusInfo: {
        flex: 1,
        justifyContent: 'center', // Center text vertically
    },
    statusLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#888888',
        marginBottom: 2,
        textTransform: 'uppercase',
    },
    statusValueOffline: {
        fontSize: 13,
        fontWeight: '900',
        color: '#666666',
    },
    statusValueOnline: {
        fontSize: 13,
        fontWeight: '900',
        color: '#000000',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    textContent: {
        paddingHorizontal: 24,
        marginBottom: 'auto', // Push to top but allow flex
        marginTop: 20,
    },
    stepContainer: {
        backgroundColor: '#F0F0F0',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 16,
        marginTop: 10, // Ensure space from card shadows
    },
    step: {
        fontSize: 12,
        fontWeight: '900',
        color: '#000000',
    },
    title: {
        fontSize: 42, // Slightly smaller to prevent excessive wrapping on small screens
        fontWeight: '900',
        color: '#000000',
        lineHeight: 42,
        letterSpacing: -1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666666',
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 20,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E0E0E0',
    },
    activeDot: {
        backgroundColor: '#000000',
        width: 24,
    },
    fullButton: {
        width: '100%',
        height: 56,
    },
    loginButton: {
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
});
