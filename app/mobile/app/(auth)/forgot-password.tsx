import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StatusBar } from 'expo-status-bar';
import Animated, {
    FadeInDown,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPassword() {
    const router = useRouter();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [isSuccess, setIsSuccess] = React.useState(false);

    const handleReset = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await forgotPassword(email);
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container backgroundColor="#F0F0F0">
            <StatusBar style="dark" />

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
                            </TouchableOpacity>

                            <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                                <Text style={styles.title}>RESET</Text>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(300).duration(800)}>
                                <Text style={styles.title}>PASSWORD</Text>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(400)}>
                                <Text style={styles.subtitle}>Enter your email to receive instructions.</Text>
                            </Animated.View>
                        </View>

                        {/* Form */}
                        <Animated.View entering={FadeInDown.delay(500)}>
                            <View style={styles.form}>
                                {isSuccess ? (
                                    <View style={styles.successContainer}>
                                        <MaterialCommunityIcons name="check-circle" size={64} color="#4CAF50" />
                                        <Text style={styles.successText}>Reset link sent!</Text>
                                        <Text style={styles.successSubtext}>Please check your email for instructions.</Text>
                                        <Button
                                            title="Back to Login"
                                            onPress={() => router.push('/(auth)/login')}
                                            style={{ marginTop: 24, width: '100%' }}
                                        />
                                    </View>
                                ) : (
                                    <>
                                        <Input
                                            label="Email Address"
                                            placeholder="username@gmail.com"
                                            icon="email-outline"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={setEmail}
                                        />

                                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                        <Button
                                            title={loading ? "Sending..." : "Send Reset Link"}
                                            onPress={handleReset}
                                            style={{ marginTop: 24 }}
                                            disabled={loading}
                                        />
                                    </>
                                )}
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600)}>
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Remember your password? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                    <Text style={styles.footerLink}>Log In</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Container>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        // Removed justifyContent: 'center'
        paddingVertical: 20,
        paddingBottom: 40,
    },
    header: {
        marginBottom: 32,
        marginTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#000000',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#000000',
        lineHeight: 48,
        letterSpacing: -2,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginTop: 8,
        fontWeight: '500',
    },
    form: {
        marginBottom: 32,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '500',
    },
    footerLink: {
        fontSize: 14,
        color: '#000000',
        fontWeight: '900',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    successText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#000000',
        marginTop: 16,
    },
    successSubtext: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
        marginTop: 8,
    },
});
