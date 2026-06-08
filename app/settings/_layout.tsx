import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScreenBackground } from '@/components/ScreenBackground';
import { GradientHeaderBackground } from '@/components/GradientHeaderBackground';

export default function SettingsLayout() {
  return (
    <View style={styles.root}>
      <ScreenBackground />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackground: () => <GradientHeaderBackground />,
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Настройки' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Редактирование профиля' }} />
        <Stack.Screen name="email" options={{ title: 'Изменить почту' }} />
        <Stack.Screen name="social" options={{ title: 'Вход через социальные сети' }} />
        <Stack.Screen name="social-links" options={{ title: 'Ссылки на социальные сети' }} />
        <Stack.Screen name="password" options={{ title: 'Установить пароль' }} />
        <Stack.Screen name="details" options={{ title: 'Реквизиты' }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
