import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    StatusBar, Platform, Modal, TextInput,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTransactions, Category, CATEGORY_COLORS, CATEGORY_ICONS, mapCategoryIcon } from '@/context/TransactionContext';
import { useSettings } from '@/context/SettingsContext';
import DonutChart from '@/components/DonutChart';
import Svg, { Rect, G, Text as SvgText, Circle, Path, Line } from 'react-native-svg';
import { useRouter } from 'expo-router';
import Animated, {
    FadeInDown, FadeIn, FadeInUp, ZoomIn, BounceIn,
    useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring,
    Easing, SlideInLeft, SlideInRight,
} from 'react-native-reanimated';

// ── Constants ────────────────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const BUDGET_LIMITS: Record<string, number> = {
    Food: 5000, Transport: 3000, Shopping: 4000,
    Entertainment: 2000, Bills: 8000, Health: 5000,
    Education: 10000, Other: 2000,
};

// ── Helpers ──────────────────────────────────────────────────
function fmt(n: number, formatCurrency: (n: number) => string): string {
    return formatCurrency(Math.abs(n));
}

function ordinal(n: number): string {
    if ([11, 12, 13].includes(n % 100)) return n + 'th';
    if (n % 10 === 1) return n + 'st';
    if (n % 10 === 2) return n + 'nd';
    if (n % 10 === 3) return n + 'rd';
    return n + 'th';
}

// ── Simple Bar Chart ─────────────────────────────────────────
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
                                <Rect y={0} width={barW} height={chartH} fill="#F5F5F5" rx={6} />
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

// ── Income vs Expense Dual Bar Chart ─────────────────────────
const DualBarChart = ({ data, height = 170 }: { data: { label: string; income: number; expense: number }[]; height?: number }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)), 1000);
    const chartH = height - 44;
    const groupW = 44;
    const barW = 18;
    const gap = 20;
    const totalW = data.length * (groupW + gap) - gap;
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
            <Svg width={totalW + 40} height={height}>
                <G x={20}>
                    {data.map((d, i) => {
                        const incH = (d.income / maxVal) * chartH;
                        const expH = (d.expense / maxVal) * chartH;
                        const gx = i * (groupW + gap);
                        return (
                            <G key={i} x={gx}>
                                <Rect y={0} width={groupW} height={chartH} fill="#F9F9FB" rx={6} />
                                <Rect y={chartH - incH} width={barW} height={incH} fill="#2DCA72" rx={4} />
                                <Rect x={barW + 4} y={chartH - expH} width={barW} height={expH} fill="#F43F5E" rx={4} />
                                <SvgText x={groupW / 2} y={height - 10} fill="#8E8E93" fontSize="9" fontWeight="600" textAnchor="middle">
                                    {d.label}
                                </SvgText>
                            </G>
                        );
                    })}
                </G>
            </Svg>
        </ScrollView>
    );
};

