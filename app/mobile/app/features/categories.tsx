import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Modal, StatusBar, Alert, ActivityIndicator,
    Animated as RNAnimated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, Layout, SlideInRight } from 'react-native-reanimated';
import { useTransactions, CategoryItem } from '@/context/TransactionContext';
import { useSettings } from '@/context/SettingsContext';
import {
    Utensils, Pizza, Coffee, Beef, Apple, ChefHat, Wine, IceCreamCone, Grape, Cake,
    Car, Bus, TrainFront, Plane, Bike, CircleParking, MapPin, Fuel, Navigation, Compass,
    ShoppingCart, ShoppingBag, Tag, Shirt, Footprints, Package, Laptop, Smartphone, Watch, Sofa,
    Home, Baby, Users, PawPrint, Heart, Flower2,
    Drama, Music, Ticket, Tv, Headphones, Gamepad2, PartyPopper,
    Briefcase, Building2, Printer, PieChart, Presentation, TrendingUp, Truck, Megaphone,
    Wallet, Banknote, CreditCard, PiggyBank, Coins, BarChart3, ArrowUpRight, ArrowDownLeft, Landmark, Receipt,
    Activity, Pill, Stethoscope, Hospital, Thermometer, HeartPulse,
    Zap, Droplets, Wifi, Trash2, Fan, Lightbulb, Hammer, Wrench, Battery,
    Gift, Trophy, Star, Smile, Cloud, Moon, Sun, Infinity, GraduationCap, Umbrella,
} from 'lucide-react-native';

const SCREEN_W = Dimensions.get('window').width;

// ─── Icon Registry ───────────────────────────────────────
const LUCIDE_MAP: Record<string, any> = {
    Utensils, Pizza, Coffee, Beef, Apple, ChefHat, Wine, IceCreamCone, Grape, Cake,
    Car, Bus, TrainFront, Plane, Bike, CircleParking, MapPin, Fuel, Navigation, Compass,
    ShoppingCart, ShoppingBag, Tag, Shirt, Footprints, Package, Laptop, Smartphone, Watch, Sofa,
    Home, Baby, Users, PawPrint, Heart, Flower2,
    Drama, Music, Ticket, Tv, Headphones, Gamepad2, PartyPopper,
    Briefcase, Building2, Printer, PieChart, Presentation, TrendingUp, Truck, Megaphone,
    Wallet, Banknote, CreditCard, PiggyBank, Coins, BarChart3, ArrowUpRight, ArrowDownLeft, Landmark, Receipt,
    Activity, Pill, Stethoscope, Hospital, Thermometer, HeartPulse,
    Zap, Droplets, Wifi, Trash2, Fan, Lightbulb, Hammer, Wrench, Battery,
    Gift, Trophy, Star, Smile, Cloud, Moon, Sun, Infinity, GraduationCap, Umbrella,
};

const ICON_GROUPS: { label: string; icons: string[] }[] = [
    { label: 'Food', icons: ['Utensils', 'Pizza', 'Coffee', 'Beef', 'Apple', 'ChefHat', 'Wine', 'IceCreamCone', 'Grape', 'Cake'] },
    { label: 'Travel', icons: ['Car', 'Bus', 'TrainFront', 'Plane', 'Bike', 'CircleParking', 'MapPin', 'Fuel', 'Navigation', 'Compass'] },
    { label: 'Shopping', icons: ['ShoppingCart', 'ShoppingBag', 'Tag', 'Shirt', 'Footprints', 'Package', 'Laptop', 'Smartphone', 'Watch', 'Sofa'] },
    { label: 'Family', icons: ['Home', 'Baby', 'Users', 'PawPrint', 'Heart', 'Flower2'] },
    { label: 'Entertainment', icons: ['Drama', 'Music', 'Ticket', 'Tv', 'Headphones', 'Gamepad2', 'PartyPopper'] },
    { label: 'Business', icons: ['Briefcase', 'Building2', 'Printer', 'PieChart', 'Presentation', 'TrendingUp', 'Truck', 'Megaphone'] },
    { label: 'Finance', icons: ['Wallet', 'Banknote', 'CreditCard', 'PiggyBank', 'Coins', 'BarChart3', 'ArrowUpRight', 'ArrowDownLeft', 'Landmark', 'Receipt'] },
    { label: 'Medical', icons: ['Activity', 'Pill', 'Stethoscope', 'Hospital', 'Thermometer', 'HeartPulse'] },
    { label: 'Utilities', icons: ['Zap', 'Droplets', 'Wifi', 'Trash2', 'Fan', 'Lightbulb', 'Hammer', 'Wrench', 'Battery'] },
    { label: 'Miscellaneous', icons: ['Gift', 'Trophy', 'Star', 'Smile', 'Cloud', 'Moon', 'Sun', 'Infinity', 'GraduationCap', 'Umbrella'] },
];

