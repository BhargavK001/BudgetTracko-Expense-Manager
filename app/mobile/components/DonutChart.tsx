import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { DarkTheme } from '@/constants/Theme';

type DonutSegment = {
    value: number;
    color: string;
    label?: string;
};

type DonutChartProps = {
    data: DonutSegment[];
    size?: number;
    strokeWidth?: number;
    showPercentages?: boolean;
};

export default function DonutChart({
    data,
    size = 200,
    strokeWidth = 40,
    showPercentages = true,
}: DonutChartProps) {
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (total === 0 || data.length === 0) {
        // Empty state: draw a gray ring
        return (
            <View style={styles.container}>
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <Circle
                        cx={center}
                        cy={center}
                        r={radius}
                        stroke={DarkTheme.neoBorder}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                </Svg>
            </View>
        );
    }

    // Use stroke-dasharray technique for reliable donut rendering
    // This approach works correctly for any number of segments including single-segment (100%)
    let cumulativeOffset = 0;

    const segments = data.map((segment) => {
        const percentage = segment.value / total;
        const segmentLength = percentage * circumference;
        const dashArray = `${segmentLength} ${circumference - segmentLength}`;
        // dashoffset rotates the segment; we start from the top (-90°)
        const dashOffset = circumference * 0.25 - cumulativeOffset;

        // Label position at the midpoint of this segment's angle
        const midAngle = ((cumulativeOffset / circumference) * 360) - 90 + ((percentage * 360) / 2);
        const midRad = (midAngle * Math.PI) / 180;
        const labelRadius = radius;
        const labelX = center + labelRadius * Math.cos(midRad);
        const labelY = center + labelRadius * Math.sin(midRad);

        cumulativeOffset += segmentLength;

        return {
            dashArray,
            dashOffset,
            color: segment.color,
            percentage: Math.round(percentage * 100),
            labelX,
            labelY,
        };
    });

    return (
        <View style={styles.container}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G>
                    {segments.map((seg, index) => (
                        <Circle
                            key={index}
                            cx={center}
                            cy={center}
                            r={radius}
                            stroke={seg.color}
                            strokeWidth={strokeWidth}
                            strokeDasharray={seg.dashArray}
                            strokeDashoffset={seg.dashOffset}
                            fill="none"
                            strokeLinecap="butt"
                        />
                    ))}
                    {showPercentages &&
                        segments.map((seg, index) => {
                            if (seg.percentage < 8) return null; // Hide tiny labels
                            return (
                                <SvgText
                                    key={`label-${index}`}
                                    x={seg.labelX}
                                    y={seg.labelY}
                                    fill="#FFFFFF"
                                    fontSize="11"
                                    fontWeight="700"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {seg.percentage}%
                                </SvgText>
                            );
                        })}
                </G>
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
});