// ── Budget Comparison Horizontal Bars ────────────────────────
const BudgetBars = ({ data, formatCurrency }: { data: { category: string; budget: number; actual: number; percent: number }[]; formatCurrency: (n: number) => string }) => {
    return (
        <View style={{ gap: 14 }}>
            {data.map((d, i) => {
                const pct = Math.min(d.percent, 150);
                const barColor = d.percent > 100 ? '#EF4444' : d.percent > 85 ? '#F59E0B' : '#2DCA72';
                return (
                    <View key={d.category}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={s.budgetCatName}>{d.category}</Text>
                            <Text style={[s.budgetPct, { color: barColor }]}>{d.percent.toFixed(0)}%</Text>
                        </View>
                        <View style={s.budgetBarBg}>
                            <View style={[s.budgetBarFill, { width: `${(pct / 150) * 100}%`, backgroundColor: barColor }]} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
                            <Text style={s.budgetSubTxt}>Spent {fmt(d.actual, formatCurrency)}</Text>
                            <Text style={s.budgetSubTxt}>Budget {fmt(d.budget, formatCurrency)}</Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

// ── Financial Health Gauge (Circle + stroke-dasharray) ───────
const HealthGauge = ({ score }: { score: number }) => {
    const clampedScore = Math.min(Math.max(Math.round(score), 0), 100);
    const size = 180;
    const strokeW = 14;
    const r = (size - strokeW) / 2 - 10;
    const cx = size / 2;
    const cy = size / 2;
    const halfCircumference = Math.PI * r; // only top half (semicircle)
    const scoreDash = (clampedScore / 100) * halfCircumference;

    const statusLabel = clampedScore > 70 ? 'Excellent' : clampedScore > 40 ? 'Fair' : 'Needs Action';
    const statusColor = clampedScore > 70 ? '#2DCA72' : clampedScore > 40 ? '#F59E0B' : '#EF4444';

    return (
        <View style={{ alignItems: 'center' }}>
            <View style={{ width: size, height: size / 2 + 20, overflow: 'hidden' }}>
                <Svg width={size} height={size}>
                    {/* Background semicircle */}
                    <Circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        stroke="#F2F2F7"
                        strokeWidth={strokeW}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${halfCircumference} ${halfCircumference * 2}`}
                        strokeDashoffset={0}
                        rotation={180}
                        origin={`${cx}, ${cy}`}
                    />
                    {/* Score arc */}
                    {clampedScore > 0 && (
                        <Circle
                            cx={cx}
                            cy={cy}
                            r={r}
                            stroke={statusColor}
                            strokeWidth={strokeW}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${scoreDash} ${halfCircumference * 2}`}
                            strokeDashoffset={0}
                            rotation={180}
                            origin={`${cx}, ${cy}`}
                        />
                    )}
                    {/* Score number */}
                    <SvgText x={cx} y={cy - 6} fill="#111" fontSize="32" fontWeight="900" textAnchor="middle">
                        {clampedScore}
                    </SvgText>
                    <SvgText x={cx} y={cy + 14} fill="#8E8E93" fontSize="10" fontWeight="700" textAnchor="middle">
                        SCORE
                    </SvgText>
                </Svg>
            </View>
            <View style={[s.healthBadge, { backgroundColor: statusColor + '18' }]}>
                <Text style={[s.healthBadgeText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
        </View>
    );
};

// ── Savings Bar Chart (Green/Red) ────────────────────────────
const SavingsChart = ({ data, height = 160 }: { data: { label: string; value: number }[]; height?: number }) => {
    const vals = data.map(d => d.value);
    const maxAbs = Math.max(...vals.map(Math.abs), 500);
    const halfH = (height - 44) / 2;
    const barW = 36;
    const gap = 16;
    const totalW = data.length * (barW + gap) - gap;
    const midY = halfH;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 16 }}>
            <Svg width={totalW + 40} height={height}>
                <G x={20}>
                    {/* Zero line */}
                    <Line x1={0} y1={midY} x2={totalW} y2={midY} stroke="#E5E5EA" strokeWidth={1} strokeDasharray="4,4" />
                    {data.map((d, i) => {
                        const val = Math.round(d.value);
                        const bh = (Math.abs(val) / Math.max(maxAbs, 1)) * halfH;
                        const isPositive = val >= 0;
                        const barY = isPositive ? midY - bh : midY;
                        const color = isPositive ? '#2DCA72' : '#F43F5E';
                        return (
                            <G key={i} x={i * (barW + gap)}>
                                <Rect y={barY} width={barW} height={bh} fill={color} rx={6} />
                                <SvgText
                                    x={barW / 2}
                                    y={isPositive ? barY - 5 : barY + bh + 12}
                                    fill={color}
                                    fontSize="8" fontWeight="900" textAnchor="middle"
                                >
                                    {val > 0 ? '+' : ''}{val > 1000 || val < -1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                </SvgText>
                                <SvgText x={barW / 2} y={height - 6} fill="#8E8E93" fontSize="9" fontWeight="600" textAnchor="middle">
                                    {d.label}
                                </SvgText>
                            </G>
                        );
                    })}
                </G>
            </Svg>
        </ScrollView>
    );
};

// ── Transaction Row ──────────────────────────────────────────
const TransactionRow = React.memo(({ tx, index, formatCurrency }: { tx: any; index: number; formatCurrency: (n: number) => string }) => {
    const rawIcon = CATEGORY_ICONS[tx.category as Category] || 'receipt-outline';
    const iconName = rawIcon ? mapCategoryIcon(rawIcon) : 'receipt-outline';
    const iconColor = CATEGORY_COLORS[tx.category as Category] || '#111';

    return (
        <Animated.View entering={FadeInDown.delay(50 + index * 30).duration(300)}>
            <TouchableOpacity style={s.txRow} activeOpacity={0.7} onPress={() => { }}>
                <View style={[s.txIconWrap, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={iconName as any} size={20} color={iconColor} />
                </View>
                <View style={s.txMid}>
                    <Text style={s.txTitle} numberOfLines={1}>{tx.title}</Text>
                    <View style={s.txMeta}>
                        <Text style={s.txCat}>{tx.category || 'General'}</Text>
                        <Text style={s.txDot}>·</Text>
                        <Text style={s.txDate}>{ordinal(tx.day)} {MONTHS_SHORT[tx.month]}</Text>
                    </View>
                </View>
                <Text style={[s.txAmt, { color: tx.type === 'income' ? '#2DCA72' : '#111' }]}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount, formatCurrency)}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

// ── Types ────────────────────────────────────────────────────
type TimeFilter = 'Week' | 'Month' | 'Year' | 'Custom';
type ViewMode = 'spending' | 'income';

// ══════════════════════════════════════════════════════════════
// ── MAIN SCREEN ──────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
export default function AnalysisScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { formatCurrency } = useSettings();
    const { transactions } = useTransactions();

    const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('Month');
    const [viewMode, setViewMode] = useState<ViewMode>('spending');
    const now = new Date();
    const [mi, setMi] = useState(now.getMonth());
    const [yr, setYr] = useState(now.getFullYear());

    // Custom date range
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Transactions list
    const [showAllTx, setShowAllTx] = useState(false);

    const goPrev = () => { if (mi === 0) { setMi(11); setYr(y => y - 1); } else setMi(p => p - 1); };
    const goNext = () => { if (mi === 11) { setMi(0); setYr(y => y + 1); } else setMi(p => p + 1); };

    // ── Date Range ─────────────────────────────────────────
    const dateRange = useMemo(() => {
        let start = new Date(yr, mi, 1);
        let end = new Date(yr, mi + 1, 0, 23, 59, 59, 999);
        if (selectedFilter === 'Year') {
            start = new Date(yr, 0, 1);
            end = new Date(yr, 11, 31, 23, 59, 59, 999);
        } else if (selectedFilter === 'Week') {
            const today = new Date();
            if (mi === today.getMonth() && yr === today.getFullYear()) {
                end = new Date(today); end.setHours(23, 59, 59, 999);
                start = new Date(end); start.setDate(end.getDate() - 7); start.setHours(0, 0, 0, 0);
            } else {
                start = new Date(yr, mi, 1);
                end = new Date(yr, mi, 7, 23, 59, 59, 999);
            }
        } else if (selectedFilter === 'Custom' && customStart && customEnd) {
            const parts1 = customStart.split('/');
            const parts2 = customEnd.split('/');
            if (parts1.length === 3 && parts2.length === 3) {
                start = new Date(parseInt(parts1[2]), parseInt(parts1[1]) - 1, parseInt(parts1[0]));
                end = new Date(parseInt(parts2[2]), parseInt(parts2[1]) - 1, parseInt(parts2[0]), 23, 59, 59, 999);
            }
        }
        return { start, end };
    }, [selectedFilter, mi, yr, customStart, customEnd]);

    // ── Filtered Transactions ──────────────────────────────
    const filtered = useMemo(() => {
        if (selectedFilter === 'Month') {
            return transactions.filter(t => t.month === mi && t.year === yr);
        } else if (selectedFilter === 'Year') {
            return transactions.filter(t => t.year === yr);
        }

        const { start, end } = dateRange;
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
    }, [transactions, selectedFilter, mi, yr, dateRange]);

    // ── Summary Stats ──────────────────────────────────────
    const income = useMemo(() => filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [filtered]);
    const expense = useMemo(() => filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [filtered]);
    const balance = income - expense;
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : (expense > 0 ? -100 : 0);
    const healthScore = income === 0 && expense > 0 ? 0 : Math.min(Math.max(savingsRate + 50, 0), 100);

    // ── Category Data (respects viewMode) ──────────────────
    const categoryData = useMemo(() => {
        const isSpending = viewMode === 'spending';
        const map = new Map<Category, number>();
        filtered
            .filter(t => isSpending ? t.type === 'expense' : t.type === 'income')
            .forEach(t => {
                const cat = (t.category || 'Other') as Category;
                map.set(cat, (map.get(cat) || 0) + t.amount);
            });
        return Array.from(map.entries())
            .map(([name, amount]) => ({ name, amount, color: CATEGORY_COLORS[name] || '#795548', icon: CATEGORY_ICONS[name] || 'ellipsis-horizontal-circle-outline' }))
            .sort((a, b) => b.amount - a.amount);
    }, [filtered, viewMode]);

    const chartData = useMemo(() => categoryData.map(c => ({ value: c.amount, color: c.color, label: c.name })), [categoryData]);
    const totalCategoryAmt = useMemo(() => categoryData.reduce((s, c) => s + c.amount, 0), [categoryData]);

    // ── Trend Data & Income/Expense Trends (Combined for performance) ─────
    const { trendData, dualTrendData } = useMemo(() => {
        if (selectedFilter === 'Month' || selectedFilter === 'Custom') {
            const weeks = MONTHS_SHORT.map((_, i) => ({ label: `W${i + 1}`, income: 0, expense: 0, value: 0 })); // support up to 5 weeks
            const resultWeeks = [
                { label: 'W1', income: 0, expense: 0, value: 0 }, { label: 'W2', income: 0, expense: 0, value: 0 },
                { label: 'W3', income: 0, expense: 0, value: 0 }, { label: 'W4', income: 0, expense: 0, value: 0 },
            ];
            filtered.forEach(t => {
                const day = new Date(t.date).getDate();
                const idx = Math.min(Math.floor((day - 1) / 7), 3);
                if (t.type === 'income') resultWeeks[idx].income += t.amount;
                else if (t.type === 'expense') {
                    resultWeeks[idx].expense += t.amount;
                    resultWeeks[idx].value += t.amount;
                }
            });
            return { trendData: resultWeeks, dualTrendData: resultWeeks };
        } else if (selectedFilter === 'Year') {
            const months = MONTHS_SHORT.map(m => ({ label: m.charAt(0), income: 0, expense: 0, value: 0 }));
            filtered.forEach(t => {
                const mIdx = t.month;
                if (t.type === 'income') months[mIdx].income += t.amount;
                else if (t.type === 'expense') {
                    months[mIdx].expense += t.amount;
                    months[mIdx].value += t.amount;
                }
            });
            return { trendData: months, dualTrendData: months };
        } else if (selectedFilter === 'Week') {
            const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => ({ label: d, income: 0, expense: 0, value: 0 }));
            filtered.forEach(t => {
                const d = new Date(t.date);
                const dayIdx = (d.getDay() + 6) % 7; // Mon=0
                if (t.type === 'income') days[dayIdx].income += t.amount;
                else if (t.type === 'expense') {
                    days[dayIdx].expense += t.amount;
                    days[dayIdx].value += t.amount;
                }
            });
            return { trendData: days, dualTrendData: days };
        }
        return { trendData: [], dualTrendData: [] };
    }, [filtered, selectedFilter]);

    // ── Savings Trend Data ─────────────────────────────────
    const savingsTrendData = useMemo(() => {
        return dualTrendData.map(d => ({ label: d.label, value: d.income - d.expense }));
    }, [dualTrendData]);

    // ── Budget vs Actual ───────────────────────────────────
    const budgetCompareData = useMemo(() => {
        return Object.entries(BUDGET_LIMITS).map(([category, limit]) => {
            const actual = filtered
                .filter(t => t.category === category && t.type === 'expense')
                .reduce((s, t) => s + t.amount, 0);
            return { category, budget: limit, actual, percent: limit > 0 ? (actual / limit) * 100 : 0 };
        }).filter(d => d.actual > 0)
            .sort((a, b) => b.actual - a.actual);
    }, [filtered]);

    // ── Recurring Bills (Dynamic) ──────────────────────────
    const recurringBills = useMemo(() => {
        // Find recurring bills dynamically by grouping "Bills & Utilities" transactions by title
        const billsTxs = filtered.filter(t => t.type === 'expense' && (t.category === 'Bills & Utilities' || t.category === 'Subscriptions'));
        const map = new Map<string, { amount: number, date: Date }>();

        billsTxs.forEach(t => {
            const name = t.title || 'Unknown Bill';
            if (!map.has(name) || new Date(t.date) > map.get(name)!.date) {
                map.set(name, { amount: t.amount, date: new Date(t.date) });
            }
        });

        return Array.from(map.entries()).map(([name, data], i) => ({
            id: String(i),
            name,
            amount: data.amount,
            dueDate: data.date.getDate(),
            autoPay: false
        })).sort((a, b) => b.amount - a.amount).slice(0, 5); // top 5
    }, [filtered]);

    // ── Insight Stats ──────────────────────────────────────
    const days = Math.max(Math.ceil(Math.abs(dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)), 1);
    const expCount = filtered.filter(t => t.type === 'expense').length;
    const avgDay = expCount > 0 ? expense / days : 0;
    const avgTx = expCount > 0 ? expense / expCount : 0;

    const fmtL = (n: number) => fmt(n, formatCurrency);

    // ── Period Label & List ────────────────────────────────
    const periodLabel = selectedFilter === 'Year' ? `${yr}`
        : selectedFilter === 'Custom' ? (customStart && customEnd ? `${customStart} – ${customEnd}` : 'Select dates')
            : `${MONTHS[mi]} ${yr}`;

    // Sort transactions newest first
    const sortedFiltered = useMemo(() => {
        return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filtered]);

    // Reset showAll when filter changes
    useEffect(() => {
        setShowAllTx(false);
    }, [selectedFilter, mi, yr, customStart, customEnd]);

    return (
        <View style={[s.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={s.hTitle}>Monthly Analysis</Text>
                <TouchableOpacity style={s.exportBtn}>
                    <Ionicons name="download-outline" size={18} color="#2DCA72" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

                {/* ═══ Filter Row ═══ */}
                <Animated.View entering={FadeIn.delay(50).duration(350)} style={s.filterRow}>
                    {(['Week', 'Month', 'Year', 'Custom'] as TimeFilter[]).map(f => (
                        <TouchableOpacity
                            key={f} style={[s.filterChip, selectedFilter === f && s.filterActive]}
                            onPress={() => {
                                setSelectedFilter(f);
                                if (f === 'Custom') setShowDatePicker(true);
                            }}
                        >
                            <Text style={[s.filterTxt, selectedFilter === f && s.filterTxtActive]}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* Custom Date Range Display */}
                {selectedFilter === 'Custom' && (
                    <Animated.View entering={FadeInDown.delay(60).duration(300)}>
                        <TouchableOpacity style={s.customDateRow} onPress={() => setShowDatePicker(true)}>
                            <View style={s.customDateBlock}>
                                <Ionicons name="calendar-outline" size={14} color="#2DCA72" />
                                <Text style={s.customDateTxt}>{customStart || 'DD/MM/YYYY'}</Text>
                            </View>
                            <Ionicons name="arrow-forward" size={14} color="#C7C7CC" />
                            <View style={s.customDateBlock}>
                                <Ionicons name="calendar-outline" size={14} color="#2DCA72" />
                                <Text style={s.customDateTxt}>{customEnd || 'DD/MM/YYYY'}</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* ═══ View Mode Toggle ═══ */}
                <Animated.View entering={SlideInLeft.delay(80).duration(400).springify()} style={s.viewModeRow}>
                    <TouchableOpacity
                        style={[s.viewModeBtn, viewMode === 'spending' && s.viewModeBtnActiveRed]}
                        onPress={() => setViewMode('spending')}
                    >
                        <Ionicons name="trending-down" size={14} color={viewMode === 'spending' ? '#fff' : '#F43F5E'} />
                        <Text style={[s.viewModeTxt, viewMode === 'spending' && s.viewModeTxtActive]}>Spending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[s.viewModeBtn, viewMode === 'income' && s.viewModeBtnActiveGreen]}
                        onPress={() => setViewMode('income')}
                    >
                        <Ionicons name="trending-up" size={14} color={viewMode === 'income' ? '#fff' : '#2DCA72'} />
                        <Text style={[s.viewModeTxt, viewMode === 'income' && s.viewModeTxtActive]}>Income</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* ═══ Summary Hero ═══ */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                    <LinearGradient colors={['#1A1C20', '#0F1014']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroCard}>
                        <View style={s.heroTop}>
                            <View>
                                <Text style={s.heroPeriod}>{periodLabel}</Text>
                                <Text style={s.heroLabel}>Total Balance</Text>
                            </View>
                            {selectedFilter !== 'Custom' && (
                                <View style={s.navBtns}>
                                    <TouchableOpacity onPress={goPrev} style={s.navBtn}>
                                        <Ionicons name="chevron-back" size={16} color="#fff" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={goNext} style={s.navBtn}>
                                        <Ionicons name="chevron-forward" size={16} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <Animated.Text entering={BounceIn.delay(250).duration(500)} style={[s.heroBalance, { color: balance >= 0 ? '#2DCA72' : '#F43F5E' }]}>
                            {balance >= 0 ? '+' : ''}{fmt(balance, formatCurrency)}
                        </Animated.Text>

                        <View style={s.savingsRow}>
                            <View style={s.savingsBarBg}>
                                <View style={[s.savingsBarFill, { width: `${Math.max(savingsRate, 0)}%` }]} />
                            </View>
                            <Text style={s.savingsLabel}>{savingsRate}% saved</Text>
                        </View>

                        <View style={s.heroDivider} />

                        <View style={s.heroPills}>
                            <View style={s.heroPillGreen}>
                                <Ionicons name="trending-up" size={14} color="#2DCA72" />
                                <Text style={s.heroPillLbl}>Income</Text>
                                <Text style={s.heroPillGreenAmt}>{fmtL(income)}</Text>
                            </View>
                            <View style={s.heroPillRed}>
                                <Ionicons name="trending-down" size={14} color="#F43F5E" />
                                <Text style={s.heroPillLbl}>Expense</Text>
                                <Text style={s.heroPillRedAmt}>{fmtL(expense)}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* ═══ Income vs Expense Trend ═══ */}
                {dualTrendData.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(150).duration(400)} style={s.section}>
                        <View style={s.secTitleRow}>
                            <Text style={s.secTitle}>Income vs Expense</Text>
                            <View style={s.legendRow}>
                                <View style={s.legendItem}>
                                    <View style={[s.legendDot, { backgroundColor: '#2DCA72' }]} />
                                    <Text style={s.legendTxt}>Income</Text>
                                </View>
                                <View style={s.legendItem}>
                                    <View style={[s.legendDot, { backgroundColor: '#F43F5E' }]} />
                                    <Text style={s.legendTxt}>Expense</Text>
                                </View>
                            </View>
                        </View>
                        <View style={s.card}>
                            <DualBarChart data={dualTrendData} />
                        </View>
                    </Animated.View>
                )}

                {/* ═══ Spending Trends ═══ */}
                {trendData.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(200).duration(400)} style={s.section}>
                        <Text style={s.secTitle}>Spending Trends</Text>
                        <View style={s.card}>
                            <Text style={s.cardSub}>Expense over time</Text>
                            <BarChart data={trendData} />
                        </View>
                    </Animated.View>
                )}

                {/* ═══ Categories ═══ */}
                <Animated.View entering={FadeInDown.delay(300).duration(400)} style={s.section}>
                    <Text style={s.secTitle}>
                        {viewMode === 'spending' ? 'Expense' : 'Income'} Categories
                    </Text>
                    <View style={s.card}>
                        {categoryData.length === 0 ? (
                            <View style={s.emptyWrap}>
                                <Ionicons name="pie-chart-outline" size={36} color="#C7C7CC" />
                                <Text style={s.emptyTxt}>No {viewMode} data for this selection</Text>
                            </View>
                        ) : (
                            <>
                                <Animated.View
                                    entering={ZoomIn.delay(350).duration(600).springify()}
                                    style={s.donutWrap}
                                >
                                    <DonutChart data={chartData} size={190} strokeWidth={32} />
                                </Animated.View>
                                <View style={s.catList}>
                                    {categoryData.map((cat, i) => (
                                        <Animated.View key={cat.name} entering={FadeInDown.delay(350 + i * 40).duration(300)} style={s.catRow}>
                                            <View style={[s.catIcon, { backgroundColor: cat.color + '14' }]}>
                                                <Ionicons name={cat.icon as any} size={16} color={cat.color} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <View style={s.catNameRow}>
                                                    <Text style={s.catName}>{cat.name}</Text>
                                                    {i === 0 && <View style={s.topBadge}><Ionicons name="flame-outline" size={10} color="#F43F5E" /><Text style={s.topBadgeTxt}>Top</Text></View>}
                                                </View>
                                                <View style={s.progressBg}>
                                                    <View style={[s.progressFill, { width: `${(cat.amount / Math.max(totalCategoryAmt, 1)) * 100}%`, backgroundColor: cat.color }]} />
                                                </View>
                                            </View>
                                            <View style={s.catRight}>
                                                <Text style={s.catAmt}>{fmt(cat.amount, formatCurrency)}</Text>
                                                <Text style={s.catPct}>{((cat.amount / Math.max(totalCategoryAmt, 1)) * 100).toFixed(0)}%</Text>
                                            </View>
                                        </Animated.View>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>

                {/* ═══ Budget vs Actual ═══ */}
                {viewMode === 'spending' && budgetCompareData.length > 0 && (
                    <Animated.View entering={SlideInRight.delay(350).duration(500).springify()} style={s.section}>
                        <Text style={s.secTitle}>Budget vs Actual</Text>
                        <View style={s.card}>
                            <BudgetBars data={budgetCompareData} formatCurrency={formatCurrency} />
                        </View>
                    </Animated.View>
                )}

                {/* ═══ Financial Health ═══ */}
                <Animated.View entering={ZoomIn.delay(370).duration(500).springify()} style={s.section}>
                    <Text style={s.secTitle}>Financial Health</Text>
                    <View style={s.card}>
                        <HealthGauge score={healthScore} />
                        <Text style={s.healthDescription}>
                            {healthScore < 40 ? 'High spending compared to income this period.'
                                : `Based on your savings rate (${savingsRate}%) and spending patterns.`}
                        </Text>
                    </View>
                </Animated.View>

                {/* ═══ Recurring Bills ═══ */}
                {recurringBills.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(390).duration(400)} style={s.section}>
                        <Text style={s.secTitle}>Recurring Bills</Text>
                        <View style={s.card}>
                            {recurringBills.map((bill, i) => (
                                <Animated.View key={bill.id} entering={SlideInLeft.delay(420 + i * 80).duration(400).springify()} style={[s.billRow, i < recurringBills.length - 1 && s.billBorder]}>
                                    <View style={s.billIcon}>
                                        <Ionicons name="receipt-outline" size={16} color="#007AFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.billName}>{bill.name}</Text>
                                        <Text style={s.billDue}>Due {ordinal(bill.dueDate)}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={s.billAmt}>-{fmtL(bill.amount)}</Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* ═══ Savings Chart ═══ */}
                {savingsTrendData.length > 0 && (
                    <Animated.View entering={FadeInDown.delay(410).duration(400)} style={s.section}>
                        <Text style={s.secTitle}>
                            {selectedFilter === 'Week' ? 'Daily' : selectedFilter === 'Year' ? 'Monthly' : 'Weekly'} Savings
                        </Text>
                        <View style={s.card}>
                            <Text style={s.cardSub}>Net savings per period</Text>
                            <SavingsChart data={savingsTrendData} />
                        </View>
                    </Animated.View>
                )}

                {/* ═══ Insights Grid ═══ */}
                <Animated.View entering={FadeInUp.delay(430).duration(400)} style={s.section}>
                    <Text style={s.secTitle}>Financial Insights</Text>
                    <View style={s.insightGrid}>
                        {[
                            { label: 'Daily Avg Spend', value: fmtL(Math.round(avgDay)), icon: 'calendar-outline' as const, color: '#FF9500' },
                            { label: 'Per Transaction', value: fmtL(Math.round(avgTx)), icon: 'receipt-outline' as const, color: '#007AFF' },
                            { label: 'Savings Rate', value: `${savingsRate}%`, icon: 'shield-checkmark-outline' as const, color: '#2DCA72' },
                            { label: 'Total Tx', value: `${filtered.length}`, icon: 'layers-outline' as const, color: '#AF52DE' },
                        ].map((ins, i) => (
                            <Animated.View key={ins.label} entering={BounceIn.delay(460 + i * 80).duration(400)} style={s.insightCard}>
                                <View style={[s.insightIcon, { backgroundColor: ins.color + '12' }]}>
                                    <Ionicons name={ins.icon} size={16} color={ins.color} />
                                </View>
                                <Text style={s.insightLabel}>{ins.label}</Text>
                                <Text style={s.insightValue}>{ins.value}</Text>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* ═══ Recent Transactions ═══ */}
                <Animated.View entering={FadeInUp.delay(450).duration(400)} style={s.section}>
                    <View style={s.txHeaderRow}>
                        <Text style={s.secTitle}>Transactions</Text>
                        <Text style={s.txCountTxt}>{filtered.length} total</Text>
                    </View>
                    <View style={s.card}>
                        {sortedFiltered.length === 0 ? (
                            <View style={s.emptyWrap}>
                                <Ionicons name="receipt-outline" size={36} color="#C7C7CC" />
                                <Text style={s.emptyTxt}>No transactions in this period</Text>
                            </View>
                        ) : (
                            <View>
                                {sortedFiltered.slice(0, showAllTx ? sortedFiltered.length : 5).map((tx, i) => (
                                    <TransactionRow key={tx.id || tx._id || i} tx={tx} index={i} formatCurrency={formatCurrency} />
                                ))}
                                {sortedFiltered.length > 5 && (
                                    <TouchableOpacity
                                        style={s.showAllBtn}
                                        onPress={() => setShowAllTx(!showAllTx)}
                                    >
                                        <Text style={s.showAllTxt}>
                                            {showAllTx ? 'Show Less' : `View All ${sortedFiltered.length} Transactions`}
                                        </Text>
                                        <Ionicons
                                            name={showAllTx ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color="#007AFF"
                                        />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                </Animated.View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ═══ Custom Date Picker Modal ═══ */}
            <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <View style={s.modalHeader}>
                            <Text style={s.modalTitle}>Custom Date Range</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Ionicons name="close-circle" size={26} color="#C7C7CC" />
                            </TouchableOpacity>
                        </View>
                        <Text style={s.modalHint}>Format: DD/MM/YYYY</Text>

                        <View style={s.modalInputRow}>
                            <View style={s.modalInputWrap}>
                                <Ionicons name="calendar-outline" size={16} color="#2DCA72" />
                                <TextInput
                                    style={s.modalInput}
                                    placeholder="01/01/2026"
                                    placeholderTextColor="#C7C7CC"
                                    value={customStart}
                                    onChangeText={setCustomStart}
                                    keyboardType="numbers-and-punctuation"
                                    maxLength={10}
                                />
                            </View>
                            <Ionicons name="arrow-forward" size={16} color="#C7C7CC" />
                            <View style={s.modalInputWrap}>
                                <Ionicons name="calendar-outline" size={16} color="#F43F5E" />
                                <TextInput
                                    style={s.modalInput}
                                    placeholder="31/01/2026"
                                    placeholderTextColor="#C7C7CC"
                                    value={customEnd}
                                    onChangeText={setCustomEnd}
                                    keyboardType="numbers-and-punctuation"
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[s.modalApplyBtn, (!customStart || !customEnd) && { opacity: 0.4 }]}
                            disabled={!customStart || !customEnd}
                            onPress={() => setShowDatePicker(false)}
                        >
                            <Text style={s.modalApplyTxt}>Apply Range</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ══════════════════════════════════════════════════════════════
// ── STYLES ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    hTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
    exportBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
    scroll: { paddingHorizontal: 24, paddingTop: 16 },

    // Filter
    filterRow: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 14, padding: 3, marginBottom: 12 },
    filterChip: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
    filterActive: { backgroundColor: '#111' },
    filterTxt: { fontSize: 11, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase' },
    filterTxtActive: { color: '#fff', fontWeight: '700' },

    // Custom Date
    customDateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#F9F9FB', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F2F2F7' },
    customDateBlock: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#F2F2F7' },
    customDateTxt: { fontSize: 12, fontWeight: '600', color: '#111' },

    // View Mode
    viewModeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    viewModeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#F2F2F7' },
    viewModeBtnActiveRed: { backgroundColor: '#F43F5E', borderColor: '#F43F5E' },
    viewModeBtnActiveGreen: { backgroundColor: '#2DCA72', borderColor: '#2DCA72' },
    viewModeTxt: { fontSize: 12, fontWeight: '700', color: '#3A3A3C', textTransform: 'uppercase' },
    viewModeTxtActive: { color: '#fff' },

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

    // Section
    section: { marginBottom: 22 },
    secTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 10 },
    secTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    card: { backgroundColor: '#fff', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#F2F2F7', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 }, android: { elevation: 2 } }) },
    cardSub: { fontSize: 11, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },

    // Legend
    legendRow: { flexDirection: 'row', gap: 10 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendTxt: { fontSize: 10, fontWeight: '600', color: '#8E8E93' },

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

    // Budget
    budgetCatName: { fontSize: 12, fontWeight: '600', color: '#111' },
    budgetPct: { fontSize: 12, fontWeight: '800' },
    budgetBarBg: { height: 8, backgroundColor: '#F2F2F7', borderRadius: 4, overflow: 'hidden' },
    budgetBarFill: { height: '100%', borderRadius: 4 },
    budgetSubTxt: { fontSize: 9, fontWeight: '600', color: '#C7C7CC' },

    // Health Gauge
    healthBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
    healthBadgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    healthDescription: { fontSize: 11, fontWeight: '500', color: '#8E8E93', textAlign: 'center', marginTop: 12 },

    // Recurring Bills
    billRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    billBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    billIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,122,255,0.08)', justifyContent: 'center', alignItems: 'center' },
    billName: { fontSize: 13, fontWeight: '700', color: '#111' },
    billDue: { fontSize: 10, fontWeight: '500', color: '#8E8E93', marginTop: 2 },
    billAmt: { fontSize: 13, fontWeight: '700', color: '#F43F5E' },
    autoPayBadge: { backgroundColor: '#F2F2F7', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginTop: 3 },
    autoPayTxt: { fontSize: 8, fontWeight: '700', color: '#8E8E93' },

    // Insights
    insightGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    insightCard: { flex: 1, minWidth: '45%' as any, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F2F2F7' },
    insightIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    insightLabel: { fontSize: 10, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    insightValue: { fontSize: 17, fontWeight: '800', color: '#111' },

    emptyWrap: { alignItems: 'center', paddingVertical: 36, gap: 10 },
    emptyTxt: { fontSize: 13, color: '#C7C7CC', fontWeight: '500' },

    // Transaction Row
    txHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16, paddingHorizontal: 4 },
    txCountTxt: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
    txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    txIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txMid: { flex: 1 },
    txTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 3 },
    txMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    txCat: { fontSize: 11, color: '#8E8E93', fontWeight: '500' },
    txDot: { fontSize: 11, color: '#C7C7CC' },
    txDate: { fontSize: 11, color: '#8E8E93', fontWeight: '500' },
    txAmt: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
    showAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#F2F2F7', marginTop: 4 },
    showAllTxt: { fontSize: 14, fontWeight: '600', color: '#007AFF' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    modalHint: { fontSize: 11, color: '#C7C7CC', fontWeight: '600', marginBottom: 16 },
    modalInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    modalInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#F2F2F7' },
    modalInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111' },
    modalApplyBtn: { backgroundColor: '#111', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    modalApplyTxt: { fontSize: 14, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
});
