import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ScrollView, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
    FadeInDown, FadeInUp, FadeIn, ZoomIn,
    useSharedValue, useAnimatedStyle,
    withSpring, withSequence, withTiming,
} from 'react-native-reanimated';
import {
    TransactionType, Category,
    EXPENSE_CATEGORIES, INCOME_CATEGORIES,
    CATEGORY_ICONS, CATEGORY_COLORS,
    useTransactions,
} from '@/context/TransactionContext';

const ACCOUNTS = ['Cash', 'Bank Account', 'Slice'];

interface Props { visible: boolean; onClose: () => void; }

export default function AddTransactionModal({ visible, onClose }: Props) {
    const { addTransaction } = useTransactions();
    const [type, setType] = useState<TransactionType>('expense');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Category | null>(null);
    const [account, setAccount] = useState('Cash');
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const cats = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const isExpense = type === 'expense';

    const reset = () => {
        setType('expense'); setTitle(''); setAmount('');
        setCategory(null); setAccount('Cash'); setNotes('');
        setImages([]);
    };

    const pickImage = async () => {
        if (images.length >= 3) {
            Alert.alert('Limit Reached', 'You can attach up to 3 images.');
            return;
        }
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Please allow photo access to attach receipts.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            allowsMultipleSelection: true,
            selectionLimit: 3 - images.length,
        });
        if (!result.canceled && result.assets) {
            setImages(prev => [...prev, ...result.assets!.map(a => a.uri)].slice(0, 3));
        }
    };

    const removeImage = (idx: number) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSave = async () => {
        if (!title.trim()) { Alert.alert('Missing Title', 'What was this for?'); return; }
        const num = parseFloat(amount);
        if (isNaN(num) || num <= 0) { Alert.alert('Invalid Amount', 'Enter a valid amount.'); return; }
        if (!category) { Alert.alert('Missing Category', 'Please pick a category.'); return; }
        setSaving(true);
        try {
            await addTransaction({ title: title.trim(), amount: num, type, category, date: new Date().toISOString(), account });
            reset(); onClose();
        } catch { Alert.alert('Error', 'Failed to save. Try again.'); }
        finally { setSaving(false); }
    };

    // save button bounce
    const saveSc = useSharedValue(1);
    const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveSc.value }] }));
    const pressSave = () => {
        saveSc.value = withSequence(withSpring(0.93, { damping: 10 }), withSpring(1, { damping: 8 }));
        handleSave();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
                {/* Tap-to-dismiss backdrop */}
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheet}>
                    {/* Drag handle */}
                    <View style={styles.handleRow}><View style={styles.handle} /></View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Add Transaction</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#111" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">

                        {/* ─── Type Toggle ─── */}
                        <Animated.View entering={FadeInDown.delay(50).duration(350)} style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeBtn, isExpense && styles.typeBtnExpense]}
                                onPress={() => { setType('expense'); setCategory(null); }}
                            >
                                <Ionicons name="arrow-down-circle" size={16} color={isExpense ? '#fff' : '#C7C7CC'} />
                                <Text style={[styles.typeTxt, isExpense && styles.typeTxtActive]}>Expense</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, !isExpense && styles.typeBtnIncome]}
                                onPress={() => { setType('income'); setCategory(null); }}
                            >
                                <Ionicons name="arrow-up-circle" size={16} color={!isExpense ? '#fff' : '#C7C7CC'} />
                                <Text style={[styles.typeTxt, !isExpense && styles.typeTxtActive]}>Income</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* ─── Amount ─── */}
                        <Animated.View entering={ZoomIn.delay(100).duration(400)} style={styles.amountWrap}>
                            <Text style={[styles.amountCurr, { color: isExpense ? '#F43F5E' : '#2DCA72' }]}>₹</Text>
                            <TextInput
                                style={[styles.amountInput, { color: isExpense ? '#F43F5E' : '#2DCA72' }]}
                                placeholder="0"
                                placeholderTextColor="#E5E5EA"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                returnKeyType="done"
                            />
                        </Animated.View>

                        {/* ─── Title ─── */}
                        <Animated.View entering={FadeInDown.delay(150).duration(350)} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>What was it for?</Text>
                            <View style={styles.inputRow}>
                                <MaterialCommunityIcons name="pencil-outline" size={16} color="#C7C7CC" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Coffee, Salary..."
                                    placeholderTextColor="#C7C7CC"
                                    value={title}
                                    onChangeText={setTitle}
                                    returnKeyType="done"
                                />
                            </View>
                        </Animated.View>

                        {/* ─── Category ─── */}
                        <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Category</Text>
                            <View style={styles.catGrid}>
                                {cats.map((cat, i) => {
                                    const sel = category === cat;
                                    const col = CATEGORY_COLORS[cat];
                                    const ico = CATEGORY_ICONS[cat] as any;
                                    return (
                                        <Animated.View key={cat} entering={FadeInDown.delay(220 + i * 25).duration(280)}>
                                            <TouchableOpacity
                                                style={[styles.catChip, sel && { borderColor: col, backgroundColor: col + '18' }]}
                                                onPress={() => setCategory(cat)}
                                            >
                                                <Ionicons name={ico} size={14} color={sel ? col : '#8E8E93'} />
                                                <Text style={[styles.catChipTxt, sel && { color: col }]} numberOfLines={1}>{cat}</Text>
                                            </TouchableOpacity>
                                        </Animated.View>
                                    );
                                })}
                            </View>
                        </Animated.View>

                        {/* ─── Account ─── */}
                        <Animated.View entering={FadeInDown.delay(260).duration(350)} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Account</Text>
                            <View style={styles.accRow}>
                                {ACCOUNTS.map(acc => {
                                    const sel = account === acc;
                                    return (
                                        <TouchableOpacity key={acc} style={[styles.accChip, sel && styles.accChipActive]} onPress={() => setAccount(acc)}>
                                            <Text style={[styles.accChipTxt, sel && styles.accChipTxtActive]}>{acc}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </Animated.View>

                        {/* ─── Date ─── */}
                        <Animated.View entering={FadeInDown.delay(300).duration(350)} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Date</Text>
                            <View style={styles.inputRow}>
                                <MaterialCommunityIcons name="calendar-outline" size={16} color="#C7C7CC" style={styles.inputIcon} />
                                <Text style={styles.dateText}>Today, {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                            </View>
                        </Animated.View>

                        {/* ─── Notes ─── */}
                        <Animated.View entering={FadeInDown.delay(330).duration(350)} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Notes (optional)</Text>
                            <View style={[styles.inputRow, { alignItems: 'flex-start', minHeight: 64 }]}>
                                <MaterialCommunityIcons name="note-text-outline" size={16} color="#C7C7CC" style={[styles.inputIcon, { marginTop: 2 }]} />
                                <TextInput
                                    style={[styles.textInput, { minHeight: 48, textAlignVertical: 'top' }]}
                                    placeholder="Add details..."
                                    placeholderTextColor="#C7C7CC"
                                    value={notes}
                                    onChangeText={setNotes}
                                    multiline
                                />
                            </View>
                        </Animated.View>

                        {/* ─── Image Attachments ─── */}
                        <Animated.View entering={FadeInDown.delay(360).duration(350)} style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>Receipts / Images</Text>
                            {images.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imgScroll}>
                                    {images.map((uri, i) => (
                                        <View key={i} style={styles.imgThumbWrap}>
                                            <Image source={{ uri }} style={styles.imgThumb} />
                                            <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(i)}>
                                                <Ionicons name="close-circle" size={20} color="#F43F5E" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                            <TouchableOpacity style={styles.imgAddBtn} onPress={pickImage}>
                                <MaterialCommunityIcons name="camera-plus-outline" size={18} color="#8E8E93" />
                                <Text style={styles.imgAddTxt}>
                                    {images.length === 0 ? 'Attach receipt or image' : `Add more (${images.length}/3)`}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>

                    </ScrollView>

                    {/* ─── Save ─── */}
                    <Animated.View style={[styles.saveWrap, saveStyle]}>
                        <TouchableOpacity
                            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                            onPress={pressSave}
                            activeOpacity={0.9}
                            disabled={saving}
                        >
                            <Text style={styles.saveTxt}>
                                {saving ? 'Saving...' : isExpense ? 'Add Expense' : 'Add Income'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        maxHeight: '92%',
    },
    handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
    handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E5EA' },

    /* Header */
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#F2F2F7',
    },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#111' },
    closeBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },

    scrollBody: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },

    /* Type toggle */
    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    typeBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 12, borderRadius: 14,
        backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#F2F2F7',
    },
    typeBtnExpense: { backgroundColor: '#F43F5E', borderColor: '#F43F5E' },
    typeBtnIncome: { backgroundColor: '#2DCA72', borderColor: '#2DCA72' },
    typeTxt: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    typeTxtActive: { color: '#fff' },

    /* Amount */
    amountWrap: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, paddingVertical: 12,
        backgroundColor: '#F9F9FB', borderRadius: 16,
    },
    amountCurr: { fontSize: 34, fontWeight: '900', marginRight: 2 },
    amountInput: { fontSize: 38, fontWeight: '900', minWidth: 80, textAlign: 'center' },

    /* Fields */
    fieldGroup: { marginBottom: 18 },
    fieldLabel: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13,
    },
    inputIcon: { marginRight: 10 },
    textInput: { flex: 1, fontSize: 14, color: '#111', fontWeight: '500' },
    dateText: { fontSize: 14, color: '#111', fontWeight: '500' },

    /* Category grid */
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
        backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#F2F2F7',
    },
    catChipTxt: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },

    /* Account */
    accRow: { flexDirection: 'row', gap: 8 },
    accChip: {
        flex: 1, alignItems: 'center', paddingVertical: 10,
        borderRadius: 12, backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#F2F2F7',
    },
    accChipActive: { backgroundColor: '#111', borderColor: '#111' },
    accChipTxt: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
    accChipTxtActive: { color: '#fff', fontWeight: '700' },

    /* Images */
    imgScroll: { marginBottom: 10 },
    imgThumbWrap: { position: 'relative', marginRight: 10 },
    imgThumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#F5F5F5' },
    imgRemove: { position: 'absolute', top: -6, right: -6 },
    imgAddBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        paddingVertical: 14, borderRadius: 13,
        borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#E5E5EA',
    },
    imgAddTxt: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },

    /* Save */
    saveWrap: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 },
    saveBtn: {
        width: '100%', padding: 16, backgroundColor: '#111',
        borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    saveTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
