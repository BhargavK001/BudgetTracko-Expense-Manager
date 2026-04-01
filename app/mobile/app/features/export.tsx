import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { FadeInDown, FadeInUp, useAnimatedStyle, useSharedValue, withSpring, withSequence } from 'react-native-reanimated';

import { Container } from '../../components/Container';
import { useTransactions } from '../../context/TransactionContext';
import { exportToCSV, exportToPDF } from '../../utils/exportService';
import { useSettings } from '../../context/SettingsContext';
import { Spacing, BorderRadius, NeoShadow } from '../../constants/Theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ExportFeature() {
    const router = useRouter();
    const { transactions } = useTransactions();
    const { triggerHaptic } = useSettings();
    
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

            const rangeStr = `${startDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})} - ${endDate.toLocaleDateString('en-US', {month:'short', day:'numeric'})}`;

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
        <Container backgroundColor="#F9FAFB">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.8}>
                    <Ionicons name="arrow-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Export Data</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.scrollFlex} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <Animated.View entering={FadeInDown.delay(100).springify().damping(16)}>
                    <Text style={styles.sectionTitle}>1. Timeframe Selection</Text>
                    
                    <View style={styles.card}>
                        <View style={styles.dateFlow}>
                            <View style={styles.dateBlock}>
                                <Text style={styles.label}>Start Date</Text>
                                <TouchableOpacity style={styles.datePill} activeOpacity={0.7} onPress={() => openPicker('start')}>
                                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                                        <Ionicons name="calendar" size={18} color="#6366F1" />
                                    </View>
                                    <Text style={styles.dateText}>
                                        {startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                    </Text>
                                </TouchableOpacity>
                                {showStartPicker && (
                                    <DateTimePicker
                                        value={startDate}
                                        mode="date"
                                        display="default"
                                        onChange={(event, date) => {
                                            setShowStartPicker(Platform.OS === 'ios');
                                            if (date) setStartDate(date);
                                        }}
                                    />
                                )}
                            </View>

                            <View style={styles.dateConnector}>
                                <Ionicons name="arrow-down" size={24} color="#D1D5DB" />
                            </View>

                            <View style={styles.dateBlock}>
                                <Text style={styles.label}>End Date</Text>
                                <TouchableOpacity style={styles.datePill} activeOpacity={0.7} onPress={() => openPicker('end')}>
                                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                                        <Ionicons name="calendar" size={18} color="#EF4444" />
                                    </View>
                                    <Text style={styles.dateText}>
                                        {endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                    </Text>
                                </TouchableOpacity>
                                {showEndPicker && (
                                    <DateTimePicker
                                        value={endDate}
                                        mode="date"
                                        display="default"
                                        minimumDate={startDate}
                                        onChange={(event, date) => {
                                            setShowEndPicker(Platform.OS === 'ios');
                                            if (date) setEndDate(date);
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).springify().damping(16)}>
                    <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>2. File Format</Text>
                    
                    <View style={styles.formatGrid}>
                        <TouchableOpacity 
                            style={[styles.formatCard, format === 'pdf' && styles.formatCardActive]}
                            activeOpacity={0.8}
                            onPress={() => toggleFormat('pdf')}
                        >
                            <View style={styles.formatCardHeader}>
                                <View style={[styles.formatIconCirc, format === 'pdf' ? { backgroundColor: '#6366F1' } : { backgroundColor: '#F3F4F6' }]}>
                                    <Ionicons name="document-text" size={22} color={format === 'pdf' ? '#FFF' : '#6B7280'} />
                                </View>
                                <View style={[styles.radio, format === 'pdf' && styles.radioActive]}>
                                    {format === 'pdf' && <View style={styles.radioInner} />}
                                </View>
                            </View>
                            <Text style={[styles.formatTitle, format === 'pdf' && { color: '#111' }]}>PDF Report</Text>
                            <Text style={styles.formatDesc}>Visual, print-ready document with charts and tables.</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.formatCard, format === 'csv' && styles.formatCardActive]}
                            activeOpacity={0.8}
                            onPress={() => toggleFormat('csv')}
                        >
                            <View style={styles.formatCardHeader}>
                                <View style={[styles.formatIconCirc, format === 'csv' ? { backgroundColor: '#10B981' } : { backgroundColor: '#F3F4F6' }]}>
                                    <Ionicons name="grid" size={22} color={format === 'csv' ? '#FFF' : '#6B7280'} />
                                </View>
                                <View style={[styles.radio, format === 'csv' && styles.radioActive]}>
                                    {format === 'csv' && <View style={styles.radioInner} />}
                                </View>
                            </View>
                            <Text style={[styles.formatTitle, format === 'csv' && { color: '#111' }]}>CSV Data</Text>
                            <Text style={styles.formatDesc}>Raw spreadsheet data for Excel or accounting workflows.</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
                
                <View style={{ height: 160 }} />
            </ScrollView>

            <Animated.View entering={FadeInUp.delay(300).springify().damping(18)} style={styles.footerWrap}>
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
                    <Ionicons name="shield-checkmark" size={14} color="#9CA3AF" />
                    <Text style={styles.secNoteTxt}>Data exports are processed securely on-device.</Text>
                </View>
            </Animated.View>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: Spacing.md,
        backgroundColor: '#F9FAFB',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1, borderColor: '#F3F4F6',
        ...NeoShadow,
        shadowOpacity: 0.05,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    scrollFlex: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: Spacing.md,
        paddingLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        ...NeoShadow,
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
    },
    dateFlow: {
        alignItems: 'center',
    },
    dateBlock: {
        width: '100%',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#6B7280',
        marginBottom: 8,
        marginLeft: 4,
    },
    datePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dateText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
    },
    dateConnector: {
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    formatGrid: {
        gap: 16,
    },
    formatCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 2,
        borderColor: '#F3F4F6',
        ...NeoShadow,
        shadowOpacity: 0.02,
        shadowRadius: 8,
    },
    formatCardActive: {
        borderColor: '#6366F1',
        backgroundColor: '#F8FAFC',
    },
    formatCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    formatIconCirc: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radio: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    radioActive: {
        borderColor: '#6366F1',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6366F1',
    },
    formatTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#4B5563',
        marginBottom: 6,
    },
    formatDesc: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    footerWrap: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: Spacing.lg,
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        ...NeoShadow,
        shadowOpacity: 0.05,
    },
    exportBtn: {
        flexDirection: 'row',
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#111', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
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
        color: '#9CA3AF',
    }
});
