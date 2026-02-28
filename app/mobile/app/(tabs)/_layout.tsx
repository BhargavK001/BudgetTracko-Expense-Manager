import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadow } from '@/constants/Theme';
import AddTransactionModal from '@/components/AddTransactionModal';

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

type TabConfig = {
  name: string;
  title: string;
  icon: TabIconName;
  iconFocused: TabIconName;
};

const TABS: TabConfig[] = [
  { name: 'index', title: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'pulse', title: 'Pulse', icon: 'flash-outline', iconFocused: 'flash' },
  { name: 'accounts', title: 'Accounts', icon: 'business-outline', iconFocused: 'business' },
  { name: 'more', title: 'More', icon: 'ellipsis-horizontal', iconFocused: 'ellipsis-horizontal' },
];

function CustomTabBar({ state, descriptors, navigation, onFabPress }: any) {
  const insets = useSafeAreaInsets();
  const fabIndex = 2; // FAB sits between Analysis and Accounts

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm }]}>
      {state.routes.map((route: any, index: number) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;

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

        const tabArrayIndex = TABS.findIndex((t) => t.name === route.name);

        return (
          <React.Fragment key={route.key}>
            {/* Insert FAB before the accounts tab */}
            {tabArrayIndex === fabIndex && (
              <TouchableOpacity style={styles.fabButton} activeOpacity={0.8} onPress={onFabPress}>
                <Ionicons name="add" size={28} color={DarkTheme.fabIcon} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFocused ? tab.iconFocused : tab.icon}
                size={22}
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
  );
}

export default function TabLayout() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} onFabPress={() => setShowAddModal(true)} />}
        screenOptions={{
          headerShown: false,
        }}
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
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: DarkTheme.tabBarBg,
    borderTopWidth: 2,
    borderTopColor: DarkTheme.neoBorder,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  fabButton: {
    width: 54,
    height: 54,
    borderRadius: BorderRadius.md,
    backgroundColor: DarkTheme.fabBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -28,
    borderWidth: 2.5,
    borderColor: DarkTheme.brandBlack,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 0,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});
