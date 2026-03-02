import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';

const { width, height } = Dimensions.get('window');
WebBrowser.maybeCompleteAuthSession();

export default function Login() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
        <View style={styles.container}>
            <StatusBar style="dark" />
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
                    <View style={[styles.liBody, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

                        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/welcome')}>
                            <MaterialCommunityIcons name="arrow-left" size={20} color="#111" />
                        </TouchableOpacity>

                        <View style={styles.liHead}>
                            <Text style={styles.h2}>Welcome back 👋</Text>
                            <Text style={styles.p}>Sign in to continue to BudgetTracko.</Text>
                        </View>

                        <View style={styles.ig}>
                            <Text style={styles.il}>Email</Text>
                            <TextInput
                                style={styles.inf}
                                placeholder="rahul@example.com"
                                placeholderTextColor="#C7C7CC"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View style={[styles.ig, { marginBottom: 8 }]}>
                            <Text style={styles.il}>Password</Text>
                            <TextInput
                                style={styles.inf}
                                placeholder="••••••••"
                                placeholderTextColor="#C7C7CC"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                            <Text style={styles.forgot}>Forgot password?</Text>
                        </TouchableOpacity>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity style={styles.btnG} onPress={handleLogin} disabled={loading}>
                            <Text style={styles.btnGText}>{loading ? "Signing In..." : "Sign In"}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.bioBtn}>
                            <MaterialCommunityIcons name="fingerprint" size={20} color="#111" />
                            <Text style={styles.bioBtnText}>Sign in with Biometrics</Text>
                        </TouchableOpacity>

                        <View style={styles.divRow}>
                            <View style={styles.divL} />
                            <Text style={styles.divTxt}>or</Text>
                            <View style={styles.divL} />
                        </View>

                        <View style={styles.socRow}>
                            <TouchableOpacity style={styles.socBtn} onPress={() => handleSocialLogin('google')} disabled={loading}>
                                <Image source={{ uri: 'https://img.icons8.com/color/48/000000/google-logo.png' }} style={{ width: 17, height: 17 }} />
                                <Text style={styles.socBtnText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socBtn} onPress={() => handleSocialLogin('github')} disabled={loading}>
                                <MaterialCommunityIcons name="github" size={17} color="#111" />
                                <Text style={styles.socBtnText}>GitHub</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.spacer} />

                        <View style={styles.liFoot}>
                            <Text style={styles.liFootText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                                <Text style={styles.liFootLink}>Sign up</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    keyboardView: {
        flex: 1,
    },
    liBody: {
        flex: 1,
        paddingHorizontal: 24,
    },
    backBtn: {
        width: 36,
        height: 36,
        backgroundColor: '#F5F5F5',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 22,
    },
    liHead: {
        marginBottom: 28,
    },
    h2: {
        fontSize: 26,
        fontWeight: '800',
        color: '#111',
        letterSpacing: -0.3,
    },
    p: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 5,
    },
    ig: {
        marginBottom: 13,
    },
    il: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3A3A3C',
        marginBottom: 6,
    },
    inf: {
        width: '100%',
        paddingVertical: 14,
        paddingHorizontal: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 13,
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 14,
        color: '#111',
    },
    forgot: {
        textAlign: 'right',
        fontSize: 12,
        fontWeight: '600',
        color: '#2DCA72',
        marginTop: -6,
        marginBottom: 12,
    },
    btnG: {
        width: '100%',
        padding: 16,
        backgroundColor: '#111',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    btnGText: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    bioBtn: {
        width: '100%',
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 10,
    },
    bioBtnText: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 14,
        fontWeight: '600',
        color: '#111',
    },
    divRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 16,
    },
    divL: {
        flex: 1,
        height: 1,
        backgroundColor: '#F2F2F7',
    },
    divTxt: {
        fontSize: 11,
        color: '#C7C7CC',
    },
    socRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    socBtn: {
        flex: 1,
        padding: 13,
        backgroundColor: '#F5F5F5',
        borderRadius: 13,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
    },
    socBtnText: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 13,
        fontWeight: '600',
        color: '#111',
    },
    spacer: {
        flex: 1,
    },
    liFoot: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    liFootText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    liFootLink: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },
    errorText: {
        color: '#F43F5E',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },
});
