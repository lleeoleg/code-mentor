import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_MY_LEARNING = '@codementor_my_learning';

export type LearningCourse = {
  id: number;
  title: string;
  price?: number | string;
  level_display?: string;
  level?: string;
};

type MyLearningContextType = {
  startedCourses: LearningCourse[];
  isInLearning: (id: number) => boolean;
  addToLearning: (course: LearningCourse) => Promise<void>;
  removeFromLearning: (id: number) => Promise<void>;
};

const MyLearningContext = createContext<MyLearningContextType | null>(null);

export function MyLearningProvider({ children }: { children: React.ReactNode }) {
  const [startedCourses, setStartedCourses] = useState<LearningCourse[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_MY_LEARNING);
      if (raw) {
        const parsed = JSON.parse(raw) as LearningCourse[];
        setStartedCourses(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setStartedCourses([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (list: LearningCourse[]) => {
    setStartedCourses(list);
    await AsyncStorage.setItem(STORAGE_MY_LEARNING, JSON.stringify(list));
  }, []);

  const isInLearning = useCallback(
    (id: number) => startedCourses.some((c) => c.id === id),
    [startedCourses]
  );

  const addToLearning = useCallback(
    async (course: LearningCourse) => {
      if (startedCourses.some((c) => c.id === course.id)) return;
      await save([...startedCourses, course]);
    },
    [startedCourses, save]
  );

  const removeFromLearning = useCallback(
    async (id: number) => {
      await save(startedCourses.filter((c) => c.id !== id));
    },
    [startedCourses, save]
  );

  return (
    <MyLearningContext.Provider
      value={{
        startedCourses,
        isInLearning,
        addToLearning,
        removeFromLearning,
      }}
    >
      {children}
    </MyLearningContext.Provider>
  );
}

export function useMyLearning() {
  const ctx = useContext(MyLearningContext);
  if (!ctx) throw new Error('useMyLearning must be used within MyLearningProvider');
  return ctx;
}
