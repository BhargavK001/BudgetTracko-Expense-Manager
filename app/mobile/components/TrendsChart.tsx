import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, Switch } from 'react-native';
import Svg, { Path, Circle, Rect, Line, G, Text as SvgText, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTokens } from '@/components/more/DesignSystem';

// ═══ TYPES ═══════════════════════════════════════════════════
export type DayDataPoint = {
    label: string;     // e.g. "05/04"
    value: number;     // spending or income for this day
    cumulative: number; // running total
    isFuture?: boolean; // if this day is in the future (for prediction)
};

export type TrendsChartProps = {
    tokens: AppTokens;
    currentData: DayDataPoint[];
    previousData: DayDataPoint[];
    currentAvg: number;
    previousAvg: number;
    isCompare: boolean;
    onToggleCompare: (val: boolean) => void;
    compareLabel: string;   // e.g. "March 2026"
    isSpending: boolean;
    formatCurrency: (n: number) => string;
};

// ═══ HELPERS ═════════════════════════════════════════════════
const formatYLabel = (val: number): string => {
    if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toFixed(1);
};

const AnimatedRect = Animated.createAnimatedComponent(Rect);

// ═══ TOTAL LINE CHART ════════════════════════════════════════
const CHART_W = 320;
const LINE_H = 200;
const PADDING_LEFT = 44;
const PADDING_RIGHT = 16;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 40;

