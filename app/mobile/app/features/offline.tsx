import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import { MaterialIcons } from '@expo/vector-icons';

export default function OfflineFeature() {
    const router = useRouter();

    return (
        <Container backgroundColor="#FFFFFF">
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialIcons name="cloud-off" size={64} color="#000000" />
                </View>
                <Text style={styles.step}>STEP 04</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>OFFLINE MODE</Text>
                <Text style={styles.description}>
                    No internet? No problem. Track expenses offline and sync automatically when you're back.
                </Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.activeDot]} />
                </View>

                <View style={styles.buttons}>
                    <Button
                        title="Get Started"
                        onPress={() => router.push('/(auth)/signup')}
                        variant="primary"
                        style={styles.fullButton}
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
        borderColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
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
        color: '#000000',
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 18,
        lineHeight: 28,
        color: '#333333',
        fontWeight: '500',
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
        backgroundColor: '#E0E0E0',
        borderWidth: 2,
        borderColor: '#000000',
    },
    activeDot: {
        backgroundColor: '#FFD700',
        width: 32,
    },
    buttons: {
        flexDirection: 'row',
    },
    fullButton: {
        flex: 1,
    },
});
