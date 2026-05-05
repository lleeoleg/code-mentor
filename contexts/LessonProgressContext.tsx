import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';
import { lessonProgress as lessonProgressApi } from '@/lib/api';

const STORAGE_KEY = '@codementor_lesson_progress';
const STORAGE_ACCESS = 'access';

type ProgressMap = Record<string, number[]>; // courseId -> completed lesson ids

type LessonProgressContextType = {
  isLessonCompleted: (courseId: number | string, lessonId: number) => boolean;
  getCompletedLessonIds: (courseId: number | string) => number[];
  markLessonCompleted: (courseId: number | string, lessonId: number) => Promise<void>;
  resetCourseProgress: (courseId: number | string) => Promise<void>;
};

const LessonProgressContext = createContext<LessonProgressContextType | null>(null);

function normalizeCourseId(courseId: number | string): string {
  return String(courseId);
}

function mergeMaps(local: ProgressMap, server: Record<string, number[]>): ProgressMap {
  const out: ProgressMap = { ...local };
  for (const [cid, ids] of Object.entries(server || {})) {
    const a = Array.isArray(out[cid]) ? out[cid] : [];
    const b = Array.isArray(ids) ? ids.map(Number) : [];
    out[cid] = [...new Set([...a, ...b])];
  }
  return out;
}

export function LessonProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [map, setMap] = useState<ProgressMap>({});

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as ProgressMap;
          if (parsed && typeof parsed === 'object') setMap(parsed);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const persist = useCallback(async (next: ProgressMap) => {
    setMap(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        let local: ProgressMap = {};
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as ProgressMap;
            if (parsed && typeof parsed === 'object') local = parsed;
          } catch {
            local = {};
          }
        }
        const server = await lessonProgressApi.get();
        const merged = mergeMaps(local, server);
        if (cancelled) return;
        await persist(merged);
        await lessonProgressApi.sync({ by_course: merged });
      } catch {
        // offline
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, persist]);

  const getCompletedLessonIds = useCallback(
    (courseId: number | string) => {
      const k = normalizeCourseId(courseId);
      const list = map[k];
      return Array.isArray(list) ? list : [];
    },
    [map]
  );

  const isLessonCompleted = useCallback(
    (courseId: number | string, lessonId: number) => getCompletedLessonIds(courseId).includes(lessonId),
    [getCompletedLessonIds]
  );

  const markLessonCompleted = useCallback(
    async (courseId: number | string, lessonId: number) => {
      const k = normalizeCourseId(courseId);
      const current = Array.isArray(map[k]) ? map[k] : [];
      if (current.includes(lessonId)) return;
      const next: ProgressMap = { ...map, [k]: [...current, lessonId] };
      await persist(next);
      try {
        const access = await AsyncStorage.getItem(STORAGE_ACCESS);
        if (access) await lessonProgressApi.complete(lessonId);
      } catch {
        // ignore
      }
    },
    [map, persist]
  );

  const resetCourseProgress = useCallback(
    async (courseId: number | string) => {
      const k = normalizeCourseId(courseId);
      const next: ProgressMap = { ...map };
      delete next[k];
      await persist(next);
    },
    [map, persist]
  );

  const value = useMemo(
    () => ({ isLessonCompleted, getCompletedLessonIds, markLessonCompleted, resetCourseProgress }),
    [getCompletedLessonIds, isLessonCompleted, markLessonCompleted, resetCourseProgress]
  );

  return <LessonProgressContext.Provider value={value}>{children}</LessonProgressContext.Provider>;
}

export function useLessonProgress() {
  const ctx = useContext(LessonProgressContext);
  if (!ctx) throw new Error('useLessonProgress must be used within LessonProgressProvider');
  return ctx;
}
