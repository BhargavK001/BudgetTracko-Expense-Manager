import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Cloud, Star } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { SectionHeader, WideRow, useThemeStyles } from '@/components/more/DesignSystem';

export default function EditProfileScreen() {
  const { tokens, isDarkMode } = useThemeStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState<string | null>((user as any)?.avatar || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await api.get('/api/user/profile');
        if (profile.data?.success) {
          const data = profile.data.data;
          setDisplayName(data?.displayName || user?.displayName || '');
          setEmail(data?.email || user?.email || '');
          setAvatarUri(data?.avatar || (user as any)?.avatar || null);
        }
      } catch {
        setDisplayName(user?.displayName || '');
        setEmail(user?.email || '');
      }
    };

    loadProfile();
  }, [user]);

  const initials = useMemo(() => {
    const base = displayName || user?.displayName || 'BT';
    return base
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'BT';
  }, [displayName, user?.displayName]);

  const uploadAvatar = async (uri: string) => {
    const formData = new FormData();
    const name = uri.split('/').pop() || 'avatar.jpg';
    const ext = name.includes('.') ? name.split('.').pop() : 'jpg';

    formData.append('avatar', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name,
      type: `image/${ext}`,
    } as any);

    const result = await api.put('/api/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (result.data?.success) {
      setAvatarUri(result.data.avatar);
      await refreshUser?.();
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== 'granted') {
      Alert.alert('Permission needed', 'Media library permission is required to choose a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const onChangePhoto = () => {
    Alert.alert('Change photo', 'Choose a source', [
      { text: 'Camera', onPress: openCamera },
      { text: 'Gallery', onPress: openGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const onSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Validation', 'Display name is required.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Validation', 'Enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/api/user/profile', {
        displayName: displayName.trim(),
        email: email.trim(),
      });

      if (response.data?.success) {
        await refreshUser?.();
        if (Platform.OS === 'android') {
          ToastAndroid.show('Profile updated', ToastAndroid.SHORT);
        }
        router.back();
      }
    } catch {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const plan = user?.subscription?.plan
    ? String(user.subscription.plan).toUpperCase()
    : 'FREE';

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: tokens.bgSecondary }]}> 
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={tokens.bgSecondary} />

      <View style={[styles.header, { borderBottomWidth: 1, borderBottomColor: tokens.borderSubtle }]}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F0F5' }]}>
          <ChevronLeft size={20} color={tokens.textPrimary} strokeWidth={1.7} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Edit profile</Text>
        <Pressable onPress={onSave} disabled={saving} style={styles.headerSaveWrap}>
          <Text style={[styles.headerSave, { color: tokens.purple.stroke }]}>{saving ? 'Saving...' : 'Save'}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: insets.bottom + 100 }}
        >
          <View style={[styles.avatarCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: tokens.borderDefault }]}>
            <Pressable onPress={onChangePhoto} style={[styles.avatarWrap, { backgroundColor: tokens.purple.stroke }]}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </Pressable>
            <Pressable onPress={onChangePhoto}>
              <Text style={[styles.changePhoto, { color: tokens.purple.stroke }]}>Change photo</Text>
            </Pressable>
          </View>

          <SectionHeader title="Personal info" />
          <View style={styles.inputGroup}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor={tokens.textMuted}
              style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: tokens.borderDefault, color: tokens.textPrimary }]}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={tokens.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#FFFFFF', borderColor: tokens.borderDefault, color: tokens.textPrimary }]}
            />
          </View>

          <SectionHeader title="Account" />
          <WideRow
            title="Sync status"
            subtitle="Cloud backup"
            color={tokens.teal}
            Icon={Cloud}
            value="Last synced 2h ago"
            showChevron={false}
            onPress={() => null}
          />
          <WideRow
            title="Plan & billing"
            subtitle="Manage subscription"
            color={tokens.purple}
            Icon={Star}
            value={plan}
            onPress={() => router.push('/premium')}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomAction, { paddingBottom: insets.bottom + 16, backgroundColor: tokens.bgSecondary }]}> 
        <Pressable onPress={onSave} disabled={saving} style={[styles.saveButton, { backgroundColor: tokens.purple.accent }]}>
          <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save changes'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSaveWrap: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerSave: {
    fontSize: 15,
    fontWeight: '600',
  },
  avatarCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarImage: {
    width: 84,
    height: 84,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  changePhoto: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 8,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    fontWeight: '400',
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  saveButton: {
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
