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
        <Container>
            <StatusBar style="light" />

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
                                <MaterialCommunityIcons name="arrow-left" size={24} color="#F1F5F9" />
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
                                        <MaterialCommunityIcons name="check-circle" size={64} color="#10B981" />
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
        backgroundColor: '#0D1630',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#1E2D4F',
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#F1F5F9',
        lineHeight: 40,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        color: '#94A3B8',
        marginTop: 8,
        fontWeight: '400',
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
        color: '#94A3B8',
        fontWeight: '400',
    },
    footerLink: {
        fontSize: 14,
        color: '#A5B4FC',
        fontWeight: '700',
    },
    errorText: {
        color: '#F43F5E',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
        textAlign: 'center',
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    successText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#F1F5F9',
        marginTop: 16,
    },
    successSubtext: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 8,
    },
});
