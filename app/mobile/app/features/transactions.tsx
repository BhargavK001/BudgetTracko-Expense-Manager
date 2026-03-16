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

const TransactionRow = React.memo(({ tx, index, onPress, formatCurrency }: { tx: any; index: number; onPress: () => void; formatCurrency: (n: number) => string }) => {
    const rawIcon = CATEGORY_ICONS[tx.category as Category] || 'receipt-outline';
    const iconName = rawIcon ? mapCategoryIcon(rawIcon) : 'receipt-outline';
    const iconColor = CATEGORY_COLORS[tx.category as Category] || '#111';

    // Only animate the first 10 items to prevent off-screen layout jitter
    const isInitial = index < 10;

    return (
        <Animated.View
            entering={isInitial ? FadeInDown.delay(50 + index * 30).duration(300) : undefined}
        >
            <TouchableOpacity
                style={styles.txRow}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View style={[styles.txIconWrap, { backgroundColor: iconColor + '15' }]}>
                    <Ionicons name={iconName as any} size={20} color={iconColor} />
                </View>
                <View style={styles.txMid}>
                    <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                    <View style={styles.txMeta}>
                        <Text style={styles.txCat}>{tx.category || 'General'}</Text>
                        <Text style={styles.txDot}>·</Text>
                        <Text style={styles.txDate}>{fmtDate(tx.day, tx.month, tx.year)}</Text>
                    </View>
                </View>
                <Text style={[styles.txAmt, { color: tx.type === 'income' ? '#2DCA72' : '#111' }]}>
                    {tx.type === 'income' ? '+' : '−'}{fmt(tx.amount, formatCurrency)}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

export default function TransactionsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { formatCurrency } = useSettings();
    const { transactions, refreshTransactions } = useTransactions();
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);

    const filteredTxs = useMemo(() => {
        let result = transactions;

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

        // 3. Date Filter (Match Day)
        if (dateFilter) {
            const dfDay = dateFilter.getDate();
            const dfMonth = dateFilter.getMonth();
            const dfYear = dateFilter.getFullYear();
            result = result.filter(t =>
                t.day === dfDay && t.month === dfMonth && t.year === dfYear
            );
        }

        return result;
    }, [transactions, filter, searchQuery, dateFilter]);

    const handleRowPress = useCallback((tx: any) => {
        setSelectedTx(tx);
        setIsModalVisible(true);
    }, []);

    const renderItem = useCallback(({ item: tx, index: i }: { item: any; index: number }) => {
        return <TransactionRow tx={tx} index={i} onPress={() => handleRowPress(tx)} formatCurrency={formatCurrency} />;
    }, [handleRowPress, formatCurrency]);

    const keyExtractor = useCallback((item: any) => item.id || item._id, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <Animated.View entering={FadeIn} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>All Transactions</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
                    <Ionicons name="calendar-outline" size={20} color={dateFilter ? "#fff" : "#111"} />
                    {dateFilter && <View style={styles.datePickerDot} />}
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
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    placeholderTextColor="#8E8E93"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    returnKeyType="search"
                />
                {(searchQuery.length > 0 || dateFilter) && (
                    <TouchableOpacity
                        onPress={() => { setSearchQuery(''); setDateFilter(null); }}
                        style={styles.clearSearchBtn}
                    >
                        <Ionicons name="close-circle" size={16} color="#8E8E93" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Filters */}
            <View style={styles.filterContainer}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f.key}
                        style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterTxt, filter === f.key && styles.filterTxtActive]}>{f.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={filteredTxs}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={11}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={48} color="#E5E5EA" />
                        <Text style={styles.emptyTitle}>No transactions found</Text>
                        <Text style={styles.emptyDesc}>You don't have any matching transactions.</Text>
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    datePickerBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
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
        borderWidth: 1,
        borderColor: '#fff'
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
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
        color: '#111',
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
        backgroundColor: '#F5F5F5',
    },
    filterBtnActive: {
        backgroundColor: '#111',
    },
    filterTxt: {
        fontSize: 13,
        fontWeight: '600',
        color: '#8E8E93',
    },
    filterTxtActive: {
        color: '#fff',
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
        borderBottomColor: '#F9F9FB',
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
        color: '#111',
        marginBottom: 3,
    },
    txMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    txCat: {
        fontSize: 11,
        color: '#8E8E93',
        fontWeight: '500',
    },
    txDot: {
        fontSize: 11,
        color: '#C7C7CC',
    },
    txDate: {
        fontSize: 11,
        color: '#8E8E93',
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
        color: '#111',
    },
    emptyDesc: {
        fontSize: 14,
        color: '#8E8E93',
    },
});
