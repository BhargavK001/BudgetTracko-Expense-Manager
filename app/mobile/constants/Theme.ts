/**
 * BudgetTracko Dark Theme Constants
 * Blends reference dark aesthetic with neo-brutalist brand identity
 */

export const DarkTheme = {
    // Backgrounds
    bg: '#0A0A0A',
    cardBg: '#1A1A1A',
    cardBgElevated: '#222222',
    cardBgAlt: '#141414',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#9E9E9E',
    textMuted: '#666666',

    // Accents
    spending: '#E8584F',
    spendingBg: '#2D1F1F',
    income: '#4CAF50',
    incomeBg: '#1F2D1F',
    accent: '#FFD700',
    accentSecondary: '#FF9800',

    // Neo-Brutalist brand colors (from web app)
    brandYellow: '#facc15',
    brandBlack: '#1a1a1a',
    brandLime: '#a3e635',

    // Category Colors (for charts)
    categoryColors: [
        '#4CAF50',
        '#FF9800',
        '#7C4DFF',
        '#2196F3',
        '#E91E63',
        '#00BCD4',
        '#FFEB3B',
        '#795548',
    ],

    // Borders & Separators
    border: '#2A2A2A',
    separator: '#1E1E1E',

    // Tab bar
    tabBarBg: '#0A0A0A',
    tabBarActive: '#facc15',
    tabBarInactive: '#666666',
    fabBg: '#facc15',
    fabIcon: '#1a1a1a',

    // Misc
    chevron: '#666666',
    badge: '#FFD700',

    // Neo-Brutalist specifics
    neoBorder: '#333333',
    neoBorderAccent: '#facc15',
    neoShadow: '#333333',
};

// Neo-brutalist shadow for React Native
export const NeoShadow = {
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 5,
};

export const NeoShadowSm = {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 3,
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
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    display: 32,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};
