import React from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import Animated, { FadeInUp, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

// Mock Chart Bar
const ChartBar = ({ height, color, delay, label }: any) => (
    <View style={styles.barContainer}>
        <Animated.View
            entering={FadeInDown.delay(delay).springify().damping(12)}
            style={[styles.bar, { height: height, backgroundColor: color }]}
        />
        <Text style={styles.barLabel}>{label}</Text>
    </View>
);

export default function TrendsFeature() {
    const router = useRouter();

    return (
        <Container backgroundColor="#F0F0F0">
            <StatusBar style="dark" />

            <View style={styles.content}>
                {/* Visual Section */}
                <View style={styles.visualContainer}>
                    <Animated.View
                        entering={ZoomIn.delay(200).springify()}
                        style={styles.chartCard}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.cardTitle}>MONTHLY SPENDING</Text>
                            <View style={styles.cardBadge}>
                                <Text style={styles.cardBadgeText}>-12%</Text>
                            </View>
                        </View>

                        <View style={styles.chartArea}>
                            <ChartBar height={60} color="#E0E0E0" delay={300} label="W1" />
                            <ChartBar height={120} color="#FFD700" delay={400} label="W2" />
                            <ChartBar height={90} color="#1a1a1a" delay={500} label="W3" />
                            <ChartBar height={40} color="#E0E0E0" delay={600} label="W4" />
                        </View>

                        <View style={styles.legendContainer}>
                            <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
                            <Text style={styles.legendText}>Food</Text>
                            <View style={[styles.legendDot, { backgroundColor: '#1a1a1a' }]} />
                            <Text style={styles.legendText}>Transport</Text>
                        </View>
                    </Animated.View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                    <Animated.View entering={FadeInUp.delay(300)} style={styles.stepContainer}>
                        <Text style={styles.step}>02 / 04</Text>
                    </Animated.View>

                    <Animated.Text entering={FadeInUp.delay(400)} style={styles.title}>
                        SPOT
                        {'\n'}
                        BAD HABITS.
                    </Animated.Text>

                    <Animated.Text entering={FadeInUp.delay(500)} style={styles.description}>
                        Visualize where your money goes. Cut wasteful spending and save more every month.
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
                        onPress={() => router.push('/features/security')}
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
        // Removed space-between
        paddingVertical: Platform.OS === 'ios' ? 20 : 40,
    },
    visualContainer: {
        // Removed flex: 1
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    chartCard: {
        width: width * 0.8,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 4,
        borderColor: '#000000',
        shadowColor: '#000000',
        shadowOffset: { width: 8, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 0,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#000000',
    },
    cardBadge: {
        backgroundColor: '#4ADE80',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#000000',
    },
    cardBadgeText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#000000',
    },
    chartArea: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 150,
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 10,
    },
    barContainer: {
        alignItems: 'center',
        gap: 8,
    },
    bar: {
        width: 32,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#000000',
    },
    barLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#888888',
    },
    legendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#000000',
    },
    legendText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666666',
        marginRight: 8,
    },
    textContent: {
        paddingHorizontal: 24,
        marginBottom: 30,
        marginTop: 0,
    },
    stepContainer: {
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
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
        backgroundColor: 'transparent',
    },
    nextButton: {
        flex: 2,
    },
});
