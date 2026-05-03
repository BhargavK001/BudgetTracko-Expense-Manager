import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Modal, TextInput, Alert, Platform, FlatList, ActivityIndicator,
  InteractionManager,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/services/api';
import AccountCard, { ACCOUNT_TYPE_META } from '@/components/AccountCard';
import Animated, {
  FadeInDown, FadeInUp, FadeIn, ZoomIn,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withSpring, Easing,
} from 'react-native-reanimated';

import { useSettings } from '@/context/SettingsContext';
import { useThemeStyles } from '@/components/more/DesignSystem';
import { useAccounts, Account } from '@/context/AccountContext';
import { useTransactions } from '@/context/TransactionContext';
import { useIsFocused } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';


// ── Floating glow ────────────────────────────────────────
function useFloat() {
  const y = useSharedValue(0);
  React.useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

// ── Bounce wrapper ───────────────────────────────────────
const Bounce = React.memo(function Bounce({ children, onPress, style }: any) {
  const sc = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const press = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    sc.value = withSequence(withSpring(0.9, { damping: 12 }), withSpring(1, { damping: 10 }));
    onPress?.();
  }, [onPress]);
  return (
    <Animated.View style={anim}>
      <TouchableOpacity onPress={press} activeOpacity={0.9} style={style}>{children}</TouchableOpacity>
    </Animated.View>
  );
});

// ── Color palette ────────────────────────────────────────
const COLORS = ['#007AFF', '#2DCA72', '#FF9500', '#F43F5E', '#AF52DE', '#FF2D55', '#5856D6', '#34C759'];

// ── Account type list ────────────────────────────────────
const ACCOUNT_TYPES = Object.entries(ACCOUNT_TYPE_META).map(([key, meta]) => ({
  key, label: meta.label, icon: meta.Icon, color: meta.defaultColor,
}));

// Map backend type to form type (credit_card -> credit)
const toFormType = (t: string) => t === 'credit_card' ? 'credit' : t;
const toBackendType = (t: string) => t === 'credit' ? 'credit_card' : t;

const defaultForm = { name: '', type: 'bank', balance: '', color: '#007AFF', creditLimit: '' };

// ═══════════════════════════════════════════════════════════
// Add / Edit Account Modal
// ═══════════════════════════════════════════════════════════
type AccountFormData = { name: string; type: string; balance: string; color: string; creditLimit: string };
type FormModalProps = {
  visible: boolean;
  editMode: boolean;
  initial: AccountFormData;
  formatCurrency: (n: number) => string;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  onDelete?: () => void;
};

