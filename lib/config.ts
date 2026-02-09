/**
 * Адрес API backend.
 *
 * На реальном телефоне (не эмуляторе):
 * 1. Узнайте IP ПК: в cmd выполните ipconfig, найдите "IPv4-адрес" (например 192.168.0.105).
 * 2. Создайте в папке myApp файл .env с строкой:
 *    EXPO_PUBLIC_API_URL=http://192.168.0.105:8000/api
 *    (подставьте свой IP).
 * 3. Backend запустите так: python manage.py runserver 0.0.0.0:8000
 * 4. Телефон и ПК — в одной Wi‑Fi. Перезапустите приложение (npx expo start).
 *
 * Либо укажите IP ниже в YOUR_PC_IP (без .env).
 */
import { Platform } from 'react-native';

const USE_REAL_DEVICE = true;
const YOUR_PC_IP = '192.168.0.15';

const getApiBase = (): string => {
  const fromEnv = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
  if (fromEnv && String(fromEnv).startsWith('http')) {
    const url = String(fromEnv).trim();
    return url.endsWith('/api') ? url : url.endsWith('/') ? url + 'api' : url + '/api';
  }
  if (__DEV__) {
    if (USE_REAL_DEVICE) {
      return `http://${YOUR_PC_IP}:8000/api`;
    }
    if (Platform.OS === 'android') return 'http://10.0.2.2:8000/api';
    return 'http://localhost:8000/api';
  }
  return 'https://your-production-api.com/api';
};

export const API_BASE = getApiBase();
