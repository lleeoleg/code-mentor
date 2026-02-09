import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as favoritesStore from '../utils/favoritesStore';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const [favoriteIds, setFavoriteIds] = useState(() => favoritesStore.getFavoriteIds(username));

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

  const toggleFavorite = useCallback(
    (courseId) => {
      if (!username) return;
      const next = favoritesStore.toggleFavorite(username, courseId);
      setFavoriteIds(next);
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
