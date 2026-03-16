import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, StatusBar,
    Image, ActivityIndicator, Alert, ScrollView, Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    FadeIn, FadeInDown, FadeInUp,
    useSharedValue, useAnimatedStyle,
    withRepeat, withTiming, withSequence,
    Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
    extractTextFromImage, parseBillText,
    formatLineItemsAsNotes, BillParseResult,
} from '@/services/ocrService';
import { useQuickAction, ScanData } from '@/context/QuickActionContext';
import { useSettings } from '@/context/SettingsContext';

type ScanPhase = 'idle' | 'processing' | 'result';

export default function ScanScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { openModal } = useQuickAction();

    const [phase, setPhase] = useState<ScanPhase>('idle');
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [ocrResult, setOcrResult] = useState<BillParseResult | null>(null);
    const { formatCurrency } = useSettings();
    const [processingText, setProcessingText] = useState('Analyzing bill…');

    // Scan line animation for idle state
    const scanLineY = useSharedValue(0);
    React.useEffect(() => {
        scanLineY.value = withRepeat(
            withSequence(
                withTiming(260, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            ), -1, false,
        );
    }, []);
    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    // ── Capture / Pick ──────────────────────────────────────
    const captureFromCamera = useCallback(async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera access is required to scan bills.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            quality: 0.85,
            allowsEditing: false,
        });
        if (!result.canceled && result.assets?.[0]) {
            processImage(result.assets[0].uri);
        }
    }, []);

    const pickFromGallery = useCallback(async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Gallery access is required.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            quality: 0.85,
            allowsEditing: false,
        });
        if (!result.canceled && result.assets?.[0]) {
            processImage(result.assets[0].uri);
        }
    }, []);

    // ── OCR Processing ──────────────────────────────────────
    const processImage = async (uri: string) => {
        setCapturedUri(uri);
        setPhase('processing');
        setProcessingText('Reading text from bill…');

        try {
            const rawText = await extractTextFromImage(uri);
            setProcessingText('Extracting details…');

            const parsed = parseBillText(rawText);
            setOcrResult(parsed);
            setPhase('result');
        } catch (err: any) {
            Alert.alert('OCR Failed', err.message || 'Could not read the bill. Try a clearer image.');
            setPhase('idle');
        }
    };

    // ── Use Result: Open Modal ──────────────────────────────
    const useResult = () => {
        if (!ocrResult || !capturedUri) return;

        const scan: ScanData = {
            title: ocrResult.merchantName || '',
            amount: ocrResult.totalAmount > 0 ? String(ocrResult.totalAmount) : '',
            notes: formatLineItemsAsNotes(ocrResult.lineItems, formatCurrency(0).charAt(0)),
            date: ocrResult.date || new Date(),
            category: ocrResult.detectedCategory,
            attachments: [capturedUri],
        };

        router.back();
        setTimeout(() => openModal('expense', scan), 300);
    };

    const retryCapture = () => {
        setPhase('idle');
        setCapturedUri(null);
        setOcrResult(null);
    };

    // ── Render: Idle ────────────────────────────────────────
    const renderIdle = () => (
        <>
            {/* Camera Preview Placeholder */}
            <View style={styles.cameraPlaceholder}>
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.scanFrameContainer}>
                    <View style={styles.scanFrame}>
                        <View style={[styles.bracket, styles.topLeft]} />
                        <View style={[styles.bracket, styles.topRight]} />
                        <View style={[styles.bracket, styles.bottomLeft]} />
                        <View style={[styles.bracket, styles.bottomRight]} />
                        <Animated.View style={[styles.scanLine, scanLineStyle]} />
                    </View>
                </View>

                <Animated.View entering={FadeIn.delay(500)} style={styles.overlayTextContainer}>
                    <MaterialCommunityIcons name="receipt-text-outline" size={32} color="#2DCA72" style={{ marginBottom: 12 }} />
                    <Text style={styles.overlayTitle}>Scan Your Bill</Text>
                    <Text style={styles.overlaySubTitle}>
                        Take a photo or pick from gallery to auto-extract expense details
                    </Text>
                </Animated.View>
            </View>

            {/* Bottom Controls */}
            <Animated.View entering={FadeInDown.delay(300)} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.controlBtn} onPress={pickFromGallery}>
                    <View style={styles.controlIconWrap}>
                        <MaterialCommunityIcons name="image-outline" size={22} color="#fff" />
                    </View>
                    <Text style={styles.controlText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mainScanBtn} onPress={captureFromCamera} activeOpacity={0.85}>
                    <View style={styles.mainScanBtnInner}>
                        <MaterialCommunityIcons name="camera" size={30} color="#111" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={captureFromCamera}>
                    <View style={styles.controlIconWrap}>
                        <MaterialCommunityIcons name="flashlight" size={22} color="#fff" />
                    </View>
                    <Text style={styles.controlText}>Flash</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    );

    // ── Render: Processing ──────────────────────────────────
    const renderProcessing = () => (
        <View style={styles.processingContainer}>
            {capturedUri && (
                <Animated.View entering={FadeIn} style={styles.previewWrap}>
                    <Image source={{ uri: capturedUri }} style={styles.previewImage} />
                    <View style={styles.previewOverlay}>
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={StyleSheet.absoluteFill}
                        />
                    </View>
                </Animated.View>
            )}
            <Animated.View entering={FadeInUp.delay(200)} style={styles.processingCard}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.processingTitle}>{processingText}</Text>
                <Text style={styles.processingSub}>This may take a few seconds</Text>
            </Animated.View>
        </View>
    );

    // ── Render: Result ──────────────────────────────────────
    const renderResult = () => (
        <ScrollView style={styles.resultScroll} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 100 }}>
            {/* Bill Image */}
            {capturedUri && (
                <Animated.View entering={FadeInDown.delay(100)} style={styles.resultImageWrap}>
                    <Image source={{ uri: capturedUri }} style={styles.resultImage} />
                    <View style={styles.resultImageBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#2DCA72" />
                        <Text style={styles.resultImageBadgeText}>Scanned</Text>
                    </View>
                </Animated.View>
            )}

            {/* Extracted Data */}
            <Animated.View entering={FadeInDown.delay(200)} style={styles.resultCard}>
                <Text style={styles.resultCardTitle}>Extracted Details</Text>

                <View style={styles.resultRow}>
                    <View style={styles.resultLabelWrap}>
                        <Ionicons name="storefront-outline" size={16} color="#8E8E93" />
                        <Text style={styles.resultLabel}>Merchant</Text>
                    </View>
                    <Text style={styles.resultValue}>{ocrResult?.merchantName || 'Not found'}</Text>
                </View>

                <View style={styles.resultDivider} />

                <View style={styles.resultRow}>
                    <View style={styles.resultLabelWrap}>
                        <Ionicons name="cash-outline" size={16} color="#8E8E93" />
                        <Text style={styles.resultLabel}>Total Amount</Text>
                    </View>
                    <Text style={[styles.resultValue, styles.resultAmount]}>
                        {formatCurrency(ocrResult?.totalAmount || 0)}
                    </Text>
                </View>

                <View style={styles.resultDivider} />

                <View style={styles.resultRow}>
                    <View style={styles.resultLabelWrap}>
                        <Ionicons name="calendar-outline" size={16} color="#8E8E93" />
                        <Text style={styles.resultLabel}>Date</Text>
                    </View>
                    <Text style={styles.resultValue}>
                        {ocrResult?.date
                            ? ocrResult.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'Today'}
                    </Text>
                </View>

                {ocrResult?.detectedCategory && (
                    <>
                        <View style={styles.resultDivider} />
                        <View style={styles.resultRow}>
                            <View style={styles.resultLabelWrap}>
                                <Ionicons name="pricetag-outline" size={16} color="#8E8E93" />
                                <Text style={styles.resultLabel}>Category</Text>
                            </View>
                            <Text style={[styles.resultValue, { color: '#06B6D4' }]}>
                                {ocrResult.detectedCategory}
                            </Text>
                        </View>
                    </>
                )}

            </Animated.View>

            {/* Line Items */}
            {ocrResult && ocrResult.lineItems.length > 0 && (
                <Animated.View entering={FadeInDown.delay(300)} style={styles.resultCard}>
                    <Text style={styles.resultCardTitle}>Items Found</Text>
                    {ocrResult.lineItems.map((item, i) => (
                        <View key={i} style={[styles.itemRow, i > 0 && { borderTopWidth: 1, borderTopColor: '#F2F2F7' }]}>
                            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                            <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
                        </View>
                    ))}
                </Animated.View>
            )}

            {/* Actions */}
            <Animated.View entering={FadeInDown.delay(400)} style={styles.resultActions}>
                <TouchableOpacity style={styles.useBtn} onPress={useResult} activeOpacity={0.85}>
                    <LinearGradient colors={['#111', '#1a1a2e']} style={styles.useBtnGradient}>
                        <Ionicons name="add-circle-outline" size={20} color="#fff" />
                        <Text style={styles.useBtnText}>Add as Expense</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.retryBtn} onPress={retryCapture} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="camera-retake-outline" size={18} color="#8E8E93" />
                    <Text style={styles.retryBtnText}>Scan Again</Text>
                </TouchableOpacity>
            </Animated.View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {phase === 'idle' ? 'Bill Scanner' : phase === 'processing' ? 'Processing…' : 'Review'}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            {phase === 'idle' && renderIdle()}
            {phase === 'processing' && renderProcessing()}
            {phase === 'result' && renderResult()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },

    // ── Idle ──
    cameraPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scanFrameContainer: { width: 280, height: 280, position: 'relative' },
    scanFrame: {
        flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        position: 'relative', overflow: 'hidden',
    },
    bracket: {
        position: 'absolute', width: 28, height: 28,
        borderColor: '#2DCA72', borderTopWidth: 4, borderLeftWidth: 4,
    },
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0, transform: [{ rotate: '90deg' }] },
    bottomLeft: { bottom: 0, left: 0, transform: [{ rotate: '-90deg' }] },
    bottomRight: { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] },
    scanLine: {
        height: 2, backgroundColor: '#2DCA72', width: '100%',
        shadowColor: '#2DCA72', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 10,
    },
    overlayTextContainer: {
        position: 'absolute', top: '68%', alignItems: 'center', width: '100%', paddingHorizontal: 40,
    },
    overlayTitle: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 8 },
    overlaySubTitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 20 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    controlBtn: { alignItems: 'center', gap: 6 },
    controlIconWrap: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },
    controlText: { fontSize: 11, color: '#fff', fontWeight: '600' },
    mainScanBtn: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: 'rgba(255,255,255,0.2)', padding: 6,
    },
    mainScanBtnInner: {
        flex: 1, borderRadius: 32, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },

    // ── Processing ──
    processingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    previewWrap: { ...StyleSheet.absoluteFillObject },
    previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    previewOverlay: { ...StyleSheet.absoluteFillObject },
    processingCard: {
        backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 24, padding: 36,
        alignItems: 'center', gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    processingTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
    processingSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },

    // ── Result ──
    resultScroll: { flex: 1, backgroundColor: '#F9F9FB', marginTop: 90 },
    resultImageWrap: {
        width: '100%', height: 200, borderRadius: 16, overflow: 'hidden',
        marginBottom: 16, backgroundColor: '#E5E5EA',
    },
    resultImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    resultImageBadge: {
        position: 'absolute', top: 12, right: 12,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 12,
    },
    resultImageBadgeText: { color: '#2DCA72', fontSize: 11, fontWeight: '700' },

    resultCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 18,
        marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    resultCardTitle: { fontSize: 15, fontWeight: '800', color: '#111', marginBottom: 16 },
    resultRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 8,
    },
    resultLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    resultLabel: { fontSize: 14, color: '#8E8E93', fontWeight: '600' },
    resultValue: { fontSize: 14, fontWeight: '700', color: '#111' },
    resultAmount: { fontSize: 18, fontWeight: '900', color: '#F43F5E' },
    resultDivider: { height: 1, backgroundColor: '#F2F2F7' },

    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 10,
    },
    itemName: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500', marginRight: 12 },
    itemPrice: { fontSize: 14, fontWeight: '700', color: '#111' },

    resultActions: { gap: 12, marginTop: 4 },
    useBtn: { borderRadius: 16, overflow: 'hidden' },
    useBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16,
    },
    useBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 14,
        backgroundColor: '#fff', borderRadius: 16,
        borderWidth: 1, borderColor: '#E5E5EA',
    },
    retryBtnText: { fontSize: 15, fontWeight: '700', color: '#8E8E93' },
});
