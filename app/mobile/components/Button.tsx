import React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle
}) => {
    const offset = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: withTiming(offset.value * 4, { duration: 100 }) },
                { translateY: withTiming(offset.value * 4, { duration: 100 }) }
            ],
            shadowOffset: {
                width: withTiming((1 - offset.value) * 4, { duration: 100 }),
                height: withTiming((1 - offset.value) * 4, { duration: 100 })
            }
        };
    });

    const handlePressIn = () => {
        offset.value = 1;
    };

    const handlePressOut = () => {
        offset.value = 0;
    };

    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryText;
            case 'secondary':
                return styles.secondaryText;
            case 'outline':
                return styles.outlineText;
            default:
                return styles.primaryText;
        }
    };

    return (
        <AnimatedPressable
            style={[styles.button, getButtonStyle(), style, animatedStyle]}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 0, // Neo-brutalist sharp corners
        borderWidth: 2,
        borderColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0, // Disable Android elevation for custom shadow look
    },
    text: {
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    primaryButton: {
        backgroundColor: '#000000',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryButton: {
        backgroundColor: '#FFD700', // Brand Yellow
    },
    secondaryText: {
        color: '#000000',
    },
    outlineButton: {
        backgroundColor: '#FFFFFF',
    },
    outlineText: {
        color: '#000000',
    },
});
