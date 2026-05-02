import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    FlatList,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTransactions, CATEGORY_ICONS, CATEGORY_COLORS, Category, mapCategoryIcon } from '@/context/TransactionContext';
import AddTransactionModal from '@/components/AddTransactionModal';
import { useSettings } from '@/context/SettingsContext';
import { LucideCategoryIcon } from '@/app/features/categories';
import { useThemeStyles } from '@/components/more/DesignSystem';

function fmt(n: number, formatCurrency: (n: number) => string): string {
    return formatCurrency(Math.abs(n));
}

function fmtDate(day: number, month: number, year: number): string {
    const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${m[month]} ${year}`;
}

const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expense', label: 'Expense' },
    { key: 'transfer', label: 'Transfer' },
];

const TransactionRow = React.memo(({ tx, index, onPress, formatCurrency, getCategoryMeta, tokens }: { tx: any; index: number; onPress: () => void; formatCurrency: (n: number) => string; getCategoryMeta: (name: string) => { icon: string; color: string; isLucide: boolean }; tokens: any }) => {
    const meta = getCategoryMeta(tx.category || 'Other');
    const iconColor = meta.color;

    const isInitial = index < 12;

    return (
        <Animated.View
            entering={isInitial ? FadeInDown.delay(index * 30).duration(300) : undefined}
        >
            <TouchableOpacity
                style={[styles.txRow, { borderBottomColor: tokens.borderSubtle }]}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.txIconWrap, { backgroundColor: iconColor + '15' }]}>
                    {meta.isLucide ? (
                        <LucideCategoryIcon name={meta.icon} size={20} color={iconColor} />
                    ) : (
                        <Ionicons name={mapCategoryIcon(meta.icon) as any} size={20} color={iconColor} />
                    )}
                </View>
                <View style={styles.txMid}>
                    <Text style={[styles.txTitle, { color: tokens.textPrimary }]} numberOfLines={1}>{tx.title}</Text>
                    <View style={styles.txMeta}>
                        <Text style={[styles.txCat, { color: tokens.textMuted }]}>{tx.category || 'General'}</Text>
                        <Text style={[styles.txDot, { color: tokens.borderSubtle }]}>·</Text>
                        <Text style={[styles.txDate, { color: tokens.textMuted }]}>{fmtDate(tx.day, tx.month, tx.year)}</Text>
                    </View>
                </View>
                <Text style={[styles.txAmt, { color: tx.type === 'income' ? '#2DCA72' : tokens.textPrimary }]}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount, formatCurrency)}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

export default function TransactionsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { tokens } = useThemeStyles();
    const { formatCurrency, isDarkMode } = useSettings();
    const { transactions, refreshTransactions, getCategoryMeta, getTransactionsByYear } = useTransactions();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);

    const filteredTxs = useMemo(() => {
        let result = transactions;

        // Optimization: if date filter is set, start with the specific year to narrow search space
        if (dateFilter) {
            const dfYear = dateFilter.getFullYear();
            const dfMonth = dateFilter.getMonth();
            const dfDay = dateFilter.getDate();
            
            // Only use indexed year if we have one, otherwise fall back to full list
            const yearTxs = getTransactionsByYear ? getTransactionsByYear(dfYear) : transactions;
            
            result = yearTxs.filter(t =>
                t.day === dfDay && t.month === dfMonth && t.year === dfYear
            );
        }

        // 1. Type Filter
        if (filter !== 'all') {
            result = result.filter(t => t.type === filter);
        }

        // 2. Search (Title or Category)
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                (t.title && t.title.toLowerCase().includes(q)) ||
                (t.category && t.category.toLowerCase().includes(q))
            );
        }

        return result;
    }, [transactions, filter, searchQuery, dateFilter, getTransactionsByYear]);

    const handleRowPress = useCallback((tx: any) => {
        setSelectedTx(tx);
        setIsModalVisible(true);
    }, []);

    const renderItem = useCallback(({ item: tx, index: i }: { item: any; index: number }) => {
        return (
            <TransactionRow
                tx={tx}
                index={i}
                onPress={() => handleRowPress(tx)}
                formatCurrency={formatCurrency}
                getCategoryMeta={getCategoryMeta}
                tokens={tokens}
            />
        );
    }, [handleRowPress, formatCurrency, getCategoryMeta, tokens]);

    const keyExtractor = useCallback((item: any) => item.id || item._id, []);
    const getItemLayout = useCallback((data: any, index: number) => ({
        length: 73,
        offset: 73 * index,
        index,
    }), []);

    return (
        <View style={[styles.container, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <Animated.View entering={FadeIn} style={[styles.header, { borderBottomColor: tokens.borderSubtle }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>All Transactions</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.datePickerBtn, { backgroundColor: dateFilter ? tokens.teal.accent : tokens.bgSecondary }]}>
                    <Ionicons name="calendar-outline" size={20} color={dateFilter ? "#fff" : tokens.textPrimary} />
                    {dateFilter && <View style={[styles.datePickerDot, { borderColor: tokens.bgPrimary, backgroundColor: tokens.coral.accent }]} />}
                </TouchableOpacity>
            </Animated.View>

            {/* Date Picker Overlay */}
            {showDatePicker && (
                <DateTimePicker
                    value={dateFilter || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) setDateFilter(selectedDate);
                    }}
                />
            )}

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: tokens.bgSecondary }]}>
                <Ionicons name="search" size={18} color={tokens.textMuted} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: tokens.textPrimary }]}
                    placeholder="Search transactions..."
                    placeholderTextColor={tokens.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {(searchQuery.length > 0 || dateFilter) && (
                    <TouchableOpacity
                        onPress={() => { setSearchQuery(''); setDateFilter(null); }}
                        style={styles.clearSearchBtn}
                    >
                        <Ionicons name="close-circle" size={16} color={tokens.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                {FILTERS.map(f => {
                    const isActive = filter === f.key;
                    return (
                        <TouchableOpacity
                            key={f.key}
                            style={[
                                styles.filterBtn,
                                { backgroundColor: isActive ? tokens.textPrimary : tokens.bgSecondary }
                            ]}
                            onPress={() => setFilter(f.key)}
                        >
                            <Text style={[
                                styles.filterTxt,
                                { color: isActive ? tokens.bgPrimary : tokens.textMuted }
                            ]}>
                                {f.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            <FlatList
                data={filteredTxs}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemLayout={getItemLayout}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5} // Reduced from 11 for better memory management on large lists
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={48} color={tokens.borderSubtle} />
                        <Text style={[styles.emptyTitle, { color: tokens.textPrimary }]}>No transactions found</Text>
                        <Text style={[styles.emptyDesc, { color: tokens.textMuted }]}>You don't have any matching transactions.</Text>
                    </View>
                }
            />

            {/* Edit Modal */}
            <AddTransactionModal
                visible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setTimeout(() => setSelectedTx(null), 300); // clear after animation
                }}
                editingTransaction={selectedTx}
                onEditSuccess={() => {
                    refreshTransactions();
                }}
            />
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
        paddingHorizontal: 24,
        paddingVertical: 14,
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
    datePickerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    datePickerDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#F43F5E',
        borderWidth: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 24,
        marginTop: 16,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
    },
    clearSearchBtn: {
        padding: 4,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingVertical: 16,
        gap: 8,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    filterTxt: {
        fontSize: 13,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    txIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    txMid: {
        flex: 1,
    },
    txTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
    },
    txMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    txCat: {
        fontSize: 11,
        fontWeight: '500',
    },
    txDot: {
        fontSize: 11,
    },
    txDate: {
        fontSize: 11,
        fontWeight: '500',
    },
    txAmt: {
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptyDesc: {
        fontSize: 14,
    },
});
