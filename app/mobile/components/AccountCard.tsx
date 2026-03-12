import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedPressable from './AnimatedPressable';

// ── Account type metadata ────────────────────────────────
export const ACCOUNT_TYPE_META: Record<string, { icon: React.ComponentProps<typeof Ionicons>['name']; label: string; defaultColor: string }> = {
  'bank': { icon: 'business-outline', label: 'Bank Account', defaultColor: '#007AFF' },
  'wallet': { icon: 'wallet-outline', label: 'Digital Wallet', defaultColor: '#2DCA72' },
  'cash': { icon: 'cash-outline', label: 'Cash', defaultColor: '#FF9500' },
  'credit': { icon: 'card-outline', label: 'Credit Card', defaultColor: '#F43F5E' },
};

const NAME_TO_TYPE: Record<string, string> = {
  'Cash': 'cash', 'Bank Account': 'bank', 'Slice': 'credit',
};

type AccountCardProps = {
  name: string;
  type?: string;
  balance?: string;
  balanceNum?: number;
  color?: string;
  masked?: boolean;
  creditLimit?: number;
  onPress?: () => void;
  onLongPress?: () => void;
};

function AccountCard({
  name, type, balance, balanceNum = 0, color, masked = true,
  creditLimit, onPress, onLongPress,
}: AccountCardProps) {
  const resolvedType = type || NAME_TO_TYPE[name] || 'bank';
  const meta = ACCOUNT_TYPE_META[resolvedType] || ACCOUNT_TYPE_META['bank'];
  const accentColor = color || meta.defaultColor;
  const isNegative = balanceNum < 0;
  const isCredit = resolvedType === 'credit';
  const hasLimit = isCredit && creditLimit && creditLimit > 0;
  const used = hasLimit ? Math.abs(Math.min(balanceNum, 0)) : 0;
  const usagePct = hasLimit ? Math.min((used / creditLimit!) * 100, 100) : 0;
  const available = hasLimit ? Math.max(creditLimit! - used, 0) : 0;

  const accentBarStyle = useMemo(() => ({ backgroundColor: accentColor }), [accentColor]);
  const iconBgStyle = useMemo(() => ({ backgroundColor: accentColor + '14' }), [accentColor]);
  const badgeBgStyle = useMemo(() => ({ backgroundColor: accentColor + '12' }), [accentColor]);
  const badgeTextStyle = useMemo(() => ({ color: accentColor }), [accentColor]);
  const balanceColor = useMemo(() => ({ color: masked ? '#C7C7CC' : isNegative ? '#F43F5E' : '#111' }), [masked, isNegative]);
  const creditFillStyle = useMemo(() => ({
    width: `${usagePct}%` as any,
    backgroundColor: usagePct > 80 ? '#F43F5E' : usagePct > 50 ? '#FF9500' : '#2DCA72',
  }), [usagePct]);

  return (
    <AnimatedPressable
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleDown={0.97}
    >
      <View style={[styles.accentBar, accentBarStyle]} />

      <View style={[styles.iconWrap, iconBgStyle]}>
        <Ionicons name={meta.icon} size={20} color={accentColor} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <View style={[styles.typeBadge, badgeBgStyle]}>
          <Text style={[styles.typeBadgeText, badgeTextStyle]}>{meta.label}</Text>
        </View>

        {/* Credit limit bar */}
        {hasLimit && !masked && (
          <View style={styles.creditWrap}>
            <View style={styles.creditBarBg}>
              <View style={[styles.creditBarFill, creditFillStyle]} />
            </View>
            <View style={styles.creditLabels}>
              <Text style={styles.creditTxt}>
                ₹{available.toLocaleString('en-IN')} avail
              </Text>
              <Text style={styles.creditTxt}>
                Limit ₹{creditLimit!.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <Text style={styles.balLabel}>Balance</Text>
        <Text style={[styles.balance, balanceColor]}>
          {masked ? '₹ ••••••' : balance}
        </Text>
        <View style={styles.historyHint}>
          <Text style={styles.historyText}>View →</Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default React.memo(AccountCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 16,
    padding: 14, paddingLeft: 18, marginBottom: 10,
    borderWidth: 1, borderColor: '#F2F2F7',
    position: 'relative', overflow: 'hidden',
  },
  accentBar: { position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2 },
  iconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 4 },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  typeBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },

  // Credit limit bar
  creditWrap: { marginTop: 8 },
  creditBarBg: { height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, overflow: 'hidden' },
  creditBarFill: { height: '100%', borderRadius: 2 },
  creditLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  creditTxt: { fontSize: 9, color: '#8E8E93', fontWeight: '500' },

  right: { alignItems: 'flex-end', marginLeft: 8 },
  balLabel: { fontSize: 9, color: '#C7C7CC', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  balance: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  historyHint: { marginTop: 4 },
  historyText: { fontSize: 10, fontWeight: '600', color: '#2DCA72' },
});
