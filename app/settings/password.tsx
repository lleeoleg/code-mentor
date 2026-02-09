import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '@/lib/api';

export default function PasswordSettingsScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (newPassword.length < 8) {
      setError('Пароль должен быть не менее 8 символов.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Пароли не совпадают.');
      return;
    }
    setLoading(true);
    try {
      await auth.setPassword({
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      });
      setNewPassword('');
      setNewPasswordConfirm('');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const msg =
        err.response?.data?.new_password ||
        err.response?.data?.new_password_confirm ||
        err.response?.data?.detail;
      const text = Array.isArray(msg) ? msg.join(' ') : msg || 'Не удалось изменить пароль.';
      setError(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Новый пароль</Text>
        <TextInput
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Минимум 8 символов"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Новый пароль (ещё раз)</Text>
        <TextInput
          style={styles.input}
          value={newPasswordConfirm}
          onChangeText={setNewPasswordConfirm}
          placeholder="Повторите пароль"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.submitBtnText}>
          {saved ? 'Сохранено' : loading ? 'Сохранение...' : 'Сохранить изменения'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 12 },
  submitBtn: {
    backgroundColor: '#0d0d0d',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
