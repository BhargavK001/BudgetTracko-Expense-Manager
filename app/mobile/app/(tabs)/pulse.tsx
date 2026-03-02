import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown, FadeIn, FadeInUp,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';

function useFloat(offset = -5, dur = 2000) {
  const y = useSharedValue(0);
  React.useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(offset, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: dur, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

// Tappable card with smooth scale
function TapCard({ children, onPress, style, delay = 0 }: any) {
  const sc = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const press = () => {
    sc.value = withSequence(
      withTiming(0.97, { duration: 80 }),
      withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }),
    );
    setTimeout(() => onPress?.(), 100);
  };
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)} style={anim}>
      <TouchableOpacity onPress={press} activeOpacity={1} style={style}>{children}</TouchableOpacity>
    </Animated.View>
  );
}

export default function PulseHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const floatStyle = useFloat();

  const quickChips = [
    { label: 'Can I afford…?', icon: 'help-circle-outline' as const, route: '/features/ask-tracko' },
    { label: 'Monthly recap', icon: 'calendar-outline' as const, route: '/features/analysis' },
    { label: 'Spending tips', icon: 'bulb-outline' as const, route: '/features/ask-tracko' },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View entering={FadeIn.delay(50).duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconBadge}>
            <Ionicons name="flash" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerSub}>AI Financial Coach</Text>
            <Text style={styles.headerTitle}>Tracko Pulse</Text>
          </View>
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.heroWrap}>
          <Animated.View style={[styles.heroGlow, floatStyle]} />
          <View style={styles.heroIconRow}>
            <View style={styles.heroIcon}>
              <MaterialCommunityIcons name="robot-outline" size={28} color="#2DCA72" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Choose Your Mode</Text>
          <Text style={styles.heroDesc}>
            Chat about a specific purchase, or get a deep-dive breakdown of your entire financial month.
          </Text>
        </Animated.View>

        {/* Quick suggestion chips */}
        <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.chipRow}>
          {quickChips.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => router.push(c.route as any)}
              activeOpacity={0.7}
            >
              <Ionicons name={c.icon} size={14} color="#2DCA72" />
              <Text style={styles.chipTxt}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Feature cards */}
        <View style={styles.cardsWrap}>
          {/* Chat Card */}
          <TapCard onPress={() => router.push('/features/ask-tracko')} style={styles.card} delay={300}>
            <View style={[styles.cardAccent, { backgroundColor: '#007AFF' }]} />
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(0,122,255,0.1)' }]}>
              <Ionicons name="chatbubbles-outline" size={26} color="#007AFF" />
            </View>
            <Text style={styles.cardTitle}>Chat with Bot</Text>
            <Text style={styles.cardDesc}>
              Ask if you can afford that Zomato order or get advice on your remaining budget.
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.cardCta, { color: '#007AFF' }]}>Start Chat</Text>
              <Ionicons name="arrow-forward-circle-outline" size={16} color="#007AFF" />
            </View>
          </TapCard>

          {/* Analysis Card */}
          <TapCard onPress={() => router.push('/features/analysis')} style={styles.card} delay={420}>
            <View style={[styles.cardAccent, { backgroundColor: '#FF9500' }]} />
            <View style={[styles.cardIconBox, { backgroundColor: 'rgba(255,149,0,0.1)' }]}>
              <Ionicons name="bar-chart-outline" size={26} color="#FF9500" />
            </View>
            <Text style={styles.cardTitle}>Monthly Deep-Dive</Text>
            <Text style={styles.cardDesc}>
              Get a full AI breakdown of your month — what you spent, saved, and how to improve.
            </Text>
            <View style={styles.cardFooter}>
              <Text style={[styles.cardCta, { color: '#FF9500' }]}>Generate Pulse</Text>
              <Ionicons name="arrow-forward-circle-outline" size={16} color="#FF9500" />
            </View>
          </TapCard>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 24, paddingVertical: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBadge: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  headerSub: { fontSize: 11, color: '#8E8E93', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  scroll: { paddingHorizontal: 24, paddingTop: 4 },

  // Hero
  heroWrap: { alignItems: 'center', paddingVertical: 24, position: 'relative', marginBottom: 8 },
  heroGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(45,202,114,0.1)', top: -10, right: 20 },
  heroIconRow: { marginBottom: 16 },
  heroIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(45,202,114,0.08)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginBottom: 8, textAlign: 'center' },
  heroDesc: { fontSize: 13, color: '#8E8E93', textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },

  // Chips
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: '#F2F2F7' },
  chipTxt: { fontSize: 12, fontWeight: '600', color: '#3A3A3C' },

  // Cards
  cardsWrap: { gap: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 22, position: 'relative', overflow: 'hidden',
    borderWidth: 1, borderColor: '#F2F2F7',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  cardIconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#8E8E93', lineHeight: 19, marginBottom: 16 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardCta: { fontSize: 13, fontWeight: '700' },
});
