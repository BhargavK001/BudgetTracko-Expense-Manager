import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';

import { useTransactions } from '../../context/TransactionContext';
import { exportToCSV, exportToPDF } from '../../utils/exportService';
import { useSettings } from '../../context/SettingsContext';
import { useThemeStyles } from '../../components/more/DesignSystem';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ExportFeature() {
    const router = useRouter();
    const { transactions } = useTransactions();
    const { triggerHaptic } = useSettings();
    const { styles: dStyles, tokens, isDarkMode } = useThemeStyles();

    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
    const [endDate, setEndDate] = useState(new Date());
    const [format, setFormat] = useState<'csv' | 'pdf'>('pdf');

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const btnScale = useSharedValue(1);
    const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));

    const handleExport = async () => {
        triggerHaptic();
        btnScale.value = withSequence(withSpring(0.95, { damping: 12 }), withSpring(1, { damping: 10 }));
        setIsExporting(true);
        try {
            const start = startDate.getTime();
            const end = endDate.getTime();

            const endOfDay = new Date(end);
            endOfDay.setHours(23, 59, 59, 999);

            const startOfDay = new Date(start);
            startOfDay.setHours(0, 0, 0, 0);

            const filtered = transactions.filter(t => {
                const tTime = new Date(t.date).getTime();
                return tTime >= startOfDay.getTime() && tTime <= endOfDay.getTime();
            });

            if (filtered.length === 0) {
                Alert.alert('No Transactions', 'There are no transactions in the selected date range.');
                return;
            }

            const rangeStr = `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

            if (format === 'csv') {
                await exportToCSV(filtered, rangeStr);
            } else {
                await exportToPDF(filtered, rangeStr);
            }
        } finally {
            setIsExporting(false);
        }
    };

    const toggleFormat = (newFmt: 'csv' | 'pdf') => {
        triggerHaptic();
        setFormat(newFmt);
    };

    const openPicker = (type: 'start' | 'end') => {
        triggerHaptic();
        if (type === 'start') setShowStartPicker(true);
        else setShowEndPicker(true);
    };

    return (
        <View style={[styles.root, { backgroundColor: tokens.bgPrimary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: tokens.bgPrimary }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDarkMode ? tokens.bgTertiary : '#fff', borderColor: tokens.borderDefault }]} activeOpacity={0.8}>
                    <Ionicons name="arrow-back" size={22} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Export Data</Text>
                <View style={{ width: 44 }} />
            </View>

            {/* Core Body - Non Scrollable Flex layout */}
            <View style={styles.bodyFlex}>
                <Animated.View entering={FadeInDown.delay(100).springify().damping(16)} style={styles.sectionWrap}>
                    <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>1. Timeframe Selection</Text>

                    <View style={[styles.card, { backgroundColor: isDarkMode ? tokens.bgTertiary : '#fff', borderColor: tokens.borderSubtle }]}>
                        <View style={styles.dateFlowRow}>
                            <View style={styles.dateBlock}>
                                <Text style={[styles.label, { color: tokens.textSecondary }]}>Start Date</Text>
                                <TouchableOpacity style={[styles.datePill, { backgroundColor: isDarkMode ? tokens.bgSecondary : '#F9FAFB', borderColor: tokens.borderDefault }]} activeOpacity={0.7} onPress={() => openPicker('start')}>
                                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                                        <Ionicons name="calendar" size={16} color="#6366F1" />
                                    </View>
                                    <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.dateText, { color: tokens.textPrimary }]}>
                                        {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dateConnector}>
                                <Ionicons name="arrow-forward" size={20} color={tokens.textMuted} />
                            </View>

                            <View style={styles.dateBlock}>
                                <Text style={[styles.label, { color: tokens.textSecondary }]}>End Date</Text>
                                <TouchableOpacity style={[styles.datePill, { backgroundColor: isDarkMode ? tokens.bgSecondary : '#F9FAFB', borderColor: tokens.borderDefault }]} activeOpacity={0.7} onPress={() => openPicker('end')}>
                                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                                        <Ionicons name="calendar" size={16} color="#EF4444" />
                                    </View>
                                    <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.dateText, { color: tokens.textPrimary }]}>
                                        {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Hidden Native Date Pickers */}
                        {showStartPicker && (
                            <DateTimePicker
                                value={startDate} mode="date" display="default"
                                onChange={(_, date) => { setShowStartPicker(Platform.OS === 'ios'); if (date) setStartDate(date); }}
                            />
                        )}
                        {showEndPicker && (
                            <DateTimePicker
                                value={endDate} mode="date" display="default" minimumDate={startDate}
                                onChange={(_, date) => { setShowEndPicker(Platform.OS === 'ios'); if (date) setEndDate(date); }}
                            />
                        )}
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify().damping(16)} style={[styles.sectionWrap, { marginTop: 12 }]}>
                    <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>2. File Format</Text>

                    <View style={styles.formatGridRow}>
                        <TouchableOpacity
                            style={[
                                styles.formatCardHorizontal,
                                { backgroundColor: isDarkMode ? tokens.bgTertiary : '#fff', borderColor: tokens.borderDefault },
                                format === 'pdf' && { borderColor: '#6366F1', backgroundColor: isDarkMode ? 'rgba(99,102,241,0.05)' : '#F8FAFC' }
                            ]}
                            activeOpacity={0.8}
                            onPress={() => toggleFormat('pdf')}
                        >
                            <View style={[styles.formatIconCirc, { backgroundColor: format === 'pdf' ? '#6366F1' : isDarkMode ? tokens.bgSecondary : '#F3F4F6' }]}>
                                <Ionicons name="document-text" size={24} color={format === 'pdf' ? '#FFF' : tokens.textMuted} />
                            </View>
                            <Text style={[styles.formatTitle, { color: tokens.textPrimary }, format === 'pdf' && { color: isDarkMode ? '#818CF8' : '#6366F1' }]}>PDF Report</Text>
                            <Text adjustsFontSizeToFit numberOfLines={3} style={[styles.formatDesc, { color: tokens.textSecondary }]}>Visual, print-ready document.</Text>
                            <View style={[styles.radio, { borderColor: format === 'pdf' ? '#6366F1' : tokens.textMuted }]}>
                                {format === 'pdf' && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.formatCardHorizontal,
                                { backgroundColor: isDarkMode ? tokens.bgTertiary : '#fff', borderColor: tokens.borderDefault },
                                format === 'csv' && { borderColor: '#10B981', backgroundColor: isDarkMode ? 'rgba(16,185,129,0.05)' : '#F0FDF4' }
                            ]}
                            activeOpacity={0.8}
                            onPress={() => toggleFormat('csv')}
                        >
                            <View style={[styles.formatIconCirc, { backgroundColor: format === 'csv' ? '#10B981' : isDarkMode ? tokens.bgSecondary : '#F3F4F6' }]}>
                                <Ionicons name="grid" size={24} color={format === 'csv' ? '#FFF' : tokens.textMuted} />
                            </View>
                            <Text style={[styles.formatTitle, { color: tokens.textPrimary }, format === 'csv' && { color: isDarkMode ? '#34D399' : '#10B981' }]}>CSV Data</Text>
                            <Text adjustsFontSizeToFit numberOfLines={3} style={[styles.formatDesc, { color: tokens.textSecondary }]}>Raw spreadsheet data format.</Text>
                            <View style={[styles.radio, { borderColor: format === 'csv' ? '#10B981' : tokens.textMuted }]}>
                                {format === 'csv' && <View style={[styles.radioInner, { backgroundColor: '#10B981' }]} />}
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>

            {/* Anchored Footer */}
            <Animated.View entering={FadeInUp.delay(300).springify().damping(18)} style={[styles.footer, { backgroundColor: isDarkMode ? tokens.bgPrimary : '#fff', borderTopColor: tokens.borderSubtle }]}>
                <AnimatedTouchable
                    style={[styles.exportBtn, format === 'csv' ? { backgroundColor: '#10B981' } : { backgroundColor: '#6366F1' }, btnStyle]}
                    activeOpacity={0.9}
                    onPress={handleExport}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                    ) : (
                        <Ionicons name="share-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    )}
                    <Text style={styles.exportBtnTxt}>{isExporting ? 'Generating...' : 'Generate Export'}</Text>
                </AnimatedTouchable>

                <View style={styles.secNoteRow}>
                    <Ionicons name="shield-checkmark" size={14} color={tokens.textMuted} />
                    <Text style={[styles.secNoteTxt, { color: tokens.textSecondary }]}>Data exports are processed securely on-device.</Text>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    bodyFlex: {
        flex: 1,
        paddingHorizontal: 24,
    },
    sectionWrap: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 12,
        paddingLeft: 4,
    },
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
    },
    dateFlowRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateBlock: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        padding: 8,
        paddingRight: 10,
        borderWidth: 1,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '700',
        flex: 1,
    },
    dateConnector: {
        marginHorizontal: 12,
        marginTop: 18,
    },
    formatGridRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20, // Prevents footer overlap
    },
    formatCardHorizontal: {
        flex: 1,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    formatIconCirc: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16, 
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6366F1',
    },
    formatTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 6,
        textAlign: 'center',
    },
    formatDesc: {
        fontSize: 12,
        lineHeight: 18,
        textAlign: 'center',
        marginBottom: 16,
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        borderTopWidth: 1,
    },
    exportBtn: {
        flexDirection: 'row',
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    exportBtnTxt: {
        fontSize: 16,
        fontWeight: '800',
        color: '#fff',
    },
    secNoteRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    secNoteTxt: {
        fontSize: 12,
        fontWeight: '600',
    }
});
