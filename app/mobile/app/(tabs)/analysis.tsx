import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, InteractionManager, ActivityIndicator, Animated, Modal, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DonutChart from '@/components/DonutChart';
import TrendsChart, { DayDataPoint } from '@/components/TrendsChart';
import { useTransactions, Category, CATEGORY_COLORS, CATEGORY_ICONS, mapCategoryIcon } from '@/context/TransactionContext';
import { LucideCategoryIcon } from '@/app/features/categories';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import * as Haptics from 'expo-haptics';
import { useThemeStyles } from '@/components/more/DesignSystem';

const { width } = Dimensions.get('window');
type TimeFilter = 'Week' | 'Month' | 'Year' | 'Custom';

// ── Reusable Inner Pill Slider ──────────────────────────────────────────
const PillSegment = ({ options, selectedIndex, onChange }: any) => {
    const { tokens } = useThemeStyles();
    const position = useRef(new Animated.Value(selectedIndex)).current;
    const [w, setW] = useState(0);

    useEffect(() => {
        Animated.spring(position, {
            toValue: selectedIndex,
            useNativeDriver: true,
            bounciness: 4,
            speed: 12,
        }).start();
    }, [selectedIndex]);

    const animStyle = {
        transform: [{
            translateX: position.interpolate({
                inputRange: [0, 1],
                outputRange: [0, w > 0 ? w : 1]
            })
        }]
    };

    return (
        <View style={{ flexDirection: 'row', backgroundColor: tokens.bgSecondary, borderRadius: 24, padding: 4, position: 'relative' }}>
            {w > 0 && (
                <Animated.View style={[{ position: 'absolute', top: 4, bottom: 4, left: 4, width: w, borderRadius: 20, backgroundColor: tokens.pillSurface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }, animStyle]} />
            )}
            {options.map((opt: string, i: number) => (
                <TouchableOpacity
                    key={opt}
                    style={{ flex: 1, paddingVertical: 10, alignItems: 'center', zIndex: 2 }}
                    onLayout={(e) => { if (i === 0) setW(e.nativeEvent.layout.width); }}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onChange(i);
                    }}
                >
                    <Text style={{ fontSize: 13, fontWeight: selectedIndex === i ? '700' : '600', color: selectedIndex === i ? tokens.textPrimary : tokens.textMuted }}>{opt}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// SimpleBarChart removed — replaced by TrendsChart component

// ── Custom Drop-in Wheel Picker ───────────────────────────────────────
const WheelPicker = React.memo(({ items, selectedValue, onValueChange, tokens }: any) => {
    const ITEM_HEIGHT = 44;
    const flatListRef = useRef<FlatList>(null);
    const initialIndex = items.findIndex((i: any) => i === selectedValue);

    const handleScrollEnd = (e: any) => {
        const y = e.nativeEvent.contentOffset.y;
        const index = Math.round(y / ITEM_HEIGHT);
        if (items[index] && items[index] !== selectedValue) {
            onValueChange(items[index]);
        }
    };

    return (
        <View style={{ height: ITEM_HEIGHT * 3, width: 80, overflow: 'hidden' }}>
            <View style={{ position: 'absolute', top: ITEM_HEIGHT, left: 4, right: 4, height: ITEM_HEIGHT, backgroundColor: tokens.borderSubtle, borderRadius: 8 }} />
            <FlatList
                ref={flatListRef}
                data={['', ...items, '']}
                keyExtractor={(item, i) => i.toString()}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                contentContainerStyle={{ paddingVertical: 0 }}
                onMomentumScrollEnd={handleScrollEnd}
                onScrollEndDrag={handleScrollEnd}
                getItemLayout={(data, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                initialScrollIndex={Math.max(0, initialIndex)}
                renderItem={({ item }) => (
                    <View style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: item === selectedValue ? '800' : '500', color: item === selectedValue ? tokens.textPrimary : tokens.textMuted }}>
                            {item}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
});

const CustomDateInlinePicker = React.memo(({ date, onChange, tokens }: any) => {
    const days = Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0'));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const years = Array.from({length: 30}, (_, i) => (new Date().getFullYear() - 10 + i).toString());

    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 132, backgroundColor: tokens.bgPrimary, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tokens.borderSubtle }}>
            <WheelPicker items={days} selectedValue={date.getDate().toString().padStart(2, '0')} tokens={tokens} onValueChange={(val: string) => {
                const newD = new Date(date); newD.setDate(parseInt(val)); onChange(newD);
            }} />
            <WheelPicker items={months} selectedValue={months[date.getMonth()]} tokens={tokens} onValueChange={(val: string) => {
                const newD = new Date(date); newD.setMonth(months.indexOf(val)); onChange(newD);
            }} />
            <WheelPicker items={years} selectedValue={date.getFullYear().toString()} tokens={tokens} onValueChange={(val: string) => {
                const newD = new Date(date); newD.setFullYear(parseInt(val)); onChange(newD);
            }} />
        </View>
    );
});

export default function AnalysisScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { transactions, getCategoryMeta } = useTransactions();
    const { formatCurrency, isDarkMode } = useSettings();
    const { tokens, styles: tStyles } = useThemeStyles();

    const [isReady, setIsReady] = useState(false);
    useEffect(() => { InteractionManager.runAfterInteractions(() => setIsReady(true)); }, []);

    const [filterIdx, setFilterIdx] = useState(0); // 0: Week, 1: Month, 2: Year, 3: Custom
    const filters: TimeFilter[] = ['Week', 'Month', 'Year', 'Custom'];
    const selectedFilter = filters[filterIdx];

    const now = new Date();
    const [anchorDate, setAnchorDate] = useState(now);
    const [customStart, setCustomStart] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
    const [customEnd, setCustomEnd] = useState<Date>(now);
    
    // Custom Range Modal logic
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [drType, setDrType] = useState(0); 
    const [modalStart, setModalStart] = useState<Date>(customStart);
    const [modalEnd, setModalEnd] = useState<Date>(customEnd);
    const [openPicker, setOpenPicker] = useState<'from' | 'to' | null>('from');

    // Sub-segment states
    const [trendSegment, setTrendSegment] = useState(0); // 0 Spending, 1 Income
    const [catSegment, setCatSegment] = useState(0); // 0 Spending, 1 Income
    const [paySegment, setPaySegment] = useState(0); // 0 Spending, 1 Income, 2 Transfers
    const [isCompare, setIsCompare] = useState(false);

    const goToPrev = () => {
        setAnchorDate(prev => {
            const d = new Date(prev);
            if (selectedFilter === 'Month') d.setMonth(d.getMonth() - 1);
            else if (selectedFilter === 'Year') d.setFullYear(d.getFullYear() - 1);
            else if (selectedFilter === 'Week') d.setDate(d.getDate() - 7);
            return d;
        });
    };

    const goToNext = () => {
        setAnchorDate(prev => {
            const d = new Date(prev);
            if (selectedFilter === 'Month') d.setMonth(d.getMonth() + 1);
            else if (selectedFilter === 'Year') d.setFullYear(d.getFullYear() + 1);
            else if (selectedFilter === 'Week') d.setDate(d.getDate() + 7);
            return d;
        });
    };

    const dateRange = useMemo(() => {
        let start = new Date(anchorDate);
        let end = new Date(anchorDate);

        if (selectedFilter === 'Year') {
            start.setMonth(0, 1); start.setHours(0, 0, 0, 0);
            end.setMonth(11, 31); end.setHours(23, 59, 59, 999);
        } else if (selectedFilter === 'Month') {
            start.setDate(1); start.setHours(0, 0, 0, 0);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0); end.setHours(23, 59, 59, 999);
        } else if (selectedFilter === 'Week') {
            const dayOfWeek = start.getDay() === 0 ? 6 : start.getDay() - 1;
            start.setDate(start.getDate() - dayOfWeek); start.setHours(0, 0, 0, 0);
            end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23, 59, 59, 999);
        } else if (selectedFilter === 'Custom') {
            start = new Date(customStart); start.setHours(0, 0, 0, 0);
            end = new Date(customEnd); end.setHours(23, 59, 59, 999);
        }
        return { start, end };
    }, [selectedFilter, anchorDate, customStart, customEnd]);

    const headerDateText = useMemo(() => {
        if (selectedFilter === 'Week' || selectedFilter === 'Custom') {
            return `${dateRange.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${dateRange.end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
        }
        if (selectedFilter === 'Month') return dateRange.start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
        if (selectedFilter === 'Year') return dateRange.start.getFullYear().toString();
        return '';
    }, [selectedFilter, dateRange]);

    const filteredTxs = useMemo(() => {
        const { start, end } = dateRange;
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
    }, [transactions, dateRange]);

    const monthlyIncome = useMemo(() => filteredTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0), [filteredTxs]);
    const monthlyExpense = useMemo(() => filteredTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [filteredTxs]);
    const monthlyBalance = monthlyIncome - monthlyExpense;

    // ── Previous period date range (for compare) ───────────────────────
    const prevDateRange = useMemo(() => {
        const { start, end } = dateRange;
        const diffMs = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        prevEnd.setHours(23, 59, 59, 999);
        const prevStart = new Date(prevEnd.getTime() - diffMs);
        prevStart.setHours(0, 0, 0, 0);
        return { start: prevStart, end: prevEnd };
    }, [dateRange]);

    const prevFilteredTxs = useMemo(() => {
        const { start, end } = prevDateRange;
        return transactions.filter(t => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
    }, [transactions, prevDateRange]);

    const compareLabel = useMemo(() => {
        const { start } = prevDateRange;
        return start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    }, [prevDateRange]);

    // ── Day-level data for Trends charts ────────────────────────
    const buildDayData = (txs: any[], range: { start: Date; end: Date }, isExpense: boolean): DayDataPoint[] => {
        const { start, end } = range;
        const daysCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const targetTxs = txs.filter(t => t.type === (isExpense ? 'expense' : 'income'));
        const dayMap = new Map<number, number>();
        targetTxs.forEach(t => {
            const d = new Date(t.date).getDate();
            dayMap.set(d, (dayMap.get(d) || 0) + t.amount);
        });

        const points: DayDataPoint[] = [];
        let cumulative = 0;
        for (let i = 0; i < daysCount; i++) {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            const dayNum = d.getDate();
            const val = dayMap.get(dayNum) || 0;
            cumulative += val;
            const label = `${String(dayNum).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            const isFuture = d > today;
            points.push({ label, value: val, cumulative, isFuture });
        }

        // For future days, extrapolate prediction from avg of past days
        const pastPoints = points.filter(p => !p.isFuture);
        if (pastPoints.length > 0) {
            const avgPerDay = pastPoints[pastPoints.length - 1].cumulative / pastPoints.length;
            let lastCum = pastPoints[pastPoints.length - 1].cumulative;
            points.forEach(p => {
                if (p.isFuture) {
                    lastCum += avgPerDay;
                    p.cumulative = lastCum;
                    p.value = avgPerDay;
                }
            });
        }
        return points;
    };

    const trendsDayData = useMemo(() => {
        return buildDayData(filteredTxs, dateRange, trendSegment === 0);
    }, [filteredTxs, dateRange, trendSegment]);

    const previousDayData = useMemo(() => {
        return buildDayData(prevFilteredTxs, prevDateRange, trendSegment === 0);
    }, [prevFilteredTxs, prevDateRange, trendSegment]);

    const currentTrendAvg = useMemo(() => {
        const pastPts = trendsDayData.filter(p => !p.isFuture && p.value > 0);
        if (pastPts.length === 0) return 0;
        return pastPts.reduce((s, p) => s + p.value, 0) / trendsDayData.filter(p => !p.isFuture).length;
    }, [trendsDayData]);

    const previousTrendAvg = useMemo(() => {
        if (previousDayData.length === 0) return 0;
        return previousDayData.reduce((s, p) => s + p.value, 0) / previousDayData.length;
    }, [previousDayData]);

    const trendData = useMemo(() => {
        const isExpense = trendSegment === 0;
        const targetTxs = filteredTxs.filter(t => t.type === (isExpense ? 'expense' : 'income'));

        if (selectedFilter === 'Week') {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({ label: d, value: 0 }));
            targetTxs.forEach(t => {
                const day = new Date(t.date).getDay();
                const idx = day === 0 ? 6 : day - 1;
                days[idx].value += t.amount;
            });
            return days;
        } else if (selectedFilter === 'Year') {
            const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map(m => ({ label: m, value: 0 }));
            targetTxs.forEach(t => { months[new Date(t.date).getMonth()].value += t.amount; });
            return months;
        } else {
            const weeks = [{ label: 'W1', value: 0 }, { label: 'W2', value: 0 }, { label: 'W3', value: 0 }, { label: 'W4', value: 0 }];
            targetTxs.forEach(t => {
                const day = new Date(t.date).getDate();
                if (day <= 7) weeks[0].value += t.amount;
                else if (day <= 14) weeks[1].value += t.amount;
                else if (day <= 21) weeks[2].value += t.amount;
                else weeks[3].value += t.amount;
            });
            return weeks;
        }
    }, [filteredTxs, selectedFilter, trendSegment]);

    const categoryData = useMemo(() => {
        const isExpense = catSegment === 0;
        const targetTxs = filteredTxs.filter(t => t.type === (isExpense ? 'expense' : 'income'));
        const map = new Map<Category, number>();
        targetTxs.forEach(t => map.set(t.category as Category, (map.get(t.category as Category) || 0) + t.amount));
        const total = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;
        return Array.from(map.entries())
            .map(([name, amount]) => {
                const meta = getCategoryMeta(name);
                return {
                    name, amount,
                    color: meta.color,
                    icon: meta.icon,
                    isLucide: meta.isLucide,
                    percent: (amount / total) * 100
                };
            })
            .sort((a, b) => b.amount - a.amount);
    }, [filteredTxs, catSegment, getCategoryMeta]);

    const paymentModesData = useMemo(() => {
        const typeFilter = paySegment === 0 ? 'expense' : (paySegment === 1 ? 'income' : 'transfer');
        const list = filteredTxs.filter(t => t.type === typeFilter);
        const map = new Map<string, number>();
        list.forEach(t => map.set(t.account || 'Cash', (map.get(t.account || 'Cash') || 0) + t.amount));
        return Array.from(map.entries()).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    }, [filteredTxs, paySegment]);

    const diffTime = Math.max(86400000, Math.abs(dateRange.end.getTime() - dateRange.start.getTime()));
    const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Stats logic exactly matching the mock
    const avgSpendingPerDay = filteredTxs.length > 0 ? monthlyExpense / daysInRange : 0;
    const expenseTxCount = filteredTxs.filter(t => t.type === 'expense').length;
    const avgSpendingPerTx = expenseTxCount > 0 ? monthlyExpense / expenseTxCount : 0;
    const incomeTxCount = filteredTxs.filter(t => t.type === 'income').length;
    const avgIncomePerDay = monthlyIncome / daysInRange;
    const avgIncomePerTx = incomeTxCount > 0 ? monthlyIncome / incomeTxCount : 0;

    if (!isReady) return (
        <View style={{ flex: 1, backgroundColor: tokens.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={tokens.amber.stroke} />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: tokens.bgPrimary, paddingTop: insets.top }}>
            {/* Top Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: tokens.textPrimary }}>Analysis</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => router.push('/features/pulse-ai')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tokens.bgSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: tokens.borderDefault }}>
                        <Ionicons name="sparkles-outline" size={20} color={tokens.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/features/export')} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tokens.bgSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: tokens.borderDefault }}>
                        <Ionicons name="download-outline" size={20} color={tokens.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                {/* Master Pill Filter */}
                <PillSegment options={filters} selectedIndex={filterIdx} onChange={(idx: number) => {
                    setFilterIdx(idx);
                    if (idx === 3) {
                        setModalStart(customStart);
                        setModalEnd(customEnd);
                        setShowRangeModal(true);
                    }
                }} />

                {/* Date Navigator Card */}
                <View style={{ backgroundColor: tokens.cardSurface, borderRadius: 20, marginVertical: 20, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: tokens.borderDefault }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 }}>
                        <TouchableOpacity onPress={goToPrev} style={{ padding: 10 }}><Ionicons name="chevron-back" size={20} color={tokens.textPrimary} /></TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.7} onPress={() => {
                            if (selectedFilter === 'Custom') setShowRangeModal(true);
                        }} style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: tokens.textPrimary }}>{headerDateText}</Text>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: tokens.textMuted, marginTop: 4, letterSpacing: 1 }}>{filteredTxs.length} TRANSACTIONS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={goToNext} style={{ padding: 10 }}><Ionicons name="chevron-forward" size={20} color={tokens.textPrimary} /></TouchableOpacity>
                    </View>
                </View>

                {/* Balance Glow Card */}
                <View style={{ borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: tokens.borderDefault, backgroundColor: tokens.cardSurface, marginBottom: 30 }}>
                    {/* The glowing aura */}
                    <LinearGradient
                        colors={isDarkMode 
                            ? ['rgba(235, 78, 107, 0.25)', 'transparent', 'rgba(45, 202, 114, 0.25)'] 
                            : ['rgba(235, 78, 107, 0.15)', 'transparent', 'rgba(45, 202, 114, 0.15)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        locations={[0, 0.5, 1]}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 }}>
                        <View>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#EB4E6B', letterSpacing: 1, marginBottom: 8 }}>SPENDING</Text>
                            <Text style={{ fontSize: 32, fontWeight: '800', color: tokens.textPrimary }}>₹{monthlyExpense.toLocaleString('en-IN')}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#2DCA72', letterSpacing: 1, marginBottom: 8 }}>INCOME</Text>
                            <Text style={{ fontSize: 32, fontWeight: '800', color: tokens.textPrimary }}>₹{monthlyIncome.toLocaleString('en-IN')}</Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: tokens.bgSecondary, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, zIndex: 2 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: tokens.textMuted }}>Net Balance</Text>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: tokens.textPrimary }}>{monthlyBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(monthlyBalance))}</Text>
                    </View>
                </View>

                {/* Trends Section */}
                <Text style={{ fontSize: 20, fontWeight: '800', color: tokens.textPrimary, marginBottom: 12 }}>Trends</Text>
                <View style={{ backgroundColor: tokens.cardSurface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: tokens.borderDefault, marginBottom: 30 }}>
                    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                        <PillSegment options={['Spending', 'Income']} selectedIndex={trendSegment} onChange={setTrendSegment} />
                    </View>
                    <TrendsChart
                        tokens={tokens}
                        currentData={trendsDayData}
                        previousData={previousDayData}
                        currentAvg={currentTrendAvg}
                        previousAvg={previousTrendAvg}
                        isCompare={isCompare}
                        onToggleCompare={setIsCompare}
                        compareLabel={compareLabel}
                        isSpending={trendSegment === 0}
                        formatCurrency={formatCurrency}
                    />
                </View>

                {/* Categories Section */}
                <Text style={{ fontSize: 20, fontWeight: '800', color: tokens.textPrimary, marginBottom: 12 }}>Categories</Text>
                <View style={{ backgroundColor: tokens.cardSurface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: tokens.borderDefault, marginBottom: 30 }}>
                    <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
                        <PillSegment options={['Spending', 'Income']} selectedIndex={catSegment} onChange={setCatSegment} />
                    </View>
                    {categoryData.length > 0 ? (
                        <>
                            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                                <DonutChart data={categoryData.map(c => ({ value: c.amount, color: c.color, label: c.name }))} size={200} strokeWidth={40} />
                            </View>
                            {categoryData.map((cat, i) => (
                                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: i === categoryData.length - 1 ? 0 : 1, borderBottomColor: tokens.borderSubtle }}>
                                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: cat.color + '22', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                                        {cat.isLucide ? (
                                            <LucideCategoryIcon name={cat.icon} size={20} color={cat.color} />
                                        ) : (
                                            <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                                        )}
                                    </View>
                                    <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: tokens.textPrimary }}>{cat.name}</Text>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '800', color: tokens.textPrimary }}>₹{cat.amount.toLocaleString('en-IN')}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <MaterialCommunityIcons name={catSegment === 0 ? "menu-down" : "menu-up"} size={14} color={catSegment === 0 ? tokens.red.stroke : tokens.green.stroke} />
                                            <Text style={{ fontSize: 11, fontWeight: '700', color: catSegment === 0 ? tokens.red.stroke : tokens.green.stroke }}>{cat.percent.toFixed(1)}%</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </>
                    ) : (
                        <Text style={{ textAlign: 'center', marginVertical: 40, color: tokens.textMuted }}>No data available.</Text>
                    )}
                </View>

                {/* Payment Modes */}
                <Text style={{ fontSize: 20, fontWeight: '800', color: tokens.textPrimary, marginBottom: 12 }}>Payment modes</Text>
                <View style={{ backgroundColor: tokens.cardSurface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: tokens.borderDefault, marginBottom: 30 }}>
                    <View style={{ paddingHorizontal: 10, marginBottom: 20 }}>
                        <PillSegment options={['Spending', 'Income', 'Transfers']} selectedIndex={paySegment} onChange={setPaySegment} />
                    </View>
                    {paymentModesData.length > 0 ? paymentModesData.map((pm, i) => (
                        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: i === paymentModesData.length - 1 ? 0 : 1, borderBottomColor: tokens.borderSubtle }}>
                            <Ionicons name="business-outline" size={24} color={tokens.teal.stroke} style={{ marginRight: 16 }} />
                            <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: tokens.textPrimary }}>{pm.name}</Text>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: tokens.textPrimary }}>₹{pm.amount.toLocaleString('en-IN')}</Text>
                        </View>
                    )) : (
                        <Text style={{ textAlign: 'center', marginVertical: 20, color: tokens.textMuted }}>No payment modes recorded.</Text>
                    )}
                </View>

                {/* Stats */}
                <Text style={{ fontSize: 20, fontWeight: '800', color: tokens.textPrimary, marginBottom: 12 }}>Stats</Text>
                <View style={{ backgroundColor: tokens.cardSurface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: tokens.borderDefault, marginBottom: 30 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: tokens.red.stroke, letterSpacing: 1, marginBottom: 16 }}>AVERAGE SPENDING</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: tokens.textMuted, marginBottom: 6 }}>Per day</Text>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: tokens.textPrimary }}>₹{avgSpendingPerDay.toFixed(1)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: tokens.textMuted, marginBottom: 6 }}>Per transaction</Text>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: tokens.textPrimary }}>₹{avgSpendingPerTx.toFixed(2)}</Text>
                        </View>
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: tokens.green.stroke, letterSpacing: 1, marginBottom: 16 }}>AVERAGE INCOME</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: tokens.textMuted, marginBottom: 6 }}>Per day</Text>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: tokens.textPrimary }}>₹{avgIncomePerDay.toFixed(1)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: tokens.textMuted, marginBottom: 6 }}>Per transaction</Text>
                            <Text style={{ fontSize: 24, fontWeight: '800', color: tokens.textPrimary }}>₹{avgIncomePerTx.toFixed(1)}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* Custom Date Range Bottom Sheet Modal */}
            <Modal
                visible={showRangeModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowRangeModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: tokens.bgSecondary, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Math.max(insets.bottom, 24) }}>
                        
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <TouchableOpacity onPress={() => setShowRangeModal(false)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: tokens.bgPrimary, justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="close" size={20} color={tokens.textPrimary} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: tokens.textPrimary }}>Select Range</Text>
                            <TouchableOpacity onPress={() => {
                                if (drType === 0) {
                                    setCustomStart(modalStart);
                                    setCustomEnd(modalEnd);
                                    setFilterIdx(3);
                                } else {
                                    setCustomStart(new Date('2000-01-01'));
                                    setCustomEnd(new Date());
                                    setFilterIdx(3);
                                }
                                setShowRangeModal(false);
                            }} style={{ backgroundColor: tokens.bgPrimary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 }}>
                                <Text style={{ fontSize: 14, fontWeight: '600', color: tokens.textPrimary }}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Middle Segment */}
                        <View style={{ marginBottom: 24 }}>
                            <PillSegment options={['Date Range', 'All Time']} selectedIndex={drType} onChange={setDrType} />
                        </View>

                        {/* Content Area */}
                        {drType === 0 ? (
                            <View style={{ backgroundColor: tokens.bgPrimary, borderRadius: 24, padding: 20 }}>
                                
                                {/* FROM */}
                                <TouchableOpacity onPress={() => setOpenPicker(openPicker === 'from' ? null : 'from')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: openPicker === 'from' ? 0 : 1, borderBottomColor: tokens.borderSubtle }}>
                                    <Text style={{ fontSize: 16, color: tokens.textMuted }}>From</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: tokens.textPrimary }}>{modalStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                                </TouchableOpacity>
                                {openPicker === 'from' && (
                                    <CustomDateInlinePicker date={modalStart} onChange={setModalStart} tokens={tokens} />
                                )}

                                {/* TO */}
                                <TouchableOpacity onPress={() => setOpenPicker(openPicker === 'to' ? null : 'to')} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
                                    <Text style={{ fontSize: 16, color: tokens.textMuted }}>To</Text>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: tokens.textPrimary }}>{modalEnd.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                                </TouchableOpacity>
                                {openPicker === 'to' && (
                                    <CustomDateInlinePicker date={modalEnd} onChange={setModalEnd} tokens={tokens} />
                                )}
                            </View>
                        ) : (
                            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                <Ionicons name="infinite" size={48} color={tokens.textMuted} style={{ marginBottom: 12 }} />
                                <Text style={{ fontSize: 15, color: tokens.textMuted }}>Viewing all historical transactions.</Text>
                            </View>
                        )}
                        
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({});