const AccountFormModal: React.FC<FormModalProps> = ({ visible, editMode, initial, formatCurrency, onClose, onSubmit, onDelete }) => {
  const { tokens } = useThemeStyles();
  const { isDarkMode } = useSettings();
  const [name, setName] = useState(initial.name);
  const [type, setType] = useState(initial.type);
  const [balance, setBalance] = useState(initial.balance);
  const [color, setColor] = useState(initial.color);
  const [creditLimit, setCreditLimit] = useState(initial.creditLimit);

  useEffect(() => {
    setName(initial.name); setType(initial.type);
    setBalance(initial.balance); setColor(initial.color);
    setCreditLimit(initial.creditLimit);
  }, [initial, visible]);

  const handleSubmit = () => {
    if (!name.trim()) { Alert.alert('Missing Name', 'Please enter an account name.'); return; }
    onSubmit({ name: name.trim(), type, balance, color, creditLimit });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={[fm.overlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]}>
        <TouchableOpacity style={fm.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[fm.sheet, { backgroundColor: tokens.bgPrimary }]}>
          <View style={fm.handleRow}><View style={[fm.handle, { backgroundColor: tokens.borderSubtle }]} /></View>

          <View style={[fm.header, { borderBottomColor: tokens.borderSubtle }]}>
            <Text style={[fm.headerTitle, { color: tokens.textPrimary }]}>{editMode ? 'Edit Account' : 'Add Account'}</Text>
            <TouchableOpacity onPress={onClose} style={[fm.closeBtn, { backgroundColor: tokens.bgSecondary }]}>
              <Ionicons name="close" size={18} color={tokens.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={fm.scrollBody} keyboardShouldPersistTaps="handled">
            {/* Account type selector */}
            <Text style={[fm.label, { color: tokens.textMuted }]}>Account Type</Text>
            <View style={fm.typeGrid}>
              {ACCOUNT_TYPES.map(t => {
                const sel = type === t.key;
                const TypeIcon = t.icon;
                return (
                  <TouchableOpacity key={t.key}
                    style={[
                      fm.typeCard,
                      { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle },
                      sel && { borderColor: t.color, backgroundColor: t.color + '10' }
                    ]}
                    onPress={() => { setType(t.key); if (!color || COLORS.includes(color)) setColor(t.color); }}
                    activeOpacity={0.7}
                  >
                    <View style={[fm.typeIcon, { backgroundColor: t.color + '18' }]}>
                      <TypeIcon size={16} color={t.color} />
                    </View>
                    <Text style={[fm.typeLabel, { color: tokens.textPrimary }, sel && { color: t.color, fontWeight: '700' }]} numberOfLines={1}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Name field */}
            <Text style={[fm.label, { color: tokens.textMuted }]}>Account Name</Text>
            <View style={[fm.inputRow, { backgroundColor: tokens.bgSecondary }]}>
              <MaterialCommunityIcons name="pencil-outline" size={16} color={tokens.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                style={[fm.input, { color: tokens.textPrimary }]}
                placeholder="e.g. HDFC Savings, Paytm..."
                placeholderTextColor={tokens.textMuted}
                value={name} onChangeText={setName} returnKeyType="done"
              />
            </View>

            <Text style={[fm.label, { color: tokens.textMuted }]}>Initial Balance ({formatCurrency(0).charAt(0)})</Text>
            <View style={[fm.inputRow, { backgroundColor: tokens.bgSecondary }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#2DCA72', marginRight: 8 }}>{formatCurrency(0).charAt(0)}</Text>
              <TextInput
                style={[fm.input, { color: tokens.textPrimary }]}
                placeholder="0"
                placeholderTextColor={tokens.textMuted}
                value={balance} onChangeText={setBalance}
                keyboardType="numeric" returnKeyType="done"
              />
            </View>

            {/* Credit Limit (only for credit cards) */}
            {type === 'credit' && (
              <>
                <Text style={[fm.label, { color: tokens.textMuted }]}>Credit Limit ({formatCurrency(0).charAt(0)})</Text>
                <View style={[fm.inputRow, { backgroundColor: tokens.bgSecondary }]}>
                  <Ionicons name="card-outline" size={16} color="#F43F5E" style={{ marginRight: 8 }} />
                  <TextInput
                    style={[fm.input, { color: tokens.textPrimary }]}
                    placeholder="e.g. 50000"
                    placeholderTextColor={tokens.textMuted}
                    value={creditLimit} onChangeText={setCreditLimit}
                    keyboardType="numeric" returnKeyType="done"
                  />
                </View>
              </>
            )}

            {/* Color picker */}
            <Text style={[fm.label, { color: tokens.textMuted }]}>Account Color</Text>
            <View style={fm.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setColor(c)}
                  style={[fm.colorDot, { backgroundColor: c }, color === c && [fm.colorDotActive, { borderColor: tokens.textPrimary }]]}
                />
              ))}
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={fm.actions}>
            {editMode && onDelete && (
              <TouchableOpacity style={fm.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
                <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                <Text style={fm.deleteTxt}>Delete</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[fm.submitBtn, { backgroundColor: tokens.textPrimary }, editMode && onDelete ? { flex: 1 } : { width: '100%' as any }]} onPress={handleSubmit} activeOpacity={0.9}>
              <Text style={[fm.submitTxt, { color: tokens.bgPrimary }]}>{editMode ? 'Update Account' : 'Add Account'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const fm = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '88%' },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E5EA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111' },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  scrollBody: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  label: { fontSize: 11, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeCard: { width: '47%' as any, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: '#F2F2F7', backgroundColor: '#F9F9FB' },
  typeIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  typeLabel: { fontSize: 11, fontWeight: '600', color: '#3A3A3C', flex: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 13, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 16 },
  input: { flex: 1, fontSize: 14, color: '#111', fontWeight: '500' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 16, flexWrap: 'wrap' },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  colorDotActive: { borderWidth: 3, borderColor: '#111' },
  actions: { flexDirection: 'row', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32, gap: 10 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14, backgroundColor: 'rgba(244,63,94,0.08)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.2)' },
  deleteTxt: { fontSize: 13, fontWeight: '700', color: '#F43F5E' },
  submitBtn: { padding: 16, backgroundColor: '#111', borderRadius: 16, alignItems: 'center' },
  submitTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

// ═══════════════════════════════════════════════════════════
// Account History Modal (Feature 3)
// ═══════════════════════════════════════════════════════════
type HistoryProps = {
  visible: boolean;
  account: { name: string; type: string; balance: number; color: string } | null;
  transactions: any[];
  onClose: () => void;
  formatCurrency: (n: number) => string;
};

const AccountHistoryModal: React.FC<HistoryProps> = ({ visible, account, transactions, onClose, formatCurrency }) => {
  const { tokens } = useThemeStyles();
  const { isDarkMode } = useSettings();
  const meta = account ? (ACCOUNT_TYPE_META[account.type] || ACCOUNT_TYPE_META['bank']) : ACCOUNT_TYPE_META['bank'];
  const accentColor = account?.color || meta.defaultColor;

  const accountTxs = useMemo(() =>
    account ? transactions.filter(tx => tx.account === account.name).slice(0, 20) : [],
    [transactions, account]
  );

  const iconBgStyle = useMemo(() => ({ backgroundColor: accentColor + '14' }), [accentColor]);
  const balAmtStyle = useMemo(() => ({ color: (account?.balance ?? 0) < 0 ? '#F43F5E' : tokens.textPrimary }), [account, tokens]);

  const renderHistoryItem = useCallback(({ item: tx }: { item: any }) => {
    const isIncome = tx.type === 'income';
    return (
      <View style={[hm.txRow, { borderBottomColor: tokens.borderSubtle }]}>
        <View style={[hm.txDot, { backgroundColor: isIncome ? '#2DCA72' : '#F43F5E' }]} />
        <View style={{ flex: 1 }}>
          <Text style={[hm.txTitle, { color: tokens.textPrimary }]} numberOfLines={1}>{tx.title}</Text>
          <Text style={[hm.txDate, { color: tokens.textMuted }]}>{new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Text>
        </View>
        <Text style={[hm.txAmt, { color: isIncome ? '#2DCA72' : tokens.textPrimary }]}>
          {isIncome ? '+' : '\u2212'}{Math.abs(tx.amount).toLocaleString('en-IN')}
        </Text>
      </View>
    );
  }, [tokens]);

  const historyKeyExtractor = useCallback((item: any, index: number) => item.id || String(index), []);

  if (!account) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={[hm.overlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]}>
        <TouchableOpacity style={hm.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={[hm.sheet, { backgroundColor: tokens.bgPrimary }]}>
          <View style={hm.handleRow}><View style={[hm.handle, { backgroundColor: tokens.borderSubtle }]} /></View>

          {/* Account header */}
          <View style={hm.accHeader}>
            <View style={[hm.accIcon, iconBgStyle]}>
              <meta.Icon size={22} color={accentColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[hm.accName, { color: tokens.textPrimary }]}>{account.name}</Text>
              <Text style={[hm.accType, { color: tokens.textMuted }]}>{meta.label}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[hm.balLabel, { color: tokens.textMuted }]}>Balance</Text>
              <Text style={[hm.balAmt, balAmtStyle]}>
                {formatCurrency(account.balance)}
              </Text>
            </View>
          </View>

          <View style={[hm.divider, { backgroundColor: tokens.borderSubtle }]} />

          <Text style={[hm.sectionTitle, { color: tokens.textPrimary }]}>Transaction History</Text>

          {accountTxs.length === 0 ? (
            <View style={hm.empty}>
              <MaterialCommunityIcons name="receipt" size={28} color={tokens.textMuted} />
              <Text style={[hm.emptyTxt, { color: tokens.textMuted }]}>No transactions for this account yet</Text>
            </View>
          ) : (
            <FlatList
              data={accountTxs}
              renderItem={renderHistoryItem}
              keyExtractor={historyKeyExtractor}
              style={hm.txScroll}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={5}
              removeClippedSubviews={true}
              ListFooterComponent={<View style={{ height: 40 }} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const hm = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '80%' },
  handleRow: { alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  accHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, gap: 12 },
  accIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  accName: { fontSize: 17, fontWeight: '700' },
  accType: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  balLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginBottom: 2 },
  balAmt: { fontSize: 18, fontWeight: '800' },
  divider: { height: 1, marginHorizontal: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', paddingHorizontal: 24, paddingVertical: 14 },
  txScroll: { paddingHorizontal: 24 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  txDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  txTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  txDate: { fontSize: 11 },
  txAmt: { fontSize: 14, fontWeight: '700', marginLeft: 8 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTxt: { fontSize: 13, fontWeight: '500' },
});

export default function AccountsScreen() {

  const isFocused = useIsFocused();
  // Removed isReady/InteractionManager to ensure instant navigation




  const insets = useSafeAreaInsets();
  const { tokens } = useThemeStyles();
  const { isDarkMode, formatCurrency } = useSettings();
  const { accounts: allAccounts, isLoading: accountsLoading, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { transactions, isLoading: transactionsLoading } = useTransactions();

  const [showBalance, setShowBalance] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [historyTarget, setHistoryTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const floatStyle = useFloat();

  const loading = accountsLoading;

  const accounts = useMemo(() => {
    if (!Array.isArray(allAccounts)) return [];
    return allAccounts.map(a => ({
      ...a,
      type: toFormType(a.type),
      balance: a.balance || 0,
    }));
  }, [allAccounts]);

  const totalBalance = useMemo(() => accounts.reduce((s, a) => s + a.balance, 0), [accounts]);
  const totalAssets = useMemo(() => accounts.reduce((s, a) => s + Math.max(a.balance, 0), 0), [accounts]);
  const totalLiabilities = useMemo(() => accounts.reduce((s, a) => s + Math.abs(Math.min(a.balance, 0)), 0), [accounts]);

  // ── Handlers ──
  const handleOpenAdd = useCallback(() => { setEditTarget(null); setShowForm(true); }, []);
  const handleOpenEdit = useCallback((acc: any) => { setEditTarget(acc); setShowForm(true); }, []);

  const handleFormSubmit = useCallback(async (data: AccountFormData) => {
    setSaving(true);
    const payload = {
      name: data.name,
      type: toBackendType(data.type),
      balance: parseFloat(data.balance) || 0,
      color: data.color,
      ...(data.type === 'credit' ? { creditLimit: parseFloat(data.creditLimit) || 0 } : {}),
    };

    try {
      if (editTarget?._id || editTarget?.id) {
        await updateAccount(editTarget._id || editTarget.id, payload);
      } else {
        await addAccount(payload as any);
      }
      setShowForm(false); setEditTarget(null);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to save account.');
    } finally {
      setSaving(false);
    }
  }, [editTarget, addAccount, updateAccount]);

  const handleDelete = useCallback(() => {
    const id = editTarget?._id || editTarget?.id;
    if (!id) return;
    Alert.alert('Delete Account', `Are you sure you want to delete "${editTarget.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteAccount(id);
            setShowForm(false); setEditTarget(null);
          } catch (e: any) {
            Alert.alert('Error', 'Failed to delete account.');
          }
        }
      },
    ]);
  }, [editTarget, deleteAccount]);

  const handleLongPress = useCallback((acc: any) => {
    const buttons: any[] = [
      { text: 'Edit', onPress: () => handleOpenEdit(acc) },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Delete?', `Remove "${acc.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete', style: 'destructive', onPress: async () => {
                try {
                  await deleteAccount(acc._id || acc.id);
                } catch (e: any) {
                  Alert.alert('Error', 'Failed to delete.');
                }
              }
            },
          ]);
        }
      },
      { text: 'Cancel', style: 'cancel' },
    ];
    Alert.alert(acc.name, 'What would you like to do?', buttons);
  }, [handleOpenEdit, deleteAccount]);

  const renderAccountItem = useCallback(({ item: acc, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeIn.delay(index * 20).duration(200)}>

      <AccountCard
        name={acc.name}
        type={acc.type}
        balance={formatCurrency(acc.balance)}
        balanceNum={acc.balance}
        color={acc.color}
        masked={!showBalance}
        creditLimit={acc.creditLimit}
        onPress={() => setHistoryTarget(acc)}
        onLongPress={() => handleLongPress(acc)}
      />
    </Animated.View>
  ), [showBalance, formatCurrency, handleLongPress]);

  if (accountsLoading) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }


  return (
    <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <FlatList
        data={accounts}
        keyExtractor={(item) => item._id || item.name}
        renderItem={renderAccountItem}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        ListHeaderComponent={
          <>
            {/* Header */}
            <Animated.View entering={FadeIn.delay(50).duration(350)} style={styles.header}>
              <View>
                <Text style={[styles.headerSub, { color: tokens.textMuted }]}>Overview</Text>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>My Accounts</Text>
              </View>
              <Bounce onPress={handleOpenAdd} style={[styles.addHeaderBtn, { backgroundColor: tokens.textPrimary }]}>
                <Ionicons name="add" size={20} color={tokens.bgPrimary} />
              </Bounce>
            </Animated.View>

            {/* ═══ Net Worth Hero ═══ */}
            <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}>
              <LinearGradient
                colors={isDarkMode ? ['#1A1C20', '#0F1014'] : ['#111111', '#2D2D2D']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <Animated.View style={[styles.heroGlow, floatStyle, { backgroundColor: isDarkMode ? 'rgba(45,202,114,0.1)' : 'rgba(45,202,114,0.16)' }]} />
                <View style={styles.heroTop}>
                  <View>
                    <Text style={[styles.heroLabel, { color: tokens.textMuted }]}>Net Worth</Text>
                    <Animated.Text entering={ZoomIn.delay(250).duration(380)} style={styles.heroAmount}>
                      {showBalance ? formatCurrency(totalBalance) : `${formatCurrency(0).charAt(0)} ••••••`}
                    </Animated.Text>
                    <Text style={[styles.heroSub, { color: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.35)' }]}>Across {accounts.length} accounts</Text>
                  </View>
                  <TouchableOpacity style={[styles.eyeBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)' }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowBalance(!showBalance); }}>
                    <Ionicons name={showBalance ? 'eye-outline' : 'eye-off-outline'} size={20} color={tokens.textMuted} />
                  </TouchableOpacity>
                </View>

                <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.heroPills}>
                  <View style={styles.heroPillGreen}>
                    <View style={styles.heroPillIconBadgeGreen}>
                      <Ionicons name="trending-up" size={16} color="#2DCA72" />
                    </View>
                    <View style={styles.heroPillTextCol}>
                      <Text style={styles.heroPillLabel} numberOfLines={1}>Assets</Text>
                      <Text style={styles.heroPillGreenAmt} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{showBalance ? formatCurrency(totalAssets) : '••••'}</Text>
                    </View>
                  </View>
                  <View style={styles.heroPillRed}>
                    <View style={styles.heroPillIconBadgeRed}>
                      <Ionicons name="trending-down" size={16} color="#F43F5E" />
                    </View>
                    <View style={styles.heroPillTextCol}>
                      <Text style={styles.heroPillLabel} numberOfLines={1}>Liabilities</Text>
                      <Text style={styles.heroPillRedAmt} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{showBalance ? formatCurrency(totalLiabilities) : '••••'}</Text>
                    </View>
                  </View>
                </Animated.View>
              </LinearGradient>
            </Animated.View>



            {/* ═══ All Accounts ═══ */}
            <Animated.View entering={FadeIn.delay(320).duration(350)} style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>All Accounts</Text>
              <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowBalance(!showBalance); }}>
                <Text style={styles.toggleTxt}>{showBalance ? 'Hide' : 'Show'} balances</Text>
              </TouchableOpacity>
            </Animated.View>

            {accounts.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
                <MaterialCommunityIcons name="bank-off-outline" size={48} color={tokens.borderSubtle} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: tokens.textMuted }}>No accounts yet</Text>
                <Text style={{ fontSize: 13, color: tokens.textMuted, textAlign: 'center' }}>Add your first account to start tracking balances.</Text>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <>
            {/* ═══ Add Account CTA ═══ */}
            <Animated.View entering={FadeInDown.delay(100).duration(380)}>
              <TouchableOpacity style={[styles.addCta, { borderColor: tokens.borderSubtle }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleOpenAdd(); }} activeOpacity={0.7}>
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#2DCA72" />
                <Text style={styles.addCtaTxt}>Add New Account</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={[styles.footNote, { color: tokens.textMuted }]}>
              Balances synced from your account. Long-press any account to edit or delete.
            </Text>

            <View style={{ height: 120 }} />
          </>
        }
      />


      {/* Add/Edit Modal */}
      <AccountFormModal
        visible={showForm}
        editMode={!!editTarget}
        formatCurrency={formatCurrency}
        initial={editTarget
          ? { name: editTarget.name, type: editTarget.type, balance: String(editTarget.balance ?? 0), color: editTarget.color || '#007AFF', creditLimit: String(editTarget.creditLimit ?? '') }
          : defaultForm
        }
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        onSubmit={handleFormSubmit}
        onDelete={editTarget ? handleDelete : undefined}
      />
      {/* History Modal */}
      <AccountHistoryModal
        visible={!!historyTarget}
        account={historyTarget}
        transactions={transactions}
        formatCurrency={formatCurrency}
        onClose={() => setHistoryTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, marginBottom: 8 },
  headerSub: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  addHeaderBtn: { width: 38, height: 38, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 24, paddingTop: 4 },

  heroCard: { borderRadius: 24, padding: 24, marginBottom: 18, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, top: -40, right: -30 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  heroLabel: { fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 },
  heroAmount: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  heroSub: { fontSize: 11, marginTop: 4 },
  eyeBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  heroPills: { flexDirection: 'row', gap: 10 },
  heroPillGreen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(45,202,114,0.1)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 },
  heroPillRed: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 },
  heroPillIconBadgeGreen: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(45,202,114,0.15)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  heroPillIconBadgeRed: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(244,63,94,0.15)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  heroPillTextCol: { flex: 1, flexDirection: 'column', gap: 2 },
  heroPillLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: 0.2 },
  heroPillGreenAmt: { fontSize: 15, fontWeight: '800', color: '#2DCA72', letterSpacing: -0.3 },
  heroPillRedAmt: { fontSize: 15, fontWeight: '800', color: '#F43F5E', letterSpacing: -0.3 },



  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  toggleTxt: { fontSize: 12, fontWeight: '600', color: '#2DCA72' },

  addCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
    borderWidth: 1.5, borderStyle: 'dashed',
    marginTop: 8, marginBottom: 14,
  },
  addCtaTxt: { fontSize: 14, fontWeight: '600', color: '#2DCA72' },
  footNote: { fontSize: 11, textAlign: 'center', lineHeight: 17, paddingHorizontal: 12 },
});
