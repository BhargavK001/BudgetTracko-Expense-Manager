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
    disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    style,
    textStyle,
    disabled = false
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
            style={[
                styles.button,
                getButtonStyle(),
                style,
                animatedStyle,
                disabled && styles.disabledButton
            ]}
            onPress={disabled ? undefined : onPress}
            onPressIn={disabled ? undefined : handlePressIn}
            onPressOut={disabled ? undefined : handlePressOut}
            disabled={disabled}
        >
            <Text style={[styles.text, getTextStyle(), textStyle, disabled && styles.disabledText]}>{title}</Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 6,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
    },
    text: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    primaryButton: {
        backgroundColor: '#6366F1',
    },
    primaryText: {
        color: '#FFFFFF',
    },
    secondaryButton: {
        backgroundColor: '#132040',
        borderColor: '#1E2D4F',
    },
    secondaryText: {
        color: '#F1F5F9',
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderColor: '#6366F1',
    },
    outlineText: {
        color: '#6366F1',
    },
    disabledButton: {
        backgroundColor: '#1E2D4F',
        borderColor: '#1E2D4F',
        shadowOpacity: 0,
    },
    disabledText: {
        color: '#475569',
    },
});
