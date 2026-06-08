import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ScreenBackground } from '@/components/ScreenBackground';
import { GradientButton } from '@/components/GradientButton';
import { AppTheme } from '@/constants/theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: Record<string, unknown> } };
      const data = ax.response?.data;
      let msg = 'Ошибка регистрации';
      if (data?.username && Array.isArray(data.username)) msg = (data.username as string[]).join(' ');
      else if (data?.email && Array.isArray(data.email)) msg = (data.email as string[]).join(' ');
      else if (data?.password && Array.isArray(data.password)) msg = (data.password as string[]).join(' ');
      else if (typeof data === 'object') msg = JSON.stringify(data);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScreenBackground />
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>CodeMentor</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Регистрация</Text>
            <Text style={styles.subtitle}>Создайте аккаунт для доступа к курсам</Text>

            <TextInput
              style={styles.input}
              placeholder="Логин"
              placeholderTextColor={AppTheme.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              placeholderTextColor={AppTheme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Пароль (минимум 8 символов)"
              placeholderTextColor={AppTheme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <GradientButton
              title={loading ? 'Регистрация...' : 'Зарегистрироваться'}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.button}
            />

            <Link href="/login" asChild>
              <TouchableOpacity style={styles.linkWrap} activeOpacity={0.7}>
                <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: AppTheme.accent,
    letterSpacing: -0.5,
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: AppTheme.radius,
    borderWidth: 1,
    borderColor: AppTheme.border,
    padding: 24,
    shadowColor: AppTheme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: AppTheme.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: AppTheme.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: AppTheme.border,
    borderRadius: AppTheme.radiusSm,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: AppTheme.text,
  },
  error: {
    color: AppTheme.error,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: { marginTop: 8 },
  linkWrap: {
    marginTop: 22,
    alignItems: 'center',
  },
  link: {
    color: AppTheme.accent,
    fontSize: 15,
    fontWeight: '600',
  },
});
