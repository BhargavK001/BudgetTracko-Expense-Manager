import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL } from '@/services/api';

const { width } = Dimensions.get('window');
WebBrowser.maybeCompleteAuthSession();

export default function Signup() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { signup, completeSocialLogin } = useAuth();
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleSignup = async () => {
        if (!firstName || !lastName || !email || !password) {
            setError('Please fill in required fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const fullName = `${firstName} ${lastName}`.trim();
            await signup(fullName, email, password);
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
            const redirectUrl = Linking.createURL('auth/callback');
            const authUrl = `${API_BASE_URL}/auth/${provider}?state=mobile&redirect=${encodeURIComponent(redirectUrl)}`;
            const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

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
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

                        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/welcome')}>
                            <MaterialCommunityIcons name="arrow-left" size={20} color="#111" />
                        </TouchableOpacity>

                        <View style={styles.suHead}>
                            <Text style={styles.h2}>Create account</Text>
                            <Text style={styles.p}>Start your journey to financial clarity.</Text>
                        </View>

                        <View style={styles.ig2}>
                            <View style={styles.igHalf}>
                                <Text style={styles.il}>First Name</Text>
                                <TextInput
                                    style={styles.inf}
                                    placeholder="Rahul"
                                    placeholderTextColor="#C7C7CC"
                                    autoCapitalize="words"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                />
                            </View>
                            <View style={[styles.igHalf, { marginLeft: 12 }]}>
                                <Text style={styles.il}>Last Name</Text>
                                <TextInput
                                    style={styles.inf}
                                    placeholder="Sharma"
                                    placeholderTextColor="#C7C7CC"
                                    autoCapitalize="words"
                                    value={lastName}
                                    onChangeText={setLastName}
                                />
                            </View>
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

                        <View style={styles.ig}>
                            <Text style={styles.il}>Phone</Text>
                            <TextInput
                                style={styles.inf}
                                placeholder="+91 98765 43210"
                                placeholderTextColor="#C7C7CC"
                                keyboardType="phone-pad"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <View style={styles.ig}>
                            <Text style={styles.il}>Password</Text>
                            <TextInput
                                style={styles.inf}
                                placeholder="Minimum 8 characters"
                                placeholderTextColor="#C7C7CC"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity style={styles.btnG} onPress={handleSignup} disabled={loading}>
                            <Text style={styles.btnGText}>{loading ? "Creating Account..." : "Create Account"}</Text>
                        </TouchableOpacity>

                        <View style={styles.divRow}>
                            <View style={styles.divL} />
                            <Text style={styles.divTxt}>or continue with</Text>
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

                        <Text style={styles.termsT}>
                            By signing up you agree to our <Text style={styles.termsLink}>Terms of Service</Text> & <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>

                        <View style={styles.ll}>
                            <Text style={styles.llText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                                <Text style={styles.llLink}>Log in</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
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
    scrollContent: {
        flexGrow: 1,
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
    suHead: {
        marginBottom: 26,
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
    ig2: {
        flexDirection: 'row',
        marginBottom: 13,
    },
    igHalf: {
        flex: 1,
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
    btnG: {
        width: '100%',
        padding: 16,
        backgroundColor: '#111',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    btnGText: {
        fontFamily: 'Plus Jakarta Sans',
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
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
    termsT: {
        fontSize: 11.5,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 18,
    },
    termsLink: {
        color: '#111',
        fontWeight: '600',
    },
    ll: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    llText: {
        fontSize: 13,
        color: '#8E8E93',
    },
    llLink: {
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
