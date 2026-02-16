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
            borderColor: withTiming(isFocused ? '#000000' : '#000000', { duration: 200 }),
            borderWidth: 2,
            transform: [{ scale: withTiming(isFocused ? 1.02 : 1, { duration: 200 }) }],
            shadowOpacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
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
                        color="#000000"
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={styles.input}
                    placeholderTextColor="#666666"
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
                            color="#000000"
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
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        color: '#000000',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        shadowColor: '#000000',
        shadowOffset: { width: 4, height: 4 },
        shadowRadius: 0,
    },
    icon: {
        marginRight: 12,
        opacity: 0.5,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#000000',
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
