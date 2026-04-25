import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Layout, SlideInRight } from 'react-native-reanimated';
import { mapCategoryIcon, useTransactions, CategoryItem } from '@/context/TransactionContext';
import { LinearGradient } from 'expo-linear-gradient';
import api from '@/services/api';

const AVAILABLE_COLORS = [
    '#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', 
    '#06B6D4', '#F43F5E', '#3B82F6', '#1E293B', '#64748B'
];

const AVAILABLE_ICONS = [
    'cart', 'bus', 'restaurant', 'gift', 'medical', 
    'school', 'game-controller', 'fitness', 'home', 'construct', 
    'airplane', 'subway', 'receipt', 'card', 'briefcase', 
    'laptop', 'cash', 'trending-up', 'wallet', 'apps'
];

export default function CategoriesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { categories, refreshCategories, addCategory, updateCategory, deleteCategory, transactions } = useTransactions();

    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [saving, setSaving] = useState(false);

    const currentCategories = categories.filter(c => c.type === activeTab);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        transactions.forEach((t: any) => {
            const catName = typeof t.category === 'string' ? t.category : t.category?.name;
            if (catName) counts[catName] = (counts[catName] || 0) + 1;
        });
        return counts;
    }, [transactions]);

    useEffect(() => {
        refreshCategories();
    }, []);

    const openAddModal = () => {
        setEditingCategory(null);
        setCategoryName('');
        setSelectedIcon(AVAILABLE_ICONS[0]);
        setSelectedColor(AVAILABLE_COLORS[0]);
        setIsModalOpen(true);
    };

    const openEditModal = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setSelectedIcon(cat.icon || AVAILABLE_ICONS[0]);
        setSelectedColor(cat.color || AVAILABLE_COLORS[0]);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const name = categoryName.trim();
        if (!name) return;

        setSaving(true);
        try {
            if (editingCategory) {
                await updateCategory(editingCategory._id, { 
                    name, 
                    icon: selectedIcon, 
                    color: selectedColor 
                });
            } else {
                await addCategory({ 
                    name, 
                    type: activeTab, 
                    icon: selectedIcon, 
                    color: selectedColor 
                });
            }
            setIsModalOpen(false);
            setCategoryName('');
            setEditingCategory(null);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || e.message || 'Failed to save category.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCat = (cat: CategoryItem) => {
        const count = categoryCounts[cat.name] || 0;
        const warning = count > 0
            ? `This category has ${count} transaction${count > 1 ? 's' : ''}. Deleting it will remove the category label from those transactions.`
            : `Are you sure you want to delete "${cat.name}"?`;

        Alert.alert('Delete Category', warning, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteCategory(cat._id);
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.message || e.message || 'Failed to delete category.');
                    }
                },
            },
        ]);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Categories</Text>
                <TouchableOpacity onPress={openAddModal} style={styles.addButton} activeOpacity={0.7}>
                    <Ionicons name="add" size={24} color="#6366F1" />
                </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.tabsContainer}>
                <View style={styles.tabsWrapper}>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'expense' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('expense')} activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === 'income' && styles.tabBtnActive]}
                        onPress={() => setActiveTab('income')} activeOpacity={0.8}
                    >
                        <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>Income</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {currentCategories.map((cat, index) => {
                        const iconName = mapCategoryIcon(cat.icon || 'ellipsis-horizontal-circle-outline');
                        const iconColor = cat.color || '#6366F1';
                        const count = categoryCounts[cat.name] || 0;

                        return (
                            <Animated.View key={cat._id} layout={Layout.springify()}>
                                <Animated.View
                                    entering={FadeInDown.delay(100 + index * 30).duration(400).springify()}
                                    style={styles.categoryCard}
                                >
                                    <View style={styles.catLeft}>
                                        <View style={[styles.iconWrap, { backgroundColor: iconColor + '15' }]}>
                                            <Ionicons name={iconName as any} size={20} color={iconColor} />
                                        </View>
                                        <View>
                                            <Text style={styles.catName}>{cat.name}</Text>
                                            <Text style={styles.catUsage}>{count} transaction{count !== 1 ? 's' : ''}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.catRight}>
                                        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={() => openEditModal(cat)}>
                                            <Ionicons name="pencil-outline" size={16} color="#8E8E93" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.iconButton, { backgroundColor: 'rgba(244,63,94,0.05)' }]}
                                            activeOpacity={0.7}
                                            onPress={() => handleDeleteCat(cat)}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </Animated.View>
                        );
                    })}

                    {currentCategories.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="folder-open-outline" size={64} color="#E5E5EA" />
                            <Text style={styles.emptyTitle}>No categories yet</Text>
                            <Text style={styles.emptyDesc}>Tap the + button to add your first {activeTab} category.</Text>
                        </View>
                    )}

                    <Animated.View entering={FadeInDown.delay(100 + currentCategories.length * 30).duration(400).springify()}>
                        <TouchableOpacity style={styles.emptyCard} onPress={openAddModal} activeOpacity={0.7}>
                            <Ionicons name="add-circle-outline" size={32} color="#C7C7CC" />
                            <Text style={styles.emptyCardText}>Add Category</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal visible={isModalOpen} animationType="fade" transparent onRequestClose={() => setIsModalOpen(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingCategory ? 'Rename Category' : `New ${activeTab === 'expense' ? 'Expense' : 'Income'} Category`}
                            </Text>
                            <TouchableOpacity onPress={() => { setIsModalOpen(false); setEditingCategory(null); }}>
                                <Ionicons name="close-circle" size={28} color="#C7C7CC" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Category Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Subscriptions"
                                placeholderTextColor="#C7C7CC"
                                value={categoryName}
                                onChangeText={setCategoryName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Select Icon</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.iconPicker}>
                                {AVAILABLE_ICONS.map((icon) => (
                                    <TouchableOpacity
                                        key={icon}
                                        style={[
                                            styles.pickerIconWrap,
                                            selectedIcon === icon && { backgroundColor: selectedColor + '15', borderColor: selectedColor }
                                        ]}
                                        onPress={() => setSelectedIcon(icon)}
                                    >
                                        <Ionicons 
                                            name={mapCategoryIcon(icon) as any} 
                                            size={22} 
                                            color={selectedIcon === icon ? selectedColor : '#8E8E93'} 
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Select Color</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorPicker}>
                                {AVAILABLE_COLORS.map((color) => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorDot,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.colorDotActive
                                        ]}
                                        onPress={() => setSelectedColor(color)}
                                    >
                                        {selectedColor === color && <Ionicons name="checkmark" size={14} color="#fff" />}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8} disabled={saving}>
                            {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.saveButtonText}>{editingCategory ? 'Save Changes' : 'Create Category'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 14,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    addButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(99,102,241,0.1)', justifyContent: 'center', alignItems: 'center',
    },
    tabsContainer: { paddingHorizontal: 24, marginBottom: 16 },
    tabsWrapper: {
        flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 4,
    },
    tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    tabBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    tabTextActive: { color: '#111' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24 },
    grid: { gap: 12 },
    categoryCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#fff', padding: 16, borderRadius: 20,
        borderWidth: 1, borderColor: '#F2F2F7',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02, shadowRadius: 6, elevation: 1,
    },
    catLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconWrap: {
        width: 44, height: 44, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
    },
    catName: { fontSize: 16, fontWeight: '800', color: '#111', marginBottom: 2 },
    catUsage: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
    catRight: { flexDirection: 'row', gap: 8 },
    iconButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 10 },
    emptyCard: {
        height: 80, borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0',
        borderStyle: 'dashed', backgroundColor: '#FAFAFA',
        alignItems: 'center', justifyContent: 'center', gap: 8, flexDirection: 'row',
    },
    emptyCardText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyTitle: { fontSize: 20, fontWeight: '800', color: '#111' },
    emptyDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 32 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 24,
    },
    modalTitle: { fontSize: 18, fontWeight: '900', color: '#111' },
    formGroup: { marginBottom: 24 },
    label: {
        fontSize: 12, fontWeight: '800', color: '#8E8E93',
        textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1,
    },
    input: {
        backgroundColor: '#F5F5F5', borderRadius: 16, padding: 18,
        color: '#111', fontSize: 18, fontWeight: '800',
    },
    saveButton: {
        backgroundColor: '#6366F1', borderRadius: 16, paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25, shadowRadius: 10, elevation: 4,
    },
    saveButtonText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
    iconPicker: { gap: 12, paddingVertical: 4 },
    pickerIconWrap: {
        width: 46, height: 46, borderRadius: 12,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'transparent',
    },
    colorPicker: { gap: 12, paddingVertical: 4 },
    colorDot: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    colorDotActive: {
        borderWidth: 2, borderColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, shadowRadius: 4, elevation: 3,
    },
});
