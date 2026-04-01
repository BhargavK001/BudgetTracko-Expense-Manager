import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    FadeInDown, FadeInUp, FadeIn, SlideInRight, ZoomIn,
    useSharedValue, useAnimatedStyle,
    withRepeat, withTiming, withSequence, withSpring,
    Easing,
} from 'react-native-reanimated';
import { useSettings } from '@/context/SettingsContext';

const { width } = Dimensions.get('window');

// ── Floating glow ────────────────────────────────────────────
function useFloat(amp = 8, dur = 1800) {
    const y = useSharedValue(0);
    useEffect(() => {
        y.value = withRepeat(
            withSequence(
                withTiming(-amp, { duration: dur, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: dur, easing: Easing.inOut(Easing.sin) }),
            ),
            -1, false,
        );
    }, []);
    return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

// ── Pulsing scale ────────────────────────────────────────────
function usePulse() {
    const s = useSharedValue(1);
    useEffect(() => {
        s.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
            ),
            -1, false,
        );
    }, []);
    return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}

// ── Bouncy Next button ───────────────────────────────────────
function NextButton({ onPress }: { onPress: () => void }) {
    const sc = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
    const press = () => {
        sc.value = withSequence(withSpring(0.86, { damping: 10 }), withSpring(1, { damping: 8 }));
        onPress();
    };
    return (
        <Animated.View style={style}>
            <TouchableOpacity style={styles.btnNext} onPress={press} activeOpacity={0.9}>
                <MaterialCommunityIcons name="arrow-right" size={24} color="#fff" />
            </TouchableOpacity>
        </Animated.View>
    );
}

// ── Progress bar (onboarding screens only) ───────────────────
function TopBar({ index }: { index: number }) {
    if (index === 0) return null;
    return (
        <Animated.View entering={FadeIn.duration(250)} style={styles.progContainer}>
            <Animated.View style={[styles.progFill, { width: `${(index / 4) * 100}%` as any }]} />
        </Animated.View>
    );
}

