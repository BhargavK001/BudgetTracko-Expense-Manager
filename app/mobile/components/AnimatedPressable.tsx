import React, { useCallback } from 'react';
import { Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    ReduceMotion,
} from 'react-native-reanimated';

const ReanimatedPressable = Animated.createAnimatedComponent(Pressable);

type AnimatedPressableProps = {
    children: React.ReactNode;
    onPress?: () => void;
    onLongPress?: () => void;
    style?: StyleProp<ViewStyle>;
    scaleDown?: number;
    disabled?: boolean;
    hitSlop?: number;
};

const SPRING_IN = { damping: 15, stiffness: 300, reduceMotion: ReduceMotion.System };
const SPRING_OUT = { damping: 12, stiffness: 200, reduceMotion: ReduceMotion.System };

function AnimatedPressable({
    children,
    onPress,
    onLongPress,
    style,
    scaleDown = 0.92,
    disabled = false,
    hitSlop = 0,
}: AnimatedPressableProps) {
    const scale = useSharedValue(1);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = useCallback(() => {
        scale.value = withSpring(scaleDown, SPRING_IN);
    }, [scaleDown]);

    const handlePressOut = useCallback(() => {
        scale.value = withSpring(1, SPRING_OUT);
    }, []);

    return (
        <ReanimatedPressable
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[animStyle, style]}
            disabled={disabled}
            hitSlop={hitSlop}
        >
            {children}
        </ReanimatedPressable>
    );
}

export default React.memo(AnimatedPressable);
