import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { StatusBar } from 'expo-status-bar';
import Animated, {
    FadeInDown,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function Login() {
    const router = useRouter();

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
                            <Animated.Text entering={FadeInDown.delay(200).duration(800)} style={styles.title}>
                                WELCOME
                            </Animated.Text>
                            <Animated.Text entering={FadeInDown.delay(300).duration(800)} style={styles.title}>
                                BACK
                            </Animated.Text>
                            <Animated.Text entering={FadeInDown.delay(400)} style={styles.subtitle}>
                                Sign in to continue tracking.
                            </Animated.Text>
                        </View>

                        {/* Social Login */}
                        <Animated.View entering={FadeInDown.delay(500)} style={styles.socialContainer}>
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
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(600)} style={styles.divider}>
                            <View style={styles.line} />
                            <Text style={styles.dividerText}>OR WITH EMAIL</Text>
                            <View style={styles.line} />
                        </Animated.View>

                        {/* Form */}
                        <Animated.View entering={FadeInDown.delay(700)} style={styles.form}>
                            <Input
                                label="Email Address"
                                placeholder="username@gmail.com"
                                icon="email-outline"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Input
                                label="Password"
                                placeholder="Enter password"
                                icon="lock-outline"
                                secureTextEntry
                            />

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>Forgot?</Text>
                            </TouchableOpacity>

                            <Button
                                title="Sign In"
                                onPress={() => router.push('/(tabs)')}
                                style={{ marginTop: 24 }}
                            />
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(800)} style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                <Text style={styles.footerLink}>Sign Up</Text>
                            </TouchableOpacity>
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
        marginBottom: 32,
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
});
