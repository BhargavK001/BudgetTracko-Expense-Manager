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
    backgroundColor = '#060D1F'
}) => {
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor={backgroundColor} />
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
