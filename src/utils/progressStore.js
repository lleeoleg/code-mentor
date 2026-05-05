import { lessonProgress as lessonProgressApi } from '../api';

const STORAGE_PREFIX = 'codementor_progress';

function getUsername() {
  try {
    return localStorage.getItem('username') || 'user';
  } catch {
    return 'user';
  }
}

function key() {
  return `${STORAGE_PREFIX}_${getUsername()}`;
}

function read() {
  try {
    const raw = localStorage.getItem(key());
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function write(obj) {
  try {
    localStorage.setItem(key(), JSON.stringify(obj));
  } catch {
    // ignore
  }
}

export function getCompletedLessonIds(courseId) {
  const data = read();
  const list = data[String(courseId)];
  return Array.isArray(list) ? list : [];
}

export function markLessonCompleted(courseId, lessonId) {
  const data = read();
  const k = String(courseId);
  const current = Array.isArray(data[k]) ? data[k] : [];
  if (current.includes(lessonId)) return;
  data[k] = [...current, lessonId];
  write(data);
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('access')) {
      lessonProgressApi.complete(lessonId).catch(() => {});
    }
  } catch {
    // ignore
  }
}

/** Объединить сервер и localStorage и отправить полный снимок на сервер (синхронизация устройств). */
export async function syncLessonProgressWithServer() {
  if (typeof localStorage === 'undefined') return;
  if (!localStorage.getItem('access')) return;
  try {
    const server = await lessonProgressApi.get();
    const local = read();
    const merged = {};
    const keys = new Set([...Object.keys(local), ...Object.keys(server || {})]);
    keys.forEach((cid) => {
      const a = Array.isArray(local[cid]) ? local[cid].map(Number) : [];
      const b = Array.isArray(server[cid]) ? server[cid].map(Number) : [];
      merged[cid] = [...new Set([...a, ...b])];
    });
    write(merged);
    await lessonProgressApi.sync({ by_course: merged });
  } catch {
    // offline / 401
  }
}

export function getProgressPercent(courseId, totalLessons) {
  const completed = getCompletedLessonIds(courseId);
  const total = Number(totalLessons) || 0;
  if (!total) return 0;
  const done = completed.length;
  return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
}

