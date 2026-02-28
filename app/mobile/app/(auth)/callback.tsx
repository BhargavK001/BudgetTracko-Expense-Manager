import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Container } from '../../components/Container';

export default function AuthCallback() {
    const router = useRouter();
    const { token, user } = useLocalSearchParams();
    const { completeSocialLogin } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            if (token && user) {
                try {
                    const userData = JSON.parse(user as string);
                    await completeSocialLogin(token as string, userData);

                    // Small delay to ensure state is updated
                    setTimeout(() => {
                        router.replace('/(tabs)');
                    }, 500);
                } catch (error) {
                    console.error('Failed to parse user data during callback', error);
                    router.replace('/(auth)/login');
                }
            } else {
                // If no token/user, redirect back to login
                router.replace('/(auth)/login');
            }
        };

        handleCallback();
    }, [token, user]);

    return (
        <Container backgroundColor="#FFD700">
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.text}>Authenticating...</Text>
                <Text style={styles.subtext}>Just a moment while we sign you in.</Text>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000000',
        marginTop: 20,
        textTransform: 'uppercase',
    },
    subtext: {
        fontSize: 16,
        color: '#333333',
        marginTop: 8,
        fontWeight: '500',
    },
});
