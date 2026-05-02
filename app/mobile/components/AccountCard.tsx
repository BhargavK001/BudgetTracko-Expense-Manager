import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Building2, Wallet, Banknote, CreditCard, ChevronRight,
} from 'lucide-react-native';
import AnimatedPressable from './AnimatedPressable';
import { useSettings } from '@/context/SettingsContext';
import { useThemeStyles } from '@/components/more/DesignSystem';

export const ACCOUNT_TYPE_META: Record<string, { Icon: any; label: string; defaultColor: string }> = {
  bank:   { Icon: Building2,  label: 'Bank Account',    defaultColor: '#0A84FF' },
  wallet: { Icon: Wallet,     label: 'Digital Wallet',  defaultColor: '#2DCA72' },
  cash:   { Icon: Banknote,   label: 'Cash',            defaultColor: '#FF9F0A' },
  credit: { Icon: CreditCard, label: 'Credit Card',     defaultColor: '#F43F5E' },
};

// Legacy Ionicons compat shim used by other files
export const ACCOUNT_TYPE_META_LEGACY = ACCOUNT_TYPE_META;

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
  name, type, balance, balanceNum = 0, color,
  masked = true, creditLimit, onPress, onLongPress,
}: AccountCardProps) {
  const { formatCurrency, currency, isDarkMode } = useSettings();
  const { tokens } = useThemeStyles();

  const resolvedType = type || 'bank';
  const meta = ACCOUNT_TYPE_META[resolvedType] || ACCOUNT_TYPE_META.bank;
  const { Icon } = meta;
  const accentColor = color || meta.defaultColor;
  const isNegative = balanceNum < 0;
  const isCredit = resolvedType === 'credit';
  const hasLimit = isCredit && !!creditLimit && creditLimit > 0;
  const used = hasLimit ? Math.abs(Math.min(balanceNum, 0)) : 0;
  const usagePct = hasLimit ? Math.min((used / creditLimit!) * 100, 100) : 0;
  const available = hasLimit ? Math.max(creditLimit! - used, 0) : 0;

  const barColor = usagePct > 80 ? '#F43F5E' : usagePct > 50 ? '#FF9F0A' : '#2DCA72';

  const balanceTextColor = masked
    ? tokens.textMuted
    : isNegative ? '#F43F5E' : tokens.textPrimary;

  return (
    <AnimatedPressable
      style={[s.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}
      onPress={onPress}
      onLongPress={onLongPress}
      scaleDown={0.97}
    >
      {/* Left accent line */}
      <View style={[s.accentBar, { backgroundColor: accentColor }]} />

      {/* Icon */}
      <View style={[s.iconWrap, { backgroundColor: accentColor + '18' }]}>
        <Icon size={20} color={accentColor} strokeWidth={2} />
      </View>

      {/* Info */}
      <View style={s.info}>
        <Text style={[s.name, { color: tokens.textPrimary }]} numberOfLines={1}>{name}</Text>
        <View style={[s.badge, { backgroundColor: accentColor + '15' }]}>
          <Text style={[s.badgeTxt, { color: accentColor }]}>{meta.label}</Text>
        </View>

        {hasLimit && !masked && (
          <View style={s.creditWrap}>
            <View style={[s.creditBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#EFEFEF' }]}>
              <View style={[s.creditFill, { width: `${usagePct}%` as any, backgroundColor: barColor }]} />
            </View>
            <View style={s.creditRow}>
              <Text style={[s.creditTxt, { color: tokens.textMuted }]}>{formatCurrency(available)} avail</Text>
              <Text style={[s.creditTxt, { color: tokens.textMuted }]}>Limit {formatCurrency(creditLimit || 0)}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Right: balance */}
      <View style={s.right}>
        <Text style={[s.balLabel, { color: tokens.textMuted }]}>BALANCE</Text>
        <Text style={[s.balance, { color: balanceTextColor }]}>
          {masked ? `${currency} ••••` : balance}
        </Text>
        <View style={s.viewHint}>
          <Text style={[s.viewTxt, { color: accentColor }]}>Details</Text>
          <ChevronRight size={10} color={accentColor} strokeWidth={2.5} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default React.memo(AccountCard);

const s = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 14, paddingLeft: 20,
    marginBottom: 10, borderWidth: 1,
    position: 'relative', overflow: 'hidden',
  },
  accentBar: { position: 'absolute', left: 0, top: 10, bottom: 10, width: 3, borderRadius: 3 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeTxt: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  creditWrap: { marginTop: 8 },
  creditBg: { height: 4, borderRadius: 2, overflow: 'hidden' },
  creditFill: { height: '100%', borderRadius: 2 },
  creditRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  creditTxt: { fontSize: 9, fontWeight: '500' },
  right: { alignItems: 'flex-end', marginLeft: 8, gap: 3 },
  balLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8 },
  balance: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  viewHint: { flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 2 },
  viewTxt: { fontSize: 10, fontWeight: '600' },
});
