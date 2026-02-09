import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password);
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('username', username);
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser({ username });
    }
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    localStorage.setItem('access', data.tokens.access);
    localStorage.setItem('refresh', data.tokens.refresh);
    localStorage.setItem('username', data.user.username);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    setUser(null);
  }, []);

  /** Вход по токенам (после OAuth callback). */
  const loginWithTokens = useCallback(async (access, refresh) => {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    try {
      const me = await authApi.me();
      const username = me.username || me.email || 'user';
      localStorage.setItem('username', username);
      setUser(me.id !== undefined ? { ...me, username } : { username });
    } catch {
      try {
        const payload = JSON.parse(atob(access.split('.')[1]));
        const username = payload.username || payload.sub || 'user';
        localStorage.setItem('username', username);
        setUser({ username });
      } catch {
        setUser({ username: 'user' });
      }
    }
  }, []);

  useEffect(() => {
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');
    const username = localStorage.getItem('username');

    const restoreSession = () => {
      authApi.me()
        .then((me) => setUser(me))
        .catch(() => setUser(username ? { username } : null))
        .finally(() => setLoading(false));
    };

    if (!access && !refresh) {
      setLoading(false);
      return;
    }

    if (access && username) {
      try {
        const payload = JSON.parse(atob(access.split('.')[1]));
        if (payload.exp * 1000 > Date.now()) {
          restoreSession();
          return;
        }
      } catch {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('username');
        setLoading(false);
        return;
      }
    }

    // Токен истёк или нет access — пробуем обновить по refresh
    if (refresh) {
      authApi.refresh()
        .then((data) => {
          localStorage.setItem('access', data.access);
          restoreSession();
        })
        .catch(() => {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('username');
          setUser(null);
          setLoading(false);
        });
      return;
    }

    setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const onSessionExpired = () => setUser(null);
    window.addEventListener('auth:sessionExpired', onSessionExpired);
    return () => window.removeEventListener('auth:sessionExpired', onSessionExpired);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
