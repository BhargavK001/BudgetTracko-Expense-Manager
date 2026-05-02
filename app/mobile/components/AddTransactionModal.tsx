import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity, TextInput,
    ScrollView, KeyboardAvoidingView, Platform, Alert, Image,
    Dimensions, ActivityIndicator, Animated as RNAnimated,
} from 'react-native';
import { 
    X, Plus, Camera, Trash2, Calendar, Clock, 
    ArrowUpCircle, ArrowDownCircle, ArrowRightLeft,
    ChevronLeft, ChevronRight, PenLine, FileText, CheckCircle2
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
    FadeInDown, FadeIn, ZoomIn,
    useSharedValue, useAnimatedStyle,
    withSpring, withSequence, withTiming, Easing,
    interpolateColor, useAnimatedProps,
} from 'react-native-reanimated';
import api from '@/services/api';
import * as localDB from '@/services/localDB';
import { mapCategoryIcon, useTransactions, CategoryItem } from '@/context/TransactionContext';
import { useAccounts, Account } from '@/context/AccountContext';
import { LucideCategoryIcon } from '@/app/features/categories';
import { ScanData } from '@/context/QuickActionContext';
import { useSettings } from '@/context/SettingsContext';
import { useThemeStyles } from './more/DesignSystem';
import { compressImage } from '@/utils/imageCompressor';

// ─── Types ───────────────────────────────────────────────
type TxType = 'expense' | 'income' | 'transfer';

// Removed local BackendAccount type in favor of Account from AccountContext

// Deleted local BackendCategory type since we use CategoryItem from context

// ─── Constants ───────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const PILL_TYPES: { key: TxType; label: string; icon: any; tokenKey: 'red' | 'teal' | 'blue' }[] = [
    { key: 'expense', label: 'Expense', icon: ArrowDownCircle, tokenKey: 'red' },
    { key: 'income', label: 'Income', icon: ArrowUpCircle, tokenKey: 'teal' },
    { key: 'transfer', label: 'Transfer', icon: ArrowRightLeft, tokenKey: 'blue' },
];

