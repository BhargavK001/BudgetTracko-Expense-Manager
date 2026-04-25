import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform,
    useWindowDimensions, Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSequence, withSpring, Easing } from 'react-native-reanimated';

export default function EditProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { user, refreshUser } = useAuth();

    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar || null);
    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    // Password fields
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [hasPassword, setHasPassword] = useState(true);

    // Save button animation
    const btnScale = useSharedValue(1);
    const animatedBtnStyle = useAnimatedStyle(() => ({
        transform: [{ scale: btnScale.value }],
    }));

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/user/profile');
                if (res.data?.success) {
                    const d = res.data.data;
                    setDisplayName(d.displayName || '');
                    setEmail(d.email || '');
                    setPhone(d.phone || '');
                    setAvatarUri(d.avatar || null);
                    setHasPassword(d.hasPassword);
                }
            } catch (e) {
                // fallbacks to context data which is already in initial state
            }
        };
        fetchProfile();
    }, []);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'We need permission to access your photos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5, // Compress image
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                await uploadAvatar(asset.uri);
            }
        } catch (error) {
            console.error('Image picking error:', error);
            Alert.alert('Error', 'Failed to pick image.');
        }
    };

    const uploadAvatar = async (uri: string) => {
        setAvatarLoading(true);
        try {
            // Need to create form data for Multer
            const formData = new FormData();

            // Extract filename and type from URI
            const filename = uri.split('/').pop() || 'avatar.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            // @ts-ignore - React Native FormData accepts an object with uri, name, type
            formData.append('avatar', {
                uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
                name: filename,
                type,
            });

            const res = await api.put('/api/user/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data?.success) {
                setAvatarUri(res.data.avatar);
                if (refreshUser) await refreshUser();
            }
        } catch (e: any) {
            Alert.alert('Upload Failed', e.response?.data?.message || 'Failed to upload photo.');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    setAvatarLoading(true);
                    try {
                        const res = await api.delete('/api/user/avatar');
                        if (res.data?.success) {
                            setAvatarUri(null);
                            if (refreshUser) await refreshUser();
                        }
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.message || 'Failed to remove photo.');
                    } finally {
                        setAvatarLoading(false);
                    }
                }
            }
        ]);
    };

    const handleSaveProfile = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Display name cannot be empty.');
            return;
        }
        // Bounce animation
        btnScale.value = withSequence(
            withSpring(0.92, { damping: 15, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 }),
        );
        setLoading(true);
        try {
            const res = await api.put('/api/user/profile', {
                displayName: displayName.trim(),
                email: email.trim(),
                phone: phone.trim(),
            });
            if (res.data?.success) {
                if (refreshUser) await refreshUser();
                Alert.alert('Success', 'Profile updated successfully!', [
                    { text: 'OK', onPress: () => router.back() },
                ]);
            }
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (hasPassword && !currentPassword) {
            Alert.alert('Error', 'Please enter your current password.');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const body: any = { newPassword };
            if (hasPassword) body.currentPassword = currentPassword;
            await api.put('/api/user/change-password', body);
            Alert.alert('Success', 'Password updated!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordSection(false);
            setHasPassword(true);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header — consistent with rest of app */}
            <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingHorizontal: horizontalPadding, paddingBottom: insets.bottom + 40 }]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Avatar */}
                    <Animated.View entering={FadeInDown.delay(50).duration(600).easing(Easing.out(Easing.cubic))} style={styles.avatarSection}>
                        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage} disabled={avatarLoading} activeOpacity={0.8}>
                            <View style={styles.avatar}>
                                {avatarLoading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.avatarText}>{initials || '?'}</Text>
                                )}
                            </View>
                            <View style={styles.editBadge}>
                                <Ionicons name="camera" size={12} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        {avatarUri ? (
                            <TouchableOpacity onPress={handleRemoveAvatar} style={styles.removePhotoBtn}>
                                <Text style={styles.removePhotoText}>Remove Photo</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.avatarHint}>Tap to add photo</Text>
                        )}
                    </Animated.View>

                    {/* Profile Fields */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600).easing(Easing.out(Easing.cubic))}>
                        <Text style={styles.sectionTitle}>Personal Info</Text>
                        <View style={styles.fieldGroup}>
                            <FieldRow icon="person-outline" label="Display Name" value={displayName} onChange={setDisplayName} />
                            <FieldRow icon="mail-outline" label="Email" value={email} onChange={setEmail} keyboard="email-address" />
                            <FieldRow icon="call-outline" label="Phone" value={phone} onChange={setPhone} keyboard="phone-pad" isLast />
                        </View>
                    </Animated.View>

                    {/* Save Button with animation */}
                    <Animated.View entering={FadeInDown.delay(150).duration(600).easing(Easing.out(Easing.cubic))}>
                        <Animated.View style={animatedBtnStyle}>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile} disabled={loading} activeOpacity={0.8}>
                                {loading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                        <Text style={styles.saveBtnText}>Save Changes</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>

                    {/* Password Section */}
                    <Animated.View entering={FadeInDown.delay(200).duration(600).easing(Easing.out(Easing.cubic))}>
                        <Text style={styles.sectionTitle}>Security</Text>
                        <TouchableOpacity
                            style={styles.passwordToggle}
                            onPress={() => setShowPasswordSection(!showPasswordSection)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.passwordToggleLeft}>
                                <View style={styles.passwordIconWrap}>
                                    <Ionicons name="lock-closed-outline" size={18} color="#F59E0B" />
                                </View>
                                <Text style={styles.passwordToggleText}>
                                    {hasPassword ? 'Change Password' : 'Set Password'}
                                </Text>
                            </View>
                            <Ionicons name={showPasswordSection ? 'chevron-up' : 'chevron-down'} size={18} color="#8E8E93" />
                        </TouchableOpacity>

                        {showPasswordSection && (
                            <View style={styles.fieldGroup}>
                                {hasPassword && (
                                    <FieldRow icon="key-outline" label="Current Password" value={currentPassword} onChange={setCurrentPassword} secure />
                                )}
                                <FieldRow icon="lock-closed-outline" label="New Password" value={newPassword} onChange={setNewPassword} secure />
                                <FieldRow icon="shield-checkmark-outline" label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} secure isLast />
                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: '#F59E0B', marginTop: 16, marginHorizontal: 16, marginBottom: 16 }]}
                                    onPress={handleChangePassword}
                                    disabled={loading}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="key-outline" size={18} color="#fff" />
                                    <Text style={styles.saveBtnText}>{hasPassword ? 'Update Password' : 'Set Password'}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function FieldRow({ icon, label, value, onChange, keyboard, secure, isLast }: {
    icon: string; label: string; value: string; onChange: (v: string) => void;
    keyboard?: any; secure?: boolean; isLast?: boolean;
}) {
    return (
        <View style={[styles.fieldRow, isLast && styles.fieldRowLast]}>
            <View style={styles.fieldIcon}>
                <Ionicons name={icon as any} size={18} color="#8E8E93" />
            </View>
            <View style={styles.fieldContent}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                    style={styles.fieldInput}
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboard || 'default'}
                    secureTextEntry={secure}
                    placeholderTextColor="#C7C7CC"
                    placeholder={`Enter ${label.toLowerCase()}`}
                    autoCapitalize={secure ? 'none' : 'words'}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 14,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
    scrollView: { flex: 1 },
    scrollContent: { paddingTop: 8 },
    avatarSection: {
        alignItems: 'center', marginBottom: 28,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    editBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#111',
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarText: {
        fontSize: 28, fontWeight: '900', color: '#fff',
    },
    avatarHint: {
        fontSize: 13, color: '#8E8E93', fontWeight: '600',
    },
    removePhotoBtn: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    removePhotoText: {
        fontSize: 13, color: '#EF4444', fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 11, fontWeight: '800', color: '#8E8E93',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 12, paddingHorizontal: 4,
    },
    fieldGroup: {
        backgroundColor: '#fff', borderRadius: 20,
        borderWidth: 1, borderColor: '#F2F2F7',
        overflow: 'hidden', marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    },
    fieldRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14, gap: 14,
        borderBottomWidth: 1, borderBottomColor: '#F2F2F7',
    },
    fieldRowLast: { borderBottomWidth: 0 },
    fieldIcon: {
        width: 40, height: 40, borderRadius: 14,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },
    fieldContent: { flex: 1 },
    fieldLabel: {
        fontSize: 11, fontWeight: '700', color: '#8E8E93',
        marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    fieldInput: { fontSize: 15, fontWeight: '600', color: '#111', padding: 0, minHeight: 24 },
    saveBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, backgroundColor: '#6366F1', borderRadius: 16,
        paddingVertical: 16, marginBottom: 32,
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
    },
    saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
    passwordToggle: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#fff', borderRadius: 20, padding: 16,
        borderWidth: 1, borderColor: '#F2F2F7', marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    },
    passwordToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    passwordIconWrap: {
        width: 40, height: 40, borderRadius: 14,
        backgroundColor: 'rgba(245,158,11,0.12)', justifyContent: 'center', alignItems: 'center',
    },
    passwordToggleText: { fontSize: 15, fontWeight: '700', color: '#111' },
});
