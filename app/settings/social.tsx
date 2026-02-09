import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Linking } from 'react-native';
import { API_BASE } from '@/lib/config';

const SOCIAL_PROVIDERS = [
  { name: 'Facebook', path: 'facebook' },
  { name: 'GitHub', path: 'github' },
  { name: 'Google', path: 'google' },
  { name: 'VK', path: 'vk' },
  { name: 'Twitter', path: 'twitter' },
  { name: 'Яндекс', path: 'yandex' },
];

export default function SocialSettingsScreen() {
  const openConnect = (path: string) => {
    const url = `${API_BASE.replace(/\/$/, '')}/auth/${path}/login/`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {SOCIAL_PROVIDERS.map((provider) => (
        <View key={provider.path} style={styles.row}>
          <Text style={styles.name}>{provider.name}</Text>
          <TouchableOpacity onPress={() => openConnect(provider.path)}>
            <Text style={styles.link}>Подключить</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  name: { fontSize: 16, color: '#111' },
  link: { fontSize: 16, color: '#3b82f6' },
});
