import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDebts, DebtType } from '../../../context/DebtContext';
import { useSettings } from '../../../context/SettingsContext';
import { Button } from '../../../components/Button';

export default function AddDebt() {
    const router = useRouter();
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
            <Text style={styles.stepTitle}>Select what you want to track:</Text>
            <TouchableOpacity style={styles.typeCard} onPress={() => handleSelectType('lend')}>
                <View style={[styles.typeIconContainer, { backgroundColor: '#1a2e25' }]}>
                    <Ionicons name="arrow-up" size={24} color="#34C759" />
                </View>
                <View style={styles.typeTextContainer}>
                    <Text style={styles.typeTitle}>Lend Money</Text>
                    <Text style={styles.typeSubtitle}>Record money you've lent to someone.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.typeCard} onPress={() => handleSelectType('borrow')}>
                <View style={[styles.typeIconContainer, { backgroundColor: '#2e1a1e' }]}>
                    <Ionicons name="arrow-down" size={24} color="#FF453A" />
                </View>
                <View style={styles.typeTextContainer}>
                    <Text style={styles.typeTitle}>Borrow Money</Text>
                    <Text style={styles.typeSubtitle}>Track money you owe to someone.</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Name of the person</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="person-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        placeholderTextColor="#8E8E93"
                        value={personName}
                        onChangeText={setPersonName}
                    />
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount (₹)</Text>
                <View style={styles.inputWrapper}>
                    <Ionicons name="cash-outline" size={20} color={type === 'lend' ? '#34C759' : '#FF453A'} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { fontSize: 24, fontWeight: 'bold' }]}
                        placeholder="0"
                        placeholderTextColor="#8E8E93"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Due date for repayment</Text>
                <TouchableOpacity style={styles.inputWrapper} onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                    <Text style={[styles.inputText, !dueDate && { color: '#8E8E93' }]}>
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
                <Text style={styles.label}>Additional details</Text>
                <View style={[styles.inputWrapper, { height: 100, alignItems: 'flex-start' }]}>
                    <TextInput
                        style={[styles.input, { height: '100%', textAlignVertical: 'top' }]}
                        placeholder="Write a note"
                        placeholderTextColor="#8E8E93"
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()} style={styles.backButton}>
                    <Ionicons name={step === 2 ? 'arrow-back' : 'close'} size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add debt</Text>
                <View style={{ width: 24 }} />
            </View>
            {step === 1 ? renderStep1() : renderStep2()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    stepContainer: {
        padding: 20,
    },
    stepTitle: {
        fontSize: 16,
        color: '#8E8E93',
        marginBottom: 20,
    },
    typeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    typeIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    typeTextContainer: {
        flex: 1,
    },
    typeTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginBottom: 4,
    },
    typeSubtitle: {
        fontSize: 12,
        color: '#8E8E93',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    inputGroup: {
        marginBottom: 20,
    },
    lastInputGroup: {
        marginBottom: 40,
    },
    label: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#111',
        fontSize: 16,
    },
    inputText: {
        flex: 1,
        color: '#111',
        fontSize: 16,
    },
});
