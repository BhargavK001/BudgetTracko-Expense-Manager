import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import { MaterialIcons } from '@expo/vector-icons';

export default function SecurityFeature() {
    const router = useRouter();

    return (
        <Container backgroundColor="#000000">
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="security" size={64} color="#000000" />
                </View>
                <Text style={[styles.step, styles.lightText]}>STEP 03</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, styles.yellowText]}>SECURE DATA</Text>
                <Text style={[styles.description, styles.lightText]}>
                    Bank-grade encryption. 100% Private. We never sell your data to advertisers.
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.activeDot]} />
                    <View style={styles.dot} />
                </View>

                <View style={styles.buttons}>
                    <Button
                        title="Skip"
                        onPress={() => router.push('/(auth)/login')}
                        variant="outline"
                        style={[styles.skipButton, { borderColor: '#FFFFFF' }]}
                        textStyle={{ color: '#FFFFFF' }}
                    />
                    <Button
                        title="Next"
                        onPress={() => router.push('/features/offline')}
                        variant="secondary"
                        style={styles.nextButton}
                    />
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        backgroundColor: '#FFD700',
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 0,
    },
    step: {
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 2,
        marginTop: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 18,
        lineHeight: 28,
        fontWeight: '500',
    },
    yellowText: {
        color: '#FFD700',
    },
    lightText: {
        color: '#FFFFFF',
    },
    footer: {
        paddingVertical: 24,
    },
    pagination: {
        flexDirection: 'row',
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#333333',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    activeDot: {
        backgroundColor: '#FFD700',
        width: 32,
        borderColor: '#FFD700',
    },
    buttons: {
        flexDirection: 'row',
        gap: 16,
    },
    skipButton: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    nextButton: {
        flex: 1,
    },
});
