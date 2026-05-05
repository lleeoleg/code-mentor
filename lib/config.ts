/**
 * Адрес API backend.
 *
 * На реальном телефоне localhost не работает — нужен IP вашего ПК.
 * 1. В cmd: ipconfig → найдите "IPv4-адрес" (например 192.168.1.100).
 * 2. Подставьте его ниже в YOUR_PC_IP или в .env: EXPO_PUBLIC_API_URL=http://ВАШ_IP:8000/api
 * 3. Backend: python manage.py runserver 0.0.0.0:8000
 * 4. Телефон и ПК — в одной Wi‑Fi.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Реальный телефон (не эмулятор) — тогда используем IP ПК. На телефоне localhost = сам телефон.
const USE_REAL_DEVICE = Device.isDevice;
// Замените на IP вашего компьютера (ipconfig → IPv4-адрес). Телефон и ПК в одной Wi‑Fi.
const YOUR_PC_IP = '192.168.0.18';

const getFromExpoExtra = (): string | undefined => {
  // Expo может хранить extra в разных местах (зависит от SDK/режима).
  const extra1: any = (Constants as any).expoConfig?.extra;
  const extra2: any = (Constants as any).manifest?.extra;
  const extra3: any = (Constants as any).manifest2?.extra;
  return extra1?.apiUrl || extra2?.apiUrl || extra3?.apiUrl;
};

const getApiBase = (): string => {
  const fromEnv = typeof process !== 'undefined' ? (process.env as any)?.EXPO_PUBLIC_API_URL : undefined;
  const fromExtra = getFromExpoExtra();
  const raw = (fromEnv && String(fromEnv).startsWith('http')) ? String(fromEnv) : (fromExtra || '');
  if (raw && String(raw).startsWith('http')) {
    const url = String(raw).trim();
    return url.endsWith('/api') ? url : url.endsWith('/') ? url + 'api' : url + '/api';
  }
  if (__DEV__) {
    // Android эмулятор -> 10.0.2.2 (это "localhost" хост-машины)
    if (Platform.OS === 'android' && !USE_REAL_DEVICE) return 'http://10.0.2.2:8000/api';
    // Реальный телефон -> IP вашего ПК в той же сети
    if (USE_REAL_DEVICE) return `http://${YOUR_PC_IP}:8000/api`;
    // iOS симулятор (если используется) обычно видит localhost
    return 'http://localhost:8000/api';
  }
  return 'https://your-production-api.com/api';
};

export const API_BASE = getApiBase();
