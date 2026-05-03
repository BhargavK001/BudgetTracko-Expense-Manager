import React, { useState, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, StatusBar,
    ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
import { compressImage } from '@/utils/imageCompressor';

type ScanPhase = 'idle' | 'processing' | 'result';

export default function ScanScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { openModal } = useQuickAction();
    const cameraRef = useRef<CameraView | null>(null);
    const [permission, requestPermission] = useCameraPermissions();

    const [phase, setPhase] = useState<ScanPhase>('idle');
    const [capturedUri, setCapturedUri] = useState<string | null>(null);
    const [ocrResult, setOcrResult] = useState<BillParseResult | null>(null);
    const { formatCurrency } = useSettings();
    const [processingText, setProcessingText] = useState('Analyzing bill…');
    const [flashEnabled, setFlashEnabled] = useState(false);

    // Scan line animation for idle state
    const scanLineY = useSharedValue(0);
    React.useEffect(() => {
        scanLineY.value = withRepeat(
            withSequence(
                withTiming(320, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
            ), -1, false,
        );
    }, []);
    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    // ── Capture / Pick ──────────────────────────────────────
    const captureFromCamera = useCallback(async () => {
        if (!permission?.granted) {
            const res = await requestPermission();
            if (!res.granted) {
                Alert.alert('Permission Denied', 'Camera access is required to scan bills.');
                return;
            }
        }

        if (!cameraRef.current) {
            Alert.alert('Camera not ready', 'Please wait a moment and try again.');
            return;
        }

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.85,
                skipProcessing: false,
            });
            if (photo?.uri) {
                const compressedUri = await compressImage(photo.uri);
                processImage(compressedUri);
            }
        } catch {
            Alert.alert('Capture failed', 'Could not capture image. Please try again.');
        }
    }, [permission?.granted, requestPermission]);

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
            const compressedUri = await compressImage(result.assets[0].uri);
            processImage(compressedUri);
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
            <View style={styles.cameraShell}>
                {permission?.granted ? (
                    <CameraView
                        ref={cameraRef}
                        style={StyleSheet.absoluteFillObject}
                        facing="back"
                        enableTorch={flashEnabled}
                    />
                ) : (
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]} />
                )}

                <View style={styles.scanMaskWrap} pointerEvents="none">
                    <View style={styles.maskTop} />
                    <View style={styles.maskCenterRow}>
                        <View style={styles.maskSide} />
                        <View style={styles.scanFrame}>
                            <View style={[styles.bracket, styles.topLeft]} />
                            <View style={[styles.bracket, styles.topRight]} />
                            <View style={[styles.bracket, styles.bottomLeft]} />
                            <View style={[styles.bracket, styles.bottomRight]} />
                            <Animated.View style={[styles.scanLine, scanLineStyle]} />
                            <View style={styles.receiptIconBadge}>
                                <MaterialCommunityIcons name="receipt-text" size={24} color="#2DCA72" />
                            </View>
                        </View>
                        <View style={styles.maskSide} />
                    </View>
                    <View style={styles.maskBottom}>
                        <Animated.View entering={FadeIn.delay(250)} style={styles.overlayTextContainer}>
                            <Text style={styles.overlayTitle}>Scan Your Bill</Text>
                            <Text style={styles.overlaySubTitle}>
                                Take a photo or pick from gallery to{'\n'}auto-extract expense details
                            </Text>
                        </Animated.View>
                    </View>
                </View>
            </View>

            {/* Bottom Controls */}
            <Animated.View entering={FadeInDown.delay(300)} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.controlBtn} onPress={pickFromGallery}>
                    <View style={styles.controlIconWrap}>
                        <MaterialCommunityIcons name="image-outline" size={24} color="#111" />
                    </View>
                    <Text style={styles.controlText}>Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mainScanBtn} onPress={captureFromCamera} activeOpacity={0.85}>
                    <View style={styles.mainScanBtnInner}>
                        <MaterialCommunityIcons name="camera" size={32} color="#fff" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn} onPress={() => setFlashEnabled(prev => !prev)}>
                    <View style={[styles.controlIconWrap, flashEnabled && { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
                        <MaterialCommunityIcons name={flashEnabled ? 'flashlight' : 'flashlight-off'} size={24} color={flashEnabled ? '#F59E0B' : '#111'} />
                    </View>
                    <Text style={[styles.controlText, flashEnabled && { color: '#F59E0B' }]}>Flash</Text>
                </TouchableOpacity>
            </Animated.View>
        </>
    );

    // ── Render: Processing ──────────────────────────────────
    const renderProcessing = () => (
        <View style={styles.processingContainer}>
            {capturedUri && (
                <Animated.View entering={FadeIn} style={styles.previewWrap}>
                    <Image source={{ uri: capturedUri }} style={styles.previewImage} contentFit="cover" />
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
                    <Image source={{ uri: capturedUri }} style={styles.resultImage} contentFit="cover" />
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
                    <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.useBtnGradient}>
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

            {permission && !permission.granted && phase === 'idle' && (
                <View style={styles.permissionCardWrap}>
                    <View style={styles.permissionCard}>
                        <MaterialCommunityIcons name="camera-lock-outline" size={26} color="#2DCA72" />
                        <Text style={styles.permissionTitle}>Camera Permission Needed</Text>
                        <Text style={styles.permissionSub}>Allow camera access to scan bills directly from this screen.</Text>
                        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                            <Text style={styles.permissionBtnText}>Enable Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

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
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute', left: 20,
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

    // ── Idle ──
    cameraShell: { flex: 1 },
    scanMaskWrap: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
    },
    maskTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
    maskCenterRow: { height: 320, flexDirection: 'row' },
    maskSide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
    maskBottom: { flex: 1.2, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', paddingTop: 60 },
    scanFrame: {
        width: 320, height: 320,
        position: 'relative', overflow: 'visible',
    },
    bracket: {
        position: 'absolute', width: 36, height: 36,
        borderColor: '#2DCA72', borderTopWidth: 5, borderLeftWidth: 5,
    },
    receiptIconBadge: {
        position: 'absolute', bottom: -18, alignSelf: 'center', left: '50%',
        marginLeft: -13, // center offset for icon
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: '#000', borderRadius: 4,
        paddingHorizontal: 4,
    },
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0, transform: [{ rotate: '90deg' }] },
    bottomLeft: { bottom: 0, left: 0, transform: [{ rotate: '-90deg' }] },
    bottomRight: { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] },
    scanLine: {
        height: 2, backgroundColor: '#2DCA72', width: '100%',
        shadowColor: '#2DCA72', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1, shadowRadius: 8, elevation: 4,
    },
    overlayTextContainer: {
        alignItems: 'center', width: '100%', paddingHorizontal: 40,
    },
    overlayTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 12 },
    overlaySubTitle: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 22 },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 36, borderTopRightRadius: 36,
        paddingTop: 30,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05, shadowRadius: 20, elevation: 15,
    },
    controlBtn: { alignItems: 'center', gap: 10, width: 70 },
    controlIconWrap: {
        width: 58, height: 58, borderRadius: 29,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center', alignItems: 'center',
    },
    controlText: { fontSize: 13, color: '#8E8E93', fontWeight: '700' },
    mainScanBtn: {
        width: 90, height: 90, borderRadius: 45,
        backgroundColor: '#F9F9FB', padding: 8,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 5,
    },
    mainScanBtnInner: {
        flex: 1, borderRadius: 40, backgroundColor: '#6366F1',
        justifyContent: 'center', alignItems: 'center',
    },
    permissionCardWrap: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 30,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#F9F9FB',
    },
    permissionCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 24,
        backgroundColor: '#fff',
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08, shadowRadius: 16, elevation: 5,
    },
    permissionTitle: { fontSize: 20, fontWeight: '800', color: '#111', marginTop: 16, marginBottom: 8, textAlign: 'center' },
    permissionSub: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
    permissionBtn: {
        backgroundColor: '#6366F1', paddingVertical: 14, paddingHorizontal: 30,
        borderRadius: 16, width: '100%', alignItems: 'center',
    },
    permissionBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

    // ── Processing ──
    processingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F9FB' },
    previewWrap: { ...StyleSheet.absoluteFillObject },
    previewImage: { width: '100%', height: '100%' },
    previewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)' },
    processingCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 36,
        alignItems: 'center', gap: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08, shadowRadius: 24, elevation: 10,
    },
    processingTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginTop: 8 },
    processingSub: { fontSize: 14, color: '#8E8E93' },

    // ── Result ──
    resultScroll: { flex: 1, backgroundColor: '#F9F9FB', marginTop: 90 },
    resultImageWrap: {
        width: '100%', height: 220, borderRadius: 20, overflow: 'hidden',
        marginBottom: 20, backgroundColor: '#E5E5EA',
    },
    resultImage: { width: '100%', height: '100%' },
    resultImageBadge: {
        position: 'absolute', top: 16, right: 16,
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
    },
    resultImageBadgeText: { color: '#111', fontSize: 13, fontWeight: '800' },

    resultCard: {
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    },
    resultCardTitle: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 18, letterSpacing: 0.5 },
    resultRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 12,
    },
    resultLabelWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    resultLabel: { fontSize: 15, color: '#8E8E93', fontWeight: '600' },
    resultValue: { fontSize: 15, fontWeight: '700', color: '#111' },
    resultAmount: { fontSize: 20, fontWeight: '900', color: '#6366F1' },
    resultCategory: { color: '#6366F1' },
    resultDivider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 4 },

    itemRow: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 12,
    },
    itemName: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500', marginRight: 15 },
    itemPrice: { fontSize: 15, fontWeight: '800', color: '#111' },

    resultActions: { gap: 14, marginTop: 10, marginBottom: 20 },
    useBtn: { borderRadius: 18, overflow: 'hidden' },
    useBtnGradient: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, paddingVertical: 18,
    },
    useBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 10, paddingVertical: 18,
        backgroundColor: '#F9F9FB', borderRadius: 18,
    },
    retryBtnText: { fontSize: 16, fontWeight: '700', color: '#666' },
});
