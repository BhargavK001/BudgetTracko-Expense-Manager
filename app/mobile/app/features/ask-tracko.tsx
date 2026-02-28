import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, SlideInRight, Layout } from 'react-native-reanimated';
import {
    DarkTheme,
    Spacing,
    FontSize,
    BorderRadius,
    NeoShadowSm,
} from '@/constants/Theme';

const LOADING_PHRASES = [
    "Calculating how much you spent on Momo's...",
    "Judging your Swiggy orders...",
    "Crunching numbers faster than your GPA drops...",
    "Finding missing rupees in the couch cushions...",
    "Checking if you can actually afford that trip to Goa..."
];

interface Message {
    id: string;
    sender: 'tracko' | 'user';
    text: string;
    timestamp: Date;
    isError?: boolean;
}

export default function AskTrackoScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const scrollRef = useRef<ScrollView>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            sender: 'tracko',
            text: "Hey! I'm Tracko, your brutally honest financial coach. Ask me anything about your remaining budget, recent spending, or if you can afford that new pair of sneakers.",
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loadingPhrase, setLoadingPhrase] = useState(LOADING_PHRASES[0]);

    // Scroll to bottom when messages change
    useEffect(() => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, isTyping]);

    // Cycle through loading phrases
    useEffect(() => {
        let interval: any;
        if (isTyping) {
            interval = setInterval(() => {
                setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isTyping]);

    const handleSendMessage = () => {
        if (!inputValue.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: inputValue.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);
        setLoadingPhrase(LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]);

        // Mock AI Response after delay
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'tracko',
                text: getMockResponse(userMsg.text),
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 2500);
    };

    const getMockResponse = (input: string) => {
        const lower = input.toLowerCase();
        if (lower.includes('budget')) return "You've used 65% of your food budget this week. Maybe skip that extra Starbucks? (P.S. I'm watching you)";
        if (lower.includes('afford')) return "Technically yes, but if you buy it, your savings goal for next month will look like a sad emoji.";
        if (lower.includes('spent')) return "You spent ₹4,200 on 'Eating Out' this month. That's about 15% more than last month. Slow down, master chef.";
        return "I heard what you said, but my brain is currently in 'Mock Mode'. Once I'm connected to the backend, I'll give you real, brutal advice!";
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={DarkTheme.brandBlack} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <View style={styles.trackoIcon}>
                        <Ionicons name="flash" size={20} color={DarkTheme.brandBlack} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>Ask Tracko</Text>
                        <Text style={styles.headerSubtitle}>AI Financial Coach</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.optionsButton}>
                    <Ionicons name="ellipsis-vertical" size={20} color={DarkTheme.brandBlack} />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <Animated.View
                        key={msg.id}
                        entering={FadeInDown.delay(100)}
                        style={[
                            styles.messageRow,
                            msg.sender === 'user' ? styles.userRow : styles.trackoRow
                        ]}
                    >
                        {msg.sender === 'tracko' && (
                            <View style={[styles.avatar, styles.trackoAvatar]}>
                                <Ionicons name="chatbubble-ellipses-outline" size={16} color={DarkTheme.brandBlack} />
                            </View>

                        )}
                        <View style={[
                            styles.bubble,
                            msg.sender === 'user' ? styles.userBubble : styles.trackoBubble
                        ]}>
                            <Text style={[
                                styles.messageText,
                                msg.sender === 'user' ? styles.userText : styles.trackoText
                            ]}>
                                {msg.text}
                            </Text>
                            <Text style={[
                                styles.timestamp,
                                msg.sender === 'user' ? styles.userTimestamp : styles.trackoTimestamp
                            ]}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        {msg.sender === 'user' && (
                            <View style={[styles.avatar, styles.userAvatar]}>
                                <Ionicons name="person" size={16} color="#FFF" />
                            </View>
                        )}
                    </Animated.View>
                ))}

                {isTyping && (
                    <Animated.View entering={FadeIn} style={styles.typingContainer}>
                        <View style={[styles.avatar, styles.trackoAvatar]}>
                            <Ionicons name="chatbubble-ellipses-outline" size={16} color={DarkTheme.brandBlack} />
                        </View>

                        <View style={styles.typingBubble}>
                            <View style={styles.typingContent}>
                                <ActivityIndicator size="small" color={DarkTheme.brandBlack} />
                                <Text style={styles.loadingPhrase}>{loadingPhrase}</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={[styles.inputContainer, { paddingBottom: Math.max(Spacing.lg, insets.bottom) }]}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ask Tracko anything..."
                            placeholderTextColor={DarkTheme.textMuted}
                            value={inputValue}
                            onChangeText={setInputValue}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                !inputValue.trim() && styles.sendButtonDisabled
                            ]}
                            onPress={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping}
                        >
                            <Ionicons name="send" size={18} color={DarkTheme.brandBlack} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
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
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: DarkTheme.brandYellow,
        borderBottomWidth: 3,
        borderBottomColor: DarkTheme.brandBlack,
    },
    backButton: {
        padding: 5,
    },
    headerInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.md,
        gap: 12,
    },
    trackoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadowSm,
    },
    headerTitle: {
        fontSize: FontSize.md,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.brandBlack,
        opacity: 0.7,
    },
    optionsButton: {
        padding: 5,
    },
    chatArea: {
        flex: 1,
    },
    chatContent: {
        padding: Spacing.lg,
        paddingBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: Spacing.xl,
        alignItems: 'flex-end',
        gap: 8,
    },
    userRow: {
        justifyContent: 'flex-end',
    },
    trackoRow: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: DarkTheme.brandBlack,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trackoAvatar: {
        backgroundColor: DarkTheme.brandYellow,
    },
    userAvatar: {
        backgroundColor: '#4A90E2',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadowSm,
    },
    userBubble: {
        backgroundColor: '#FFF',
        borderBottomRightRadius: 2,
    },
    trackoBubble: {
        backgroundColor: '#E8F5E9', // Light green
        borderBottomLeftRadius: 2,
    },
    messageText: {
        fontSize: FontSize.sm,
        lineHeight: 20,
        fontWeight: '600',
    },
    userText: {
        color: DarkTheme.brandBlack,
    },
    trackoText: {
        color: DarkTheme.brandBlack,
    },
    timestamp: {
        fontSize: 8,
        fontWeight: '700',
        marginTop: 4,
        opacity: 0.4,
    },
    userTimestamp: {
        textAlign: 'right',
    },
    trackoTimestamp: {
        textAlign: 'left',
    },
    typingContainer: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    typingBubble: {
        backgroundColor: DarkTheme.cardBg,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderBottomLeftRadius: 2,
        borderWidth: 2,
        borderColor: DarkTheme.neoBorder,
    },
    typingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    loadingPhrase: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
        fontStyle: 'italic',
    },
    inputContainer: {
        padding: Spacing.lg,
        backgroundColor: DarkTheme.bg,
        borderTopWidth: 2,
        borderTopColor: DarkTheme.neoBorder,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 2,
        borderColor: DarkTheme.brandBlack,
        borderRadius: BorderRadius.md,
        paddingHorizontal: 12,
        ...NeoShadowSm,
    },
    input: {
        flex: 1,
        color: DarkTheme.textPrimary,
        fontSize: FontSize.md,
        fontWeight: '600',
        paddingVertical: 12,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: DarkTheme.brandYellow,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1.5,
        borderColor: DarkTheme.brandBlack,
    },
    sendButtonDisabled: {
        backgroundColor: DarkTheme.textMuted,
        opacity: 0.5,
    },
});
