import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';

export default function Signup() {
    const router = useRouter();
    return (
        <Container backgroundColor="#FFFFFF">
            <View style={styles.content}>
                <Text style={styles.title}>SIGN UP</Text>
                <Text style={styles.text}>Placeholder Signup Page</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 32, fontWeight: '900', marginBottom: 20 },
    text: { fontSize: 18, marginBottom: 40 },
});
