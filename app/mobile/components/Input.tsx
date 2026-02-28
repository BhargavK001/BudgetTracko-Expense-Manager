import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface InputProps extends Omit<TextInputProps, 'style'> {
    label?: string;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    error?: string;
    style?: StyleProp<ViewStyle>;
}

export const Input: React.FC<InputProps> = ({
    label,
    icon,
    error,
    style,
    onFocus,
    onBlur,
    secureTextEntry,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    const focusAnim = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            borderColor: withTiming(isFocused ? '#6366F1' : '#1E2D4F', { duration: 200 }),
            borderWidth: 1,
            transform: [{ scale: withTiming(isFocused ? 1.01 : 1, { duration: 200 }) }],
            shadowOpacity: withTiming(isFocused ? 0.3 : 0, { duration: 200 }),
        };
    });

    const handleFocus = (e: any) => {
        setIsFocused(true);
        focusAnim.value = 1;
        if (onFocus) onFocus(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        focusAnim.value = 0;
        if (onBlur) onBlur(e);
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Animated.View style={[styles.inputContainer, animatedStyle]}>
                {icon && (
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color="#6366F1"
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#475569"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={secureTextEntry && !isPasswordVisible}
                    {...props}
                />
                {secureTextEntry && (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                        <MaterialCommunityIcons
                            name={isPasswordVisible ? 'eye-off' : 'eye'}
                            size={20}
                            color="#94A3B8"
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        color: '#94A3B8',
        letterSpacing: 0.3,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D1630',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 15,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#F1F5F9',
        fontWeight: '500',
    },
    eyeIcon: {
        marginLeft: 12,
        opacity: 0.5,
    },
    errorText: {
        color: '#FF0000',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '600',
    },
});
