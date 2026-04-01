import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
    const router = useRouter();
    const { token, user } = useLocalSearchParams();
    const { completeSocialLogin } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            if (token && user) {
                try {
                    const userData = JSON.parse(decodeURIComponent(user as string));
                    await completeSocialLogin(token as string, userData);

                    setTimeout(() => {
                        router.replace('/(tabs)');
                    }, 500);
                } catch (error) {
                    console.error('Failed to parse user data during callback', error);
                    router.replace('/(auth)/login');
                }
            } else {
                router.replace('/(auth)/login');
            }
        };

        handleCallback();
    }, [token, user]);

    return (
        <View style={styles.container}>
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#111" />
                <Text style={styles.text}>Signing you in...</Text>
                <Text style={styles.subtext}>Just a moment.</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginTop: 20,
    },
    subtext: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 6,
    },
});
