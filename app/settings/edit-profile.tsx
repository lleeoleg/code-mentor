import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, saveProfile, type Profile } from '@/utils/profileStore';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

function getInitials(profile: Profile | null, username: string | undefined): string {
  if (profile?.firstName && profile?.lastName) {
    return (profile.firstName[0] + profile.lastName[0]).toUpperCase().slice(0, 2);
  }
  if (profile?.firstName) return profile.firstName.slice(0, 2).toUpperCase();
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.username) {
      getProfile(user.username).then((p) =>
        setProfileState({ ...p, firstName: p.firstName || user.username || '' })
      );
    }
  }, [user?.username, user?.username]);

  const setProfile = (patch: Partial<Profile>) => {
    setProfileState((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const handleSave = async () => {
    if (user?.username && profile) {
      await saveProfile(user.username, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAvatarUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setProfile({ avatar: result.assets[0].uri });
    }
  };

  const handleAvatarRemove = () => setProfile({ avatar: null });

  if (!profile) {
    return <View style={styles.centered}><Text style={styles.muted}>Загрузка...</Text></View>;
  }

  const initials = getInitials(profile, user?.username);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Ваше имя *</Text>
          <TextInput
            style={styles.input}
            value={profile.firstName}
            onChangeText={(t) => setProfile({ firstName: t })}
            placeholder="Имя"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Фамилия *</Text>
          <TextInput
            style={styles.input}
            value={profile.lastName}
            onChangeText={(t) => setProfile({ lastName: t })}
            placeholder="Фамилия"
            placeholderTextColor="#9ca3af"
          />
        </View>
        <Text style={styles.hint}>Ваше официальное имя, используемое в сертификатах.</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Приватность</Text>
          <Switch
            value={profile.isPrivate}
            onValueChange={(v) => setProfile({ isPrivate: v })}
            trackColor={{ false: '#e5e7eb', true: '#0d0d0d' }}
            thumbColor="#fff"
          />
        </View>
        <Text style={styles.checkboxLabel}>Сделать профиль приватным</Text>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Программа бета-тестирования</Text>
          <Switch
            value={profile.betaProgram}
            onValueChange={(v) => setProfile({ betaProgram: v })}
            trackColor={{ false: '#e5e7eb', true: '#0d0d0d' }}
            thumbColor="#fff"
          />
        </View>
        <Text style={styles.checkboxLabel}>Хочу участвовать</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Краткая биография (до 255 символов)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.shortBio}
            onChangeText={(t) => setProfile({ shortBio: t.slice(0, 255) })}
            placeholder="Краткая биография"
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={255}
          />
          <Text style={styles.charCount}>{profile.shortBio.length} / 255</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Обо мне</Text>
          <TextInput
            style={[styles.input, styles.textArea, { minHeight: 100 }]}
            value={profile.aboutMe}
            onChangeText={(t) => setProfile({ aboutMe: t })}
            placeholder="Обо мне"
            placeholderTextColor="#9ca3af"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>{saved ? 'Сохранено' : 'Сохранить изменения'}</Text>
        </TouchableOpacity>

        <View style={styles.avatarSection}>
          <Text style={styles.label}>Аватарка</Text>
          <View style={styles.avatarBlock}>
            <View style={styles.avatarPreview}>
              {profile.avatar ? (
                <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarInitials}>{initials}</Text>
              )}
            </View>
            <View style={styles.avatarActions}>
              <TouchableOpacity onPress={handleAvatarUpload}>
                <Text style={styles.linkText}>Загрузить</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAvatarRemove}>
                <Text style={styles.linkText}>Убрать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6b7280' },
  field: { marginBottom: 16 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 8 },
  checkboxLabel: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  charCount: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  submitBtn: {
    backgroundColor: '#0d0d0d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  avatarSection: { marginTop: 16 },
  avatarBlock: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { color: '#fff', fontSize: 24, fontWeight: '700' },
  avatarActions: { flexDirection: 'row', gap: 16 },
  linkText: { fontSize: 16, color: '#3b82f6' },
});
