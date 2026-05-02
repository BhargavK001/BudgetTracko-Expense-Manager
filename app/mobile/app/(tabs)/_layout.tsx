import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Home, PieChart, Wallet, LayoutGrid, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withSequence,
} from 'react-native-reanimated';
import AddTransactionModal from '@/components/AddTransactionModal';
import { useQuickAction } from '@/context/QuickActionContext';
import { useSettings } from '@/context/SettingsContext';
import { useThemeStyles } from '@/components/more/DesignSystem';

type TabConfig = {
  name: string;
  title: string;
  icon: any;
};

const TABS: TabConfig[] = [
  { name: 'index', title: 'Home', icon: Home },
  { name: 'analysis', title: 'Analytics', icon: PieChart },
  { name: 'accounts', title: 'Accounts', icon: Wallet },
  { name: 'more', title: 'More', icon: LayoutGrid },
];

// ── Bouncy tab item ──────────────────────────────────────────
const TabItem = React.memo(function TabItem({ tab, isFocused, onPress }: { tab: TabConfig; isFocused: boolean; onPress: () => void }) {
  const sc = useSharedValue(1);
  const { tokens } = useThemeStyles();
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const press = () => {
    sc.value = withSequence(withSpring(0.85, { damping: 12 }), withSpring(1, { damping: 8 }));
    onPress();
  };
  return (
    <TouchableOpacity style={styles.tabItem} onPress={press} activeOpacity={1}>
      <Animated.View style={[styles.tabItemInner, animStyle]}>
        <tab.icon
          size={22}
          color={isFocused ? tokens.textPrimary : tokens.textMuted}
          strokeWidth={isFocused ? 2.5 : 2}
        />
        {isFocused && <View style={[styles.activeDot, { backgroundColor: '#2DCA72' }]} />}
        <Text style={[
          styles.tabLabel, 
          { color: isFocused ? tokens.textPrimary : tokens.textMuted },
          isFocused && styles.tabLabelActive
        ]}>
          {tab.title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

// ── Bouncy FAB ───────────────────────────────────────────────
const FabButton = React.memo(function FabButton({ onPress }: { onPress: () => void }) {
  const sc = useSharedValue(1);
  const { tokens, isDarkMode } = useThemeStyles();
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const press = () => {
    sc.value = withSequence(withSpring(0.82, { damping: 10 }), withSpring(1, { damping: 7 }));
    onPress();
  };
  return (
    <TouchableOpacity style={styles.fabTouchable} activeOpacity={1} onPress={press}>
      <Animated.View style={[
        styles.fabCircle, 
        animStyle, 
        { 
          backgroundColor: isDarkMode ? tokens.purple.stroke : '#111',
          shadowColor: isDarkMode ? tokens.purple.stroke : '#111'
        }
      ]}>
        <Plus size={32} color="#fff" strokeWidth={3} />
      </Animated.View>
    </TouchableOpacity>
  );
});

// ── Custom Tab Bar ───────────────────────────────────────────
const MemoizedCustomTabBar = React.memo(function CustomTabBar({ state, navigation, onFabPress, triggerHaptic }: any) {
  const insets = useSafeAreaInsets();
  const { isDarkMode, tokens } = useThemeStyles();
  const fabIndex = 2; // FAB between Pulse and Accounts

  return (
    <View style={[styles.outerWrap, { paddingBottom: insets.bottom > 0 ? insets.bottom : 8 }]}>
      <View style={[
        styles.barContainer, 
        { 
          backgroundColor: isDarkMode ? 'rgba(28,28,35,0.95)' : '#fff',
          borderColor: tokens.borderDefault 
        }
      ]}>
        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
          const isFocused = state.index === index;
          const tabArrayIndex = TABS.findIndex((t) => t.name === route.name);

          const onPress = () => {
            triggerHaptic();
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <React.Fragment key={route.key}>
              {tabArrayIndex === fabIndex && <FabButton onPress={onFabPress} />}
              <TabItem tab={tab} isFocused={isFocused} onPress={onPress} />
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
});

// ── Layout ───────────────────────────────────────────────────
export default function TabLayout() {
  const router = useRouter();
  const { showModal, modalType, scanData, openModal, closeModal } = useQuickAction();
  const { triggerHaptic } = useSettings();

  const handleFabPress = useCallback(() => {
    triggerHaptic();
    openModal();
  }, [triggerHaptic, openModal]);

  const renderTabBar = useCallback((props: any) => (
    <MemoizedCustomTabBar {...props} triggerHaptic={triggerHaptic} onFabPress={handleFabPress} />
  ), [triggerHaptic, handleFabPress]);

  return (
    <>
      <Tabs
        tabBar={renderTabBar}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="analysis" />
        <Tabs.Screen name="accounts" />
        <Tabs.Screen name="more" />
      </Tabs>

      <AddTransactionModal
        visible={showModal}
        onClose={closeModal}
        initialType={modalType}
        scanData={scanData}
      />
    </>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, backgroundColor: 'transparent',
  },
  barContainer: {
    flexDirection: 'row',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 10 },
    }),
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  tabItemInner: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 4, position: 'relative',
  },
  activeDot: {
    position: 'absolute', bottom: -2,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#2DCA72',
  },
  tabLabel: {
    fontSize: 10, marginTop: 4, fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  fabTouchable: {
    alignItems: 'center', justifyContent: 'center',
    marginTop: -26, marginHorizontal: 4,
  },
  fabCircle: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },
});
