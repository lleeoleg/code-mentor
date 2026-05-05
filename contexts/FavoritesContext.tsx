import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favorites as favoritesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const STORAGE_FAVORITES = '@codementor_favorites';

export type FavoriteCourse = {
  id: number;
  title: string;
  price?: number | string;
  level_display?: string;
  level?: string;
};

type FavoritesContextType = {
  favorites: FavoriteCourse[];
  isFavorite: (id: number) => boolean;
  addFavorite: (course: FavoriteCourse) => Promise<void>;
  removeFavorite: (id: number) => Promise<void>;
  toggleFavorite: (course: FavoriteCourse) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

function mapApiCourse(c: FavoritesResponseCourse): FavoriteCourse {
  return {
    id: c.id,
    title: c.title,
    price: c.price ?? undefined,
    level: c.level,
    level_display: c.level_display,
  };
}

type FavoritesResponseCourse = {
  id: number;
  title: string;
  price?: string | number | null;
  level?: string;
  level_display?: string;
};

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteCourse[]>([]);

  const save = useCallback(async (list: FavoriteCourse[]) => {
    setFavorites(list);
    await AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(list));
  }, []);

  const loadLocal = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_FAVORITES);
      if (raw) {
        const parsed = JSON.parse(raw) as FavoriteCourse[];
        setFavorites(Array.isArray(parsed) ? parsed : []);
      } else {
        setFavorites([]);
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  const syncWithServer = useCallback(async () => {
    if (!user) return;
    try {
      const data = await favoritesApi.list();
      const serverCourses = Array.isArray(data.courses) ? data.courses.map(mapApiCourse) : [];
      const serverIds = new Set(serverCourses.map((c) => c.id));
      const raw = await AsyncStorage.getItem(STORAGE_FAVORITES);
      const local: FavoriteCourse[] = raw ? JSON.parse(raw) : [];
      for (const c of local) {
        if (!serverIds.has(c.id)) {
          try {
            await favoritesApi.add(c.id);
          } catch {
            // ignore
          }
        }
      }
      const data2 = await favoritesApi.list();
      const merged = Array.isArray(data2.courses) ? data2.courses.map(mapApiCourse) : serverCourses;
      await save(merged);
    } catch {
      await loadLocal();
    }
  }, [user, save, loadLocal]);

  useEffect(() => {
    (async () => {
      await loadLocal();
      if (user) await syncWithServer();
    })();
  }, [user, loadLocal, syncWithServer]);

  const isFavorite = useCallback(
    (id: number) => favorites.some((c) => c.id === id),
    [favorites]
  );

  const addFavorite = useCallback(
    async (course: FavoriteCourse) => {
      if (favorites.some((c) => c.id === course.id)) return;
      const next = [...favorites, course];
      await save(next);
      if (user) {
        try {
          await favoritesApi.add(course.id);
        } catch {
          // keep local
        }
      }
    },
    [favorites, save, user]
  );

  const removeFavorite = useCallback(
    async (id: number) => {
      const next = favorites.filter((c) => c.id !== id);
      await save(next);
      if (user) {
        try {
          await favoritesApi.remove(id);
        } catch {
          // keep local
        }
      }
    },
    [favorites, save, user]
  );

  const toggleFavorite = useCallback(
    async (course: FavoriteCourse) => {
      const exists = favorites.some((c) => c.id === course.id);
      const next = exists ? favorites.filter((c) => c.id !== course.id) : [...favorites, course];
      await save(next);
      if (user) {
        try {
          if (exists) await favoritesApi.remove(course.id);
          else await favoritesApi.add(course.id);
        } catch {
          // offline: локальный список уже сохранён
        }
      }
    },
    [favorites, save, user]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
