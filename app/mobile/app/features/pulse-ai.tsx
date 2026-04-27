import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';
import Animated, { FadeInUp, FadeOut, Layout, LinearTransition } from 'react-native-reanimated';
import { useThemeStyles } from '@/components/more/DesignSystem';

const loadingPhrases = [
    "Distilling financial liquid...",
    "Scanning the glass surface...",
    "Polishing your insights...",
    "Calculating fluid assets...",
    "Pouring out some knowledge..."
];

const SUGGESTIONS = [
    "Can I afford a new phone next month?",
    "Show my top spending areas.",
    "How much should I save?",
    "Am I over budget?"
];

type Message = {
    id: string;
    sender: 'user' | 'tracko';
    text: string;
    timestamp: string;
    isError?: boolean;
    provider?: string;
};

export default function PulseAIScreen() {
    const { isDarkMode } = useThemeStyles();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([{
        id: 'welcome',
        sender: 'tracko',
        text: "Hey there! I'm Tracko Pulse ✨ Your genuinely honest AI financial coach. Let's make your money work harder. Ask me anything about your budgets, remaining balance, or if you can really afford that purchase!",
        timestamp: new Date().toISOString()
    }]);

    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingPhrase, setLoadingPhrase] = useState(loadingPhrases[0]);

    // Keyboard state to manage padding
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [kbHeight, setKbHeight] = useState(0);

    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardVisible(true);
                setKbHeight(e.endCoordinates?.height || 0);
            }
        );
        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
                setKbHeight(0);
            }
        );

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isTyping) {
            interval = setInterval(() => {
                setLoadingPhrase(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isTyping]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isTyping) return;

        const usrMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: text.trim(),
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, usrMsg]);
        setInputValue('');
        setIsTyping(true);
        setLoadingPhrase(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)]);

        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            const response = await api.post('/api/tracko-pulse/ask', { question: text.trim() });
            const aiData = response.data?.data;

            const aiMsg: Message = {
                id: Date.now().toString() + 'ai',
                sender: 'tracko',
                text: aiData?.answer || "I'm not sure what you mean.",
                timestamp: new Date().toISOString(),
                provider: aiData?.provider
            };

            setMessages(prev => [...prev, aiMsg]);
        } catch (error: any) {
            const errMsg: Message = {
                id: Date.now().toString() + 'err',
                sender: 'tracko',
                text: "My neural liquid spilled! " + (error?.response?.data?.message || error.message),
                timestamp: new Date().toISOString(),
                isError: true
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
            setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
        }
    };

    // Tones and Colors
    const isDark = isDarkMode;
    const bgColors = isDark
        ? ['#1c103f', '#09041a', '#0a0a0a'] as const
        : ['#f3e8ff', '#e0e7ff', '#f8fafc'] as const;

    // Glassmorphism variants
    const glassTint = isDark ? "dark" : "light";
    // Indigo/Purple for user
    const userBubbleColor = isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.15)';
    const aiBubbleColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)';
    const textColor = isDark ? '#ffffff' : '#1e1e1e';
    const subTextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.8)';

    return (
        <View style={styles.container}>
            {/* Liquid Background */}
            <LinearGradient
                colors={bgColors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            {/* Liquid blobs for aesthetics */}
            <View style={[styles.blob1, { backgroundColor: isDark ? '#4c1d95' : '#d8b4fe' }]} />
            <View style={[styles.blob2, { backgroundColor: isDark ? '#1e3a8a' : '#bfdbfe' }]} />

            <KeyboardAvoidingView
                style={{ flex: 1, paddingBottom: Platform.OS === 'android' ? kbHeight : 0 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                {/* Header Glass */}
                <BlurView intensity={isDark ? 50 : 80} tint={glassTint} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color={textColor} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleWrap}>
                        <Ionicons name="sparkles" size={18} color="#a855f7" />
                        <Text style={[styles.headerTitle, { color: textColor }]}>Pulse AI</Text>
                        <View style={styles.proBadge}>
                            <Text style={styles.proText}>PRO</Text>
                        </View>
                    </View>
                    <View style={{ width: 40 }} />
                </BlurView>

                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1 }}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        return (
                            <Animated.View
                                key={msg.id}
                                entering={FadeInUp.duration(300)}
                                layout={LinearTransition.duration(300)}
                                style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAI]}
                            >
                                {!isUser && (
                                    <View style={styles.avatarGlass}>
                                        <Ionicons name="hardware-chip" size={14} color="#a855f7" />
                                    </View>
                                )}
                                <View style={[styles.bubbleWrapper, isUser ? styles.bubbleUserWrapper : styles.bubbleAIWrapper]}>
                                    <BlurView
                                        intensity={isDark ? 30 : 60}
                                        tint={glassTint}
                                        style={[
                                            styles.bubbleGlass,
                                            {
                                                backgroundColor: isUser ? userBubbleColor : aiBubbleColor,
                                                borderColor: isUser ? (isDark ? 'rgba(168, 85, 247, 0.4)' : '#a855f7') : borderColor
                                            },
                                            msg.isError && { borderColor: '#ef4444' }
                                        ]}
                                    >
                                        <Text style={[styles.messageText, { color: textColor, fontWeight: isUser ? '500' : '400' }]}>
                                            {msg.text}
                                        </Text>
                                        {msg.provider && (
                                            <Text style={[styles.providerText, { color: subTextColor }]}>
                                                Powered by {msg.provider}
                                            </Text>
                                        )}
                                    </BlurView>
                                </View>
                            </Animated.View>
                        );
                    })}

                    {isTyping && (
                        <Animated.View entering={FadeInUp.duration(300)} layout={LinearTransition.duration(300)} style={[styles.messageRow, styles.messageRowAI]}>
                            <View style={styles.avatarGlass}>
                                <Ionicons name="sparkles" size={14} color="#a855f7" />
                            </View>
                            <View style={styles.bubbleWrapper}>
                                <BlurView intensity={isDark ? 30 : 60} tint={glassTint} style={[styles.bubbleGlass, { backgroundColor: aiBubbleColor, borderColor, flexDirection: 'row', alignItems: 'center' }]}>
                                    <ActivityIndicator size="small" color="#a855f7" style={{ marginRight: 8 }} />
                                    <Text style={[styles.messageText, { color: subTextColor, fontStyle: 'italic', fontSize: 13 }]} numberOfLines={1}>
                                        {loadingPhrase}
                                    </Text>
                                </BlurView>
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>

                {/* Input Area Glass */}
                <BlurView intensity={isDark ? 60 : 90} tint={glassTint} style={[styles.inputContainer, { paddingBottom: isKeyboardVisible ? 16 : Math.max(insets.bottom, 20) }]}>

                    {/* Suggestions */}
                    {messages.length === 1 && !isTyping && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll} contentContainerStyle={styles.suggestionsContent}>
                            {SUGGESTIONS.map((sug, i) => (
                                <Animated.View entering={FadeInUp.delay(i * 50).duration(300)} key={i}>
                                    <TouchableOpacity
                                        onPress={() => handleSend(sug)}
                                    >
                                        <BlurView
                                            intensity={40}
                                            tint={glassTint}
                                            style={[styles.suggestionChip, { borderColor, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)' }]}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: textColor }}>{sug}</Text>
                                        </BlurView>
                                    </TouchableOpacity>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    )}

                    <View style={styles.inputRow}>
                        <View style={[styles.inputWrapper, { borderColor, backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)' }]}>
                            <TextInput
                                style={[styles.input, { color: textColor }]}
                                placeholder="Pour your thoughts..."
                                placeholderTextColor={subTextColor}
                                value={inputValue}
                                onChangeText={setInputValue}
                                onSubmitEditing={() => handleSend(inputValue)}
                                returnKeyType="send"
                                editable={!isTyping}
                                multiline={false}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={() => handleSend(inputValue)}
                            disabled={!inputValue.trim() || isTyping}
                            style={[
                                styles.sendButton,
                                {
                                    backgroundColor: (!inputValue.trim() || isTyping) ? 'transparent' : '#a855f7',
                                    borderColor: (!inputValue.trim() || isTyping) ? borderColor : 'transparent',
                                }
                            ]}
                        >
                            <Ionicons name="arrow-up" size={20} color={(!inputValue.trim() || isTyping) ? subTextColor : '#FFF'} />
                        </TouchableOpacity>
                    </View>
                </BlurView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    blob1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        top: -100,
        left: -100,
        opacity: 0.5,
    },
    blob2: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        bottom: -100,
        right: -150,
        opacity: 0.4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    proBadge: {
        backgroundColor: '#a855f7',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    proText: {
        fontSize: 9,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
        gap: 16,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageRowAI: {
        justifyContent: 'flex-start',
    },
    avatarGlass: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bubbleWrapper: {
        maxWidth: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    bubbleUserWrapper: {
        alignItems: 'flex-end',
    },
    bubbleAIWrapper: {
        alignItems: 'flex-start',
    },
    bubbleGlass: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    providerText: {
        fontSize: 10,
        marginTop: 6,
        fontWeight: '700',
    },
    inputContainer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingTop: 16,
        paddingHorizontal: 16,
    },
    suggestionsScroll: {
        marginBottom: 16,
        marginHorizontal: -16,
    },
    suggestionsContent: {
        paddingHorizontal: 16,
        paddingRight: 32,
        gap: 10,
    },
    suggestionChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    inputWrapper: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 24,
        minHeight: 48,
        justifyContent: 'center',
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    input: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 14,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
