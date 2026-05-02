import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LucideIcon, ChevronRight, FileText, Info, Shield, Star, Trash2, Clock, HandCoins, AlertCircle, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSettings } from '@/context/SettingsContext';
import { useMemo } from 'react';

export const DARK_TOKENS = {
  bgPrimary: '#0E0E12',
  bgSecondary: '#0E0E12',
  bgTertiary: 'rgba(255,255,255,0.02)',
  heroSurface: 'rgba(255,255,255,0.03)',
  heroPageBg: '#0E0E12',
  cardSurface: 'rgba(255,255,255,0.03)',
  pillSurface: 'rgba(255,255,255,0.08)',
  borderDefault: 'rgba(255,255,255,0.08)',
  borderSubtle: 'rgba(255,255,255,0.04)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.4)',
  purple: { fill: 'rgba(127, 119, 221, 0.15)', stroke: '#AFA9EC', accent: '#7F77DD' },
  teal: { fill: 'rgba(29, 158, 117, 0.15)', stroke: '#5DCAA5', accent: '#1D9E75' },
  amber: { fill: 'rgba(239, 159, 39, 0.15)', stroke: '#EF9F27', accent: '#EF9F27' },
  coral: { fill: 'rgba(216, 90, 48, 0.15)', stroke: '#E87D59', accent: '#D85A30' },
  blue: { fill: 'rgba(55, 138, 221, 0.15)', stroke: '#73B2ED', accent: '#378ADD' },
  green: { fill: 'rgba(99, 153, 34, 0.15)', stroke: '#8DC24D', accent: '#639922' },
  pink: { fill: 'rgba(212, 83, 126, 0.15)', stroke: '#E17498', accent: '#D4537E' },
  gray: { fill: 'rgba(255,255,255,0.1)', stroke: 'rgba(255,255,255,0.8)', accent: 'rgba(255,255,255,0.3)' },
  red: { fill: 'rgba(226, 75, 74, 0.15)', stroke: '#EC7A79', accent: '#E24B4A' },
  gradients: {
    premium: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'],
    gold: ['#854F0B', '#EF9F27'],
    glass: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.01)'],
    hero: ['rgba(255,255,255,0.03)', 'rgba(0,0,0,0)'],
  }
} as const;

export const LIGHT_TOKENS = {
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F7F7F8',
  bgTertiary: '#F1F0F5',
  heroSurface: '#18181F',
  heroPageBg: '#2A1D70',
  cardSurface: '#FFFFFF',
  pillSurface: '#FFFFFF',
  borderDefault: 'rgba(0,0,0,0.08)',
  borderSubtle: 'rgba(0,0,0,0.05)',
  textPrimary: '#111111',
  textSecondary: '#888780',
  textMuted: '#B4B2A9',
  purple: { fill: '#EEEDFE', stroke: '#534AB7', accent: '#7F77DD' },
  teal: { fill: '#E1F5EE', stroke: '#0F6E56', accent: '#1D9E75' },
  amber: { fill: '#FAEEDA', stroke: '#854F0B', accent: '#EF9F27' },
  coral: { fill: '#FAECE7', stroke: '#993C1D', accent: '#D85A30' },
  blue: { fill: '#E6F1FB', stroke: '#185FA5', accent: '#378ADD' },
  green: { fill: '#EAF3DE', stroke: '#3B6D11', accent: '#639922' },
  pink: { fill: '#FBEAF0', stroke: '#993556', accent: '#D4537E' },
  gray: { fill: '#F1EFE8', stroke: '#5F5E5A', accent: '#888780' },
  red: { fill: '#FCEBEB', stroke: '#A32D2D', accent: '#E24B4A' },
  gradients: {
    premium: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'],
    gold: ['#854F0B', '#EF9F27'],
    glass: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.01)'],
    hero: ['rgba(255,255,255,0.03)', 'rgba(0,0,0,0)'],
  }
} as const;

export function useThemeStyles() {
  const { isDarkMode } = useSettings();
  const tokens = isDarkMode ? DARK_TOKENS : LIGHT_TOKENS;
  const styles = useMemo(() => getStyles(tokens, isDarkMode), [isDarkMode, tokens]);
  return { tokens, styles, isDarkMode };
}

type Palette = {
  fill: string;
  stroke: string;
  accent: string;
};

