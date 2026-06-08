import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { ScreenBackground } from '@/components/ScreenBackground';
import { GradientHeaderBackground } from '@/components/GradientHeaderBackground';
import { AppTheme } from '@/constants/theme';

export default function TabLayout() {
  return (
    <View style={styles.root}>
      <ScreenBackground />
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: AppTheme.accent,
          tabBarInactiveTintColor: AppTheme.textMuted,
          headerShown: true,
          headerBackground: () => <GradientHeaderBackground />,
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: AppTheme.card,
            borderTopColor: AppTheme.border,
            height: 58,
            paddingBottom: 6,
          },
          sceneStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'CodeMentor',
            headerTitle: 'CodeMentor',
            tabBarLabel: 'Главная',
            tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="courses"
          options={{
            title: 'Каталог курсов',
            tabBarLabel: 'Курсы',
            tabBarIcon: ({ color }) => <Ionicons name="library" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="my-learning"
          options={{
            title: 'Моё обучение',
            tabBarLabel: 'Обучение',
            tabBarIcon: ({ color }) => <Ionicons name="school" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Профиль',
            tabBarLabel: 'Профиль',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
