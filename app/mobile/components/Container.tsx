import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContainerProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    backgroundColor?: string;
}

export const Container: React.FC<ContainerProps> = ({
    children,
    style,
    backgroundColor = '#FFD700' // Default to Brand Yellow
}) => {
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
            <View style={[styles.container, style]}>
                {children}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
});
