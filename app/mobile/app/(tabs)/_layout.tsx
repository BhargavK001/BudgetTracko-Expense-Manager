import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadow } from '@/constants/Theme';
import AddTransactionModal from '@/components/AddTransactionModal';

const { width } = Dimensions.get('window');

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: TabIconName;
  iconFocused: TabIconName;
};

const TABS: TabConfig[] = [
  { name: 'index',    title: 'Home',     icon: 'home-outline',            iconFocused: 'home' },
  { name: 'pulse',    title: 'Pulse',    icon: 'flash-outline',           iconFocused: 'flash' },
  { name: 'accounts', title: 'Accounts', icon: 'wallet-outline',          iconFocused: 'wallet' },
  { name: 'more',     title: 'More',     icon: 'grid-outline',            iconFocused: 'grid' },
];

function CustomTabBar({ state, descriptors, navigation, onFabPress }: any) {
  const insets = useSafeAreaInsets();
  const fabIndex = 2; // FAB sits between Pulse and Accounts

  return (
    <View style={[styles.outerWrap, { paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 12 }]}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;

          const isFocused = state.index === index;
          const tabArrayIndex = TABS.findIndex((t) => t.name === route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <React.Fragment key={route.key}>
              {/* FAB before Accounts */}
              {tabArrayIndex === fabIndex && (
                <TouchableOpacity style={styles.fabWrapper} activeOpacity={0.85} onPress={onFabPress}>
                  <View style={styles.fabButton}>
                    <Ionicons name="add" size={26} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.tabItem}
                onPress={onPress}
                activeOpacity={0.75}
              >
                {isFocused && <View style={styles.activePill} />}
                <Ionicons
                  name={isFocused ? tab.iconFocused : tab.icon}
                  size={21}
                  color={isFocused ? DarkTheme.tabBarActive : DarkTheme.tabBarInactive}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isFocused ? DarkTheme.tabBarActive : DarkTheme.tabBarInactive },
                    isFocused && styles.tabLabelActive,
                  ]}
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} onFabPress={() => setShowAddModal(true)} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="pulse" />
        <Tabs.Screen name="accounts" />
        <Tabs.Screen name="more" />
      </Tabs>
      <AddTransactionModal visible={showAddModal} onClose={() => setShowAddModal(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: DarkTheme.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
      },
      android: { elevation: 16 },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: -Spacing.sm,
    width: 32,
    height: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: DarkTheme.tabBarActive,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  fabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    marginHorizontal: Spacing.xs,
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: DarkTheme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: DarkTheme.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.7,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
});
