import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
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
    const total = data.reduce((sum, d) => sum + d.value, 0);

    // Generate arc paths
    let cumulativeAngle = -90; // Start from top

    const arcs = data.map((segment) => {
        const percentage = total > 0 ? segment.value / total : 0;
        const angle = percentage * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        // Label position (middle of arcs outside)
        const midAngle = (startAngle + endAngle) / 2;
        const midRad = (midAngle * Math.PI) / 180;
        const labelRadius = radius + strokeWidth / 2 + 20;
        const labelX = center + labelRadius * Math.cos(midRad);
        const labelY = center + labelRadius * Math.sin(midRad);

        return {
            path: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
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
                    {arcs.map((arc, index) => (
                        <Path
                            key={index}
                            d={arc.path}
                            stroke={arc.color}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeLinecap="butt"
                        />
                    ))}
                    {showPercentages &&
                        arcs.map((arc, index) => {
                            if (arc.percentage < 5) return null; // Don't show tiny labels
                            return (
                                <SvgText
                                    key={`label-${index}`}
                                    x={arc.labelX}
                                    y={arc.labelY}
                                    fill={DarkTheme.textPrimary}
                                    fontSize="12"
                                    fontWeight="600"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {arc.percentage}%
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
