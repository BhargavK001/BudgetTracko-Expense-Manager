import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as localDB from '@/services/localDB';

export type CurrencySymbol = '₹' | '$' | '€' | '£' | '¥';
export type AppTheme = 'light' | 'dark' | 'system';

interface SettingsContextType {
    currency: CurrencySymbol;
    setCurrency: (symbol: CurrencySymbol) => Promise<void>;
    formatCurrency: (amount: number, showDecimals?: boolean) => string;
    hapticEnabled: boolean;
    setHapticEnabled: (enabled: boolean) => Promise<void>;
    triggerHaptic: (style?: Haptics.ImpactFeedbackStyle) => void;
    appTheme: AppTheme;
    setAppTheme: (theme: AppTheme) => Promise<void>;
    isDarkMode: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencySymbol>('₹');
    const [hapticEnabled, setHapticEnabledState] = useState(true);
    const [appTheme, setAppThemeState] = useState<AppTheme>('system');
    
    const systemColorScheme = useColorScheme();

    useEffect(() => {
        const loadSettings = async () => {
            try {
                // 1. Check for legacy AsyncStorage data for migration
                const legacyCurrency = await AsyncStorage.getItem('preferredCurrency');
                const legacyHaptic = await AsyncStorage.getItem('hapticEnabled');
                const legacyTheme = await AsyncStorage.getItem('appTheme');

                if (legacyCurrency) {
                    localDB.setItem('preferredCurrency', legacyCurrency);
                    setCurrencyState(legacyCurrency as CurrencySymbol);
                    await AsyncStorage.removeItem('preferredCurrency');
                }
                if (legacyHaptic !== null) {
                    localDB.setItem('hapticEnabled', legacyHaptic);
                    setHapticEnabledState(legacyHaptic === 'true');
                    await AsyncStorage.removeItem('hapticEnabled');
                }
                if (legacyTheme) {
                    localDB.setItem('appTheme', legacyTheme);
                    setAppThemeState(legacyTheme as AppTheme);
                    await AsyncStorage.removeItem('appTheme');
                }

                // 2. Load from localDB (Synchronous via MMKV)
                const storedCurrency = localDB.getItem('preferredCurrency');
                if (storedCurrency) setCurrencyState(storedCurrency as CurrencySymbol);

                const storedHaptic = localDB.getItem('hapticEnabled');
                if (storedHaptic !== null) setHapticEnabledState(storedHaptic === 'true');

                const storedTheme = localDB.getItem('appTheme');
                if (storedTheme) setAppThemeState(storedTheme as AppTheme);

            } catch (error) {
                console.error('Failed to load settings', error);
            }
        };
        loadSettings();
    }, []);

    const setCurrency = async (symbol: CurrencySymbol) => {
        localDB.setItem('preferredCurrency', symbol);
        setCurrencyState(symbol);
    };

    const setHapticEnabled = async (enabled: boolean) => {
        localDB.setItem('hapticEnabled', String(enabled));
        setHapticEnabledState(enabled);
    };

    const setAppTheme = async (theme: AppTheme) => {
        localDB.setItem('appTheme', theme);
        setAppThemeState(theme);
    };

    const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
        if (hapticEnabled) {
            Haptics.impactAsync(style);
        }
    };

    const formatCurrency = (amount: number, showDecimals = false) => {
        const val = amount || 0;
        const opts: Intl.NumberFormatOptions = {
            minimumFractionDigits: showDecimals ? 2 : 0,
            maximumFractionDigits: showDecimals ? 2 : 0,
        };
        if (currency === '₹') {
            return `${currency}${val.toLocaleString('en-IN', opts)}`;
        }
        return `${currency}${val.toLocaleString('en-US', opts)}`;
    };

    const isDarkMode = useMemo(() => {
        if (appTheme === 'system') {
            return systemColorScheme === 'dark';
        }
        return appTheme === 'dark';
    }, [appTheme, systemColorScheme]);

    return (
        <SettingsContext.Provider value={{ 
            currency, setCurrency, formatCurrency, 
            hapticEnabled, setHapticEnabled, triggerHaptic,
            appTheme, setAppTheme, isDarkMode
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
