import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as favoritesStore from '../utils/favoritesStore';
import { favorites as favoritesApi } from '../api';
import { syncLessonProgressWithServer } from '../utils/progressStore';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const [favoriteIds, setFavoriteIds] = useState(() => favoritesStore.getFavoriteIds(username));
  const syncingRef = useRef(false);

  useEffect(() => {
    setFavoriteIds(favoritesStore.getFavoriteIds(username));
  }, [username]);

  useEffect(() => {
    const handleStorage = (e) => {
      const key = favoritesStore.getKey(username);
      if (key && e.key === key) setFavoriteIds(favoritesStore.getFavoriteIds(username));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [username]);

  /** Синхронизация избранного и прогресса уроков с сервером при входе. */
  useEffect(() => {
    if (!username || !user) return;
    let cancelled = false;
    (async () => {
      if (syncingRef.current) return;
      syncingRef.current = true;
      try {
        const data = await favoritesApi.list();
        const serverIds = Array.isArray(data.course_ids) ? data.course_ids.map(Number) : [];
        const localIds = favoritesStore.getFavoriteIds(username);
        for (const id of localIds) {
          if (!serverIds.includes(id)) {
            try {
              await favoritesApi.add(id);
            } catch {
              // ignore single failures
            }
          }
        }
        const data2 = await favoritesApi.list();
        const merged = Array.isArray(data2.course_ids) ? data2.course_ids.map(Number) : [];
        favoritesStore.setFavorites(username, merged);
        if (!cancelled) setFavoriteIds(merged);
        await syncLessonProgressWithServer();
        window.dispatchEvent(new CustomEvent('lessonProgressSynced'));
      } catch {
        if (!cancelled) setFavoriteIds(favoritesStore.getFavoriteIds(username));
      } finally {
        syncingRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, user]);

  const toggleFavorite = useCallback(
    async (courseId) => {
      if (!username) return;
      const id = Number(courseId);
      const prev = favoritesStore.getFavoriteIds(username);
      const was = prev.includes(id);
      const next = was ? prev.filter((x) => x !== id) : [...prev, id];
      setFavoriteIds(next);
      favoritesStore.setFavorites(username, next);
      try {
        if (was) await favoritesApi.remove(id);
        else await favoritesApi.add(id);
      } catch {
        setFavoriteIds(prev);
        favoritesStore.setFavorites(username, prev);
      }
      window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: { username } }));
    },
    [username]
  );

  const isFavorite = useCallback(
    (courseId) => favoriteIds.includes(Number(courseId)),
    [favoriteIds]
  );

  const value = { favoriteIds, toggleFavorite, isFavorite };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
