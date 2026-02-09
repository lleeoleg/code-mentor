import axios, { type AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from './config';

const STORAGE_ACCESS = 'access';
const STORAGE_REFRESH = 'refresh';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
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
};

export const news = {
  list: () => api.get('/news/').then((r) => r.data),
};

export default api;
