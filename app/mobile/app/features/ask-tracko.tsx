import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    FadeIn, FadeInDown, SlideInLeft, SlideInRight,
    useSharedValue, useAnimatedStyle,
    withRepeat, withSequence, withTiming, Easing,
} from 'react-native-reanimated';
import { useTransactions } from '@/context/TransactionContext';
import { useSettings } from '@/context/SettingsContext';

const LOADING_PHRASES = [
    "Calculating how much you spent on Momo's...",
    "Judging your Swiggy orders...",
    "Crunching numbers faster than your GPA drops...",
    "Finding missing rupees in the couch cushions...",
    "Checking if you can actually afford that trip to Goa...",
];

interface Message {
    id: string;
    sender: 'tracko' | 'user';
    text: string;
    timestamp: Date;
}

// ── Animated typing dots ──────────────────────────────────
function TypingDots() {
    const d1 = useSharedValue(0);
    const d2 = useSharedValue(0);
    const d3 = useSharedValue(0);
    useEffect(() => {
        const anim = (v: any, delay: number) => {
            setTimeout(() => {
                v.value = withRepeat(
                    withSequence(
                        withTiming(-4, { duration: 300, easing: Easing.out(Easing.quad) }),
                        withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
                    ), -1, false,
                );
            }, delay);
        };
        anim(d1, 0); anim(d2, 150); anim(d3, 300);
    }, []);
    const s1 = useAnimatedStyle(() => ({ transform: [{ translateY: d1.value }] }));
    const s2 = useAnimatedStyle(() => ({ transform: [{ translateY: d2.value }] }));
    const s3 = useAnimatedStyle(() => ({ transform: [{ translateY: d3.value }] }));
    return (
        <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, s1]} />
            <Animated.View style={[styles.dot, s2]} />
            <Animated.View style={[styles.dot, s3]} />
        </View>
    );
}