// ─────────────────────────────────────────────────────────────
export default function Welcome() {
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);
    const [page, setPage] = useState(0);   // settled page
    const insets = useSafeAreaInsets();
    const floatStyle = useFloat();
    const pulseStyle = usePulse();
    const { currency } = useSettings();

    // Jump to a page INSTANTLY (no mid-flight animation conflict)
    // Animations fire on content mount AFTER the snap
    const goTo = (idx: number) => {
        setPage(idx); // mount new content first
        // tiny RAF delay lets state flush before scroll
        requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ x: idx * width, y: 0, animated: false });
        });
    };

    // User-swipe: detect settled page
    const onMomentumEnd = (e: any) => {
        const idx = Math.round(e.nativeEvent.contentOffset.x / width);
        setPage(idx);
    };

    const skip = () => router.push('/(auth)/signup');

    return (
        // Solid white wrapper ensures no dark background bleeds during scroll
        <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StatusBar style="dark" />
            <TopBar index={page} />

            <ScrollView
                ref={scrollRef}
                horizontal pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={page > 0}              // disable swipe on landing
                onMomentumScrollEnd={onMomentumEnd}
                scrollEventThrottle={16}
                style={styles.scroll}
                // Prevent dark bg flashing between pages:
                bounces={false}
                overScrollMode="never"
            >
                {/* ══════════════ 0: LANDING ══════════════ */}
                <View style={styles.page}>
                    <View style={styles.landingWrap}>
                        <Animated.View style={[styles.orbTR, floatStyle]} />
                        <View style={styles.orbBL} />

                        {/* Balance card */}
                        <Animated.View entering={FadeInDown.delay(80).duration(600).springify()} style={styles.card}>
                            <Animated.View style={[styles.cardGlow, floatStyle]} />
                            <Animated.Text entering={FadeIn.delay(280).duration(400)} style={styles.cardLbl}>Total Balance</Animated.Text>
                            <Animated.Text entering={FadeInDown.delay(320).duration(450)} style={styles.cardAmt}>
                                <Text style={styles.cardAmtSm}>{currency} </Text>2,48,500
                            </Animated.Text>
                            <View style={styles.bars}>
                                {[32, 46, 62, 38, 50, 44, 36].map((h, i) => (
                                    <Animated.View key={i}
                                        entering={FadeInUp.delay(240 + i * 55).duration(350)}
                                        style={[styles.bar, (i === 2 || i === 5) && styles.barG, { height: h }]}
                                    />
                                ))}
                            </View>
                            <Animated.View entering={ZoomIn.delay(680).duration(380)} style={styles.pill}>
                                <Text style={styles.pillL}>Monthly savings</Text>
                                <Text style={styles.pillR}>+{currency} 12,400</Text>
                            </Animated.View>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(420).duration(480)} style={styles.landCopy}>
                            <Text style={styles.h1}>Your money,{'\n'}under control.</Text>
                            <Text style={styles.p}>Track spending, set goals, and build better money habits — simply.</Text>
                        </Animated.View>

                        <Animated.View entering={FadeInUp.delay(560).duration(460)} style={styles.landBtns}>
                            <TouchableOpacity style={styles.btnDark} onPress={() => goTo(1)}>
                                <Text style={styles.btnDarkTxt}>Get Started</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.btnLight} onPress={() => router.push('/(auth)/login')}>
                                <Text style={styles.btnLightTxt}>Log In</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>

                {/* ══════════════ 1: EXPENSES ══════════════ */}
                <View style={styles.page}>
                    <View style={styles.obWrap}>
                        {page === 1 && (
                            <>
                                <Animated.View entering={SlideInRight.duration(400).springify()} style={styles.illo}>
                                    <View style={styles.ic}>
                                        <View style={styles.ecTop}>
                                            <Text style={styles.ecLbl}>Expenses</Text>
                                            <Text style={styles.ecMonth}>March 2025</Text>
                                        </View>
                                        <Animated.Text entering={FadeInDown.delay(60).duration(380)} style={styles.ecTotal}>
                                            <Text style={styles.ecTotalSm}>{currency} </Text>18,240
                                        </Animated.Text>
                                        {[
                                            { icon: 'pizza', color: '#FF9800', name: 'Swiggy Order', cat: 'Food · Today', amt: `−${currency}420`, exp: true },
                                            { icon: 'taxi', color: '#FFC107', name: 'Ola Cab', cat: 'Transport · Yesterday', amt: `−${currency}180`, exp: true },
                                            { icon: 'briefcase', color: '#795548', name: 'Salary Credit', cat: 'Income · Mar 1', amt: `+${currency}55,000`, exp: false },
                                        ].map((r, i) => (
                                            <Animated.View key={i} entering={FadeInDown.delay(100 + i * 90).duration(360)}
                                                style={[styles.ecRow, i === 2 && { borderBottomWidth: 0 }]}>
                                                <View style={styles.ecIcon}>
                                                    <MaterialCommunityIcons name={r.icon as any} size={20} color={r.color} />
                                                </View>
                                                <View style={styles.ecInfo}>
                                                    <Text style={styles.ecName}>{r.name}</Text>
                                                    <Text style={styles.ecCat}>{r.cat}</Text>
                                                </View>
                                                <Text style={[styles.ecAmt, r.exp ? styles.red : styles.grn]}>{r.amt}</Text>
                                            </Animated.View>
                                        ))}
                                    </View>
                                </Animated.View>
                                <Animated.View entering={FadeInUp.delay(240).duration(440)} style={styles.obCopy}>
                                    <Text style={styles.h2}>Every rupee,{'\n'}accounted for.</Text>
                                    <Text style={styles.p}>Log and auto-categorize every transaction.</Text>
                                </Animated.View>
                            </>
                        )}
                        {page !== 1 && <View style={{ flex: 1 }} />}
                        <View style={styles.obNav}>
                            <TouchableOpacity onPress={skip}><Text style={styles.skipTxt}>Skip</Text></TouchableOpacity>
                            <NextButton onPress={() => goTo(2)} />
                        </View>
                    </View>
                </View>

                {/* ══════════════ 2: GOALS ══════════════ */}
                <View style={styles.page}>
                    <View style={styles.obWrap}>
                        {page === 2 && (
                            <>
                                <Animated.View entering={SlideInRight.duration(400).springify()} style={styles.illo}>
                                    <View style={styles.ic}>
                                        <View style={styles.gcHead}>
                                            <Text style={styles.gcT}>Savings Goals</Text>
                                            <Text style={styles.gcAdd}>+ Add</Text>
                                        </View>
                                        {[
                                            { icon: 'beach', color: '#00BCD4', name: 'Goa Vacation', pct: '68%', sub: `${currency}34,000 of ${currency}50,000`, bw: '68%', bc: '#2DCA72' },
                                            { icon: 'home-variant', color: '#4CAF50', name: 'Emergency Fund', pct: '42%', sub: `${currency}84,000 of ${currency}2,00,000`, bw: '42%', bc: '#007AFF' },
                                            { icon: 'cellphone', color: '#9C27B0', name: 'New Phone', pct: '91%', sub: `${currency}63,700 of ${currency}70,000`, bw: '91%', bc: '#2DCA72' },
                                        ].map((g, i) => (
                                            <Animated.View key={i} entering={FadeInDown.delay(80 + i * 100).duration(360)}
                                                style={[styles.gbox, i === 2 && { marginBottom: 0 }]}>
                                                <View style={styles.gboxTop}>
                                                    <Text style={styles.gboxName}>
                                                        <MaterialCommunityIcons name={g.icon as any} size={14} color={g.color} /> {g.name}
                                                    </Text>
                                                    <Text style={[styles.gboxPct, i === 1 && { color: '#007AFF' }]}>{g.pct}</Text>
                                                </View>
                                                <View style={styles.gbar}>
                                                    <View style={[styles.gbarF, { width: g.bw as any, backgroundColor: g.bc }]} />
                                                </View>
                                                <Text style={styles.gboxSub}>{g.sub}</Text>
                                            </Animated.View>
                                        ))}
                                    </View>
                                </Animated.View>
                                <Animated.View entering={FadeInUp.delay(240).duration(440)} style={styles.obCopy}>
                                    <Text style={styles.h2}>Save for what{'\n'}matters most.</Text>
                                    <Text style={styles.p}>Create savings targets and track progress.</Text>
                                </Animated.View>
                            </>
                        )}
                        {page !== 2 && <View style={{ flex: 1 }} />}
                        <View style={styles.obNav}>
                            <TouchableOpacity onPress={skip}><Text style={styles.skipTxt}>Skip</Text></TouchableOpacity>
                            <NextButton onPress={() => goTo(3)} />
                        </View>
                    </View>
                </View>

                {/* ══════════════ 3: REPORTS ══════════════ */}
                <View style={styles.page}>
                    <View style={styles.obWrap}>
                        {page === 3 && (
                            <>
                                <Animated.View entering={SlideInRight.duration(400).springify()} style={styles.illo}>
                                    <View style={styles.ic}>
                                        <View style={styles.rcHead}>
                                            <Text style={styles.rcT}>Monthly Spending</Text>
                                            <Text style={styles.rcS}>Last 7 months</Text>
                                        </View>
                                        <View style={styles.rchart}>
                                            {[
                                                { h: 34, l: 'Sep' }, { h: 50, l: 'Oct' }, { h: 42, l: 'Nov' },
                                                { h: 58, l: 'Dec' }, { h: 36, l: 'Jan' }, { h: 46, l: 'Feb' },
                                                { h: 52, l: 'Mar', a: true },
                                            ].map((b: any, i) => (
                                                <Animated.View key={i} entering={FadeInUp.delay(i * 50).duration(330)} style={styles.rcc}>
                                                    <View style={[styles.rcb, b.a && styles.rcbG, { height: b.h }]} />
                                                    <Text style={[styles.rcl, b.a && styles.rclA]}>{b.l}</Text>
                                                </Animated.View>
                                            ))}
                                        </View>
                                        <Animated.View entering={ZoomIn.delay(420).duration(340)} style={styles.rInsight}>
                                            <View style={styles.rDot} />
                                            <Text style={styles.rTxt}>You spent 14% less vs February. Keep it up!</Text>
                                        </Animated.View>
                                    </View>
                                </Animated.View>
                                <Animated.View entering={FadeInUp.delay(240).duration(440)} style={styles.obCopy}>
                                    <Text style={styles.h2}>See the bigger{'\n'}picture.</Text>
                                    <Text style={styles.p}>Smart insights show how your habits are shifting.</Text>
                                </Animated.View>
                            </>
                        )}
                        {page !== 3 && <View style={{ flex: 1 }} />}
                        <View style={styles.obNav}>
                            <TouchableOpacity onPress={skip}><Text style={styles.skipTxt}>Skip</Text></TouchableOpacity>
                            <NextButton onPress={() => goTo(4)} />
                        </View>
                    </View>
                </View>

                {/* ══════════════ 4: SECURITY ══════════════ */}
                <View style={styles.page}>
                    <View style={styles.obWrap}>
                        {page === 4 && (
                            <>
                                <Animated.View entering={FadeIn.duration(460)} style={styles.illo}>
                                    <View style={styles.ic}>
                                        <Animated.View entering={ZoomIn.delay(60).duration(420)} style={styles.scCenter}>
                                            <Animated.View style={pulseStyle}>
                                                <MaterialCommunityIcons name="shield-lock" size={52} color="#111" style={styles.scIcon} />
                                            </Animated.View>
                                            <Text style={styles.scH}>Your data is safe</Text>
                                            <Text style={styles.scD}>Bank-grade encryption protects every piece of your financial data.</Text>
                                        </Animated.View>
                                        {[
                                            { icon: 'lock-check', label: '256-bit SSL Encryption' },
                                            { icon: 'fingerprint', label: 'Biometric Login' },
                                            { icon: 'shield-check', label: 'Two-Factor Authentication' },
                                        ].map((item, i) => (
                                            <Animated.View key={i} entering={FadeInDown.delay(180 + i * 110).duration(360)}
                                                style={[styles.si, i === 2 && { marginBottom: 0 }]}>
                                                <MaterialCommunityIcons name={item.icon as any} size={17} color="#111" style={styles.siIcon} />
                                                <Text style={styles.siTxt}>{item.label}</Text>
                                                <Text style={styles.siChk}>✓</Text>
                                            </Animated.View>
                                        ))}
                                    </View>
                                </Animated.View>
                                <Animated.View entering={FadeInUp.delay(300).duration(440)} style={styles.obCopy}>
                                    <Text style={styles.h2}>Private{'\n'}by design.</Text>
                                    <Text style={styles.p}>We never sell your data. Your privacy is non-negotiable.</Text>
                                </Animated.View>
                            </>
                        )}
                        {page !== 4 && <View style={{ flex: 1 }} />}
                        <View style={[styles.obNav, { justifyContent: 'flex-end' }]}>
                            {page === 4 && (
                                <Animated.View entering={FadeInUp.delay(440).duration(380)}>
                                    <TouchableOpacity
                                        style={[styles.btnDark, { width: 'auto', paddingHorizontal: 28, borderRadius: 30 }]}
                                        onPress={() => router.push('/(auth)/signup')}>
                                        <Text style={styles.btnDarkTxt}>Create Account →</Text>
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },  // solid white = no dark-bg bleed
    scroll: { flex: 1, backgroundColor: '#fff' },
    page: { width, flex: 1, backgroundColor: '#fff' },

    /* Progress bar */
    progContainer: { height: 3, backgroundColor: '#F2F2F7', marginHorizontal: 24, marginTop: 10 },
    progFill: { height: '100%', backgroundColor: '#111', borderRadius: 2 },

    /* ── Landing ── */
    landingWrap: { flex: 1, paddingHorizontal: 24, paddingBottom: 36, paddingTop: 8 },
    orbTR: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(45,202,114,0.07)', top: -20, right: -40, zIndex: 0 },
    orbBL: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(45,202,114,0.05)', bottom: 100, left: -30, zIndex: 0 },
    card: { flex: 1, backgroundColor: '#111', borderRadius: 28, padding: 26, marginBottom: 28, justifyContent: 'flex-end', overflow: 'hidden' },
    cardGlow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: 'rgba(45,202,114,0.22)', top: -70, right: -50 },
    cardLbl: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
    cardAmt: { fontSize: 38, fontWeight: '800', color: '#fff', letterSpacing: -1.5, marginBottom: 20 },
    cardAmtSm: { fontSize: 18, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
    bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 7, height: 64, marginBottom: 18 },
    bar: { flex: 1, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
    barG: { backgroundColor: '#2DCA72' },
    pill: { backgroundColor: 'rgba(45,202,114,0.12)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pillL: { fontSize: 12, color: 'rgba(255,255,255,0.45)' },
    pillR: { fontSize: 13, fontWeight: '700', color: '#2DCA72' },
    landCopy: { marginBottom: 22 },
    h1: { fontSize: 28, fontWeight: '800', color: '#111', lineHeight: 33.6, letterSpacing: -0.4 },
    p: { fontSize: 14, color: '#8E8E93', lineHeight: 23, marginTop: 8 },
    landBtns: { gap: 10 },
    btnDark: { width: '100%', padding: 16, backgroundColor: '#111', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    btnDarkTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
    btnLight: { width: '100%', padding: 16, backgroundColor: '#F5F5F5', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    btnLightTxt: { fontSize: 15, fontWeight: '600', color: '#111' },

    /* ── Onboarding shared ── */
    obWrap: { flex: 1, paddingHorizontal: 24, paddingBottom: 36, paddingTop: 16 },
    illo: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
    ic: { width: '100%', maxWidth: 318, backgroundColor: '#F9F9FB', borderRadius: 24, padding: 20 },
    obCopy: { marginBottom: 28 },
    h2: { fontSize: 26, fontWeight: '800', color: '#111', lineHeight: 32, letterSpacing: -0.3 },
    obNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    skipTxt: { fontSize: 13, fontWeight: '500', color: '#C7C7CC' },
    btnNext: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },

    /* Expense card */
    ecTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    ecLbl: { fontSize: 12, color: '#8E8E93', fontWeight: '500' },
    ecMonth: { fontSize: 12, color: '#C7C7CC' },
    ecTotal: { fontSize: 30, fontWeight: '800', color: '#111', letterSpacing: -0.8, marginBottom: 14 },
    ecTotalSm: { fontSize: 14, color: '#8E8E93', fontWeight: '500' },
    ecRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    ecIcon: { width: 36, height: 36, backgroundColor: '#fff', borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    ecInfo: { flex: 1 },
    ecName: { fontSize: 13, fontWeight: '600', color: '#111' },
    ecCat: { fontSize: 11, color: '#C7C7CC', marginTop: 1 },
    ecAmt: { fontSize: 13, fontWeight: '700' },
    red: { color: '#FF3B30' },
    grn: { color: '#2DCA72' },

    /* Goal card */
    gcHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    gcT: { fontSize: 13, fontWeight: '600', color: '#111' },
    gcAdd: { fontSize: 12, fontWeight: '600', color: '#2DCA72' },
    gbox: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14, marginBottom: 9 },
    gboxTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    gboxName: { fontSize: 13, fontWeight: '600', color: '#111' },
    gboxPct: { fontSize: 12, fontWeight: '700', color: '#2DCA72' },
    gbar: { height: 5, backgroundColor: '#F2F2F7', borderRadius: 3, overflow: 'hidden', marginBottom: 5 },
    gbarF: { height: '100%', borderRadius: 3 },
    gboxSub: { fontSize: 11, color: '#C7C7CC' },

    /* Report card */
    rcHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
    rcT: { fontSize: 13, fontWeight: '600', color: '#111' },
    rcS: { fontSize: 11, color: '#C7C7CC' },
    rchart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 76, marginBottom: 14 },
    rcc: { flex: 1, alignItems: 'center', gap: 4 },
    rcb: { width: '100%', borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, backgroundColor: '#F2F2F7' },
    rcbG: { backgroundColor: '#2DCA72' },
    rcl: { fontSize: 10, color: '#C7C7CC' },
    rclA: { color: '#111', fontWeight: '600' },
    rInsight: { backgroundColor: 'rgba(45,202,114,0.09)', borderRadius: 12, paddingVertical: 11, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
    rDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#2DCA72' },
    rTxt: { fontSize: 12, color: '#3A3A3C', lineHeight: 18, flex: 1 },

    /* Security card */
    scCenter: { alignItems: 'center', paddingBottom: 18, paddingTop: 8 },
    scIcon: { marginBottom: 10 },
    scH: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 4 },
    scD: { fontSize: 12, color: '#8E8E93', lineHeight: 18, textAlign: 'center' },
    si: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
    siIcon: { width: 30, textAlign: 'center' },
    siTxt: { fontSize: 13, fontWeight: '600', color: '#111', flex: 1 },
    siChk: { fontSize: 14, color: '#2DCA72', fontWeight: '700' },
});
