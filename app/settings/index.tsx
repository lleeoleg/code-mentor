import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const SETTINGS_NAV = [
  { route: 'edit-profile' as const, label: 'Редактировать профиль' },
  { route: 'email' as const, label: 'Изменить почту' },
  { route: 'social' as const, label: 'Вход через социальные сети' },
  { route: 'social-links' as const, label: 'Ссылки на социальные сети' },
  { route: 'password' as const, label: 'Установить пароль' },
  { route: 'details' as const, label: 'Реквизиты' },
];

export default function SettingsIndex() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.breadcrumb}>Профиль › Настройки</Text>
        {SETTINGS_NAV.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.row}
            onPress={() => router.push(`/settings/${item.route}` as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.rowText}>{item.label}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: { padding: 20 },
  breadcrumb: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rowText: { fontSize: 16, color: '#111' },
  chevron: { fontSize: 18, color: '#9ca3af' },
});
