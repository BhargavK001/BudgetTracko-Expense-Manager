import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, Keyboard,
    TouchableWithoutFeedback, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPassword() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { forgotPassword } = useAuth();
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    const handleReset = async () => {
        if (!email.trim()) { setError('Please enter your email address'); return; }
        setLoading(true);
        setError('');
        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar style="dark" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.kav}
                >
                    {/* ── Success state ── */}
                    {success ? (
                        <View style={styles.body}>
                            {/* Back */}
                            <Animated.View entering={FadeInDown.delay(60).duration(400)}>
                                <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(auth)/login')}>
                                    <MaterialCommunityIcons name="arrow-left" size={20} color="#111" />
                                </TouchableOpacity>
                            </Animated.View>

                            <View style={styles.successWrap}>
                                {/* Animated check circle */}
                                <Animated.View entering={ZoomIn.delay(100).duration(500).springify()} style={styles.checkCircle}>
                                    <MaterialCommunityIcons name="check-bold" size={36} color="#fff" />
                                </Animated.View>

                                <Animated.Text entering={FadeInUp.delay(280).duration(440)} style={styles.successH}>
                                    Check your inbox
                                </Animated.Text>
                                <Animated.Text entering={FadeInUp.delay(360).duration(440)} style={styles.successP}>
                                    We've sent a password reset link to{'\n'}
                                    <Text style={styles.successEmail}>{email}</Text>
                                </Animated.Text>

                                <Animated.View entering={FadeInUp.delay(460).duration(420)} style={styles.infoBox}>
                                    <MaterialCommunityIcons name="information-outline" size={16} color="#8E8E93" />
                                    <Text style={styles.infoTxt}>The link expires in 15 minutes. Check your spam folder if you don't see it.</Text>
                                </Animated.View>

                                <Animated.View entering={FadeInUp.delay(560).duration(420)} style={styles.successBtns}>
                                    <TouchableOpacity style={styles.btnDark} onPress={() => router.push('/(auth)/login')}>
                                        <Text style={styles.btnDarkTxt}>Back to Log In</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.btnLight} onPress={() => { setSuccess(false); setEmail(''); }}>
                                        <Text style={styles.btnLightTxt}>Try a different email</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            </View>
                        </View>
                    ) : (
                        /* ── Email form state ── */
                        <View style={styles.body}>
                            {/* Back */}
                            <Animated.View entering={FadeInDown.delay(60).duration(400)}>
                                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                                    <MaterialCommunityIcons name="arrow-left" size={20} color="#111" />
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Icon badge */}
                            <Animated.View entering={ZoomIn.delay(100).duration(480).springify()} style={styles.iconBadge}>
                                <MaterialCommunityIcons name="lock-reset" size={28} color="#111" />
                            </Animated.View>

                            {/* Heading */}
                            <Animated.View entering={FadeInDown.delay(200).duration(440)} style={styles.headWrap}>
                                <Text style={styles.h1}>Forgot password?</Text>
                                <Text style={styles.p}>No worries — enter your email and we'll send you a reset link.</Text>
                            </Animated.View>

                            {/* Email field */}
                            <Animated.View entering={FadeInDown.delay(300).duration(420)} style={styles.ig}>
                                <Text style={styles.il}>Email address</Text>
                                <View style={styles.infRow}>
                                    <MaterialCommunityIcons name="email-outline" size={18} color="#C7C7CC" style={styles.infIcon} />
                                    <TextInput
                                        style={styles.inf}
                                        placeholder="rahul@example.com"
                                        placeholderTextColor="#C7C7CC"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={email}
                                        onChangeText={t => { setEmail(t); setError(''); }}
                                    />
                                </View>
                            </Animated.View>

                            {/* Error */}
                            {!!error && (
                                <Animated.Text entering={FadeInDown.duration(300)} style={styles.errTxt}>
                                    {error}
                                </Animated.Text>
                            )}

                            {/* CTA */}
                            <Animated.View entering={FadeInDown.delay(380).duration(420)}>
                                <TouchableOpacity style={styles.btnDark} onPress={handleReset} disabled={loading}>
                                    <Text style={styles.btnDarkTxt}>{loading ? 'Sending link…' : 'Send Reset Link'}</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Divider / hints */}
                            <Animated.View entering={FadeInDown.delay(460).duration(420)} style={styles.hintBox}>
                                <MaterialCommunityIcons name="shield-check-outline" size={15} color="#2DCA72" />
                                <Text style={styles.hintTxt}>The link expires in 15 minutes and can only be used once.</Text>
                            </Animated.View>

                            {/* Footer */}
                            <Animated.View entering={FadeInUp.delay(520).duration(400)} style={styles.footer}>
                                <Text style={styles.footTxt}>Remember your password? </Text>
                                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                    <Text style={styles.footLink}>Log In</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    kav: { flex: 1 },
    body: { flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 36 },

    backBtn: {
        width: 36, height: 36, backgroundColor: '#F5F5F5',
        borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 28,
    },

    /* Icon badge (form state) */
    iconBadge: {
        width: 64, height: 64, backgroundColor: '#F5F5F5',
        borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },

    /* Heading */
    headWrap: { marginBottom: 30 },
    h1: { fontSize: 26, fontWeight: '800', color: '#111', letterSpacing: -0.3 },
    p: { fontSize: 14, color: '#8E8E93', marginTop: 6, lineHeight: 22 },

    /* Input */
    ig: { marginBottom: 14 },
    il: { fontSize: 12, fontWeight: '600', color: '#3A3A3C', marginBottom: 7 },
    infRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', borderRadius: 13,
        paddingHorizontal: 14, paddingVertical: 14,
    },
    infIcon: { marginRight: 10 },
    inf: { flex: 1, fontSize: 14, color: '#111' },

    errTxt: { color: '#F43F5E', fontSize: 12, fontWeight: '600', marginBottom: 14, textAlign: 'center' },

    /* Buttons */
    btnDark: {
        width: '100%', padding: 16, backgroundColor: '#111',
        borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4,
    },
    btnDarkTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
    btnLight: {
        width: '100%', padding: 15, backgroundColor: '#F5F5F5',
        borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 10,
    },
    btnLightTxt: { fontSize: 14, fontWeight: '600', color: '#111' },

    /* Hint row */
    hintBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: 'rgba(45,202,114,0.07)', borderRadius: 12,
        paddingVertical: 12, paddingHorizontal: 14, marginTop: 16,
    },
    hintTxt: { flex: 1, fontSize: 12, color: '#3A3A3C', lineHeight: 18 },

    /* Footer */
    footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 'auto', paddingTop: 20 },
    footTxt: { fontSize: 13, color: '#8E8E93' },
    footLink: { fontSize: 13, fontWeight: '700', color: '#111' },

    /* ── Success state ── */
    successWrap: { flex: 1, justifyContent: 'center', paddingBottom: 40 },
    checkCircle: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#2DCA72', alignItems: 'center', justifyContent: 'center',
        alignSelf: 'center', marginBottom: 26,
        shadowColor: '#2DCA72', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35, shadowRadius: 18, elevation: 12,
    },
    successH: { fontSize: 26, fontWeight: '800', color: '#111', textAlign: 'center', letterSpacing: -0.3 },
    successP: { fontSize: 14, color: '#8E8E93', textAlign: 'center', lineHeight: 23, marginTop: 10, marginBottom: 24 },
    successEmail: { fontWeight: '700', color: '#111' },
    infoBox: {
        flexDirection: 'row', alignItems: 'flex-start', gap: 8,
        backgroundColor: '#F5F5F5', borderRadius: 12,
        paddingVertical: 12, paddingHorizontal: 14, marginBottom: 28,
    },
    infoTxt: { flex: 1, fontSize: 12, color: '#8E8E93', lineHeight: 18 },
    successBtns: { gap: 0 },
});
