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
        <Container backgroundColor="#FFD700">
            <StatusBar style="dark" />

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
        justifyContent: 'center', // Centered vertically
        paddingVertical: 24, // Balanced padding
    },
    header: {
        marginBottom: 20, // Tightened
        marginTop: 30, // Increased top margin
    },
    title: {
        fontSize: 40, // Reduced from 48
        fontWeight: '900',
        color: '#000000',
        lineHeight: 40, // Reduced from 48
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
        marginBottom: 16, // Tightened
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
        marginBottom: 16,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#E0E0E0',
    },
    dividerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        paddingHorizontal: 16,
    },
    // ...
    form: {
        marginBottom: 12, // Reduced to bring footer closer
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
