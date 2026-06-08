import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/api';
import { AppTheme } from '@/constants/theme';

export default function DetailsSettingsScreen() {
  const { user } = useAuth();
  const [userMe, setUserMe] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      auth
        .me()
        .then(setUserMe)
        .catch(() => setUserMe(null))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Реквизиты для перечисления денежных средств</Text>
      <View style={styles.field}>
        <Text style={styles.label}>
          Контактный e-mail{' '}
          <Text style={styles.hintIcon} onPress={() => {}}>?</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={userMe?.email || ''}
          editable={false}
          placeholder="email"
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.hint}>Для отправки платёжных документов</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Получение средств в КЗ</Text>
        <TouchableOpacity onPress={() => Linking.openURL('#financial-conditions')}>
          <Text style={styles.link}>Финансовые условия</Text>
        </TouchableOpacity>
        <Text style={styles.agreement}>
          Переходя к заполнению реквизитов, вы соглашаетесь с{' '}
          <Text style={styles.link} onPress={() => Linking.openURL('#offer')}>
            офертой (агентским договором)
          </Text>{' '}
          о продажах курсов в рублях.
        </Text>
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>Заполнить реквизиты</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6b7280' },
  title: { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 20 },
  field: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 8 },
  hintIcon: { color: '#6b7280', fontSize: 14 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  hint: { fontSize: 14, color: '#6b7280', marginTop: 6 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12 },
  link: { fontSize: 16, color: '#3b82f6' },
  agreement: { fontSize: 14, color: '#4b5563', lineHeight: 22, marginBottom: 20 },
  submitBtn: {
    backgroundColor: AppTheme.accent,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
