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
        <Container backgroundColor="#FFD700">
            <StatusBar style="dark" />

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
        marginBottom: 24,
        marginTop: 30,
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: '#000000',
        lineHeight: 40,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: '#666666',
        marginTop: 8,
        fontWeight: '500',
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderWidth: 2,
        borderColor: '#000000',
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        backgroundColor: '#FFFFFF',
    },
    googleButton: {
        // backgroundColor: '#FFFFFF', // Redundant as socialButton now sets it
    },
    githubButton: {
        backgroundColor: '#000000',
    },
    socialButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000000',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    line: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    dividerText: {
        marginHorizontal: 16,
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(0,0,0,0.5)',
        letterSpacing: 1,
    },
    form: {
        marginBottom: 12,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginTop: -8,
        marginBottom: 8,
    },
    forgotPasswordText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#000000',
        textDecorationLine: 'underline',
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
});
