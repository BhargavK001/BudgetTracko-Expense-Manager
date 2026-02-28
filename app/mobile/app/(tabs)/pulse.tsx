import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';

export default function PulseHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.iconBadge}>
            <Ionicons name="flash" size={20} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={styles.headerSub}>AI Financial Coach</Text>
            <Text style={styles.title}>Tracko Pulse</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Choose Your Mode</Text>
          <Text style={styles.heroDesc}>
            Chat about a specific purchase, or get a deep-dive breakdown of your entire financial month.
          </Text>
        </View>

        <View style={styles.grid}>
          {/* Chat Card */}
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push('/features/ask-tracko')}>
            <LinearGradient colors={['#1E3A5F', '#0D1630']} style={styles.cardGradient}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                <Ionicons name="chatbubbles" size={28} color="#60A5FA" />
              </View>
              <Text style={styles.cardTitle}>Chat with Bot</Text>
              <Text style={styles.cardDesc}>
                Ask if you can afford that Zomato order or get advice on your remaining budget.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.footerText, { color: '#60A5FA' }]}>Start Chat</Text>
                <Ionicons name="arrow-forward-circle" size={18} color="#60A5FA" />
              </View>
              <View style={[styles.cardStripe, { backgroundColor: '#3B82F6' }]} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Analysis Card */}
          <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => router.push('/features/analysis')}>
            <LinearGradient colors={['#2D1F4E', '#0D1630']} style={styles.cardGradient}>
              <View style={[styles.cardIconBox, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                <Ionicons name="bar-chart" size={28} color={DarkTheme.brandYellow} />
              </View>
              <Text style={styles.cardTitle}>Monthly Deep-Dive</Text>
              <Text style={styles.cardDesc}>
                Get a full AI breakdown of your month — what you spent, saved, and how to improve.
              </Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.footerText, { color: DarkTheme.brandYellow }]}>Generate Pulse</Text>
                <Ionicons name="arrow-forward-circle" size={18} color={DarkTheme.brandYellow} />
              </View>
              <View style={[styles.cardStripe, { backgroundColor: DarkTheme.brandYellow }]} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkTheme.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  heroDesc: {
    fontSize: FontSize.sm,
    color: DarkTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  grid: {
    gap: Spacing.lg,
  },
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  cardGradient: {
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  cardStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardDesc: {
    fontSize: FontSize.sm,
    color: DarkTheme.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  footerText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
