/**
 * BudgetTracko – Premium Dark Theme v2
 * Deep navy + indigo/violet gradients, glass morphism cards, modern financial UI
 */

export const DarkTheme = {
  // ─── Backgrounds ───────────────────────────────────────────────
  bg: '#060D1F',              // Deep navy page background
  bgAlt: '#080F23',           // Slight alt background
  cardBg: '#0D1630',          // Default card
  cardBgElevated: '#132040',  // Elevated card (modals, hover)
  cardBgGlass: 'rgba(13,22,48,0.85)', // Glass-morphism

  // ─── Gradient stops (used in LinearGradient) ──────────────────
  gradientPrimary: ['#6366F1', '#8B5CF6'],   // Indigo → Violet
  gradientGold:    ['#F59E0B', '#FBBF24'],   // Amber → Yellow
  gradientSuccess: ['#059669', '#10B981'],   // Emerald
  gradientDanger:  ['#DC2626', '#F43F5E'],   // Red
  gradientCard:    ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.01)'],
  gradientHeader:  ['#0D1630', '#060D1F'],

  // ─── Text ──────────────────────────────────────────────────────
  textPrimary:   '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted:     '#475569',
  textAccent:    '#A5B4FC',   // Indigo-tinted text

  // ─── Semantic / Status ─────────────────────────────────────────
  spending:   '#F43F5E',
  spendingBg: '#1F0D14',
  spendingGlow: 'rgba(244,63,94,0.25)',
  income:     '#10B981',
  incomeBg:   '#0A1F18',
  incomeGlow: 'rgba(16,185,129,0.25)',

  // ─── Brand ─────────────────────────────────────────────────────
  accent:          '#6366F1',   // Primary indigo
  accentSecondary: '#8B5CF6',   // Violet
  accentGlow:      'rgba(99,102,241,0.3)',
  brandYellow:     '#FBBF24',
  brandAmber:      '#F59E0B',
  brandBlack:      '#060D1F',
  brandLime:       '#84CC16',

  // ─── Category Colors ───────────────────────────────────────────
  categoryColors: [
    '#10B981', '#6366F1', '#F59E0B', '#F43F5E',
    '#8B5CF6', '#06B6D4', '#84CC16', '#EC4899',
  ],

  // ─── Borders & Dividers ────────────────────────────────────────
  border:       '#1E2D4F',
  borderLight:  '#243357',
  separator:    '#0F1A36',
  neoBorder:    '#1E2D4F',
  neoBorderAccent: '#6366F1',

  // ─── Tab Bar ───────────────────────────────────────────────────
  tabBarBg:      '#0D1630',
  tabBarActive:  '#A5B4FC',
  tabBarInactive:'#475569',
  fabBg:         '#6366F1',
  fabIcon:       '#FFFFFF',

  // ─── Shadows / Glow ───────────────────────────────────────────
  shadowColor:   '#000000',
  glowPrimary:   'rgba(99,102,241,0.4)',
  glowGold:      'rgba(251,191,36,0.35)',

  // ─── Misc ──────────────────────────────────────────────────────
  chevron: '#475569',
  badge:   '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  info:    '#3B82F6',
};

// ─── Elevation shadows ──────────────────────────────────────────
export const NeoShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 12,
  elevation: 8,
};

export const NeoShadowSm = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
  elevation: 4,
};

export const GlowShadow = {
  shadowColor: '#6366F1',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.5,
  shadowRadius: 16,
  elevation: 8,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontSize = {
  xs:      10,
  sm:      12,
  md:      14,
  lg:      16,
  xl:      18,
  xxl:     22,
  xxxl:    28,
  display: 36,
};

export const BorderRadius = {
  sm:   10,
  md:   14,
  lg:   20,
  xl:   28,
  full: 9999,
};