// Standard defaults are handled by the backend and context now
const DEFAULT_EXPENSE_CATS: any[] = [];
const DEFAULT_INCOME_CATS: any[] = [];
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

    const { tokens } = useThemeStyles();

    const handleConfirm = () => {
        let h = parseInt(hour) || 12;
        const m = parseInt(minute) || 0;
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        onConfirm(h, m);
    };

    return (
        <View style={tpStyles.wrap}>
            <View style={[tpStyles.card, { backgroundColor: tokens.bgSecondary }]}>
                <Text style={[tpStyles.title, { color: tokens.textMuted }]}>Set Time</Text>
                <View style={tpStyles.row}>
                    <TextInput style={[tpStyles.input, { backgroundColor: tokens.bgPrimary, borderColor: tokens.borderDefault, color: tokens.textPrimary }]} value={hour} onChangeText={setHour} keyboardType="numeric" maxLength={2} placeholder="HH" placeholderTextColor={tokens.textMuted} />
                    <Text style={[tpStyles.colon, { color: tokens.textPrimary }]}>:</Text>
                    <TextInput style={[tpStyles.input, { backgroundColor: tokens.bgPrimary, borderColor: tokens.borderDefault, color: tokens.textPrimary }]} value={minute} onChangeText={setMinute} keyboardType="numeric" maxLength={2} placeholder="MM" placeholderTextColor={tokens.textMuted} />
                    <TouchableOpacity style={[tpStyles.ampmBtn, { backgroundColor: tokens.bgPrimary }]} onPress={() => setAmpm(p => p === 'AM' ? 'PM' : 'AM')}>
                        <Text style={[tpStyles.ampmTxt, { color: tokens.textPrimary }]}>{ampm}</Text>
                    </TouchableOpacity>
                </View>
                <View style={tpStyles.actions}>
                    <TouchableOpacity onPress={onCancel} style={tpStyles.cancelBtn}>
                        <Text style={[tpStyles.cancelTxt, { color: tokens.textMuted }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirm} style={[tpStyles.okBtn, { backgroundColor: tokens.textPrimary }]}>
                        <Text style={[tpStyles.okTxt, { color: tokens.bgPrimary }]}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const tpStyles = StyleSheet.create({
    wrap: { marginBottom: 16, alignItems: 'center' },
    card: { borderRadius: 20, padding: 24, width: '100%' },
    title: { fontSize: 13, fontWeight: '700', marginBottom: 16, textAlign: 'center', letterSpacing: 0.5, textTransform: 'uppercase' },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    input: { width: 64, height: 64, borderRadius: 16, textAlign: 'center', fontSize: 24, fontWeight: '800', borderWidth: 1.5 },
    colon: { fontSize: 24, fontWeight: '800' },
    ampmBtn: { borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
    ampmTxt: { fontSize: 16, fontWeight: '700' },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
    cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
    cancelTxt: { fontSize: 14, fontWeight: '600' },
    okBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
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
    const { tokens, isDarkMode } = useThemeStyles();
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
        <View style={[calStyles.wrap, { backgroundColor: tokens.bgTertiary, borderWidth: 1, borderColor: tokens.borderDefault }]}>
            {/* Month/Year Header */}
            <View style={calStyles.header}>
                <TouchableOpacity onPress={prevMonth} style={[calStyles.navBtn, { backgroundColor: tokens.bgPrimary }]}>
                    <ChevronLeft size={18} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[calStyles.monthLabel, { color: tokens.textPrimary }]}>{MONTHS[viewMonth]} {viewYear}</Text>
                <TouchableOpacity onPress={nextMonth} style={[calStyles.navBtn, { backgroundColor: tokens.bgPrimary }]}>
                    <ChevronRight size={18} color={tokens.textPrimary} />
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
                                { color: tokens.textPrimary },
                                isSel(day) && { color: '#fff', fontWeight: '800' },
                                isFuture(day) && { color: tokens.textMuted + '60' },
                            ]}>{day}</Text>
                        ) : null}
                    </TouchableOpacity>
                ))}
            </View>
            {/* Close */}
            <TouchableOpacity onPress={onClose} style={calStyles.closeBtn}>
                <Text style={[calStyles.closeTxt, { color: tokens.textMuted }]}>Cancel</Text>
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
    const pillW = (SCREEN_W - 48 - 8) / 3; 
    const slideX = useRef(new RNAnimated.Value(0)).current;
    const { tokens, isDarkMode } = useThemeStyles();

    useEffect(() => {
        const idx = PILL_TYPES.findIndex(p => p.key === active);
        RNAnimated.spring(slideX, {
            toValue: idx * pillW,
            useNativeDriver: true,
            damping: 20,
            stiffness: 120
        }).start();
    }, [active, pillW]);

    const activePill = PILL_TYPES.find(p => p.key === active);
    const activeColor = activePill ? (tokens as any)[activePill.tokenKey].accent : '#F43F5E';

    return (
        <View style={[pill.container, { backgroundColor: tokens.bgTertiary, borderWidth: 1, borderColor: tokens.borderDefault }]}>
            {/* Sliding background */}
            <RNAnimated.View style={[pill.indicator, { backgroundColor: activeColor, width: pillW, transform: [{ translateX: slideX }] }]} />
            {/* Labels */}
            {PILL_TYPES.map(p => {
                const isActive = active === p.key;
                const Icon = p.icon;
                return (
                    <TouchableOpacity
                        key={p.key}
                        style={[pill.item, { width: pillW }]}
                        onPress={() => onChange(p.key)}
                        activeOpacity={0.8}
                    >
                        <Icon size={16} color={isActive ? '#fff' : tokens.textMuted} strokeWidth={isActive ? 2.5 : 2} />
                        <Text style={[pill.label, { color: tokens.textMuted }, isActive && pill.labelActive]}>{p.label}</Text>
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
    const { addTransaction, updateTransaction, deleteTransaction, categories: contextCategories, refreshCategories } = useTransactions();
    const { accounts, refreshAccounts } = useAccounts();
    const { formatCurrency, currency, triggerHaptic } = useSettings();
    const { tokens, isDarkMode } = useThemeStyles();

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
    // Backend data removed in favor of context
    const [loadingData, setLoadingData] = useState(false);

    const fetchData = useCallback(async () => {
        // Categories need background refresh
        refreshCategories();
        // Accounts are managed by AccountContext, but we can trigger a refresh if needed
        refreshAccounts();
    }, [refreshCategories, refreshAccounts]);

    // Set default accounts when accounts list becomes available
    useEffect(() => {
        if (visible && accounts.length > 0 && !accountId && !editingTransaction) {
            setAccountId(accounts[0]._id || accounts[0].id || null);
            setFromAccountId(accounts[0]._id || accounts[0].id || null);
            if (accounts.length > 1) {
                setToAccountId(accounts[1]._id || accounts[1].id || null);
            }
        }
    }, [visible, accounts, accountId, editingTransaction]);

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
            if (scanData.category) {
                setCategory(scanData.category);
            }
            if (scanData.date) setDate(new Date(scanData.date));
            if (scanData.attachments?.length > 0) setImages(scanData.attachments.slice(0, 3));
        }
    }, [visible, scanData]);

    // ── Derived ──
    const getDisplayCategories = () => {
        return contextCategories.filter(c => {
            if (type === 'expense') return c.type === 'expense' || c.type === 'both';
            if (type === 'income') return c.type === 'income' || c.type === 'both';
            return false;
        }).map(c => {
            const rawIcon = c.icon || 'ellipsis-horizontal-circle-outline';
            const isLucide = /^[A-Z]/.test(rawIcon);
            return {
                name: c.name,
                icon: isLucide ? rawIcon : mapCategoryIcon(rawIcon),
                color: c.color || '#6366F1',
                isLucide,
            };
        });
    };

    const displayCats = getDisplayCategories();
    const isExpense = type === 'expense';
    const isTransfer = type === 'transfer';
    const activePill = PILL_TYPES.find(p => p.key === type);
    const accentColor = activePill ? (tokens as any)[activePill.tokenKey].accent : tokens.red.accent;

    // Calculate dynamic font size for amount to prevent overflow
    const amountFontSize = amount.length > 12 ? 22 : (amount.length > 9 ? 28 : (amount.length > 7 ? 32 : 38));

    // ── Handlers ──
    const reset = useCallback(() => {
        setType(initialType || 'expense'); setTitle(''); setAmount('');
        setCategory(null); setNotes(''); setImages([]);
        setDate(new Date());
        if (accounts.length > 0) {
            const firstId = accounts[0]._id || accounts[0].id || null;
            const secondId = accounts[1]?._id || accounts[1]?.id || null;
            setAccountId(firstId);
            setFromAccountId(firstId);
            if (secondId) setToAccountId(secondId);
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
            const compressed = await Promise.all(
                result.assets.map(async (a) => await compressImage(a.uri))
            );
            setImages(prev => [...prev, ...compressed].slice(0, 3));
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
        triggerHaptic();

        try {
            const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
            const txData = {
                title: title.trim(),
                text: title.trim(),
                amount: num,
                type,
                category: isTransfer ? 'Transfer' : (category || 'Other'),
                date: date.toISOString(),
                month: date.getMonth(),
                year: date.getFullYear(),
                day: date.getDate(),
                time: timeStr,
                accountId: isTransfer ? undefined : accountId,
                fromAccountId: isTransfer ? fromAccountId : undefined,
                toAccountId: isTransfer ? toAccountId : undefined,
                note: notes.trim(),
                attachments: images.length > 0 ? images.map((uri) => ({ url: uri, name: uri.split('/').pop() || 'receipt.jpg' })) : [],
            };

            if (editingTransaction) {
                const id = editingTransaction._id || editingTransaction.id;
                await updateTransaction(id, txData as any);
            } else {
                await addTransaction(txData as any);
            }

            if (onEditSuccess) onEditSuccess();
            reset();
            onClose();
        } catch (e: any) {
            console.log('Save error:', e.message);
            Alert.alert('Error', 'Failed to save transaction. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    // Save button bounce
    const saveSc = useSharedValue(1);
    const saveStyle = useAnimatedStyle(() => ({ transform: [{ scale: saveSc.value }] }));
    const pressSave = () => {
        triggerHaptic();
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
                    triggerHaptic();
                    try {
                        await deleteTransaction(editingTransaction._id || editingTransaction.id, editingTransaction.year);
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

                <View style={[styles.sheet, { backgroundColor: tokens.bgPrimary }]}>
                    <View style={styles.handleRow}><View style={[styles.handle, { backgroundColor: tokens.borderDefault }]} /></View>

                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: tokens.borderDefault }]}>
                        <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: tokens.bgSecondary }]}>
                            <X size={18} color={tokens.textPrimary} />
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
                            <Animated.View entering={ZoomIn.delay(100).duration(400)} style={[styles.amountWrap, { backgroundColor: tokens.bgTertiary, borderWidth: 1, borderColor: tokens.borderDefault }]}>
                                <Text style={[styles.amountCurr, { color: accentColor }]}>{currency}</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: accentColor, fontSize: amountFontSize }]}
                                    placeholder="0"
                                    placeholderTextColor={tokens.textMuted + '60'}
                                    value={amount}
                                    onChangeText={(val) => {
                                        if (val.length <= 15) setAmount(val);
                                    }}
                                    keyboardType="numeric"
                                    returnKeyType="done"
                                    adjustsFontSizeToFit
                                    minimumFontSize={20}
                                    numberOfLines={1}
                                />
                            </Animated.View>

                            {/* ─── Title ─── */}
                            <Animated.View entering={FadeInDown.delay(150).duration(350)} style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>What was it for?</Text>
                                <View style={[styles.inputRow, { backgroundColor: tokens.bgTertiary, borderWidth: 1, borderColor: tokens.borderDefault }]}>
                                    <PenLine size={18} color={tokens.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={[styles.textInput, { color: tokens.textPrimary }]}
                                        placeholder={isTransfer ? 'e.g. Moving savings...' : 'e.g. Coffee, Salary...'}
                                        placeholderTextColor={tokens.textMuted + '80'}
                                        value={title}
                                        onChangeText={setTitle}
                                        returnKeyType="done"
                                    />
                                </View>
                            </Animated.View>

                            {/* ─── Category (not for transfer) ─── */}
                            {!isTransfer && (
                                <Animated.View entering={FadeInDown.delay(200).duration(350)} style={styles.fieldGroup}>
                                    <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>Category</Text>
                                    <View style={styles.catGrid}>
                                        {displayCats.map((cat: any, i: number) => {
                                            const sel = category === cat.name;
                                            return (
                                                <Animated.View key={cat.name} entering={FadeInDown.delay(220 + i * 20).duration(280)}>
                                                    <TouchableOpacity
                                                        style={[
                                                            styles.catChip, 
                                                            { backgroundColor: tokens.bgTertiary, borderColor: tokens.borderDefault },
                                                            sel && { borderColor: cat.color, backgroundColor: cat.color + '15' }
                                                        ]}
                                                        onPress={() => setCategory(cat.name)}
                                                    >
                                                        <LucideCategoryIcon name={cat.icon || 'HelpCircle'} size={16} color={sel ? cat.color : tokens.textMuted} />
                                                        <Text style={[styles.catChipTxt, { color: tokens.textSecondary }, sel && { color: cat.color }]} numberOfLines={1}>{cat.name}</Text>
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
                                    <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>Account</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.accRow}>
                                            {accounts.map((acc: any) => {
                                                const sel = accountId === acc._id;
                                                return (
                                                    <TouchableOpacity
                                                        key={acc._id}
                                                        style={[
                                                            styles.accChip, 
                                                            { backgroundColor: tokens.bgTertiary, borderColor: tokens.borderDefault },
                                                            sel && { backgroundColor: tokens.textPrimary, borderColor: tokens.textPrimary }
                                                        ]}
                                                        onPress={() => setAccountId(acc._id || acc.id || null)}
                                                    >
                                                        <View style={[styles.accDot, { backgroundColor: sel ? tokens.bgPrimary : (acc.color || '#007AFF') }]} />
                                                        <Text style={[styles.accChipTxt, { color: tokens.textSecondary }, sel && { color: tokens.bgPrimary, fontWeight: '800' }]}>{acc.name}</Text>
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
                                    <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>From Account</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                                        <View style={styles.accRow}>
                                            {accounts.map((acc: any) => {
                                                const sel = fromAccountId === acc._id;
                                                return (
                                                    <TouchableOpacity
                                                        key={acc._id}
                                                        style={[
                                                            styles.accChip, 
                                                            { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault },
                                                            sel && { backgroundColor: '#F43F5E', borderColor: '#F43F5E' }
                                                        ]}
                                                        onPress={() => setFromAccountId(acc._id || acc.id || null)}
                                                    >
                                                        <View style={[styles.accDot, { backgroundColor: sel ? '#fff' : (acc.color || '#F43F5E') }]} />
                                                        <Text style={[styles.accChipTxt, { color: tokens.textMuted }, sel && { color: '#fff', fontWeight: '700' }]}>{acc.name}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>

                                    {/* Arrow separator */}
                                    <View style={{ alignItems: 'center', marginBottom: 14 }}>
                                        <View style={[styles.transferArrow, { backgroundColor: tokens.bgSecondary }]}>
                                            <ArrowRightLeft size={18} color={tokens.textPrimary} />
                                        </View>
                                    </View>

                                    <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>To Account</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.accRow}>
                                            {accounts.map(acc => {
                                                const sel = toAccountId === acc._id;
                                                return (
                                                    <TouchableOpacity
                                                        key={acc._id}
                                                        style={[
                                                            styles.accChip, 
                                                            { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault },
                                                            sel && { backgroundColor: '#2DCA72', borderColor: '#2DCA72' }
                                                        ]}
                                                        onPress={() => setToAccountId(acc._id || acc.id || null)}
                                                    >
                                                        <View style={[styles.accDot, { backgroundColor: sel ? '#fff' : (acc.color || '#2DCA72') }]} />
                                                        <Text style={[styles.accChipTxt, { color: tokens.textMuted }, sel && { color: '#fff', fontWeight: '700' }]}>{acc.name}</Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </ScrollView>
                                </Animated.View>
                            )}

                            {/* ─── Date & Time ─── */}
                            <Animated.View entering={FadeInDown.delay(300).duration(350)} style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>Date & Time</Text>
                                {/* Quick date buttons */}
                                <View style={styles.dateTimeRow}>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateQuickBtn, 
                                            { backgroundColor: tokens.bgTertiary, borderColor: tokens.borderDefault },
                                            isToday(date) && { backgroundColor: accentColor, borderColor: accentColor }
                                        ]}
                                        onPress={setToday}
                                    >
                                        <Text style={[styles.dateQuickTxt, { color: tokens.textSecondary }, isToday(date) && { color: '#fff' }]}>Today</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateQuickBtn, 
                                            { backgroundColor: tokens.bgTertiary, borderColor: tokens.borderDefault },
                                            isYesterday(date) && { backgroundColor: accentColor, borderColor: accentColor }
                                        ]}
                                        onPress={setYesterday}
                                    >
                                        <Text style={[styles.dateQuickTxt, { color: tokens.textSecondary }, isYesterday(date) && { color: '#fff' }]}>Yesterday</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.dateQuickBtn, { backgroundColor: tokens.bgTertiary, borderColor: tokens.borderDefault }]} onPress={setCustomDate}>
                                        <Calendar size={16} color={tokens.textSecondary} />
                                        <Text style={[styles.dateQuickTxt, { color: tokens.textSecondary }]}>
                                            {!isToday(date) && !isYesterday(date)
                                                ? date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                                                : 'Custom'
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {/* Time */}
                                <TouchableOpacity style={[styles.timeRow, { backgroundColor: tokens.bgTertiary, borderWidth: 1, borderColor: tokens.borderDefault }]} onPress={handleTimeEdit} activeOpacity={0.7}>
                                    <Clock size={18} color={accentColor} style={styles.inputIcon} />
                                    <Text style={[styles.dateText, { color: tokens.textPrimary }]}>
                                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </Text>
                                    <Text style={{ fontSize: 11, color: tokens.textMuted, marginLeft: 'auto' }}>Tap to change</Text>
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
                                <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>Notes (optional)</Text>
                                <View style={[styles.inputRow, { backgroundColor: tokens.bgTertiary, borderWidth: 1, borderColor: tokens.borderDefault, alignItems: 'flex-start', minHeight: 70, paddingTop: 12 }]}>
                                    <FileText size={18} color={tokens.textMuted} style={[styles.inputIcon, { marginTop: 2 }]} />
                                    <TextInput
                                        style={[styles.textInput, { color: tokens.textPrimary, minHeight: 50, textAlignVertical: 'top', paddingTop: 0 }]}
                                        placeholder="Add details..."
                                        placeholderTextColor={tokens.textMuted + '80'}
                                        value={notes}
                                        onChangeText={setNotes}
                                        multiline
                                    />
                                </View>
                            </Animated.View>

                            {/* ─── Image Attachments ─── */}
                            <Animated.View entering={FadeInDown.delay(360).duration(350)} style={styles.fieldGroup}>
                                <Text style={[styles.fieldLabel, { color: tokens.textMuted }]}>Receipts / Images</Text>
                                {images.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imgScroll}>
                                        {images.map((uri, i) => (
                                            <View key={i} style={styles.imgThumbWrap}>
                                                <Image source={{ uri }} style={[styles.imgThumb, { backgroundColor: tokens.bgTertiary, borderWidth: 1, borderColor: tokens.borderDefault }]} />
                                                <TouchableOpacity style={styles.imgRemove} onPress={() => removeImage(i)}>
                                                    <X size={16} color="#fff" style={{ backgroundColor: '#F43F5E', borderRadius: 10, padding: 2 }} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}
                                <TouchableOpacity style={[styles.imgAddBtn, { backgroundColor: tokens.bgTertiary, borderColor: tokens.borderDefault, borderWidth: 1.5 }]} onPress={pickImage}>
                                    <Camera size={20} color={tokens.textMuted} />
                                    <Text style={[styles.imgAddTxt, { color: tokens.textMuted }]}>
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
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <CheckCircle2 size={18} color="#fff" strokeWidth={2.5} />
                                        <Text style={styles.saveTxt}>
                                            {editingTransaction ? 'Save Changes' : (isTransfer ? 'Transfer Funds' : isExpense ? 'Add Expense' : 'Add Income')}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {editingTransaction && (
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={handleDelete}
                                    disabled={saving}
                                >
                                    <Trash2 size={16} color="#F43F5E" />
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
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: {
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        maxHeight: '94%',
    },
    handleRow: { alignItems: 'center', paddingTop: 12, paddingBottom: 6 },
    handle: { width: 40, height: 5, borderRadius: 2.5 },

    /* Header */
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 24, paddingVertical: 16,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    closeBtn: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },

    scrollBody: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 12 },

    /* Amount */
    amountWrap: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20, paddingVertical: 12,
        borderRadius: 18,
    },
    amountCurr: { fontSize: 32, fontWeight: '900', marginRight: 4 },
    amountInput: { fontSize: 38, fontWeight: '900', minWidth: 100, textAlign: 'center' },

    /* Fields */
    fieldGroup: { marginBottom: 22 },
    fieldLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8, textTransform: 'uppercase' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    },
    inputIcon: { marginRight: 12 },
    textInput: { flex: 1, fontSize: 15, fontWeight: '600' },

    /* Category grid */
    catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    catChip: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
        borderWidth: 1.5,
    },
    catChipTxt: { fontSize: 13, fontWeight: '700' },

    /* Account */
    accRow: { flexDirection: 'row', gap: 10 },
    accChip: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 12,
        borderRadius: 14, borderWidth: 1.5,
    },
    accChipActive: { },
    accDot: { width: 10, height: 10, borderRadius: 5 },
    accChipTxt: { fontSize: 13, fontWeight: '700' },
    accChipTxtActive: { },

    /* Transfer arrow */
    transferArrow: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 2 },
        }),
    },

    /* Date & Time */
    dateTimeRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    dateQuickBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 12, borderRadius: 14, borderWidth: 1.5,
    },
    dateQuickTxt: { fontSize: 13, fontWeight: '700' },
    timeRow: {
        flexDirection: 'row', alignItems: 'center',
        borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
    },
    dateText: { fontSize: 15, fontWeight: '600' },

    /* Images */
    imgScroll: { marginBottom: 12 },
    imgThumbWrap: { position: 'relative', marginRight: 12 },
    imgThumb: { width: 80, height: 80, borderRadius: 16 },
    imgRemove: { position: 'absolute', top: -8, right: -8, zIndex: 10 },
    imgAddBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
        paddingVertical: 16, borderRadius: 16,
        borderWidth: 1.5, borderStyle: 'dashed',
    },
    imgAddTxt: { fontSize: 14, fontWeight: '700' },

    /* Save */
    saveWrap: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
    saveBtn: {
        width: '100%', padding: 18,
        borderRadius: 18, alignItems: 'center', justifyContent: 'center',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
            android: { elevation: 6 },
        }),
    },
    saveTxt: { fontSize: 16, fontWeight: '800', color: '#fff' },
    deleteBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        marginTop: 20, paddingVertical: 14,
    },
    deleteTxt: { fontSize: 14, fontWeight: '800', color: '#F43F5E' },
});
