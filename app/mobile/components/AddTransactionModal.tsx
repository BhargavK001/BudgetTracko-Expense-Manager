import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ScrollView, KeyboardAvoidingView, Platform, Alert, Image,
    Dimensions, ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
    FadeInDown, FadeIn, ZoomIn,
    useSharedValue, useAnimatedStyle,
    withSpring, withSequence, withTiming, Easing,
    interpolateColor, useAnimatedProps,
} from 'react-native-reanimated';
import api from '@/services/api';
import { CATEGORY_ICONS as CTX_ICONS, CATEGORY_COLORS as CTX_COLORS, mapCategoryIcon, useTransactions } from '@/context/TransactionContext';
import { ScanData } from '@/context/QuickActionContext';

// ─── Types ───────────────────────────────────────────────
type TxType = 'expense' | 'income' | 'transfer';

interface BackendAccount {
    _id: string;
    name: string;
    type: string;
    color: string;
    balance: number;
}

interface BackendCategory {
    _id: string;
    name: string;
    icon?: string;
    color?: string;
    type?: string;
}

// ─── Constants ───────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const PILL_TYPES: { key: TxType; label: string; icon: string; color: string }[] = [
    { key: 'expense', label: 'Expense', icon: 'arrow-down-outline', color: '#F43F5E' },
    { key: 'income', label: 'Income', icon: 'arrow-up-outline', color: '#2DCA72' },
    { key: 'transfer', label: 'Transfer', icon: 'swap-horizontal-outline', color: '#007AFF' },
];

const DEFAULT_EXPENSE_CATS = [
    { name: 'Food and Dining', icon: 'restaurant-outline', color: '#FF9800' },
    { name: 'Transport', icon: 'car-outline', color: '#2196F3' },
    { name: 'Shopping', icon: 'cart-outline', color: '#E91E63' },
    { name: 'Entertainment', icon: 'headset-outline', color: '#4CAF50' },
    { name: 'Bills & Utilities', icon: 'receipt-outline', color: '#9C27B0' },
    { name: 'Health', icon: 'heart-outline', color: '#F44336' },
    { name: 'Education', icon: 'school-outline', color: '#00BCD4' },
    { name: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: '#795548' },
];

