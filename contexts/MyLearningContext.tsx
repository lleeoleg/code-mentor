import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { enrollments, courses } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

/** Как в GET /enrollments/ (совпадает с вебом) */
export type EnrollmentRow = {
  id: number;
  course: number;
  course_title: string;
  enrolled_at?: string;
  source?: string;
};

type MyLearningContextType = {
  enrolledList: EnrollmentRow[];
  loading: boolean;
  refreshEnrollments: () => Promise<void>;
  /** POST /courses/:id/try-free/ — как «Начать обучение» на сайте */
  tryStartLearning: (courseId: number) => Promise<void>;
  isEnrolled: (courseId: number) => boolean;
};

const MyLearningContext = createContext<MyLearningContextType | null>(null);

export function MyLearningProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [enrolledList, setEnrolledList] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshEnrollments = useCallback(async () => {
    if (!user) {
      setEnrolledList([]);
      return;
    }
    setLoading(true);
    try {
      const data = await enrollments.list();
      setEnrolledList(Array.isArray(data) ? data : []);
    } catch {
      setEnrolledList([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  const tryStartLearning = useCallback(
    async (courseId: number) => {
      await courses.tryFree(courseId);
      await refreshEnrollments();
    },
    [refreshEnrollments]
  );

  const isEnrolled = useCallback(
    (courseId: number) => enrolledList.some((e) => e.course === courseId),
    [enrolledList]
  );

  return (
    <MyLearningContext.Provider
      value={{
        enrolledList,
        loading,
        refreshEnrollments,
        tryStartLearning,
        isEnrolled,
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