const TotalLineChart = React.memo(({ data, compareData, isCompare, tokens, isSpending }: {
    data: DayDataPoint[];
    compareData: DayDataPoint[];
    isCompare: boolean;
    tokens: AppTokens;
    isSpending: boolean;
}) => {
    const actualData = data.filter(d => !d.isFuture);
    const futureData = data.filter(d => d.isFuture);

    const allCumulativeValues = [
        ...data.map(d => d.cumulative),
        ...(isCompare ? compareData.map(d => d.cumulative) : []),
    ].filter(v => v > 0);
    const maxVal = allCumulativeValues.length > 0 ? Math.max(...allCumulativeValues) * 1.15 : 1000;

    const plotW = CHART_W - PADDING_LEFT - PADDING_RIGHT;
    const plotH = LINE_H - PADDING_TOP - PADDING_BOTTOM;

    const getX = (i: number) => PADDING_LEFT + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
    const getY = (val: number) => PADDING_TOP + plotH - (val / maxVal) * plotH;

    // Build path for actual data
    const buildPath = (points: { x: number; y: number }[]): string => {
        if (points.length === 0) return '';
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            d += ` L ${points[i].x} ${points[i].y}`;
        }
        return d;
    };

    const actualPoints = actualData.map((d, i) => ({ x: getX(i), y: getY(d.cumulative) }));
    const futurePoints = futureData.map((d, i) => ({
        x: getX(actualData.length - 1 + i + (actualData.length > 0 ? 1 : 0)),
        y: getY(d.cumulative),
    }));

    // Connect future to last actual
    const connectPoint = actualPoints.length > 0 ? [actualPoints[actualPoints.length - 1]] : [];
    const futurePath = buildPath([...connectPoint, ...futurePoints]);
    const actualPath = buildPath(actualPoints);

    // Compare path
    const comparePoints = isCompare ? compareData.map((d, i) => ({
        x: PADDING_LEFT + (compareData.length > 1 ? (i / (compareData.length - 1)) * plotW : plotW / 2),
        y: getY(d.cumulative),
    })) : [];
    const comparePath = buildPath(comparePoints);

    // Y-axis scale (5 tick marks)
    const yTicks = [0, 1, 2, 3, 4].map(i => ({
        val: maxVal * (1 - i / 4),
        y: PADDING_TOP + (i / 4) * plotH,
    }));

    // X-axis labels (show 6 evenly spaced)
    const xStep = Math.max(1, Math.floor(data.length / 5));
    const xLabels = data.filter((_, i) => i % xStep === 0 || i === data.length - 1);
    const xLabelIndices = data.map((_, i) => i).filter(i => i % xStep === 0 || i === data.length - 1);

    const primaryColor = isSpending ? '#EB4E6B' : '#2DCA72';
    const predictColor = '#EF9F27';

    return (
        <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: tokens.textPrimary, marginBottom: 12 }}>Total</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Svg width={CHART_W} height={LINE_H}>
                    {/* Grid lines */}
                    {yTicks.map((tick, i) => (
                        <G key={`grid-${i}`}>
                            <Line x1={PADDING_LEFT} y1={tick.y} x2={CHART_W - PADDING_RIGHT} y2={tick.y}
                                stroke={tokens.borderSubtle} strokeWidth={0.5} strokeDasharray={i > 0 ? "4 4" : ""} />
                            <SvgText x={PADDING_LEFT - 8} y={tick.y + 4} fill={tokens.textMuted}
                                fontSize="10" fontWeight="500" textAnchor="end">
                                {formatYLabel(tick.val)}
                            </SvgText>
                        </G>
                    ))}

                    {/* X-axis labels */}
                    {xLabelIndices.map((idx) => (
                        <SvgText key={`xlab-${idx}`} x={getX(idx)} y={LINE_H - 10}
                            fill={tokens.textMuted} fontSize="10" fontWeight="500" textAnchor="middle">
                            {data[idx]?.label || ''}
                        </SvgText>
                    ))}

                    {/* Compare line (blue) */}
                    {isCompare && comparePath && (
                        <>
                            <Path d={comparePath} stroke="#5B9BD5" strokeWidth={2} fill="none" />
                            {comparePoints.map((pt, i) => (
                                <Circle key={`cmp-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill="#5B9BD5" />
                            ))}
                        </>
                    )}

                    {/* Actual line (red/green) */}
                    {actualPath && (
                        <>
                            <Path d={actualPath} stroke={primaryColor} strokeWidth={2} fill="none" />
                            {actualPoints.map((pt, i) => (
                                <Circle key={`act-${i}`} cx={pt.x} cy={pt.y} r={4} fill={primaryColor} stroke={tokens.cardSurface} strokeWidth={1.5} />
                            ))}
                        </>
                    )}

                    {/* Future/prediction line (dashed gold) */}
                    {futurePath && futurePoints.length > 0 && (
                        <>
                            <Path d={futurePath} stroke={predictColor} strokeWidth={2} fill="none" strokeDasharray="6 4" />
                            {futurePoints.map((pt, i) => (
                                <Circle key={`fut-${i}`} cx={pt.x} cy={pt.y} r={3.5} fill={predictColor} stroke={tokens.cardSurface} strokeWidth={1.5} />
                            ))}
                        </>
                    )}
                </Svg>
            </ScrollView>
        </View>
    );
});

// ═══ DAY-WISE BAR CHART ══════════════════════════════════════
const BAR_H = 200;

const DayWiseBarChart = React.memo(({ data, compareData, isCompare, currentAvg, previousAvg, tokens, isSpending, formatCurrency }: {
    data: DayDataPoint[];
    compareData: DayDataPoint[];
    isCompare: boolean;
    currentAvg: number;
    previousAvg: number;
    tokens: AppTokens;
    isSpending: boolean;
    formatCurrency: (n: number) => string;
}) => {
    const primaryColor = isSpending ? '#EB4E6B' : '#2DCA72';
    const barWidth = isCompare ? 8 : 10;
    const gap = isCompare ? 16 : 14;
    const totalDataLen = Math.max(data.length, compareData.length);
    const totalW = totalDataLen * (barWidth + gap) + (isCompare ? totalDataLen * (barWidth + 2) : 0) + PADDING_LEFT + PADDING_RIGHT;

    const allValues = [
        ...data.map(d => d.value),
        ...(isCompare ? compareData.map(d => d.value) : []),
    ];
    const maxVal = allValues.length > 0 ? Math.max(...allValues, 100) * 1.25 : 1000;

    const plotH = BAR_H - PADDING_TOP - PADDING_BOTTOM;

    const yTicks = [0, 1, 2, 3, 4].map(i => ({
        val: maxVal * (1 - i / 4),
        y: PADDING_TOP + (i / 4) * plotH,
    }));

    // X-axis labels
    const xStep = Math.max(1, Math.floor(data.length / 5));

    const getBarX = (i: number) => {
        const groupW = isCompare ? (barWidth * 2 + 2 + gap) : (barWidth + gap);
        return PADDING_LEFT + i * groupW;
    };
    const getBarH = (val: number) => (val / maxVal) * plotH;

    const avgY = currentAvg > 0 ? PADDING_TOP + plotH - (currentAvg / maxVal) * plotH : -1;
    const prevAvgY = previousAvg > 0 ? PADDING_TOP + plotH - (previousAvg / maxVal) * plotH : -1;

    const chartWidth = Math.max(totalW, CHART_W);

    return (
        <View style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: tokens.textPrimary, marginBottom: 12 }}>Day-wise</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <Svg width={chartWidth} height={BAR_H}>
                    {/* Grid lines */}
                    {yTicks.map((tick, i) => (
                        <G key={`bg-${i}`}>
                            <Line x1={PADDING_LEFT} y1={tick.y} x2={chartWidth - PADDING_RIGHT} y2={tick.y}
                                stroke={tokens.borderSubtle} strokeWidth={0.5} strokeDasharray={i > 0 ? "4 4" : ""} />
                            <SvgText x={PADDING_LEFT - 8} y={tick.y + 4} fill={tokens.textMuted}
                                fontSize="10" fontWeight="500" textAnchor="end">
                                {formatYLabel(tick.val)}
                            </SvgText>
                        </G>
                    ))}

                    {/* Bars */}
                    {data.map((d, i) => {
                        const bh = getBarH(d.value);
                        const bx = getBarX(i);
                        const by = PADDING_TOP + plotH - bh;
                        return (
                            <G key={`bar-${i}`}>
                                {/* Current bar */}
                                <Rect x={bx} y={by} width={barWidth} height={bh}
                                    fill={primaryColor} rx={barWidth / 2} />

                                {/* Compare bar */}
                                {isCompare && compareData[i] && (
                                    <Rect
                                        x={bx + barWidth + 2}
                                        y={PADDING_TOP + plotH - getBarH(compareData[i].value)}
                                        width={barWidth}
                                        height={getBarH(compareData[i].value)}
                                        fill="#5B9BD5"
                                        rx={barWidth / 2}
                                    />
                                )}

                                {/* X label */}
                                {(i % xStep === 0 || i === data.length - 1) && (
                                    <SvgText
                                        x={bx + (isCompare ? barWidth + 1 : barWidth / 2)}
                                        y={BAR_H - 10}
                                        fill={tokens.textMuted}
                                        fontSize="10" fontWeight="500" textAnchor="middle">
                                        {d.label}
                                    </SvgText>
                                )}
                            </G>
                        );
                    })}

                    {/* Current avg line */}
                    {currentAvg > 0 && (
                        <G>
                            <Line x1={PADDING_LEFT} y1={avgY} x2={chartWidth - PADDING_RIGHT} y2={avgY}
                                stroke={tokens.textMuted} strokeWidth={1} strokeDasharray="4 4" />
                            <SvgText x={chartWidth - PADDING_RIGHT - 4} y={avgY - 6}
                                fill={tokens.textMuted} fontSize="10" fontWeight="600" textAnchor="end">
                                Avg: ₹{currentAvg.toFixed(1)}
                            </SvgText>
                        </G>
                    )}

                    {/* Previous avg line */}
                    {isCompare && previousAvg > 0 && (
                        <G>
                            <Line x1={PADDING_LEFT} y1={prevAvgY} x2={chartWidth - PADDING_RIGHT} y2={prevAvgY}
                                stroke="#5B9BD5" strokeWidth={1} strokeDasharray="4 4" />
                            <SvgText x={PADDING_LEFT + 4} y={prevAvgY - 6}
                                fill="#5B9BD5" fontSize="10" fontWeight="600" textAnchor="start">
                                Avg: ₹{previousAvg.toFixed(1)}
                            </SvgText>
                        </G>
                    )}
                </Svg>
            </ScrollView>
        </View>
    );
});

// ═══ MAIN TRENDS CHART ═══════════════════════════════════════
const TrendsChart = ({
    tokens,
    currentData,
    previousData,
    currentAvg,
    previousAvg,
    isCompare,
    onToggleCompare,
    compareLabel,
    isSpending,
    formatCurrency,
}: TrendsChartProps) => {
    return (
        <View>
            {/* Total Line Chart */}
            <TotalLineChart
                data={currentData}
                compareData={previousData}
                isCompare={isCompare}
                tokens={tokens}
                isSpending={isSpending}
            />

            {/* Day-wise Bar Chart */}
            <DayWiseBarChart
                data={currentData}
                compareData={previousData}
                isCompare={isCompare}
                currentAvg={currentAvg}
                previousAvg={previousAvg}
                tokens={tokens}
                isSpending={isSpending}
                formatCurrency={formatCurrency}
            />

            {/* Compare Toggle */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 24,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: tokens.borderSubtle,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="compare-horizontal" size={18} color={tokens.textMuted} />
                    <Text style={{ fontSize: 14, fontWeight: '500', color: tokens.textPrimary }}>
                        Compare with{' '}
                        <Text style={{ textDecorationLine: 'underline' }}>{compareLabel}</Text>
                    </Text>
                </View>
                <Switch
                    value={isCompare}
                    onValueChange={onToggleCompare}
                    trackColor={{ false: 'rgba(255,255,255,0.15)', true: '#378ADD' }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="rgba(255,255,255,0.15)"
                />
            </View>
        </View>
    );
};

export default TrendsChart;
