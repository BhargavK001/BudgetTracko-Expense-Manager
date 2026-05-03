import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    Alert, Platform, StatusBar, ScrollView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDebts, DebtType } from '../../../context/DebtContext';
import { useSettings } from '../../../context/SettingsContext';
import { useAccounts } from '../../../context/AccountContext';
import { useThemeStyles } from '@/components/more/DesignSystem';
import * as Haptics from 'expo-haptics';

export default function AddDebt() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { isDarkMode, tokens } = useThemeStyles();
    const { addDebt } = useDebts();
    const { formatCurrency } = useSettings();
    const { accounts } = useAccounts();
    const notesRef = useRef<TextInput>(null);
    const scrollRef = useRef<ScrollView>(null);

    const initialType = (params.type as DebtType) || null;
    const accentColor = initialType === 'lend' ? '#34C759' : '#FF453A';
    const bg = isDarkMode ? '#0D1117' : '#F2F2F7';
    const cardBg = isDarkMode ? '#1C1C1E' : '#FFFFFF';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)';

    const [type] = useState<DebtType | null>(initialType);
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            setSelectedAccountId(accounts[0].id || accounts[0]._id || null);
        }
    }, [accounts, selectedAccountId]);

    const handleSave = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        if (!type || !personName.trim() || !amount) {
            Alert.alert('Missing Info', 'Please enter a name and amount to continue.');
            return;
        }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Invalid amount', 'Please enter a valid numeric amount.');
            return;
        }
        try {
            await addDebt({
                personName: personName.trim(),
                amount: numAmount,
                type,
                dueDate: dueDate ? dueDate.toISOString() : null,
                notes: notes.trim(),
                accountId: selectedAccountId || undefined
            });
            router.back();
        } catch {
            Alert.alert('Error', 'Failed to save debt record.');
        }
    };

    return (
        <View style={[styles.root, { backgroundColor: bg }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={bg} />

            {/* Safe area top + Header */}
            <View style={[styles.header, { paddingTop: insets.top, backgroundColor: bg, borderBottomColor: borderColor }]}>
                <TouchableOpacity
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
                    style={[styles.backButton, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}
                >
                    <Ionicons name="close" size={20} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Details</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Scrollable content — scrolls when keyboard opens */}
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1, backgroundColor: bg }}
                contentContainerStyle={[styles.content, { backgroundColor: bg, paddingBottom: insets.bottom + 32 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                automaticallyAdjustKeyboardInsets={true}
            >
                {/* Type Badge */}
                <View style={styles.typeIndicatorHeader}>
                    <View style={[styles.typeIndicatorBadge, { backgroundColor: type === 'lend' ? 'rgba(52,199,89,0.15)' : 'rgba(255,69,58,0.15)' }]}>
                        <MaterialCommunityIcons name={type === 'lend' ? 'arrow-top-right' : 'arrow-bottom-left'} size={16} color={accentColor} />
                        <Text style={[styles.typeIndicatorText, { color: accentColor }]}>
                            {type === 'lend' ? 'Lending To' : 'Borrowing From'}
                        </Text>
                    </View>
                </View>

                {/* Amount */}
                <View style={styles.amountContainer}>
                    <Text style={[styles.currencySymbol, { color: tokens.textMuted }]}>{formatCurrency(0).charAt(0)}</Text>
                    <TextInput
                        style={[styles.amountInput, { color: accentColor }]}
                        placeholder="0"
                        placeholderTextColor={tokens.textMuted}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        autoFocus
                    />
                </View>

                {/* Account chips */}
                {accounts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: tokens.textMuted }]}>Related Account</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {accounts.map(acc => {
                                const accId = acc.id || acc._id;
                                const isSelected = selectedAccountId === accId;
                                const chipColor = acc.color || accentColor;
                                return (
                                    <TouchableOpacity
                                        key={accId}
                                        style={[styles.accountChip, {
                                            backgroundColor: isSelected ? chipColor : cardBg,
                                            borderColor: isSelected ? chipColor : borderColor,
                                        }]}
                                        onPress={() => setSelectedAccountId(accId!)}
                                    >
                                        <View style={[styles.chipDot, { backgroundColor: isSelected ? '#fff' : chipColor }]} />
                                        <Text style={[styles.accountChipText, { color: isSelected ? '#fff' : tokens.textPrimary }]}>
                                            {acc.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Person Name */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: tokens.textMuted }]}>Who is involved?</Text>
                    <View style={[styles.inputRow, { backgroundColor: cardBg, borderColor }]}>
                        <Ionicons name="person" size={18} color={tokens.textMuted} style={styles.inputIcon} />
                        <TextInput
                            style={[styles.input, { color: tokens.textPrimary }]}
                            placeholder="Person's name"
                            placeholderTextColor={tokens.textMuted}
                            value={personName}
                            onChangeText={setPersonName}
                            returnKeyType="next"
                            onSubmitEditing={() => notesRef.current?.focus()}
                        />
                    </View>
                </View>

                {/* Due Date */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: tokens.textMuted }]}>Expected Repayment</Text>
                    <TouchableOpacity style={[styles.inputRow, { backgroundColor: cardBg, borderColor }]} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                        <Ionicons name="calendar" size={18} color={dueDate ? accentColor : tokens.textMuted} style={styles.inputIcon} />
                        <Text style={[styles.inputText, { color: dueDate ? tokens.textPrimary : tokens.textMuted }]}>
                            {dueDate
                                ? dueDate.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                                : 'Set a due date (Optional)'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={dueDate || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'inline' : 'default'}
                        onChange={(event, date) => {
                            if (Platform.OS === 'android') setShowDatePicker(false);
                            if (date) setDueDate(date);
                        }}
                    />
                )}

                {/* Notes — tapping scrolls it into view automatically */}
                <View style={styles.section}>
                    <Text style={[styles.label, { color: tokens.textMuted }]}>Additional Notes</Text>
                    <View style={[styles.inputRow, { backgroundColor: cardBg, borderColor }]}>
                        <Ionicons name="document-text" size={18} color={tokens.textMuted} style={styles.inputIcon} />
                        <TextInput
                            ref={notesRef}
                            style={[styles.input, { color: tokens.textPrimary }]}
                            placeholder="What was this for? (Optional)"
                            placeholderTextColor={tokens.textMuted}
                            value={notes}
                            onChangeText={setNotes}
                            onFocus={() => {
                                // scroll to bottom to show notes above keyboard
                                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
                            }}
                        />
                    </View>
                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveBtn, { backgroundColor: accentColor, shadowColor: accentColor }]}
                    onPress={handleSave}
                    activeOpacity={0.85}
                >
                    <Text style={styles.saveBtnText}>Save Record</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
    },
    backButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    content: { padding: 24 },
    typeIndicatorHeader: { alignItems: 'center', marginBottom: 10 },
    typeIndicatorBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, gap: 6 },
    typeIndicatorText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

    amountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, marginBottom: 8 },
    currencySymbol: { fontSize: 34, fontWeight: '800', marginRight: 4 },
    amountInput: { fontSize: 52, fontWeight: '900', letterSpacing: -2, minWidth: 40, paddingVertical: 0 },

    section: { marginBottom: 18 },
    label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginLeft: 2 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, height: 54, borderWidth: 1 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, fontWeight: '600' },
    inputText: { flex: 1, fontSize: 15, fontWeight: '600' },

    accountChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1.5, gap: 6 },
    chipDot: { width: 8, height: 8, borderRadius: 4 },
    accountChipText: { fontSize: 14, fontWeight: '700' },

    saveBtn: {
        marginTop: 8,
        paddingVertical: 20, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
    },
    saveBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
});
