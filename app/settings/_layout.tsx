import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#0d0d0d',
        headerShadowVisible: true,
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
  );
}
