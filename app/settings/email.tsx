import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/api';

export default function EmailSettingsScreen() {
  const { user } = useAuth();
  const [userMe, setUserMe] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      auth
        .me()
        .then(setUserMe)
        .catch(() => setUserMe(null))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleAddEmail = async () => {
    setError('');
    const email = newEmail.trim();
    if (!email) {
      setError('Введите новый адрес почты.');
      return;
    }
    try {
      const data = await auth.updateMe({ email });
      setUserMe(data);
      setNewEmail('');
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        'Не удалось обновить почту.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.muted}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Ваши почтовые адреса:</Text>
      <View style={styles.emailRow}>
        <TextInput
          style={[styles.input, styles.emailCurrent]}
          value={userMe?.email || ''}
          editable={false}
          placeholder="Текущий адрес"
          placeholderTextColor="#9ca3af"
        />
        <View style={styles.badges}>
          <View style={styles.badge}><Text style={styles.badgeText}>Основной</Text></View>
          <View style={styles.badge}><Text style={styles.badgeText}>Подтверждён</Text></View>
        </View>
      </View>
      <View style={styles.field}>
        <TextInput
          style={styles.input}
          value={newEmail}
          onChangeText={setNewEmail}
          placeholder="Новый адрес"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.submitBtn} onPress={handleAddEmail} activeOpacity={0.8}>
        <Text style={styles.submitBtnText}>{emailSaved ? 'Сохранено' : 'Добавить почту'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6b7280' },
  heading: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  emailRow: { marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  emailCurrent: { marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { backgroundColor: '#e5e7eb', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, color: '#4b5563' },
  field: { marginBottom: 16 },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  submitBtn: {
    backgroundColor: '#0d0d0d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
