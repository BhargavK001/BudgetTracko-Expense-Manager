import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StatusBar } from 'expo-status-bar';
import Animated, {
    FadeInDown,
    FadeInUp,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '@/services/api';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const router = useRouter();
    const { login, completeSocialLogin } = useAuth();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await login(email, password);
            router.replace('/(tabs)');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setLoading(true);
        setError('');
        try {
            const authUrl = `${API_BASE_URL}/auth/${provider}?state=mobile`;

            const result = await WebBrowser.openAuthSessionAsync(authUrl, 'budgettracko://auth/callback');

            if (result.type === 'success' && result.url) {
                const { queryParams } = Linking.parse(result.url);
                if (queryParams?.token && queryParams?.user) {
                    const token = queryParams.token as string;
                    const user = JSON.parse(queryParams.user as string);
                    await completeSocialLogin(token, user);
                    router.replace('/(tabs)');
                }
            }
        } catch (err: any) {
            setError(`Social login failed: ${err.message}`);
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
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Animated.View entering={FadeInUp.delay(200).duration(1000)}>
                                <Text style={styles.title}>WELCOME BACK</Text>
                            </Animated.View>
                            <Animated.View entering={FadeInUp.delay(400).duration(1000)}>
                                <Text style={styles.subtitle}>
                                    Sign in to continue managing your expenses.
                                </Text>
                            </Animated.View>
                        </View>

                        {/* Social Login */}
                        <Animated.View entering={FadeInDown.delay(500)}>
                            <View style={styles.socialContainer}>
                                <TouchableOpacity
                                    style={[styles.socialButton, styles.googleButton]}
                                    onPress={() => handleSocialLogin('google')}
                                    disabled={loading}
                                >
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
                                        style={{ width: 24, height: 24 }}
                                    />
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.socialButton, styles.githubButton]}
                                    onPress={() => handleSocialLogin('github')}
                                    disabled={loading}
                                >
                                    <MaterialCommunityIcons name="github" size={24} color="#FFFFFF" />
                                    <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>GitHub</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600)}>
                            <View style={styles.divider}>
                                <View style={styles.line} />
                                <Text style={styles.dividerText}>OR WITH EMAIL</Text>
                                <View style={styles.line} />
                            </View>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View entering={FadeInDown.delay(700)}>
                            <View style={styles.form}>
                                <Input
                                    label="Email Address"
                                    placeholder="username@gmail.com"
                                    icon="email-outline"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                                <Input
                                    label="Password"
                                    placeholder="Enter password"
                                    icon="lock-outline"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/(auth)/forgot-password')}>
                                    <Text style={styles.forgotPasswordText}>Forgot?</Text>
                                </TouchableOpacity>

                                <Button
                                    title={loading ? "Signing In..." : "Sign In"}
                                    onPress={handleLogin}
                                    style={{ marginTop: 24 }}
                                    disabled={loading}
                                />
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(800)}>
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                    <Text style={styles.footerLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </Container>
    );
}

const styles = StyleSheet.create({
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    header: {
        marginBottom: 32,
        marginTop: 20,
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
    socialContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#1E2D4F',
        borderRadius: 14,
        gap: 8,
        backgroundColor: '#0D1630',
    },
    googleButton: {},
    githubButton: {
        backgroundColor: '#0D1630',
    },
    socialButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#F1F5F9',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#1E2D4F',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        letterSpacing: 0.8,
    },
    form: {
        marginBottom: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -4,
        marginBottom: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
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
});
