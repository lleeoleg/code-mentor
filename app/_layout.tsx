import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/AuthContext';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { MyLearningProvider } from '@/contexts/MyLearningContext';
import { LessonProgressProvider } from '@/contexts/LessonProgressContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <FavoritesProvider>
            <MyLearningProvider>
              <LessonProgressProvider>
                <ThemeProvider value={DefaultTheme}>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="course/[id]" />
                    <Stack.Screen name="settings" />
                    <Stack.Screen name="whats-new" />
                    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                  </Stack>
                  <StatusBar style="dark" />
                </ThemeProvider>
              </LessonProgressProvider>
            </MyLearningProvider>
          </FavoritesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
