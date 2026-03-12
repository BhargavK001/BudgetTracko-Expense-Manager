import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScanScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const scanLineY = useSharedValue(0);

    useEffect(() => {
        scanLineY.value = withRepeat(
            withSequence(
                withTiming(260, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            false
        );
    }, []);

    const scanLineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLineY.value }],
    }));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Camera View Placeholder (Dark) */}
            <View style={styles.cameraPlaceholder}>
                <LinearGradient
                    colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.8)']}
                    style={StyleSheet.absoluteFill}
                />

                {/* Scan Frame */}
                <View style={styles.scanFrameContainer}>
                    <View style={styles.scanFrame}>
                        {/* Brackets */}
                        <View style={[styles.bracket, styles.topLeft]} />
                        <View style={[styles.bracket, styles.topRight]} />
                        <View style={[styles.bracket, styles.bottomLeft]} />
                        <View style={[styles.bracket, styles.bottomRight]} />

                        {/* Animated Scan Line */}
                        <Animated.View style={[styles.scanLine, scanLineStyle]} />
                    </View>
                </View>

                {/* Overlay Text */}
                <Animated.View entering={FadeIn.delay(500)} style={styles.overlayTextContainer}>
                    <Text style={styles.overlayTitle}>Scan QR Code</Text>
                    <Text style={styles.overlaySubTitle}>Align the QR code within the frame to scan</Text>
                </Animated.View>
            </View>

            {/* Header / Back Button */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scanner</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Bottom Controls */}
            <Animated.View entering={FadeInDown.delay(300)} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                <TouchableOpacity style={styles.controlBtn}>
                    <MaterialCommunityIcons name="flashlight" size={24} color="#fff" />
                    <Text style={styles.controlText}>Flash</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mainScanBtn}>
                    <View style={styles.mainScanBtnInner}>
                        <Ionicons name="qr-code-outline" size={32} color="#111" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.controlBtn}>
                    <MaterialCommunityIcons name="image-outline" size={24} color="#fff" />
                    <Text style={styles.controlText}>Gallery</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Coming Soon Badge */}
            <View style={styles.infoBadge}>
                <Text style={styles.infoText}>Feature coming soon in next update</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    cameraPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, zIndex: 10,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: '800', color: '#fff' },
    scanFrameContainer: { width: 280, height: 280, position: 'relative' },
    scanFrame: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' },
    bracket: { position: 'absolute', width: 24, height: 24, borderColor: '#2DCA72', borderTopWidth: 4, borderLeftWidth: 4 },
    topLeft: { top: 0, left: 0 },
    topRight: { top: 0, right: 0, transform: [{ rotate: '90deg' }] },
    bottomLeft: { bottom: 0, left: 0, transform: [{ rotate: '-90deg' }] },
    bottomRight: { bottom: 0, right: 0, transform: [{ rotate: '180deg' }] },
    scanLine: {
        height: 2, backgroundColor: '#2DCA72', width: '100%',
        shadowColor: '#2DCA72', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8, shadowRadius: 10,
    },
    overlayTextContainer: { position: 'absolute', top: '70%', alignItems: 'center', width: '100%' },
    overlayTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 8 },
    overlaySubTitle: { fontSize: 14, color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 40 },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        paddingHorizontal: 20,
    },
    controlBtn: { alignItems: 'center', gap: 6 },
    controlText: { fontSize: 11, color: '#fff', fontWeight: '600' },
    mainScanBtn: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.2)', padding: 6,
    },
    mainScanBtnInner: {
        flex: 1, borderRadius: 30, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
    },
    infoBadge: {
        position: 'absolute', top: 120, alignSelf: 'center',
        backgroundColor: 'rgba(245,158,11,0.2)', paddingHorizontal: 16,
        paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
    },
    infoText: { fontSize: 12, fontWeight: '700', color: '#F59E0B' },
});
