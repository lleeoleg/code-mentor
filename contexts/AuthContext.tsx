import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth as authApi } from '@/lib/api';

const STORAGE_ACCESS = 'access';
const STORAGE_REFRESH = 'refresh';
const STORAGE_USERNAME = 'username';

type User = { username: string; id?: number; email?: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (username: string, password: string) => Promise<unknown>;
  register: (payload: { username: string; password: string; email: string }) => Promise<unknown>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (username: string, password: string) => {
    const data = await authApi.login(username, password);
    await AsyncStorage.multiSet([
      [STORAGE_ACCESS, data.access],
      [STORAGE_REFRESH, data.refresh],
      [STORAGE_USERNAME, username],
    ]);
    setUser({ username });
    return data;
  }, []);

  const register = useCallback(
    async (payload: { username: string; password: string; email: string }) => {
      const data = await authApi.register(payload);
      await AsyncStorage.multiSet([
        [STORAGE_ACCESS, data.tokens.access],
        [STORAGE_REFRESH, data.tokens.refresh],
        [STORAGE_USERNAME, data.user.username],
      ]);
      setUser(data.user);
      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_ACCESS, STORAGE_REFRESH, STORAGE_USERNAME]);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await AsyncStorage.getItem(STORAGE_ACCESS);
      const username = await AsyncStorage.getItem(STORAGE_USERNAME);
      if (!cancelled && access && username) {
        try {
          const parts = access.split('.');
          if (parts.length >= 2) {
            const payload = JSON.parse(atob(parts[1]));
            if (payload.exp * 1000 > Date.now()) {
              setUser({ username });
            } else {
              await AsyncStorage.multiRemove([STORAGE_ACCESS, STORAGE_REFRESH, STORAGE_USERNAME]);
            }
          }
        } catch {
          await AsyncStorage.multiRemove([STORAGE_ACCESS, STORAGE_REFRESH, STORAGE_USERNAME]);
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
