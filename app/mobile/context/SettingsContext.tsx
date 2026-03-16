import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencySymbol = '₹' | '$' | '€' | '£' | '¥';

interface SettingsContextType {
    currency: CurrencySymbol;
    setCurrency: (symbol: CurrencySymbol) => Promise<void>;
    formatCurrency: (amount: number, showDecimals?: boolean) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencySymbol>('₹');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedCurrency = await AsyncStorage.getItem('preferredCurrency');
                if (storedCurrency) {
                    setCurrencyState(storedCurrency as CurrencySymbol);
                }
            } catch (error) {
                console.error('Failed to load settings', error);
            }
        };
        loadSettings();
    }, []);

    const setCurrency = async (symbol: CurrencySymbol) => {
        try {
            await AsyncStorage.setItem('preferredCurrency', symbol);
            setCurrencyState(symbol);
        } catch (error) {
            console.error('Failed to save currency', error);
        }
    };

    const formatCurrency = (amount: number, showDecimals = false) => {
        const val = amount || 0;

        // Formatter options
        const opts: Intl.NumberFormatOptions = {
            minimumFractionDigits: showDecimals ? 2 : 0,
            maximumFractionDigits: showDecimals ? 2 : 0,
        };

        // If it's INR, use South Asian numbering system
        if (currency === '₹') {
            return `${currency}${val.toLocaleString('en-IN', opts)}`;
        }

        // Otherwise use standard US/Global numbering
        return `${currency}${val.toLocaleString('en-US', opts)}`;
    };

    return (
        <SettingsContext.Provider value={{ currency, setCurrency, formatCurrency }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
    return ctx;
}