type BaseCardProps = {
  title: string;
  subtitle: string;
  color: Palette;
  Icon: LucideIcon;
  onPress: () => void;
};

export function SectionHeader({ title }: { title: string }) {
  const { styles } = useThemeStyles();
  return <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>;
}

export function BentoTile({
  title,
  subtitle,
  color,
  Icon,
  onPress,
  showProBadge = false,
}: BaseCardProps & { showProBadge?: boolean }) {
  const { styles } = useThemeStyles();
  return (
    <Pressable onPress={onPress} style={styles.bentoTile}>
      <View style={[styles.topAccentBar, { backgroundColor: color.accent }]} />
      {showProBadge ? (
        <View style={styles.proBadge}>
          <Text style={styles.proBadgeText}>PRO</Text>
        </View>
      ) : null}
      <View style={[styles.iconBox36, { backgroundColor: color.fill }]}>
        <Icon size={17} color={color.stroke} strokeWidth={1.7} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      <Text style={styles.tileSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

export function WideRow({
  title,
  subtitle,
  color,
  Icon,
  onPress,
  value,
  showChevron = true,
  toggle,
  showAccent = true,
  borderColor,
  titleColor,
  subtitleColor,
}: BaseCardProps & {
  value?: string;
  showChevron?: boolean;
  toggle?: { value: boolean; onChange: (value: boolean) => void };
  showAccent?: boolean;
  borderColor?: string;
  titleColor?: string;
  subtitleColor?: string;
}) {
  const { styles } = useThemeStyles();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.wideRow, borderColor ? { borderColor } : null]}
    >
      {showAccent ? (
        <View style={[styles.leftAccentBar, { backgroundColor: color.accent }]} />
      ) : null}
      <View style={[styles.iconBox38, { backgroundColor: color.fill }]}> 
        <Icon size={17} color={color.stroke} strokeWidth={1.7} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, titleColor ? { color: titleColor } : null]}>
          {title}
        </Text>
        <Text
          style={[
            styles.rowSubtitle,
            subtitleColor ? { color: subtitleColor } : null,
          ]}
        >
          {subtitle}
        </Text>
      </View>
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onChange}
          trackColor={{ false: '#D3D1C7', true: '#1D9E75' }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#D3D1C7"
        />
      ) : (
        <View style={styles.rowRightWrap}>
          {value ? <Text style={styles.rowValue}>{value}</Text> : null}
          {showChevron ? (
            <View style={styles.chevronPill}>
              <ChevronRight size={11} color="#6F6D66" strokeWidth={1.9} />
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

export function MiniTile({
  title,
  subtitle,
  color,
  Icon,
  onPress,
}: BaseCardProps) {
  const { styles } = useThemeStyles();
  return (
    <Pressable onPress={onPress} style={styles.miniTile}>
      <View style={[styles.iconBox38, { backgroundColor: color.fill }]}> 
        <Animated.View key={title + (typeof Icon === 'function' ? Icon.name : '')} entering={ZoomIn.duration(300)} exiting={ZoomOut.duration(200)}>
          <Icon size={17} color={color.stroke} strokeWidth={1.7} />
        </Animated.View>
      </View>
      <Text style={styles.miniTitle}>{title}</Text>
      <Text style={styles.miniSubtitle}>{subtitle}</Text>
    </Pressable>
  );
}

export function HeroProfileCard({
  initials,
  name,
  email,
  planLabel,
  syncLabel,
  avatarUrl,
  onPress,
  onAvatarPress,
  stats,
}: {
  initials: string;
  name: string;
  email: string;
  planLabel: string;
  syncLabel: string;
  avatarUrl?: string | null;
  onPress: () => void;
  onAvatarPress: () => void;
  stats: Array<{ value: string; label: string; tone: 'warning' | 'positive' | 'neutral'; Icon: LucideIcon }>;
}) {
  const { styles, tokens, isDarkMode } = useThemeStyles();
  return (
    <View style={styles.heroWrapper}>
      <Pressable onPress={onPress} style={styles.heroCard}>
        <LinearGradient
          colors={tokens.gradients.hero}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.heroTopRow}>
          <Pressable onPress={onAvatarPress} style={styles.avatarWrap}>
            <View style={styles.avatarCore}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.onlineDot} />
          </Pressable>
          <View style={styles.heroIdentity}>
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroEmail} numberOfLines={1}>{email}</Text>
            <View style={styles.heroChipRow}>
              <View style={styles.planChip}>
                <Sparkles size={10} color="#AFA9EC" style={{ marginRight: 4 }} />
                <Text style={styles.planChipText}>{planLabel}</Text>
              </View>
              <View style={styles.syncChip}>
                <View style={styles.syncDot} />
                <Text style={styles.syncChipText}>{syncLabel}</Text>
              </View>
            </View>
          </View>
          <ChevronRight size={18} color="#5F5E5A" strokeWidth={1.5} />
        </View>

        <View style={styles.metricsContainer}>
          {stats.map((stat, idx) => {
            const isLast = idx === stats.length - 1;
            return (
              <View 
                key={stat.label} 
                style={[
                  styles.metricRow, 
                  !isLast && { borderBottomWidth: 1, borderBottomColor: tokens.borderSubtle }
                ]}
              >
                <View style={styles.metricLeft}>
                  <View style={[styles.metricIconWrap, { backgroundColor: stat.tone === 'warning' ? 'rgba(239, 159, 39, 0.1)' : stat.tone === 'positive' ? 'rgba(93, 202, 165, 0.1)' : isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    <stat.Icon size={12} color={stat.tone === 'warning' ? '#EF9F27' : stat.tone === 'positive' ? '#5DCAA5' : tokens.textSecondary} strokeWidth={2} />
                  </View>
                  <Text style={styles.metricLabel}>{stat.label}</Text>
                </View>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.7}
                  style={[
                    styles.metricValue,
                    stat.tone === 'warning'
                      ? { color: '#EF9F27' }
                      : stat.tone === 'positive'
                        ? { color: '#5DCAA5' }
                        : { color: tokens.textPrimary },
                  ]}
                >
                  {stat.value}
                </Text>
              </View>
            );
          })}
        </View>
      </Pressable>
    </View>
  );
}

export function ProBanner({ onPress }: { onPress: () => void }) {
  const { styles, tokens, isDarkMode } = useThemeStyles();
  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={isDarkMode ? tokens.gradients.premium : ['#18181F', '#111111']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.proBanner}
      >
        <LinearGradient 
          colors={tokens.gradients.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.proBannerLeftIcon}
        >
          <Star size={18} color="#FFFFFF" strokeWidth={1.7} fill="#FFFFFF" />
        </LinearGradient>
        <View style={styles.proBannerTextWrap}>
          <Text style={[styles.proBannerTitle, { color: '#FFFFFF' }]}>Unlock premium insights</Text>
          <Text style={[styles.proBannerSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>AI budgeting, exports, and smart alerts</Text>
        </View>
        <View style={[styles.upgradePill, { backgroundColor: '#FFFFFF' }]}>
          <Text style={[styles.upgradePillText, { color: '#111111' }]}>Upgrade</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function DangerZoneRow({ onPress }: { onPress: () => void }) {
  const { styles, tokens } = useThemeStyles();
  return (
    <Pressable onPress={onPress} style={styles.dangerRow}>
      <View style={styles.dangerAccent} />
      <View style={[styles.iconBox38, { backgroundColor: tokens.red.fill }]}>
        <Trash2 size={17} color={tokens.red.accent} strokeWidth={1.7} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { color: tokens.red.accent }]}>Delete account</Text>
        <Text style={[styles.rowSubtitle, { color: tokens.red.stroke }]}>Permanent and irreversible action</Text>
      </View>
      <View style={styles.chevronPill}>
        <ChevronRight size={11} color={tokens.textMuted} strokeWidth={1.9} />
      </View>
    </Pressable>
  );
}

export function FooterLinks({
  version,
  onPrivacy,
  onTerms,
}: {
  version: string;
  onPrivacy: () => void;
  onTerms: () => void;
}) {
  const { styles, tokens } = useThemeStyles();
  return (
    <View style={styles.footerRow}>
      <Pressable onPress={onPrivacy} style={styles.footerItem}>
        <Shield size={12} color={tokens.textMuted} strokeWidth={1.7} />
        <Text style={styles.footerText}>Privacy policy</Text>
      </Pressable>
      <Pressable onPress={onTerms} style={styles.footerItem}>
        <FileText size={12} color={tokens.textMuted} strokeWidth={1.7} />
        <Text style={styles.footerText}>Terms</Text>
      </Pressable>
      <View style={styles.footerItem}>
        <Info size={12} color={tokens.textMuted} strokeWidth={1.7} />
        <Text style={styles.footerText}>{version}</Text>
      </View>
    </View>
  );
}

export function BodySurface({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { styles } = useThemeStyles();
  return <View style={[styles.bodySurface, style]}>{children}</View>;
}

export type AppTokens = typeof DARK_TOKENS | typeof LIGHT_TOKENS;

const getStyles = (tokens: AppTokens, isDark: boolean) => StyleSheet.create({
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.77,
    color: tokens.textMuted,
    marginBottom: 10,
    paddingLeft: 2,
    marginTop: 8,
  },
  bentoTile: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    borderRadius: 24,
    minHeight: 106,
    padding: 16,
    flex: 1,
    overflow: 'hidden',
  },
  topAccentBar: {
    display: isDark ? 'none' : 'flex',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iconBox36: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    marginTop: 0,
  },
  iconBox38: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.textPrimary,
    marginBottom: 4,
  },
  tileSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: tokens.textSecondary,
  },
  proBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderWidth: 1,
    borderColor: tokens.borderDefault,
    backgroundColor: tokens.bgTertiary,
    borderRadius: 8,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  proBadgeText: {
    fontSize: 9,
    color: tokens.textPrimary,
    fontWeight: '600',
    lineHeight: 10,
  },
  wideRow: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    borderRadius: 20,
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  leftAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: 'transparent',
  },
  rowTextWrap: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: tokens.textPrimary,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: tokens.textSecondary,
  },
  rowRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: 12,
    fontWeight: '400',
    color: tokens.textSecondary,
    marginRight: 8,
  },
  chevronPill: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniTile: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)',
    borderRadius: 20,
    minHeight: 122,
    padding: 16,
    flex: 1,
  },
  miniTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: tokens.textPrimary,
    marginTop: 12,
    marginBottom: 3,
  },
  miniSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: tokens.textSecondary,
  },
  heroWrapper: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    width: 62,
    height: 62,
    marginRight: 16,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    opacity: 0.3,
  },
  avatarCore: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: tokens.purple.stroke,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: tokens.borderSubtle,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF', // keep white on purples
  },
  avatarImage: {
    width: 62,
    height: 62,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1D9E75',
    borderWidth: 2.5,
    borderColor: tokens.bgPrimary,
  },
  heroIdentity: { flex: 1 },
  heroName: {
    fontSize: 18,
    color: tokens.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroEmail: {
    fontSize: 12,
    color: tokens.textSecondary,
    fontWeight: '400',
    marginBottom: 10,
  },
  heroChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planChip: {
    backgroundColor: tokens.purple.fill,
    borderWidth: 0.5,
    borderColor: 'rgba(83, 74, 183, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  planChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: tokens.purple.stroke,
    textTransform: 'uppercase',
  },
  syncChip: {
    backgroundColor: tokens.teal.fill,
    borderWidth: 0.5,
    borderColor: tokens.teal.stroke,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: tokens.teal.accent,
    marginRight: 5,
  },
  syncChipText: {
    fontSize: 10,
    fontWeight: '500',
    color: tokens.teal.stroke,
    textTransform: 'uppercase',
  },
  metricsContainer: {
    marginTop: 18,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    paddingHorizontal: 14,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: tokens.textSecondary,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  proBanner: {
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  proBannerLeftIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  proBannerTextWrap: { flex: 1 },
  proBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: tokens.textPrimary,
    marginBottom: 2,
  },
  proBannerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: tokens.textSecondary,
  },
  upgradePill: {
    backgroundColor: Object.values(tokens.textPrimary).join(''),
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: tokens.bgPrimary,
  },
  dangerRow: {
    backgroundColor: isDark ? 'rgba(226, 75, 74, 0.05)' : '#FFFFFF',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(226, 75, 74, 0.2)' : '#F7C1C1',
    borderRadius: 20,
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    overflow: 'hidden',
  },
  dangerAccent: {
    display: 'none',
  },
  footerRow: {
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '400',
    color: tokens.textMuted,
  },
  bodySurface: {
    backgroundColor: 'transparent',
    paddingTop: 20,
    paddingHorizontal: 14,
  },
});
