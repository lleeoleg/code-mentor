import axios, { type AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './config';

const STORAGE_ACCESS = 'access';
const STORAGE_REFRESH = 'refresh';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_ACCESS);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await AsyncStorage.getItem(STORAGE_REFRESH);
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          await AsyncStorage.setItem(STORAGE_ACCESS, data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          await AsyncStorage.multiRemove([STORAGE_ACCESS, STORAGE_REFRESH]);
        }
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (username: string, password: string) =>
    api.post<{ access: string; refresh: string }>('/auth/token/', { username, password }).then((r) => r.data),
  register: (data: { username: string; password: string; email: string }) =>
    api
      .post<{ user: { username: string }; tokens: { access: string; refresh: string } }>('/auth/register/', data)
      .then((r) => r.data),
  me: () => api.get('/auth/me/').then((r) => r.data),
  updateMe: (data: { email?: string }) => api.patch('/auth/me/', data).then((r) => r.data),
  setPassword: (data: { new_password: string; new_password_confirm: string }) =>
    api.post('/auth/password/', data).then((r) => r.data),
};

export const courses = {
  list: (params?: { price_type?: string }) =>
    api.get('/courses/', { params: params || {} }).then((r) => r.data),
  get: (id: string) => api.get(`/courses/${id}/`).then((r) => r.data),
  curriculum: (id: number | string) => api.get(`/courses/${id}/curriculum/`).then((r) => r.data),
};

export const lessons = {
  get: (id: number | string) => api.get(`/lessons/${id}/`).then((r) => r.data),
};

export const comments = {
  list: (lessonId: number | string) => api.get(`/lessons/${lessonId}/comments/`).then((r) => r.data),
  create: (lessonId: number | string, text: string) =>
    api.post(`/lessons/${lessonId}/comments/create/`, { text }).then((r) => r.data),
};

export const exams = {
  info: (courseId: number | string) => api.get(`/courses/${courseId}/exam/`).then((r) => r.data),
  start: (courseId: number | string) => api.post(`/courses/${courseId}/exam/start/`).then((r) => r.data),
  submit: (attemptId: number | string, payload: { answers: { question_id: number; choice_id: number }[] }) =>
    api.post(`/exam-attempts/${attemptId}/submit/`, payload).then((r) => r.data),
  certificatePdf: (courseId: number | string) =>
    api.get(`/courses/${courseId}/certificate/pdf/`, { responseType: 'arraybuffer' as any }).then((r) => r.data),
};

export const news = {
  list: () => api.get('/news/').then((r) => r.data),
};

export type FavoritesResponse = {
  course_ids: number[];
  courses: {
    id: number;
    title: string;
    description?: string;
    level?: string;
    level_display?: string;
    price?: string | number | null;
  }[];
};

export const favorites = {
  list: () => api.get<FavoritesResponse>('/favorites/').then((r) => r.data),
  add: (courseId: number) => api.post('/favorites/', { course_id: courseId }).then((r) => r.data),
  remove: (courseId: number) => api.delete(`/favorites/${courseId}/`).then((r) => r.data),
};

export const lessonProgress = {
  get: () => api.get<{ by_course: Record<string, number[]> }>('/lesson-progress/').then((r) => r.data.by_course || {}),
  complete: (lessonId: number) => api.post('/lesson-progress/', { lesson_id: lessonId }).then((r) => r.data),
  sync: (payload: { by_course?: Record<string, number[]>; lesson_ids?: number[] }) =>
    api.post('/lesson-progress/sync/', payload).then((r) => r.data),
};

export default api;
