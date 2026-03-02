import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions, Category, CATEGORY_COLORS, CATEGORY_ICONS } from '@/context/TransactionContext';
import DonutChart from '@/components/DonutChart';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function fmt(n: number): string {
    return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Simple Bar Chart (white theme) ───────────────────────
const BarChart = ({ data, height = 150 }: { data: { label: string; value: number }[]; height?: number }) => {
    const max = Math.max(...data.map(d => d.value), 1000);
    const chartH = height - 40;
    const barW = 36;
    const gap = 16;
    const totalW = data.length * (barW + gap) - gap;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
            <Svg width={totalW + 40} height={height}>
                <G x={20}>
                    {data.map((d, i) => {
                        const bh = (d.value / max) * chartH;
                        return (
                            <G key={i} x={i * (barW + gap)}>
                                {/* Background bar */}
                                <Rect y={0} width={barW} height={chartH} fill="#F5F5F5" rx={6} />
                                {/* Value bar */}
                                <Rect y={chartH - bh} width={barW} height={bh} fill="#2DCA72" rx={6} />
                                <SvgText x={barW / 2} y={height - 10} fill="#8E8E93" fontSize="10" fontWeight="600" textAnchor="middle">
                                    {d.label}
                                </SvgText>
                                {d.value > 0 && (
                                    <SvgText x={barW / 2} y={chartH - bh - 5} fill="#111" fontSize="8" fontWeight="900" textAnchor="middle">
                                        {d.value > 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                                    </SvgText>
                                )}
                            </G>
                        );
                    })}
                </G>
            </Svg>
        </ScrollView>
    );
};

type TimeFilter = 'Week' | 'Month' | 'Year';

export default function AnalysisScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { transactions } = useTransactions();

    const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('Month');
    const now = new Date();
    const [mi, setMi] = useState(now.getMonth());
    const [yr, setYr] = useState(now.getFullYear());

    const goPrev = () => { if (mi === 0) { setMi(11); setYr(y => y - 1); } else setMi(p => p - 1); };
    const goNext = () => { if (mi === 11) { setMi(0); setYr(y => y + 1); } else setMi(p => p + 1); };

    const dateRange = useMemo(() => {
        let start = new Date(yr, mi, 1);
        let end = new Date(yr, mi + 1, 0, 23, 59, 59, 999);
        if (selectedFilter === 'Year') { start = new Date(yr, 0, 1); end = new Date(yr, 11, 31, 23, 59, 59, 999); }
        else if (selectedFilter === 'Week') {
            const today = new Date();
            if (mi === today.getMonth() && yr === today.getFullYear()) {
                end = new Date(today); end.setHours(23, 59, 59, 999);
                start = new Date(end); start.setDate(end.getDate() - 7); start.setHours(0, 0, 0, 0);
            } else { start = new Date(yr, mi, 1); end = new Date(yr, mi, 7, 23, 59, 59, 999); }
        }
        return { start, end };
    }, [selectedFilter, mi, yr]);

    const filtered = useMemo(() => {
        const { start, end } = dateRange;
        return transactions.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
    }, [transactions, dateRange]);

    const income = useMemo(() => filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [filtered]);
    const expense = useMemo(() => filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [filtered]);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    const categoryData = useMemo(() => {
        const map = new Map<Category, number>();
        filtered.filter(t => t.type === 'expense').forEach(t => map.set(t.category, (map.get(t.category) || 0) + t.amount));
        return Array.from(map.entries())
            .map(([name, amount]) => ({ name, amount, color: CATEGORY_COLORS[name] || '#795548', icon: CATEGORY_ICONS[name] || 'ellipsis-horizontal-circle-outline' }))
            .sort((a, b) => b.amount - a.amount);
    }, [filtered]);

    const chartData = useMemo(() => categoryData.map(c => ({ value: c.amount, color: c.color, label: c.name })), [categoryData]);

    const trendData = useMemo(() => {
        if (selectedFilter === 'Month') {
            const weeks = [{ label: 'W1', value: 0 }, { label: 'W2', value: 0 }, { label: 'W3', value: 0 }, { label: 'W4', value: 0 }];
            filtered.filter(t => t.type === 'expense').forEach(t => {
                const day = new Date(t.date).getDate();
                if (day <= 7) weeks[0].value += t.amount;
                else if (day <= 14) weeks[1].value += t.amount;
                else if (day <= 21) weeks[2].value += t.amount;
                else weeks[3].value += t.amount;
            });
            return weeks;
        } else if (selectedFilter === 'Year') {
            const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map(m => ({ label: m, value: 0 }));
            filtered.filter(t => t.type === 'expense').forEach(t => { months[new Date(t.date).getMonth()].value += t.amount; });
            return months;
        }
        return [];
    }, [filtered, selectedFilter]);

    const days = Math.max(Math.ceil(Math.abs(dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const expCount = filtered.filter(t => t.type === 'expense').length;
    const avgDay = expCount > 0 ? expense / days : 0;
    const avgTx = expCount > 0 ? expense / expCount : 0;

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.hTitle}>Monthly Analysis</Text>
                <TouchableOpacity style={styles.exportBtn}>
                    <Ionicons name="download-outline" size={18} color="#2DCA72" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Filter row */}
                <Animated.View entering={FadeIn.delay(50).duration(350)} style={styles.filterRow}>
                    {(['Week', 'Month', 'Year'] as TimeFilter[]).map(f => (
                        <TouchableOpacity key={f} style={[styles.filterChip, selectedFilter === f && styles.filterActive]} onPress={() => setSelectedFilter(f)}>
                            <Text style={[styles.filterTxt, selectedFilter === f && styles.filterTxtActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* ═══ Summary Hero ═══ */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <LinearGradient colors={['#1A1C20', '#0F1014']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroCard}>
                        <View style={styles.heroTop}>
                            <View>
                                <Text style={styles.heroPeriod}>
                                    {selectedFilter === 'Year' ? yr : `${MONTHS[mi]} ${yr}`}
                                </Text>
                                <Text style={styles.heroLabel}>Total Balance</Text>
                            </View>
                            <View style={styles.navBtns}>
                                <TouchableOpacity onPress={goPrev} style={styles.navBtn}>
                                    <Ionicons name="chevron-back" size={16} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={goNext} style={styles.navBtn}>
                                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Animated.Text entering={ZoomIn.delay(250).duration(350)} style={[styles.heroBalance, { color: balance >= 0 ? '#2DCA72' : '#F43F5E' }]}>
                            {balance >= 0 ? '+' : ''}{fmt(balance)}
                        </Animated.Text>

                        {/* Savings rate */}
                        <View style={styles.savingsRow}>
                            <View style={styles.savingsBarBg}>
                                <View style={[styles.savingsBarFill, { width: `${Math.max(savingsRate, 0)}%` }]} />
                            </View>
                            <Text style={styles.savingsLabel}>{savingsRate}% saved</Text>
                        </View>

                        <View style={styles.heroDivider} />

                        <View style={styles.heroPills}>
                            <View style={styles.heroPillGreen}>
                                <Ionicons name="trending-up" size={14} color="#2DCA72" />
                                <Text style={styles.heroPillLbl}>Income</Text>
                                <Text style={styles.heroPillGreenAmt}>{fmt(income)}</Text>
                            </View>
                            <View style={styles.heroPillRed}>
                                <Ionicons name="trending-down" size={14} color="#F43F5E" />
                                <Text style={styles.heroPillLbl}>Expense</Text>
                                <Text style={styles.heroPillRedAmt}>{fmt(expense)}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* ═══ Spending Trends ═══ */}
                {trendData.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
                        <Text style={styles.secTitle}>Spending Trends</Text>
                        <View style={styles.card}>
                            <Text style={styles.cardSub}>Expense over time</Text>
                            <BarChart data={trendData} />
                        </View>
                    </Animated.View>
                )}

                {/* ═══ Categories ═══ */}
                <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
                    <Text style={styles.secTitle}>Expense Categories</Text>
                    <View style={styles.card}>
                        {categoryData.length === 0 ? (
                            <View style={styles.emptyWrap}>
                                <Ionicons name="pie-chart-outline" size={36} color="#C7C7CC" />
                                <Text style={styles.emptyTxt}>No spending data for this selection</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.donutWrap}>
                                    <DonutChart data={chartData} size={190} strokeWidth={32} />
                                </View>
                                <View style={styles.catList}>
                                    {categoryData.map((cat, i) => (
                                        <Animated.View key={cat.name} entering={FadeInDown.delay(350 + i * 40).duration(300)} style={styles.catRow}>
                                            <View style={[styles.catIcon, { backgroundColor: cat.color + '14' }]}>
                                                <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.catNameRow}>
                                                    <Text style={styles.catName}>{cat.name}</Text>
                                                    {i === 0 && <View style={styles.topBadge}><Ionicons name="flame-outline" size={10} color="#F43F5E" /><Text style={styles.topBadgeTxt}>Top</Text></View>}
                                                </View>
                                                <View style={styles.progressBg}>
                                                    <View style={[styles.progressFill, { width: `${(cat.amount / Math.max(expense, 1)) * 100}%`, backgroundColor: cat.color }]} />
                                                </View>
                                            </View>
                                            <View style={styles.catRight}>
                                                <Text style={styles.catAmt}>{fmt(cat.amount)}</Text>
                                                <Text style={styles.catPct}>{((cat.amount / Math.max(expense, 1)) * 100).toFixed(0)}%</Text>
                                            </View>
                                        </Animated.View>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* ═══ Insights Grid ═══ */}
                <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
                    <Text style={styles.secTitle}>Financial Insights</Text>
                    <View style={styles.insightGrid}>
                        {[
                            { label: 'Daily Avg Spend', value: fmt(Math.round(avgDay)), icon: 'calendar-outline' as const, color: '#FF9500' },
                            { label: 'Per Transaction', value: fmt(Math.round(avgTx)), icon: 'receipt-outline' as const, color: '#007AFF' },
                            { label: 'Savings Rate', value: `${savingsRate}%`, icon: 'shield-checkmark-outline' as const, color: '#2DCA72' },
                            { label: 'Total Tx', value: `${filtered.length}`, icon: 'layers-outline' as const, color: '#AF52DE' },
                        ].map((ins, i) => (
                            <Animated.View key={ins.label} entering={FadeInDown.delay(440 + i * 60).duration(300)} style={styles.insightCard}>
                                <View style={[styles.insightIcon, { backgroundColor: ins.color + '12' }]}>
                                    <Ionicons name={ins.icon} size={16} color={ins.color} />
                                </View>
                                <Text style={styles.insightLabel}>{ins.label}</Text>
                                <Text style={styles.insightValue}>{ins.value}</Text>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    hTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
    exportBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingHorizontal: 24, paddingTop: 16 },

    // Filter
    filterRow: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 14, padding: 3, marginBottom: 18 },
    filterChip: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    filterActive: { backgroundColor: '#111' },
    filterTxt: { fontSize: 12, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
    filterTxtActive: { color: '#fff', fontWeight: '700' },

    // Hero
    heroCard: { borderRadius: 24, padding: 22, marginBottom: 22, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    heroPeriod: { fontSize: 10, color: '#2DCA72', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 },
    heroLabel: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
    navBtns: { flexDirection: 'row', gap: 6 },
    navBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    heroBalance: { fontSize: 32, fontWeight: '900', marginVertical: 4 },
    savingsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8, marginBottom: 14 },
    savingsBarBg: { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' },
    savingsBarFill: { height: '100%', backgroundColor: '#2DCA72', borderRadius: 2 },
    savingsLabel: { fontSize: 10, color: '#2DCA72', fontWeight: '600' },
    heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 14 },
    heroPills: { flexDirection: 'row', gap: 10 },
    heroPillGreen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(45,202,114,0.1)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
    heroPillRed: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
    heroPillLbl: { fontSize: 11, color: 'rgba(255,255,255,0.45)', flex: 1 },
    heroPillGreenAmt: { fontSize: 13, fontWeight: '700', color: '#2DCA72' },
    heroPillRedAmt: { fontSize: 13, fontWeight: '700', color: '#F43F5E' },

    // Sections
    section: { marginBottom: 22 },
    secTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#F2F2F7', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 }, android: { elevation: 2 } }) },
    cardSub: { fontSize: 11, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

    // Donut
    donutWrap: { alignItems: 'center', marginVertical: 14 },

    // Category list
    catList: { marginTop: 14 },
    catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
    catIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    catNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
    catName: { fontSize: 13, fontWeight: '600', color: '#111' },
    topBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5, paddingVertical: 1, backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: 6 },
    topBadgeTxt: { fontSize: 8, fontWeight: '700', color: '#F43F5E' },
    progressBg: { height: 4, backgroundColor: '#F5F5F5', borderRadius: 2, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 2 },
    catRight: { alignItems: 'flex-end', minWidth: 65 },
    catAmt: { fontSize: 13, fontWeight: '700', color: '#111' },
    catPct: { fontSize: 10, fontWeight: '500', color: '#8E8E93' },

    // Insights
    insightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    insightCard: { flex: 1, minWidth: '45%' as any, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F2F2F7' },
    insightIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    insightLabel: { fontSize: 10, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    insightValue: { fontSize: 17, fontWeight: '800', color: '#111' },

    // Empty
    emptyWrap: { alignItems: 'center', paddingVertical: 36, gap: 10 },
    emptyTxt: { fontSize: 13, color: '#C7C7CC', fontWeight: '500' },
});
