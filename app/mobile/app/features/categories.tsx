import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Layout } from 'react-native-reanimated';
import { useTransactions, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, Category } from '@/context/TransactionContext';

export default function CategoriesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { getCategoryBreakdown } = useTransactions();

    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const currentCategories = activeTab === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    // We can pull category breakdowns to show how many transactions use a category, 
    // but without full complex backend we will mock a "transactions count" visually.
    const mockUsageCount = (catName: string) => {
        return Math.floor(Math.random() * 20) + 1; // mock usage
    };

    const handleSave = () => {
        if (!newCategoryName.trim()) return;
        // In a real app we'd call an addCategory context action.
        // For now, we just close the modal.
        setIsModalOpen(false);
        setNewCategoryName('');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Categories</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.addButton} activeOpacity={0.7}>
                    <Ionicons name="add" size={24} color="#6366F1" />
                </TouchableOpacity>
            </Animated.View>

            {/* Tabs */}
            <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'expense' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('expense')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'income' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('income')}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>Income</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {currentCategories.map((cat, index) => {
                        const iconName = CATEGORY_ICONS[cat as Category] || 'folder-outline';
                        const iconColor = CATEGORY_COLORS[cat as Category] || '#C7C7CC';
                        const usages = mockUsageCount(cat);

                        return (
                            <Animated.View
                                key={`${activeTab}-${cat}`}
                                layout={Layout.springify()}
                            >
                                <Animated.View
                                    entering={FadeInDown.delay(150 + index * 30).duration(400).springify()}
                                    style={styles.categoryCard}
                                >
                                    <View style={styles.catLeft}>
                                        <View style={[styles.iconWrap, { backgroundColor: iconColor + '15' }]}>
                                            <Ionicons name={iconName as any} size={20} color={iconColor} />
                                        </View>
                                        <View>
                                            <Text style={styles.catName}>{cat}</Text>
                                            <Text style={styles.catUsage}>{usages} transactions</Text>
                                        </View>
                                    </View>
                                    <View style={styles.catRight}>
                                        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                                            <Ionicons name="pencil-outline" size={16} color="#8E8E93" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: 'rgba(244,63,94,0.05)' }]} activeOpacity={0.7}>
                                            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </Animated.View>
                        );
                    })}

                    <Animated.View entering={FadeInDown.delay(150 + currentCategories.length * 30).duration(400).springify()}>
                        <TouchableOpacity style={styles.emptyCard} onPress={() => setIsModalOpen(true)} activeOpacity={0.7}>
                            <Ionicons name="add-circle-outline" size={32} color="#C7C7CC" />
                            <Text style={styles.emptyCardText}>Add Custom Category</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal
                visible={isModalOpen}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>New {activeTab === 'expense' ? 'Expense' : 'Income'} Category</Text>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                                <Ionicons name="close-circle" size={28} color="#C7C7CC" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Subscriptions"
                                placeholderTextColor="#C7C7CC"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                autoFocus
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                            <Text style={styles.saveButtonText}>Create Category</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(99,102,241,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabsContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    tabsWrapper: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 4,
    },
    tabBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    tabBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8E8E93',
    },
    tabTextActive: {
        color: '#111',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
    },
    grid: {
        gap: 12,
    },
    categoryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
    },
    catLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    catName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
        marginBottom: 2,
    },
    catUsage: {
        fontSize: 12,
        fontWeight: '600',
        color: '#8E8E93',
    },
    catRight: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    emptyCard: {
        height: 80,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexDirection: 'row',
    },
    emptyCardText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8E8E93',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111',
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#8E8E93',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 18,
        color: '#111',
        fontSize: 18,
        fontWeight: '800',
    },
    saveButton: {
        backgroundColor: '#6366F1',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
});
