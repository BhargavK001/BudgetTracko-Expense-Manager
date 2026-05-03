import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStyles } from '@/components/more/DesignSystem';

export default function DebtsHelp() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isDarkMode, tokens } = useThemeStyles();

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: tokens.bgPrimary }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: tokens.borderDefault }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]}>
                    <Ionicons name="chevron-back" size={24} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>About Debts</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.scrollContent}>
                
                <View style={[styles.iconWrapper, { backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : '#EEF2FF' }]}>
                    <Ionicons name="information-circle" size={48} color="#6366F1" />
                </View>
                
                <Text style={[styles.title, { color: tokens.textPrimary }]}>How Debts Work</Text>
                <Text style={[styles.description, { color: tokens.textMuted }]}>
                    The debts feature helps you keep track of money you owe to others and money others owe to you. It ensures you never forget a pending payment or collection.
                </Text>

                <View style={[styles.card, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                    <View style={[styles.cardIcon, { backgroundColor: isDarkMode ? 'rgba(52,199,89,0.1)' : '#E8F5E9' }]}>
                        <Ionicons name="arrow-up" size={24} color="#34C759" />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={[styles.cardTitle, { color: tokens.textPrimary }]}>Lend (Receivable)</Text>
                        <Text style={[styles.cardDesc, { color: tokens.textMuted }]}>
                            When you lend money to someone, you create a "Lend" record. This means someone owes you money. These appear in green as receivables.
                        </Text>
                    </View>
                </View>

                <View style={[styles.card, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                    <View style={[styles.cardIcon, { backgroundColor: isDarkMode ? 'rgba(255,69,58,0.1)' : '#FFEBEE' }]}>
                        <Ionicons name="arrow-down" size={24} color="#FF453A" />
                    </View>
                    <View style={styles.cardText}>
                        <Text style={[styles.cardTitle, { color: tokens.textPrimary }]}>Borrow (Payable)</Text>
                        <Text style={[styles.cardDesc, { color: tokens.textMuted }]}>
                            When you borrow money from someone, you create a "Borrow" record. This means you owe money. These appear in red as payables.
                        </Text>
                    </View>
                </View>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 12,
        alignItems: 'center',
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 32,
    },
    card: {
        flexDirection: 'row',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 16,
        width: '100%',
        alignItems: 'flex-start',
    },
    cardIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 8,
    },
    cardDesc: {
        fontSize: 14,
        lineHeight: 20,
    },
});
