import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// Mock transaction component for animation
const MockTransaction = ({ icon, title, amount, color, delay }: any) => (
    <Animated.View
        entering={FadeInRight.delay(delay).springify().damping(12)}
        style={styles.mockTransaction}
    >
        <View style={[styles.mockIcon, { backgroundColor: color }]}>
            <MaterialCommunityIcons name={icon} size={20} color="#000000" />
        </View>
        <View style={styles.mockContent}>
            <View style={styles.mockLineLong} />
            <View style={styles.mockLineShort} />
        </View>
        <Text style={styles.mockAmount}>{amount}</Text>
    </Animated.View>
);

export default function TrackFeature() {
    const router = useRouter();

    return (
        <Container backgroundColor="#FFFFFF">
            <StatusBar style="dark" />

            <View style={styles.content}>
                {/* Visual Section */}
                <View style={styles.visualContainer}>
                    <View style={styles.phoneMockup}>
                        <View style={styles.phoneNotch} />
                        <View style={styles.phoneScreen}>
                            {/* Header Mock */}
                            <View style={styles.mockHeader}>
                                <View style={styles.mockMenu} />
                                <View style={styles.mockProfile} />
                            </View>

                            {/* Balance Card Mock */}
                            <Animated.View
                                entering={FadeInDown.delay(200).springify()}
                                style={styles.mockCard}
                            >
                                <Text style={styles.mockLabel}>TOTAL BALANCE</Text>
                                <Text style={styles.mockBalance}>$4,250.00</Text>
                            </Animated.View>

                            {/* Transaction List */}
                            <Text style={styles.mockSectionTitle}>Transactions</Text>
                            <View style={styles.transactionList}>
                                <MockTransaction
                                    icon="food"
                                    color="#FFD700"
                                    amount="-$12.00"
                                    delay={400}
                                />
                                <MockTransaction
                                    icon="train-car"
                                    color="#A5F3FC"
                                    amount="-$3.50"
                                    delay={500}
                                />
                                <MockTransaction
                                    icon="shopping"
                                    color="#FCA5A5"
                                    amount="-$45.00"
                                    delay={600}
                                />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                    <Animated.View entering={FadeInUp.delay(300)} style={styles.stepContainer}>
                        <Text style={styles.step}>01 / 04</Text>
                    </Animated.View>

                    <Animated.Text entering={FadeInUp.delay(400)} style={styles.title}>
                        TRACK
                        {'\n'}
                        EVERY PENNY.
                    </Animated.Text>

                    <Animated.Text entering={FadeInUp.delay(500)} style={styles.description}>
                        Log expenses in seconds. Categorize instantly. Know exactly where your money goes.
                    </Animated.Text>
                </View>

                {/* Footer Navigation */}
                <View style={styles.footer}>
                    <Button
                        title="Skip"
                        onPress={() => router.push('/(auth)/login')}
                        variant="outline"
                        style={styles.skipButton}
                        textStyle={{ fontSize: 14 }}
                    />
                    <Button
                        title="Next"
                        onPress={() => router.push('/features/trends')}
                        variant="primary"
                        style={styles.nextButton}
                    />
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        // Removed space-between to allow list-like vertical flow
        paddingVertical: Platform.OS === 'ios' ? 10 : 20, // Reduced padding
    },
    visualContainer: {
        // Removed flex: 1 to prevent excessive spacing
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    phoneMockup: {
        width: width * 0.65, // Reduced from 0.7
        height: width * 0.85, // Reduced from 0.9
        backgroundColor: '#1a1a1a',
        borderRadius: 30,
        borderWidth: 8,
        borderColor: '#1a1a1a',
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    phoneNotch: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        width: '40%',
        height: 20,
        backgroundColor: '#1a1a1a',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        zIndex: 10,
    },
    phoneScreen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 16,
        paddingTop: 30,
    },
    mockHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    mockMenu: {
        width: 24,
        height: 4,
        backgroundColor: '#E5E5E5',
        borderRadius: 2,
    },
    mockProfile: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#E5E5E5',
    },
    mockCard: {
        backgroundColor: '#000000',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    mockLabel: {
        color: '#888888',
        fontSize: 10,
        fontWeight: '700',
        marginBottom: 4,
    },
    mockBalance: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: '900',
    },
    mockSectionTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: '#000000',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    transactionList: {
        gap: 10,
    },
    mockTransaction: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 10,
        borderRadius: 12,
        gap: 10,
    },
    mockIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mockContent: {
        flex: 1,
        gap: 4,
    },
    mockLineLong: {
        width: '60%',
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    mockLineShort: {
        width: '40%',
        height: 6,
        backgroundColor: '#EEEEEE',
        borderRadius: 3,
    },
    mockAmount: {
        fontSize: 12,
        fontWeight: '700',
        color: '#000000',
    },
    textContent: {
        paddingHorizontal: 24,
        marginBottom: 20,
        marginTop: 0, // Reduced from 20
        zIndex: 10,
        // Removed justifyContent: 'flex-end'
    },
    stepContainer: {
        backgroundColor: '#F0F0F0',
        alignSelf: 'flex-start',
        paddingHorizontal: 12, // Increased padding
        paddingVertical: 6,
        borderRadius: 8, // More rounded
        marginBottom: 20,
        borderWidth: 1, // Added border for visibility
        borderColor: '#E0E0E0',
    },
    step: {
        fontSize: 12,
        fontWeight: '900',
        color: '#000000',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#000000',
        lineHeight: 44,
        letterSpacing: -1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666666',
        fontWeight: '500',
        maxWidth: '90%',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16,
        marginBottom: 10,
    },
    skipButton: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: '#F5F5F5',
    },
    nextButton: {
        flex: 2,
    },
});
