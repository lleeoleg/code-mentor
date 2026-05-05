import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        }
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  login: (username, password) =>
    api.post('/auth/token/', { username, password }).then((r) => r.data),
  refresh: () =>
    api.post('/auth/token/refresh/', { refresh: localStorage.getItem('refresh') }).then((r) => r.data),
  register: (data) => api.post('/auth/register/', data).then((r) => r.data),
  me: () => api.get('/auth/me/').then((r) => r.data),
  updateMe: (data) => api.patch('/auth/me/', data).then((r) => r.data),
  setPassword: (data) => api.post('/auth/password/', data).then((r) => r.data),
};

export const courses = {
  list: (params) => api.get('/courses/', { params: params || {} }).then((r) => r.data),
  get: (id) => api.get(`/courses/${id}/`).then((r) => r.data),
  createCheckoutSession: (courseId) =>
    api.post(`/courses/${courseId}/checkout/`).then((r) => r.data),
  tryFree: (courseId) => api.post(`/courses/${courseId}/try-free/`).then((r) => r.data),
  curriculum: (courseId) => api.get(`/courses/${courseId}/curriculum/`).then((r) => r.data),
};

export const exams = {
  info: (courseId, opts) => api.get(`/courses/${courseId}/exam/`, { params: opts || {} }).then((r) => r.data),
  start: (courseId, opts) => api.post(`/courses/${courseId}/exam/start/`, null, { params: opts || {} }).then((r) => r.data),
  submit: (attemptId, payload) => api.post(`/exam-attempts/${attemptId}/submit/`, payload).then((r) => r.data),
  certificatePdf: (courseId) =>
    api.get(`/courses/${courseId}/certificate/pdf/`, { responseType: 'blob' }).then((r) => r.data),
};

export const lessons = {
  get: (id) => api.get(`/lessons/${id}/`).then((r) => r.data),
};

export const enrollments = {
  list: () => api.get('/enrollments/').then((r) => r.data),
};

export const favorites = {
  list: () => api.get('/favorites/').then((r) => r.data),
  add: (courseId) => api.post('/favorites/', { course_id: courseId }).then((r) => r.data),
  remove: (courseId) => api.delete(`/favorites/${courseId}/`).then((r) => r.data),
};

export const lessonProgress = {
  get: () => api.get('/lesson-progress/').then((r) => r.data.by_course || {}),
  complete: (lessonId) => api.post('/lesson-progress/', { lesson_id: lessonId }).then((r) => r.data),
  sync: (payload) => api.post('/lesson-progress/sync/', payload).then((r) => r.data),
};

export const activity = {
  get: () => api.get('/activity/').then((r) => r.data),
};

export const news = {
  list: () => api.get('/news/').then((r) => r.data),
};

export const comments = {
  list: (lessonId) => api.get(`/lessons/${lessonId}/comments/`).then((r) => r.data),
  create: (lessonId, text) =>
    api.post(`/lessons/${lessonId}/comments/create/`, { text }).then((r) => r.data),
  update: (commentId, text) =>
    api.patch(`/comments/${commentId}/`, { text }).then((r) => r.data),
  delete: (commentId) => api.delete(`/comments/${commentId}/`).then((r) => r.data),
};

export default api;
