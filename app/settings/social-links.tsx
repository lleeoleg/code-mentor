import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, saveProfile } from '@/utils/profileStore';
import { AppTheme } from '@/constants/theme';
import { SOCIAL_LINK_FIELDS } from '@/constants/socialLinks';

export default function SocialLinksSettingsScreen() {
  const { user } = useAuth();
  const [socialLinks, setSocialLinksState] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user?.username) {
      getProfile(user.username).then((p) =>
        setSocialLinksState({ ...(p.socialLinks || {}) })
      );
    }
  }, [user?.username]);

  const setSocialLink = (id: string, value: string) => {
    setSocialLinksState((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    if (user?.username) {
      await saveProfile(user.username, { socialLinks });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Эти ссылки будут отображаться в вашем профиле:</Text>
        {SOCIAL_LINK_FIELDS.map((field) => (
          <View key={field.id} style={styles.field}>
            <Text style={styles.prefix}>{field.prefix || field.label}</Text>
            <TextInput
              style={styles.input}
              value={socialLinks[field.id] ?? ''}
              onChangeText={(t) => setSocialLink(field.id, t)}
              placeholder={field.placeholder}
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
            />
          </View>
        ))}
        <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>{saved ? 'Сохранено' : 'Сохранить изменения'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  field: { marginBottom: 14 },
  prefix: { fontSize: 14, color: '#6b7280', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  submitBtn: {
    backgroundColor: AppTheme.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
