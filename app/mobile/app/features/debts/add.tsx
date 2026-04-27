import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDebts, DebtType } from '../../../context/DebtContext';
import { useSettings } from '../../../context/SettingsContext';
import { Button } from '../../../components/Button';
import { useThemeStyles } from '@/components/more/DesignSystem';

export default function AddDebt() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isDarkMode, tokens } = useThemeStyles();
    const { addDebt } = useDebts();
    const { triggerHaptic } = useSettings();

    const [step, setStep] = useState<1 | 2>(1);
    const [type, setType] = useState<DebtType | null>(null);
    const [personName, setPersonName] = useState('');
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    
    // Date states
    const [dueDate, setDueDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSelectType = (selectedType: DebtType) => {
        triggerHaptic();
        setType(selectedType);
        setStep(2);
    };

    const handleSave = async () => {
        triggerHaptic();
        if (!type || !personName.trim() || !amount) {
            Alert.alert('Missing fields', 'Please enter a name and amount.');
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
                notes: notes.trim()
            });
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to save debt record.');
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: tokens.textMuted }]}>Select what you want to track:</Text>
            <TouchableOpacity 
                style={[styles.typeCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]} 
                onPress={() => handleSelectType('lend')}
                activeOpacity={0.7}
            >
                <View style={[styles.typeIconContainer, { backgroundColor: isDarkMode ? 'rgba(52,199,89,0.1)' : '#E8F5E9' }]}>
                    <Ionicons name="arrow-up" size={24} color="#34C759" />
                </View>
                <View style={styles.typeTextContainer}>
                    <Text style={[styles.typeTitle, { color: tokens.textPrimary }]}>Lend Money</Text>
                    <Text style={[styles.typeSubtitle, { color: tokens.textMuted }]}>Record money you've lent to someone.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={tokens.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.typeCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]} 
                onPress={() => handleSelectType('borrow')}
                activeOpacity={0.7}
            >
                <View style={[styles.typeIconContainer, { backgroundColor: isDarkMode ? 'rgba(255,69,58,0.1)' : '#FFEBEE' }]}>
                    <Ionicons name="arrow-down" size={24} color="#FF453A" />
                </View>
                <View style={styles.typeTextContainer}>
                    <Text style={[styles.typeTitle, { color: tokens.textPrimary }]}>Borrow Money</Text>
                    <Text style={[styles.typeSubtitle, { color: tokens.textMuted }]}>Track money you owe to someone.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={tokens.textMuted} />
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: tokens.textMuted }]}>Name of the person</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                    <Ionicons name="person-outline" size={20} color={tokens.textMuted} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { color: tokens.textPrimary }]}
                        placeholder="Name"
                        placeholderTextColor={tokens.textMuted}
                        value={personName}
                        onChangeText={setPersonName}
                    />
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: tokens.textMuted }]}>Amount (₹)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                    <Ionicons name="cash-outline" size={20} color={type === 'lend' ? '#34C759' : '#FF453A'} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { fontSize: 24, fontWeight: 'bold', color: tokens.textPrimary }]}
                        placeholder="0"
                        placeholderTextColor={tokens.textMuted}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: tokens.textMuted }]}>Due date for repayment</Text>
                <TouchableOpacity 
                    style={[styles.inputWrapper, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]} 
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="calendar-outline" size={20} color={tokens.textMuted} style={styles.inputIcon} />
                    <Text style={[styles.inputText, { color: tokens.textPrimary }, !dueDate && { color: tokens.textMuted }]}>
                        {dueDate ? dueDate.toLocaleDateString() : 'Not set'}
                    </Text>
                </TouchableOpacity>
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        if (Platform.OS === 'android') setShowDatePicker(false);
                        if (date) setDueDate(date);
                    }}
                />
            )}
            <View style={[styles.inputGroup, styles.lastInputGroup]}>
                <Text style={[styles.label, { color: tokens.textMuted }]}>Additional details</Text>
                <View style={[styles.inputWrapper, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault, height: 100, alignItems: 'flex-start', paddingVertical: 12 }]}>
                    <TextInput
                        style={[styles.input, { color: tokens.textPrimary, height: '100%', textAlignVertical: 'top' }]}
                        placeholder="Write a note"
                        placeholderTextColor={tokens.textMuted}
                        multiline
                        value={notes}
                        onChangeText={setNotes}
                    />
                </View>
            </View>
            <Button
                title="Save Debt"
                onPress={handleSave}
                variant="primary"
                style={{ marginTop: 20 }}
            />
        </ScrollView>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: tokens.bgPrimary }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            <View style={[styles.header, { borderBottomColor: tokens.borderDefault }]}>
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]}>
                    <Ionicons name={step === 2 ? 'chevron-back' : 'close'} size={24} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Add debt</Text>
                <View style={{ width: 40 }} />
            </View>
            {step === 1 ? renderStep1() : renderStep2()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    stepContainer: {
        padding: 24,
    },
    stepTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 24,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    typeIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    typeTextContainer: {
        flex: 1,
    },
    typeTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    typeSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100,
    },
    inputGroup: {
        marginBottom: 24,
    },
    lastInputGroup: {
        marginBottom: 40,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
    },
    inputText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '700',
    },
});
