import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Image, Alert, FlatList,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactions, CATEGORY_ICONS, CATEGORY_COLORS, Category, mapCategoryIcon } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { useQuickAction } from '@/context/QuickActionContext';
import Animated, {
  FadeInDown, FadeInUp, FadeIn, ZoomIn,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withSpring,
  Easing,
} from 'react-native-reanimated';

// ── Helpers ──────────────────────────────────────────────────
function fmt(n: number): string {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function fmtDate(iso: string): string {
  const d = new Date(iso);
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${m[d.getMonth()]}`;
}
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
function todayStr(): string {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${m[d.getMonth()]}`;
}

// ── Floating glow ────────────────────────────────────────────
function useFloat() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

// ── Bouncy button wrapper ────────────────────────────────────
const BounceButton = React.memo(function BounceButton({ children, onPress, style }: any) {
  const sc = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const press = useCallback(() => {
    sc.value = withSequence(withSpring(0.88, { damping: 12 }), withSpring(1, { damping: 10 }));
    onPress?.();
  }, [onPress]);
  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity onPress={press} activeOpacity={0.9} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { transactions, getTotalIncome, getTotalExpense, getBalance, getTotalBudget } = useTransactions();
  const { user } = useAuth();
  const { openModal } = useQuickAction();
  const [hidden, setHidden] = useState(false);
  const floatStyle = useFloat();

  const now = new Date();
  const mon = now.getMonth();
  const yr = now.getFullYear();

  const income = useMemo(() => getTotalIncome(mon, yr), [getTotalIncome, mon, yr]);
  const expense = useMemo(() => getTotalExpense(mon, yr), [getTotalExpense, mon, yr]);
  const balance = useMemo(() => getBalance(), [getBalance]);
  const savingsRate = useMemo(() => income <= 0 ? 0 : Math.max(0, ((income - expense) / income) * 100), [income, expense]);

  const dayOfMonth = now.getDate();
  const projectedExpense = dayOfMonth > 0 ? (expense / dayOfMonth) * 30 : 0;
  const spendTarget = getTotalBudget('monthly') || 30000; // Fallback to 30000 if no budgets defined
  const pacePercent = spendTarget > 0 ? Math.min((projectedExpense / spendTarget) * 100, 150) : 0;
  const overPace = pacePercent > 100;

  const recentTxs = useMemo(() => transactions.slice(0, 6), [transactions]);

  const actions = useMemo(() => [
    { icon: 'arrow-top-right', label: 'Send', type: 'expense' as const },
    { icon: 'arrow-bottom-left', label: 'Receive', type: 'income' as const },
    { icon: 'qrcode-scan', label: 'Scan', route: '/features/scan' },
    { icon: 'file-document-outline', label: 'Bills', route: '/features/recurring-bills' },
    { icon: 'bank-transfer', label: 'Transfer', type: 'transfer' as const },
  ], []);

  const toggleHidden = useCallback(() => setHidden(h => !h), []);
  const onNotification = useCallback(() => Alert.alert('Notifications', 'No new notifications'), []);

  const renderTxItem = useCallback(({ item: tx, index: i }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(440 + i * 40).duration(360)} style={styles.txRow}>
      <View style={[styles.txIconWrap, { backgroundColor: (CATEGORY_COLORS[tx.category as Category] || '#F5F5F5') + '1A' }]}>
        <Ionicons
          name={(tx.category && CATEGORY_ICONS[tx.category as Category]) ? mapCategoryIcon(CATEGORY_ICONS[tx.category as Category] || '') as any : 'receipt-outline'}
          size={20}
          color={CATEGORY_COLORS[tx.category as Category] || '#111'}
        />
      </View>
      <View style={styles.txMid}>
        <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
        <View style={styles.txMeta}>
          <Text style={styles.txCat}>{tx.category || 'General'}</Text>
          <Text style={styles.txDot}>·</Text>
          <Text style={styles.txDate}>{fmtDate(tx.date)}</Text>
        </View>
      </View>
      <Text style={[styles.txAmt, { color: tx.type === 'income' ? '#2DCA72' : '#111' }]}>
        {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount)}
      </Text>
    </Animated.View>
  ), []);

  const txKeyExtractor = useCallback((item: any) => item.id, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ═══ 1. HEADER ═══ */}
        <Animated.View entering={FadeIn.delay(50).duration(400)} style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' }]}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#6366F1' }}>
                    {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.dateText}>{todayStr()}</Text>
              <Text style={styles.greetText}>{greeting()}, <Text style={styles.nameText}>{(user as any)?.displayName?.split(' ')[0] || 'Rahul'}</Text></Text>
            </View>
          </View>
          <BounceButton onPress={onNotification} style={styles.bellBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#111" />
            <View style={styles.badge} />
          </BounceButton>
        </Animated.View>

        {/* ═══ 2. BALANCE HERO CARD ═══ */}
        <Animated.View entering={FadeInDown.delay(100).duration(500).springify()}>
          <LinearGradient
            colors={['#1A1C20', '#0F1014']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Animated.View style={[styles.heroGlow, floatStyle]} />

            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Total Balance</Text>
                <Animated.Text entering={ZoomIn.delay(300).duration(400)} style={styles.heroAmount}>
                  {hidden ? '₹ ••••••' : fmt(balance)}
                </Animated.Text>
              </View>
              <TouchableOpacity onPress={toggleHidden}>
                <MaterialCommunityIcons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {/* Savings rate bar */}
            <View style={styles.savingsBarOuter}>
              <View style={[styles.savingsBarFill, { width: `${Math.min(savingsRate, 100)}%` as any }]} />
            </View>
            <Text style={styles.savingsLabel}>
              {savingsRate.toFixed(0)}% saved this month
            </Text>

            {/* Income / Expense pills inside card */}
            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.heroPills}>
              <View style={styles.heroPillGreen}>
                <MaterialCommunityIcons name="arrow-down-left" size={14} color="#2DCA72" />
                <Text style={styles.heroPillGreenText}>Income</Text>
                <Text style={styles.heroPillGreenAmt}>{hidden ? '••••' : fmt(income)}</Text>
              </View>
              <View style={styles.heroPillRed}>
                <MaterialCommunityIcons name="arrow-up-right" size={14} color="#F43F5E" />
                <Text style={styles.heroPillRedText}>Expense</Text>
                <Text style={styles.heroPillRedAmt}>{hidden ? '••••' : fmt(expense)}</Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* ═══ 3. QUICK ACTIONS ═══ */}
        <View style={styles.actionsRow}>
          {actions.map((a: any, i) => (
            <Animated.View key={a.label} entering={FadeInDown.delay(140 + i * 55).duration(380)} style={styles.actionItem}>
              <BounceButton
                onPress={() => {
                  if (a.route) {
                    router.push(a.route as any);
                  } else if (a.type) {
                    openModal(a.type);
                  }
                }}
                style={styles.actionCircle}
              >
                <MaterialCommunityIcons name={a.icon as any} size={22} color="#111" />
              </BounceButton>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Animated.View>
          ))}
        </View>


        {/* ═══ 5. SPENDING PACE ═══ */}
        <Animated.View entering={FadeInUp.delay(380).duration(420)} style={styles.paceCard}>
          <View style={styles.paceHeader}>
            <View style={styles.paceLeft}>
              <MaterialCommunityIcons name="speedometer" size={16} color="#111" />
              <Text style={styles.paceTitle}>Spending Pace</Text>
            </View>
            <View style={[styles.paceBadge, { backgroundColor: overPace ? 'rgba(244,63,94,0.1)' : 'rgba(45,202,114,0.1)' }]}>
              <Text style={[styles.paceBadgeText, { color: overPace ? '#F43F5E' : '#2DCA72' }]}>
                {overPace ? 'Over pace' : 'On track'}
              </Text>
            </View>
          </View>
          <View style={styles.paceBarOuter}>
            <View style={[styles.paceBarFill, {
              width: `${Math.min(pacePercent, 100)}%` as any,
              backgroundColor: overPace ? '#F43F5E' : '#2DCA72',
            }]} />
          </View>
          <View style={styles.paceFooter}>
            <Text style={styles.paceSub}>Projected: {fmt(projectedExpense)}</Text>
            <Text style={styles.paceSub}>Target: {fmt(spendTarget)}/mo</Text>
          </View>
        </Animated.View>

        {/* ═══ 6. RECENT ACTIVITY ═══ */}
        <Animated.View entering={FadeIn.delay(420).duration(400)} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/features/transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.txList}>
          {recentTxs.length === 0 ? (
            <Animated.View entering={FadeIn.delay(460).duration(400)} style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="receipt" size={32} color="#C7C7CC" />
              </View>
              <Text style={styles.emptyH}>No transactions yet</Text>
              <Text style={styles.emptyP}>Tap the + button below to add your first transaction.</Text>
            </Animated.View>
          ) : (
            <FlatList
              data={recentTxs}
              renderItem={renderTxItem}
              keyExtractor={txKeyExtractor}
              scrollEnabled={false}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
              windowSize={3}
              removeClippedSubviews={true}
            />
          )}
        </View>

        {/* ═══ 7. BOTTOM SPACER ═══ */}
        <View style={{ height: 120 }} />

      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingHorizontal: 24, paddingTop: 10 },

  /* Header */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2DCA72', borderWidth: 2, borderColor: '#fff' },
  dateText: { fontSize: 11, color: '#8E8E93', fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 2 },
  greetText: { fontSize: 16, color: '#3A3A3C', fontWeight: '600' },
  nameText: { fontWeight: '800', color: '#111' },
  bellBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 11, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F43F5E', borderWidth: 1.5, borderColor: '#F5F5F5' },

  /* Hero card */
  heroCard: { borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  heroGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(45,202,114,0.18)', top: -50, right: -40 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  heroLabel: { fontSize: 12, color: '#8E8E93', marginBottom: 4 },
  heroAmount: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  savingsBarOuter: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 10, marginBottom: 6 },
  savingsBarFill: { height: '100%', borderRadius: 2, backgroundColor: '#2DCA72' },
  savingsLabel: { fontSize: 11, color: '#8E8E93', marginBottom: 16 },
  heroPills: { flexDirection: 'row', gap: 10 },
  heroPillGreen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(45,202,114,0.1)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  heroPillGreenText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 },
  heroPillGreenAmt: { fontSize: 13, fontWeight: '700', color: '#2DCA72' },
  heroPillRed: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  heroPillRedText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 },
  heroPillRedAmt: { fontSize: 13, fontWeight: '700', color: '#F43F5E' },

  /* Quick actions */
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  actionItem: { alignItems: 'center', gap: 7 },
  actionCircle: { width: 54, height: 54, borderRadius: 18, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600', color: '#3A3A3C' },

  /* Overview cards */
  overviewRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  overviewCard: { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, borderWidth: 1 },
  overviewCardGreen: { borderColor: 'rgba(45,202,114,0.2)' },
  overviewCardRed: { borderColor: 'rgba(244,63,94,0.15)' },
  overviewIconWrap: { marginBottom: 10 },
  overviewIconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  overviewLabel: { fontSize: 12, color: '#8E8E93', fontWeight: '500', marginBottom: 4 },
  overviewAmt: { fontSize: 20, fontWeight: '800', color: '#111', letterSpacing: -0.3 },
  overviewTag: { marginTop: 6 },
  overviewTagText: { fontSize: 10, fontWeight: '600' },

  /* Spending pace */
  paceCard: { backgroundColor: '#F9F9FB', borderRadius: 16, padding: 16, marginBottom: 24 },
  paceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  paceLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paceTitle: { fontSize: 13, fontWeight: '700', color: '#111' },
  paceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  paceBadgeText: { fontSize: 10, fontWeight: '700' },
  paceBarOuter: { height: 6, backgroundColor: '#E5E5EA', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  paceBarFill: { height: '100%', borderRadius: 3 },
  paceFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  paceSub: { fontSize: 10, color: '#8E8E93', fontWeight: '500' },

  /* Section header */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#2DCA72' },

  /* Transaction list */
  txList: { gap: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 14 },
  txIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txMid: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 3 },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txCat: { fontSize: 11, color: '#8E8E93', fontWeight: '500' },
  txDot: { fontSize: 11, color: '#C7C7CC' },
  txDate: { fontSize: 11, color: '#C7C7CC' },
  txAmt: { fontSize: 15, fontWeight: '700' },

  /* Empty state */
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyH: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6 },
  emptyP: { fontSize: 13, color: '#8E8E93', textAlign: 'center', lineHeight: 20, maxWidth: 240 },
});