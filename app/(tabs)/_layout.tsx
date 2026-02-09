import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0d0d0d',
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#0d0d0d',
        headerShadowVisible: true,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e5e7eb' },
        tabBarInactiveTintColor: '#6b7280',
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
  );
}
