import React, { useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, StatusBar, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function RazorpayCheckoutScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { refreshUser } = useAuth();
    const params = useLocalSearchParams<{
        subscriptionId: string;
        key: string;
        planName: string;
        amount: string;
        email: string;
        name: string;
    }>();

    const [isLoading, setIsLoading] = useState(true);
    const webviewRef = useRef<WebView>(null);

    const checkoutHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                background: #F8FAFC;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                display: flex; justify-content: center; align-items: center;
                min-height: 100vh; padding: 20px;
            }
            .loading {
                text-align: center; color: #64748B;
            }
            .loading h2 { font-size: 18px; margin-bottom: 8px; color: #111; }
            .loading p { font-size: 14px; }
            .spinner {
                width: 40px; height: 40px; border: 4px solid #E2E8F0;
                border-top-color: #6366F1; border-radius: 50%;
                animation: spin 0.8s linear infinite; margin: 0 auto 16px;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div class="loading">
            <div class="spinner"></div>
            <h2>Opening Payment</h2>
            <p>Razorpay checkout is loading...</p>
        </div>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
            var options = {
                key: '${params.key}',
                subscription_id: '${params.subscriptionId}',
                name: 'BudgetTracko',
                description: '${params.planName || 'Pro'} Plan Subscription',
                prefill: {
                    email: '${params.email || ''}',
                    name: '${params.name || ''}'
                },
                theme: {
                    color: '#6366F1'
                },
                modal: {
                    escape: false,
                    confirm_close: true,
                    ondismiss: function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'dismissed' }));
                    }
                },
                handler: function(response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        event: 'success',
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_subscription_id: response.razorpay_subscription_id,
                        razorpay_signature: response.razorpay_signature
                    }));
                }
            };

            try {
                var rzp = new Razorpay(options);
                rzp.on('payment.failed', function(response) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                        event: 'failed',
                        error: response.error.description || 'Payment failed'
                    }));
                });
                rzp.open();
            } catch(e) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    event: 'error',
                    error: e.message || 'Failed to initialize checkout'
                }));
            }
        </script>
    </body>
    </html>
    `;

    const handleMessage = async (event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.event === 'success') {
                // Verify payment with backend
                try {
                    const verifyRes = await api.post('/api/payments/verify', {
                        razorpay_payment_id: data.razorpay_payment_id,
                        razorpay_subscription_id: data.razorpay_subscription_id,
                        razorpay_signature: data.razorpay_signature,
                    });

                    if (verifyRes.data?.success) {
                        await refreshUser();
                        Alert.alert(
                            '🎉 Welcome to Pro!',
                            'Your subscription is now active. Enjoy all premium features!',
                            [{ text: 'Awesome!', onPress: () => router.dismiss(2) }]
                        );
                    } else {
                        Alert.alert('Verification Failed', 'Payment received but verification failed. Contact support.',
                            [{ text: 'OK', onPress: () => router.back() }]);
                    }
                } catch (e: any) {
                    Alert.alert('Error', 'Payment verification failed. Please contact support.',
                        [{ text: 'OK', onPress: () => router.back() }]);
                }
            } else if (data.event === 'failed') {
                Alert.alert('Payment Failed', data.error || 'Something went wrong.',
                    [{ text: 'OK', onPress: () => router.back() }]);
            } else if (data.event === 'dismissed') {
                router.back();
            } else if (data.event === 'error') {
                Alert.alert('Error', data.error || 'Could not open checkout.',
                    [{ text: 'OK', onPress: () => router.back() }]);
            }
        } catch (e) {
            // Non-JSON message, ignore
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="close" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Complete Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <WebView
                ref={webviewRef}
                source={{ html: checkoutHTML }}
                onMessage={handleMessage}
                onLoadEnd={() => setIsLoading(false)}
                style={styles.webview}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
                originWhitelist={['*']}
                mixedContentMode="always"
                renderLoading={() => (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#6366F1" />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 14,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F2F7',
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    webview: { flex: 1 },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
});