const AVAILABLE_COLORS = [
    '#F43F5E', '#EC4899', '#D946EF', '#A855F7', '#8B5CF6',
    '#6366F1', '#3B82F6', '#06B6D4', '#14B8A6', '#10B981',
    '#22C55E', '#84CC16', '#EAB308', '#F59E0B', '#F97316',
    '#EF4444', '#78716C', '#64748B', '#1E293B', '#0F172A',
];

// ─── Render a Lucide icon by name ────────────────────────
export function LucideCategoryIcon({ name, size = 20, color = '#fff' }: { name: string; size?: number; color?: string }) {
    const IconComp = LUCIDE_MAP[name];
    if (!IconComp) return <Ionicons name="ellipsis-horizontal-circle-outline" size={size} color={color} />;
    return <IconComp size={size} color={color} strokeWidth={2} />;
}

// ─── Dark mode tokens ────────────────────────────────────
function useTheme() {
    const { isDarkMode } = useSettings();
    return useMemo(() => isDarkMode ? {
        bg: '#0F1014',
        card: '#1A1C20',
        cardBorder: '#2A2C32',
        text: '#F5F5F5',
        textSecondary: '#8E8E93',
        inputBg: '#1A1C20',
        inputBorder: '#2A2C32',
        tabBg: '#1A1C20',
        tabIndicator: '#2A2C32',
        surfaceMuted: '#1A1C20',
        statusBar: 'light-content' as const,
    } : {
        bg: '#FFFFFF',
        card: '#FFFFFF',
        cardBorder: '#F2F2F7',
        text: '#111111',
        textSecondary: '#8E8E93',
        inputBg: '#F5F5F5',
        inputBorder: '#E5E5EA',
        tabBg: '#F5F5F5',
        tabIndicator: '#FFFFFF',
        surfaceMuted: '#FAFAFA',
        statusBar: 'dark-content' as const,
    }, [isDarkMode]);
}