const DEFAULT_INCOME_CATS = [
    { name: 'Salary', icon: 'briefcase-outline', color: '#4CAF50' },
    { name: 'Freelance', icon: 'laptop-outline', color: '#7C4DFF' },
    { name: 'Investment', icon: 'trending-up-outline', color: '#FF5722' },
    { name: 'Gift', icon: 'gift-outline', color: '#FFD700' },
    { name: 'Other', icon: 'ellipsis-horizontal-circle-outline', color: '#795548' },
];
// ─── Date helpers ────────────────────────────────────────
function isToday(d: Date): boolean {
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function isYesterday(d: Date): boolean {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return d.getDate() === y.getDate() && d.getMonth() === y.getMonth() && d.getFullYear() === y.getFullYear();
}

// ─── Android Time Picker Modal ───────────────────────────
function TimePickerAndroid({ date, onConfirm, onCancel }: {
    date: Date;
    onConfirm: (h: number, m: number) => void;
    onCancel: () => void;
}) {
    const [hour, setHour] = useState(String(date.getHours() % 12 || 12));
    const [minute, setMinute] = useState(String(date.getMinutes()).padStart(2, '0'));
    const [ampm, setAmpm] = useState(date.getHours() >= 12 ? 'PM' : 'AM');

    const handleConfirm = () => {
        let h = parseInt(hour) || 12;
        const m = parseInt(minute) || 0;
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        onConfirm(h, m);
    };

    return (
        <View style={tpStyles.wrap}>
            <View style={tpStyles.card}>
                <Text style={tpStyles.title}>Set Time</Text>
                <View style={tpStyles.row}>
                    <TextInput style={tpStyles.input} value={hour} onChangeText={setHour} keyboardType="numeric" maxLength={2} placeholder="HH" />
                    <Text style={tpStyles.colon}>:</Text>
                    <TextInput style={tpStyles.input} value={minute} onChangeText={setMinute} keyboardType="numeric" maxLength={2} placeholder="MM" />
                    <TouchableOpacity style={tpStyles.ampmBtn} onPress={() => setAmpm(p => p === 'AM' ? 'PM' : 'AM')}>
                        <Text style={tpStyles.ampmTxt}>{ampm}</Text>
                    </TouchableOpacity>
                </View>
                <View style={tpStyles.actions}>
                    <TouchableOpacity onPress={onCancel} style={tpStyles.cancelBtn}>
                        <Text style={tpStyles.cancelTxt}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirm} style={tpStyles.okBtn}>
                        <Text style={tpStyles.okTxt}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const tpStyles = StyleSheet.create({
    wrap: { marginBottom: 12, alignItems: 'center' },
    card: { backgroundColor: '#F5F5F5', borderRadius: 16, padding: 20, width: '100%' },
    title: { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 14, textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    input: { width: 52, height: 48, backgroundColor: '#fff', borderRadius: 12, textAlign: 'center', fontSize: 22, fontWeight: '800', color: '#111', borderWidth: 1, borderColor: '#E5E5EA' },
    colon: { fontSize: 24, fontWeight: '800', color: '#111' },
    ampmBtn: { backgroundColor: '#111', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
    ampmTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
    cancelTxt: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
    okBtn: { backgroundColor: '#111', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
    okTxt: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

// ─── Calendar Picker ─────────────────────────────────────
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function CalendarPicker({ selected, onSelect, onClose, accentColor }: {
    selected: Date;
    onSelect: (d: Date) => void;
    onClose: () => void;
    accentColor: string;
}) {
    const [viewMonth, setViewMonth] = useState(selected.getMonth());
    const [viewYear, setViewYear] = useState(selected.getFullYear());
    const today = new Date();

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        const now = new Date();
        if (viewYear > now.getFullYear() || (viewYear === now.getFullYear() && viewMonth >= now.getMonth())) return;
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const selectDay = (day: number) => {
        const d = new Date(selected);
        d.setFullYear(viewYear, viewMonth, day);
        if (d > today) return; // can't pick future
        onSelect(d);
        onClose();
    };

    const isSel = (day: number) =>
        day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();
    const isTodayCell = (day: number) =>
        day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
    const isFuture = (day: number) => {
        const d = new Date(viewYear, viewMonth, day);
        return d > today;
    };

    return (
        <View style={calStyles.wrap}>
            {/* Month/Year Header */}
            <View style={calStyles.header}>
                <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
                    <Ionicons name="chevron-back" size={18} color="#111" />
                </TouchableOpacity>
                <Text style={calStyles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
                <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
                    <Ionicons name="chevron-forward" size={18} color="#111" />
                </TouchableOpacity>
            </View>
            {/* Day names */}
            <View style={calStyles.dayNamesRow}>
                {DAYS.map(d => <Text key={d} style={calStyles.dayName}>{d}</Text>)}
            </View>
            {/* Day grid */}
            <View style={calStyles.grid}>
                {cells.map((day, i) => (
                    <TouchableOpacity
                        key={i}
                        style={[
                            calStyles.cell,
                            !!day && isSel(day) ? { backgroundColor: accentColor } : null,
                            !!day && isTodayCell(day) && !isSel(day) ? { borderWidth: 1.5, borderColor: accentColor } : null,
                        ]}
                        onPress={() => !!day && !isFuture(day) && selectDay(day)}
                        disabled={!day || isFuture(day)}
                        activeOpacity={0.7}
                    >
                        {day ? (
                            <Text style={[
                                calStyles.cellTxt,
                                isSel(day) && { color: '#fff', fontWeight: '800' },
                                isFuture(day) && { color: '#E5E5EA' },
                            ]}>{day}</Text>
                        ) : null}
                    </TouchableOpacity>
                ))}
            </View>
            {/* Close */}
            <TouchableOpacity onPress={onClose} style={calStyles.closeBtn}>
                <Text style={calStyles.closeTxt}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const cellSize = (SCREEN_W - 48 - 12) / 7;
const calStyles = StyleSheet.create({
    wrap: { backgroundColor: '#F9F9FB', borderRadius: 16, padding: 14, marginBottom: 14 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    navBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    monthLabel: { fontSize: 14, fontWeight: '700', color: '#111' },
    dayNamesRow: { flexDirection: 'row', marginBottom: 6 },
    dayName: { width: cellSize, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#C7C7CC' },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: cellSize, height: cellSize, justifyContent: 'center', alignItems: 'center', borderRadius: cellSize / 2 },
    cellTxt: { fontSize: 13, fontWeight: '600', color: '#111' },
    closeBtn: { alignItems: 'center', marginTop: 8 },
    closeTxt: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
});

// ─── Sliding Pill Toggle ─────────────────────────────────
function SlidingPillToggle({ active, onChange }: { active: TxType; onChange: (t: TxType) => void }) {
    const pillW = (SCREEN_W - 48 - 8) / 3; // Container padding 24*2, internal gap
    const slideX = useSharedValue(0);

    useEffect(() => {
        const idx = PILL_TYPES.findIndex(p => p.key === active);
        slideX.value = withSpring(idx * pillW, { damping: 18, stiffness: 200 });
    }, [active, pillW]);

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: slideX.value }],
        width: pillW,
    }));

    const activeColor = PILL_TYPES.find(p => p.key === active)?.color || '#F43F5E';

    return (
        <View style={pill.container}>
            {/* Sliding background */}
            <Animated.View style={[pill.indicator, indicatorStyle, { backgroundColor: activeColor }]} />
            {/* Labels */}
            {PILL_TYPES.map(p => {
                const isActive = active === p.key;
                return (
                    <TouchableOpacity
                        key={p.key}
                        style={[pill.item, { width: pillW }]}
                        onPress={() => onChange(p.key)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={p.icon as any} size={15} color={isActive ? '#fff' : '#8E8E93'} />
                        <Text style={[pill.label, isActive && pill.labelActive]}>{p.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const pill = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 14,
        padding: 3,
        marginBottom: 24,
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        top: 3,
        left: 3,
        height: '100%',
        borderRadius: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 11,
        zIndex: 1,
    },
    label: { fontSize: 12, fontWeight: '700', color: '#8E8E93' },
    labelActive: { color: '#fff' },
});

// ═══════════════════════════════════════════════════════════
// Main Modal
// ═══════════════════════════════════════════════════════════
interface Props {
    visible: boolean;
    onClose: () => void;
    editingTransaction?: any;
    onEditSuccess?: () => void;
    initialType?: TxType;
    scanData?: ScanData | null;
}

export default function AddTransactionModal({ visible, onClose, editingTransaction, onEditSuccess, initialType, scanData }: Props) {
    const { deleteTransaction } = useTransactions();

    // ── State ──
    const [type, setType] = useState<TxType>('expense');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<string | null>(null);
    const [accountId, setAccountId] = useState<string | null>(null);
    const [fromAccountId, setFromAccountId] = useState<string | null>(null);
    const [toAccountId, setToAccountId] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Date & Time
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Backend data
    const [accounts, setAccounts] = useState<BackendAccount[]>([]);
    const [categories, setCategories] = useState<BackendCategory[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchData = useCallback(async () => {
        setLoadingData(true);
        try {
            const [accRes, catRes] = await Promise.all([
                api.get('/api/accounts'),
                api.get('/api/categories'),
            ]);
            const accRaw = accRes.data;
            const accs = Array.isArray(accRaw) ? accRaw : Array.isArray(accRaw?.data) ? accRaw.data : [];
            setAccounts(accs);
            if (accs.length > 0 && !accountId) {
                setAccountId(accs[0]._id);
                setFromAccountId(accs[0]._id);
                if (accs.length > 1) setToAccountId(accs[1]._id);
            }

            const catRaw = catRes.data;
            const cats = Array.isArray(catRaw) ? catRaw : Array.isArray(catRaw?.data) ? catRaw.data : [];
            setCategories(cats);
        } catch (e) {
            console.log('Failed to load form data:', e);
        } finally {
            setLoadingData(false);
        }
    }, [accountId]);

    useEffect(() => {
        if (visible) fetchData();
    }, [visible, fetchData]);

    // ── Pre-fill Edit Mode Data ──
    useEffect(() => {
        if (visible && editingTransaction) {
            setType(editingTransaction.type || 'expense');
            setTitle(editingTransaction.title || editingTransaction.text || '');
            setAmount(editingTransaction.amount ? String(editingTransaction.amount) : '');
            setCategory(editingTransaction.category || null);
            setNotes(editingTransaction.note || '');

            if (editingTransaction.date) {
                const txDate = new Date(editingTransaction.date);
                if (editingTransaction.time) {
                    // Time is like '10:30 AM'
                    const match = editingTransaction.time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                    if (match) {
                        let h = parseInt(match[1]);
                        const min = parseInt(match[2]);
                        const ampm = match[3].toUpperCase();
                        if (ampm === 'PM' && h !== 12) h += 12;
                        if (ampm === 'AM' && h === 12) h = 0;
                        txDate.setHours(h, min);
                    }
                }
                setDate(txDate);
            }

            if (editingTransaction.type === 'transfer') {
                setFromAccountId(editingTransaction.fromAccountId?._id || editingTransaction.fromAccountId || null);
                setToAccountId(editingTransaction.toAccountId?._id || editingTransaction.toAccountId || null);
            } else {
                setAccountId(editingTransaction.accountId?._id || editingTransaction.accountId || editingTransaction.account || null);
            }

            // Optional: attach existing images (note: might need remote URL handling depending on backend)
            if (Array.isArray(editingTransaction.attachments)) {
                // Ignore for now unless backend serves full URLs
            }
        } else if (visible && !editingTransaction) {
            reset();
        }
    }, [visible, editingTransaction]);

    // ── Pre-fill from Scan Data ──
    useEffect(() => {
        if (visible && scanData && !editingTransaction) {
            setType('expense');
            setTitle(scanData.title || '');
            setAmount(scanData.amount || '');
            setNotes(scanData.notes || '');
            if (scanData.date) setDate(new Date(scanData.date));
            if (scanData.attachments?.length > 0) setImages(scanData.attachments.slice(0, 3));
        }
    }, [visible, scanData]);

    // ── Derived ──
    const getDisplayCategories = () => {
        const backendCats = categories.filter(c => {
            if (type === 'expense') return c.type === 'expense' || !c.type;
            if (type === 'income') return c.type === 'income' || !c.type;
            return false;
        });

        if (backendCats.length > 0) return backendCats.map(c => {
            const rawIcon = c.icon || (CTX_ICONS as any)[c.name];
            return {
                name: c.name,
                icon: rawIcon ? mapCategoryIcon(rawIcon) : 'ellipsis-horizontal-circle-outline',
                color: c.color || (CTX_COLORS as any)[c.name] || '#795548',
            };
        });

        return type === 'expense' ? DEFAULT_EXPENSE_CATS : DEFAULT_INCOME_CATS;
    };

    const displayCats = getDisplayCategories();
    const isExpense = type === 'expense';
    const isTransfer = type === 'transfer';
    const accentColor = PILL_TYPES.find(p => p.key === type)?.color || '#F43F5E';

    // ── Handlers ──
    const reset = useCallback(() => {
        setType(initialType || 'expense'); setTitle(''); setAmount('');
        setCategory(null); setNotes(''); setImages([]);
        setDate(new Date());
        if (accounts.length > 0) {
            setAccountId(accounts[0]._id);
            setFromAccountId(accounts[0]._id);
            if (accounts.length > 1) setToAccountId(accounts[1]._id);
        }
    }, [initialType, accounts]);

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

        if (!isTransfer && !category) {
            Alert.alert('Missing Category', 'Please pick a category.');
            return;
        }
        if (isTransfer && (!fromAccountId || !toAccountId)) {
            Alert.alert('Missing Accounts', 'Please select both From and To accounts.');
            return;
        }
        if (isTransfer && fromAccountId === toAccountId) {
            Alert.alert('Same Account', 'From and To accounts must be different.');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('text', title.trim());
            formData.append('amount', String(num));
            formData.append('date', date.toISOString());
            const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            formData.append('time', timeStr);
            if (notes.trim()) formData.append('note', notes.trim());

            if (isTransfer) {
                formData.append('fromAccountId', fromAccountId!);
                formData.append('toAccountId', toAccountId!);
            } else {
                if (category) formData.append('category', category);
                if (accountId) formData.append('accountId', accountId);
            }

            // Attach new images
            images.forEach((uri, i) => {
                const name = uri.split('/').pop() || `receipt_${i}.jpg`;
                const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
                const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                formData.append('attachments', {
                    uri,
                    name,
                    type: mimeType,
                } as any);
            });

            if (editingTransaction && (editingTransaction._id || editingTransaction.id)) {
                await api.put(`/api/transactions/${editingTransaction._id || editingTransaction.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 30000,
                });
                if (onEditSuccess) onEditSuccess();
            } else {
                await api.post('/api/transactions', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    timeout: 30000,
                });
            }

            reset();
            onClose();
        } catch (e: any) {
            console.log('Save error:', e.response?.data || e.message);
            Alert.alert('Error', e.response?.data?.message || 'Failed to save. Try again.');
        } finally {
            setSaving(false);
        }
    };

    // Save button bounce
    const saveSc = useSharedValue(1);
    const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveSc.value }] }));
    const pressSave = () => {
        saveSc.value = withSequence(withSpring(0.93, { damping: 10 }), withSpring(1, { damping: 8 }));
        handleSave();
    };

    const handleDelete = () => {
        if (!editingTransaction) return;

        Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteTransaction(editingTransaction._id || editingTransaction.id);
                        if (onEditSuccess) onEditSuccess();
                        onClose();
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.message || 'Failed to delete transaction.');
                    }
                }
            }
        ]);
    };

    // ── Date/Time handlers ──
    const setToday = () => {
        const now = new Date();
        const updated = new Date(date);
        updated.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        setDate(updated);
    };

    const setYesterday = () => {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const updated = new Date(date);
        updated.setFullYear(y.getFullYear(), y.getMonth(), y.getDate());
        setDate(updated);
    };

    const setCustomDate = () => {
        setShowDatePicker(true);
    };

    const handleTimeEdit = () => {
        const curH = date.getHours();
        const curM = date.getMinutes();
        const is12hr = curH >= 12;
        const h12 = curH % 12 || 12;
        const timeStr = `${h12}:${curM.toString().padStart(2, '0')} ${is12hr ? 'PM' : 'AM'}`;

        // For Android (no Alert.prompt), toggle through hours
        if (Platform.OS === 'android') {
            setShowTimePicker(true);
            return;
        }

        Alert.prompt?.('Set Time', 'Format: HH:MM AM/PM', (text: string) => {
            const match = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match) {
                let h = parseInt(match[1]);
                const min = parseInt(match[2]);
                const ampm = match[3].toUpperCase();
                if (ampm === 'PM' && h !== 12) h += 12;
                if (ampm === 'AM' && h === 12) h = 0;
                const updated = new Date(date);
                updated.setHours(h, min);
                setDate(updated);
            }
        }, 'plain-text', timeStr);
    };

    const handleTypeChange = (newType: TxType) => {
        setType(newType);
        setCategory(null);
    };

    // ── Render ──
    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheet}>
                    <View style={styles.handleRow}><View style={styles.handle} /></View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={20} color="#111" />
                        </TouchableOpacity>
                    </View>

                    {loadingData ? (
                        <View style={{ padding: 60, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text style={{ marginTop: 12, color: '#8E8E93', fontSize: 13 }}>Loading...</Text>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">

                            {/* ─── 3-Way Sliding Toggle ─── */}
                            <Animated.View entering={FadeInDown.delay(50).duration(350)}>
                                <SlidingPillToggle active={type} onChange={handleTypeChange} />
                            </Animated.View>

                            {/* ─── Amount ─── */}
                            <Animated.View entering={ZoomIn.delay(100).duration(400)} style={styles.amountWrap}>
                                <Text style={[styles.amountCurr, { color: accentColor }]}>₹</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: accentColor }]}
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
                                        placeholder={isTransfer ? 'e.g. Moving savings...' : 'e.g. Coffee, Salary...'}
                                        placeholderTextColor="#C7C7CC"
                                        value={title}
                                        onChangeText={setTitle}
                                        returnKeyType="done"
                                    />
                                </View>
                            </Animated.View>

                            {/* ─── Category (not for transfer) ─── */}
                            {!isTransfer && (
                                <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Category</Text>
                                    <View style={styles.catGrid}>
                                        {displayCats.map((cat, i) => {
                                            const sel = category === cat.name;
                                            return (
                                                <Animated.View key={cat.name} entering={FadeInDown.delay(220 + i * 20).duration(280)}>
                                                    <TouchableOpacity
                                                        style={[styles.catChip, sel && { borderColor: cat.color, backgroundColor: cat.color + '18' }]}
                                                        onPress={() => setCategory(cat.name)}
                                                    >
                                                        <Ionicons name={cat.icon as any} size={14} color={sel ? cat.color : '#8E8E93'} />
                                                        <Text style={[styles.catChipTxt, sel && { color: cat.color }]} numberOfLines={1}>{cat.name}</Text>
                                                    </TouchableOpacity>
                                                </Animated.View>
                                            );
                                        })}
                                    </View>
                                </Animated.View>
                            )}

                            {/* ─── Account (for income/expense) ─── */}
                            {!isTransfer && (
                                <Animated.View entering={FadeInDown.delay(260).duration(350)} style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>Account</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.accRow}>
                                            {accounts.map(acc => {
                                                const sel = accountId === acc._id;
                                                return (
                                                    <TouchableOpacity
                                                        key={acc._id}
                                                        style={[styles.accChip, sel && styles.accChipActive]}
                                                        onPress={() => setAccountId(acc._id)}
                                                    >
                                                        <View style={[styles.accDot, { backgroundColor: sel ? '#fff' : (acc.color || '#007AFF') }]} />
                                                        <Text style={[styles.accChipTxt, sel && styles.accChipTxtActive]}>{acc.name}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </Animated.View>
                            )}

                            {/* ─── Transfer: From & To ─── */}
                            {isTransfer && (
                                <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.fieldGroup}>
                                    <Text style={styles.fieldLabel}>From Account</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                                        <View style={styles.accRow}>
                                            {accounts.map(acc => {
                                                const sel = fromAccountId === acc._id;
                                                return (
                                                    <TouchableOpacity
                                                        key={acc._id}
                                                        style={[styles.accChip, sel && { backgroundColor: '#F43F5E', borderColor: '#F43F5E' }]}
                                                        onPress={() => setFromAccountId(acc._id)}
                                                    >
                                                        <View style={[styles.accDot, { backgroundColor: sel ? '#fff' : (acc.color || '#F43F5E') }]} />
                                                        <Text style={[styles.accChipTxt, sel && styles.accChipTxtActive]}>{acc.name}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>

                                    {/* Arrow separator */}
                                    <View style={{ alignItems: 'center', marginBottom: 14 }}>
                                        <View style={styles.transferArrow}>
                                            <Ionicons name="arrow-down" size={18} color="#007AFF" />
                                        </View>
                                    </View>

                                    <Text style={styles.fieldLabel}>To Account</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.accRow}>
                                            {accounts.map(acc => {
                                                const sel = toAccountId === acc._id;
                                                return (
                                                    <TouchableOpacity
                                                        key={acc._id}
                                                        style={[styles.accChip, sel && { backgroundColor: '#2DCA72', borderColor: '#2DCA72' }]}
                                                        onPress={() => setToAccountId(acc._id)}
                                                    >
                                                        <View style={[styles.accDot, { backgroundColor: sel ? '#fff' : (acc.color || '#2DCA72') }]} />
                                                        <Text style={[styles.accChipTxt, sel && styles.accChipTxtActive]}>{acc.name}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </Animated.View>
                            )}

                            {/* ─── Date & Time ─── */}
                            <Animated.View entering={FadeInDown.delay(300).duration(350)} style={styles.fieldGroup}>
                                <Text style={styles.fieldLabel}>Date & Time</Text>
                                {/* Quick date buttons */}
                                <View style={styles.dateTimeRow}>
                                    <TouchableOpacity
                                        style={[styles.dateQuickBtn, isToday(date) && { backgroundColor: accentColor, borderColor: accentColor }]}
                                        onPress={setToday}
                                    >
                                        <Text style={[styles.dateQuickTxt, isToday(date) && { color: '#fff' }]}>Today</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.dateQuickBtn, isYesterday(date) && { backgroundColor: accentColor, borderColor: accentColor }]}
                                        onPress={setYesterday}
                                    >
                                        <Text style={[styles.dateQuickTxt, isYesterday(date) && { color: '#fff' }]}>Yesterday</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.dateQuickBtn} onPress={setCustomDate}>
                                        <MaterialCommunityIcons name="calendar-outline" size={14} color="#8E8E93" />
                                        <Text style={styles.dateQuickTxt}>
                                            {!isToday(date) && !isYesterday(date)
                                                ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                                : 'Custom'
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Time */}
                                <TouchableOpacity style={styles.timeRow} onPress={handleTimeEdit} activeOpacity={0.7}>
                                    <Ionicons name="time-outline" size={16} color={accentColor} style={styles.inputIcon} />
                                    <Text style={styles.dateText}>
                                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: '#C7C7CC', marginLeft: 'auto' }}>Tap to change</Text>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Calendar Picker for Custom Date */}
                            {showDatePicker && (
                                <CalendarPicker
                                    selected={date}
                                    onSelect={(selectedDay) => {
                                        // Merge time into selected day
                                        const updated = new Date(selectedDay);
                                        updated.setHours(date.getHours(), date.getMinutes());
                                        setDate(updated);
                                    }}
                                    onClose={() => setShowDatePicker(false)}
                                    accentColor={accentColor}
                                />
                            )}

                            {/* Time picker modal for Android */}
                            {showTimePicker && Platform.OS === 'android' && (
                                <TimePickerAndroid
                                    date={date}
                                    onConfirm={(h, m) => {
                                        const updated = new Date(date);
                                        updated.setHours(h, m);
                                        setDate(updated);
                                        setShowTimePicker(false);
                                    }}
                                    onCancel={() => setShowTimePicker(false)}
                                />
                            )}

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
                    )}

                    {/* ─── Save ─── */}
                    {!loadingData && (
                        <Animated.View style={[styles.saveWrap, saveStyle]}>
                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: accentColor }, saving && { opacity: 0.6 }]}
                                onPress={pressSave}
                                activeOpacity={0.9}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveTxt}>
                                        {editingTransaction ? 'Save Changes' : (isTransfer ? 'Transfer Funds' : isExpense ? 'Add Expense' : 'Add Income')}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {editingTransaction && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={handleDelete}
                                    disabled={saving}
                                >
                                    <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                                    <Text style={styles.deleteTxt}>Delete Transaction</Text>
                                </TouchableOpacity>
                            )}
                        </Animated.View>
                    )}
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
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 12, backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#F2F2F7',
    },
    accChipActive: { backgroundColor: '#111', borderColor: '#111' },
    accDot: { width: 8, height: 8, borderRadius: 4 },
    accChipTxt: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
    accChipTxtActive: { color: '#fff', fontWeight: '700' },

    /* Transfer arrow */
    transferArrow: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(0,122,255,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },

    /* Date & Time */
    dateTimeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    dateQuickBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
        paddingVertical: 10, borderRadius: 12,
        backgroundColor: '#F5F5F5', borderWidth: 1.5, borderColor: '#F2F2F7',
    },
    dateQuickTxt: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
    timeRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F5F5F5', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13,
    },
    dateText: { fontSize: 14, color: '#111', fontWeight: '500' },

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
        width: '100%', padding: 16,
        borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    saveTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        marginTop: 16, paddingVertical: 12,
    },
    deleteTxt: { fontSize: 14, fontWeight: '700', color: '#F43F5E' },
});