// ── Relative time ──────────────────────────────────────────
function relTime(d: Date): string {
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function AskTrackoScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);
    const { formatCurrency } = useSettings();
    const { transactions, getTotalExpense, getBalance } = useTransactions();

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome', sender: 'tracko',
            text: "Hey! I'm Tracko, your brutally honest financial coach. Ask me anything about your budget, spending, or if you can afford that new gadget.",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);

    useEffect(() => {
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, [messages, isTyping]);

    useEffect(() => {
        let interval: any;
        if (isTyping) {
            interval = setInterval(() => {
                setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isTyping]);

    const sendMessage = (text: string) => {
        if (!text.trim() || isTyping) return;
        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: text.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);
        setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);

        setTimeout(() => {
            const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'tracko', text: getMock(text), timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 2200);
    };

    const getMock = (input: string) => {
        const l = input.toLowerCase();

        // 1. Spending logic
        if (l.includes('spent') || l.includes('spending')) {
            const currentMonthExpense = getTotalExpense(new Date().getMonth(), new Date().getFullYear());
            const lastMonth = new Date().getMonth() === 0 ? 11 : new Date().getMonth() - 1;
            const lastYear = new Date().getMonth() === 0 ? new Date().getFullYear() - 1 : new Date().getFullYear();
            const lastMonthExpense = getTotalExpense(lastMonth, lastYear);

            if (lastMonthExpense === 0) {
                return `You've spent ${formatCurrency(currentMonthExpense)} so far this month. Keep an eye on it!`;
            }

            const diff = currentMonthExpense - lastMonthExpense;
            if (diff > 0) {
                return `You've spent ${formatCurrency(currentMonthExpense)} this month. That's ${formatCurrency(diff)} more than last month. Slow down!`;
            } else {
                return `You've spent ${formatCurrency(currentMonthExpense)} this month. That's ${formatCurrency(Math.abs(diff))} less than last month. Great job saving!`;
            }
        }

        // 2. Balance logic
        if (l.includes('balance') || l.includes('left')) {
            const balance = getBalance();
            if (balance > 10000) return `Your overall balance is a healthy ${formatCurrency(balance)}. Looking good!`;
            if (balance > 0) return `Your balance is ${formatCurrency(balance)}. A bit low, probably shouldn't splurge.`;
            return `Your balance is ${formatCurrency(balance)}. You're currently operating at a deficit. Time to cut costs.`;
        }

        // 3. Afford logic
        if (l.includes('afford')) {
            const balance = getBalance();
            return `Given your current total balance of ${formatCurrency(balance)}, technically maybe. But remember your long term savings goals! Use the "Budget & Goals" tab to plan better.`;
        }

        // 4. Default dynamic fallback
        return `I track your ${transactions.length} transactions. Try asking me "How much have I spent this month?", or "What is my balance?".`;
    };

    const quickActions = [
        { label: 'Budget check', icon: 'pie-chart-outline' as const },
        { label: 'Can I afford?', icon: 'help-circle-outline' as const },
        { label: 'Spending summary', icon: 'stats-chart-outline' as const },
    ];

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.botAvatar}>
                        <Ionicons name="flash" size={16} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Ask Tracko</Text>
                        <View style={styles.onlineRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineTxt}>Online</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <Ionicons name="ellipsis-vertical" size={18} color="#8E8E93" />
                </TouchableOpacity>
            </View>

            {/* Chat area */}
            <ScrollView
                ref={scrollRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    return (
                        <Animated.View
                            key={msg.id}
                            entering={isUser ? SlideInRight.duration(300) : SlideInLeft.duration(300)}
                            style={[styles.msgRow, isUser ? styles.msgRowUser : styles.msgRowBot]}
                        >
                            {!isUser && (
                                <View style={styles.msgAvatar}>
                                    <Ionicons name="flash" size={12} color="#fff" />
                                </View>
                            )}
                            <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
                                <Text style={[styles.msgTxt, isUser ? styles.msgTxtUser : styles.msgTxtBot]}>
                                    {msg.text}
                                </Text>
                                <Text style={[styles.time, isUser ? styles.timeUser : styles.timeBot]}>
                                    {relTime(msg.timestamp)}
                                </Text>
                            </View>
                        </Animated.View>
                    );
                })}

                {/* Typing indicator */}
                {isTyping && (
                    <Animated.View entering={FadeIn.duration(250)} style={[styles.msgRow, styles.msgRowBot]}>
                        <View style={styles.msgAvatar}>
                            <Ionicons name="flash" size={12} color="#fff" />
                        </View>
                        <View style={styles.typingWrap}>
                            <TypingDots />
                            <Text style={styles.typingPhrase}>{loadingPhrase}</Text>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            {/* Quick actions */}
            {messages.length <= 2 && !isTyping && (
                <Animated.View entering={FadeInDown.duration(350)} style={styles.quickRow}>
                    {quickActions.map((qa, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.quickChip}
                            onPress={() => sendMessage(qa.label)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name={qa.icon} size={13} color="#2DCA72" />
                            <Text style={styles.quickTxt}>{qa.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}

            {/* Input bar */}
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                <View style={[styles.inputBar, { paddingBottom: Math.max(16, insets.bottom) }]}>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask Tracko anything..."
                            placeholderTextColor="#C7C7CC"
                            value={inputValue}
                            onChangeText={setInputValue}
                            multiline
                            maxLength={500}
                            returnKeyType="send"
                            onSubmitEditing={() => sendMessage(inputValue)}
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, !inputValue.trim() && styles.sendBtnOff]}
                            onPress={() => sendMessage(inputValue)}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Ionicons name="send" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F9F9FB' },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    backBtn: { padding: 6 },
    headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 10, gap: 10 },
    botAvatar: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#2DCA72', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
    onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
    onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2DCA72' },
    onlineTxt: { fontSize: 10, color: '#2DCA72', fontWeight: '600' },
    moreBtn: { padding: 6 },

    // Chat
    chatArea: { flex: 1 },
    chatContent: { padding: 20, paddingBottom: 10 },
    msgRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end', gap: 8 },
    msgRowUser: { justifyContent: 'flex-end' },
    msgRowBot: { justifyContent: 'flex-start' },
    msgAvatar: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#2DCA72', justifyContent: 'center', alignItems: 'center' },
    bubble: { maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
    bubbleUser: { backgroundColor: '#111', borderBottomRightRadius: 4 },
    bubbleBot: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F2F2F7' },
    msgTxt: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    msgTxtUser: { color: '#fff' },
    msgTxtBot: { color: '#111' },
    time: { fontSize: 9, fontWeight: '500', marginTop: 4, opacity: 0.5 },
    timeUser: { textAlign: 'right', color: '#fff' },
    timeBot: { textAlign: 'left', color: '#8E8E93' },

    // Typing
    typingWrap: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#F2F2F7' },
    dotsRow: { flexDirection: 'row', gap: 4, marginBottom: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C7C7CC' },
    typingPhrase: { fontSize: 10, fontWeight: '500', color: '#8E8E93', fontStyle: 'italic' },

    // Quick actions
    quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 10, flexWrap: 'wrap' },
    quickChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#F2F2F7' },
    quickTxt: { fontSize: 12, fontWeight: '600', color: '#3A3A3C' },

    // Input
    inputBar: { paddingHorizontal: 20, paddingTop: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 4 },
    input: { flex: 1, fontSize: 14, color: '#111', fontWeight: '500', paddingVertical: 10, maxHeight: 80 },
    sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    sendBtnOff: { backgroundColor: '#C7C7CC', opacity: 0.5 },
});