// ══════════════════════════════════════════════════════════
//  MAIN SCREEN
// ══════════════════════════════════════════════════════════
export default function CategoriesScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const { isDarkMode } = useSettings();
    const {
        categories, refreshCategories, addCategory,
        updateCategory, deleteCategory, transactions,
    } = useTransactions();

    const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
    const [tabWidth, setTabWidth] = useState(0);
    const slideAnim = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        const index = activeTab === 'expense' ? 0 : 1;
        if (tabWidth > 0) {
            RNAnimated.spring(slideAnim, {
                toValue: index * tabWidth,
                useNativeDriver: true,
                bounciness: 4,
                speed: 12,
            }).start();
        }
    }, [activeTab, tabWidth]);

    // ── Modal state ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Utensils');
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

    useEffect(() => { refreshCategories(); }, []);

    const openAddModal = () => {
        setEditingCategory(null);
        setCategoryName('');
        setSelectedIcon('Utensils');
        setSelectedColor(AVAILABLE_COLORS[0]);
        setIsModalOpen(true);
    };

    const openEditModal = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setCategoryName(cat.name);
        setSelectedIcon(cat.icon || 'Utensils');
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
                    color: selectedColor,
                });
            } else {
                await addCategory({
                    name,
                    type: activeTab,
                    icon: selectedIcon,
                    color: selectedColor,
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
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.bg }]}>
            <StatusBar barStyle={theme.statusBar} />

            {/* Header */}
            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.inputBg }]} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Add category</Text>
                <TouchableOpacity onPress={openAddModal} style={[styles.addButton, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)' }]} activeOpacity={0.7}>
                    <Ionicons name="add" size={24} color="#6366F1" />
                </TouchableOpacity>
            </Animated.View>

            {/* Tabs */}
            <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={[styles.tabsContainer]}>
                <View style={[styles.tabsWrapper, { backgroundColor: theme.tabBg, borderWidth: 1, borderColor: theme.cardBorder, borderRadius: 24 }]} onLayout={(e) => setTabWidth((e.nativeEvent.layout.width - 8) / 2)}>
                    {tabWidth > 0 && (
                        <RNAnimated.View style={[
                            styles.activeTabIndicator,
                            { 
                                width: tabWidth, 
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: theme.tabIndicator,
                                borderRadius: 20,
                            }
                        ]} />
                    )}
                    <TouchableOpacity style={[styles.tabBtn, { zIndex: 2 }]} onPress={() => setActiveTab('expense')} activeOpacity={0.8}>
                        <Text style={[styles.tabText, { color: activeTab === 'expense' ? theme.text : theme.textSecondary, fontWeight: activeTab === 'expense' ? '700' : '600' }]}>Expense</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.tabBtn, { zIndex: 2 }]} onPress={() => setActiveTab('income')} activeOpacity={0.8}>
                        <Text style={[styles.tabText, { color: activeTab === 'income' ? theme.text : theme.textSecondary, fontWeight: activeTab === 'income' ? '700' : '600' }]}>Income</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Category List */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.grid}>
                    {currentCategories.map((cat, index) => {
                        const iconColor = cat.color || '#6366F1';
                        const count = categoryCounts[cat.name] || 0;

                        return (
                            <Animated.View key={cat._id} layout={Layout.springify()}>
                                <Animated.View
                                    entering={FadeInDown.delay(100 + index * 30).duration(400).springify()}
                                    style={[styles.categoryCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
                                >
                                    <View style={styles.catLeft}>
                                        <View style={[styles.iconWrap, { backgroundColor: iconColor + '18' }]}>
                                            <LucideCategoryIcon name={cat.icon || 'Utensils'} size={20} color={iconColor} />
                                        </View>
                                        <View>
                                            <Text style={[styles.catName, { color: theme.text }]}>{cat.name}</Text>
                                            <Text style={styles.catUsage}>{count} transaction{count !== 1 ? 's' : ''}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.catRight}>
                                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.inputBg }]} activeOpacity={0.7} onPress={() => openEditModal(cat)}>
                                            <Ionicons name="pencil-outline" size={16} color={theme.textSecondary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(244,63,94,0.12)' : 'rgba(244,63,94,0.05)' }]}
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
                            <Ionicons name="folder-open-outline" size={64} color={theme.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No categories yet</Text>
                            <Text style={styles.emptyDesc}>Tap the + button to add your first {activeTab} category.</Text>
                        </View>
                    )}

                    <Animated.View entering={FadeInDown.delay(100 + currentCategories.length * 30).duration(400).springify()}>
                        <TouchableOpacity style={[styles.emptyCard, { backgroundColor: theme.surfaceMuted, borderColor: isDarkMode ? '#2A2C32' : '#E2E8F0' }]} onPress={openAddModal} activeOpacity={0.7}>
                            <Ionicons name="add-circle-outline" size={32} color={theme.textSecondary} />
                            <Text style={[styles.emptyCardText, { color: theme.textSecondary }]}>Add Category</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* ══════════ ADD/EDIT MODAL ══════════ */}
            <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>

                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>
                                {editingCategory ? 'Edit Category' : `New ${activeTab === 'expense' ? 'Expense' : 'Income'} Category`}
                            </Text>
                            <TouchableOpacity onPress={() => { setIsModalOpen(false); setEditingCategory(null); }}>
                                <Ionicons name="close-circle" size={28} color={theme.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                            {/* Icon Preview */}
                            <View style={styles.previewRow}>
                                <View style={[styles.previewCircle, { backgroundColor: selectedColor }]}>
                                    <LucideCategoryIcon name={selectedIcon} size={32} color="#FFFFFF" />
                                </View>
                                <Text style={[styles.previewName, { color: theme.text }]}>
                                    {categoryName || 'Category name'}
                                </Text>
                            </View>

                            {/* Category Name Input */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Category name</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: theme.inputBorder }]}
                                    placeholder="e.g. Subscriptions"
                                    placeholderTextColor={theme.textSecondary}
                                    value={categoryName}
                                    onChangeText={setCategoryName}
                                />
                            </View>

                            {/* Color Picker */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Category color</Text>
                                <View style={styles.colorGrid}>
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
                                            {selectedColor === color && <Ionicons name="checkmark" size={16} color="#fff" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Icon Picker (Grouped) */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Category Icon</Text>
                                {ICON_GROUPS.map((group) => (
                                    <View key={group.label} style={styles.iconGroupWrap}>
                                        <Text style={[styles.iconGroupLabel, { color: theme.textSecondary }]}>{group.label}</Text>
                                        <View style={styles.iconGroupGrid}>
                                            {group.icons.map((iconName) => {
                                                const isSelected = selectedIcon === iconName;
                                                return (
                                                    <TouchableOpacity
                                                        key={iconName}
                                                        style={[
                                                            styles.pickerIconWrap,
                                                            { backgroundColor: theme.inputBg },
                                                            isSelected && { backgroundColor: selectedColor + '20', borderColor: selectedColor }
                                                        ]}
                                                        onPress={() => setSelectedIcon(iconName)}
                                                        activeOpacity={0.7}
                                                    >
                                                        <LucideCategoryIcon
                                                            name={iconName}
                                                            size={22}
                                                            color={isSelected ? selectedColor : theme.textSecondary}
                                                        />
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            {/* Test Label */}
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: theme.textSecondary }]}>Test</Text>
                                <TouchableOpacity style={[styles.testChip, { borderColor: selectedColor, backgroundColor: selectedColor + '14' }]}>
                                    <LucideCategoryIcon name={selectedIcon} size={16} color={selectedColor} />
                                    <Text style={[styles.testChipText, { color: selectedColor }]}>{categoryName || 'Category'}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: selectedColor }]}
                                onPress={handleSave}
                                activeOpacity={0.8}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveButtonText}>
                                        {editingCategory ? 'Save Changes' : 'Enter here'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ══════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 24, paddingVertical: 14,
    },
    backButton: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    addButton: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    tabsContainer: { paddingHorizontal: 24, marginBottom: 16 },
    tabsWrapper: {
        flexDirection: 'row', borderRadius: 16, padding: 4,
    },
    tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12, zIndex: 1 },
    activeTabIndicator: {
        position: 'absolute', top: 4, bottom: 4, left: 4,
        borderRadius: 12,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
    },
    tabText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24 },
    grid: { gap: 12 },
    categoryCard: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, borderRadius: 20,
        borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02, shadowRadius: 6, elevation: 1,
    },
    catLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    iconWrap: {
        width: 44, height: 44, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center',
    },
    catName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
    catUsage: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
    catRight: { flexDirection: 'row', gap: 8 },
    iconButton: { padding: 8, borderRadius: 10 },
    emptyCard: {
        height: 80, borderRadius: 20, borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center', justifyContent: 'center', gap: 8, flexDirection: 'row',
    },
    emptyCardText: { fontSize: 13, fontWeight: '700' },
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyTitle: { fontSize: 20, fontWeight: '800' },
    emptyDesc: { fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 32 },

    // ── Modal ──
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
        padding: 24, paddingBottom: 0,
        maxHeight: '92%',
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: '900' },

    // ── Preview ──
    previewRow: { alignItems: 'center', marginBottom: 28, gap: 12 },
    previewCircle: {
        width: 72, height: 72, borderRadius: 36,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
    previewName: { fontSize: 16, fontWeight: '800' },

    // ── Form ──
    formGroup: { marginBottom: 24 },
    label: {
        fontSize: 12, fontWeight: '800',
        textTransform: 'uppercase', marginBottom: 12, letterSpacing: 1,
    },
    input: {
        borderRadius: 16, padding: 18,
        fontSize: 18, fontWeight: '800',
        borderWidth: 1,
    },

    // ── Color Grid ──
    colorGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 4,
    },
    colorDot: {
        width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    colorDotActive: {
        borderWidth: 3, borderColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
    },

    // ── Icon Groups ──
    iconGroupWrap: { marginBottom: 16 },
    iconGroupLabel: { fontSize: 13, fontWeight: '800', marginBottom: 10 },
    iconGroupGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    },
    pickerIconWrap: {
        width: 46, height: 46, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1.5, borderColor: 'transparent',
    },

    // ── Test ──
    testChip: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14,
        borderWidth: 1.5, alignSelf: 'flex-start',
    },
    testChipText: { fontSize: 14, fontWeight: '700' },

    // ── Save ──
    saveButton: {
        borderRadius: 16, paddingVertical: 18,
        alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
    },
    saveButtonText: { fontSize: 16, fontWeight: '900', color: '#FFFFFF' },
});
