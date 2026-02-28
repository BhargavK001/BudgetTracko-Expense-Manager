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

export default function Signup() {
    const router = useRouter();
    const { signup } = useAuth();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await signup(name, email, password);
            router.replace('/(tabs)');
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
                    <View style={styles.content}>
                        <View style={styles.header}>
                            <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                                <Text style={styles.title}>CREATE</Text>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(300).duration(800)}>
                                <Text style={styles.title}>ACCOUNT</Text>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(400)}>
                                <Text style={styles.subtitle}>
                                    Start your financial journey today.
                                </Text>
                            </Animated.View>
                        </View>

                        {/* Social Login */}
                        <Animated.View entering={FadeInDown.delay(500)}>
                            <View style={styles.socialContainer}>
                                <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
                                    <Image
                                        source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }}
                                        style={{ width: 24, height: 24 }}
                                    />
                                    <Text style={styles.socialButtonText}>Google</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.socialButton, styles.githubButton]}>
                                    <MaterialCommunityIcons name="github" size={24} color="#FFFFFF" />
                                    <Text style={[styles.socialButtonText, { color: '#FFFFFF' }]}>GitHub</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600)}>
                            <View style={styles.divider}>
                                <View style={styles.line} />
                                <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
                                <View style={styles.line} />
                            </View>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View entering={FadeInDown.delay(700)}>
                            <View style={styles.form}>
                                <Input
                                    label="Full Name"
                                    placeholder="John Doe"
                                    icon="account-outline"
                                    autoCapitalize="words"
                                    value={name}
                                    onChangeText={setName}
                                />
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
                                    placeholder="Create a password"
                                    icon="lock-outline"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <Button
                                    title={loading ? "Creating Account..." : "Sign Up"}
                                    onPress={handleSignup}
                                    style={{ marginTop: 16 }}
                                    disabled={loading}
                                />
                            </View>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(800)}>
                            <View style={styles.footer}>
                                <Text style={styles.footerText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                    <Text style={styles.footerLink}>Log In</Text>
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
        paddingVertical: 24,
    },
    header: {
        marginBottom: 24,
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
        marginBottom: 16,
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
        marginBottom: 16,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#1E2D4F',
    },
    dividerText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#475569',
        paddingHorizontal: 16,
        letterSpacing: 0.6,
    },
    form: {
        marginBottom: 12,
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
