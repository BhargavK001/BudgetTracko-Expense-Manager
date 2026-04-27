import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, BounceIn } from 'react-native-reanimated';

type ErrorFallbackProps = {
    message?: string;
    onRetry?: () => void;
};

export default function ErrorFallback({
    message = 'Something went wrong. Please check your connection and try again.',
    onRetry,
}: ErrorFallbackProps) {
    return (
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
            <Animated.View entering={BounceIn.delay(100).duration(500)} style={styles.iconWrap}>
                <Ionicons name="cloud-offline-outline" size={48} color="#F43F5E" />
            </Animated.View>

            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>{message}</Text>

            {onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
                    <Ionicons name="refresh-outline" size={18} color="#fff" />
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    iconWrap: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: 'rgba(244,63,94,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(244,63,94,0.15)',
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111',
        marginBottom: 8,
    },
    message: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 280,
        marginBottom: 32,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    retryText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#fff',
    },
});
