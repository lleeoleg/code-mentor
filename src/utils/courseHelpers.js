/** Placeholder image for course (backend has no image field). */
export function getCourseImageUrl(courseId) {
  return `https://picsum.photos/seed/${courseId}/400/220`;
}

export function getLevelKey(levelDisplayOrLevel) {
  if (!levelDisplayOrLevel) return 'all';
  const s = String(levelDisplayOrLevel).toLowerCase();
  if (s === 'beginner' || s === 'начальный') return 'beginner';
  if (s === 'intermediate' || s === 'средний') return 'intermediate';
  if (s === 'advanced' || s === 'продвинутый') return 'advanced';
  return 'all';
}

export function levelBadgeClass(levelDisplayOrLevel) {
  const k = getLevelKey(levelDisplayOrLevel);
  return `badge-${k}`;
}

export function levelLabel(levelDisplayOrLevel) {
  return levelDisplayOrLevel || 'Любой';
}

export const LEVEL_FILTER_OPTIONS = [
  { value: '', label: 'Все уровни' },
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
  { value: 'all', label: 'Любой' },
];

export function filterCoursesByLevel(courses, levelFilter) {
  if (!levelFilter) return courses;
  return courses.filter((c) => getLevelKey(c.level_display ?? c.level) === levelFilter);
}

/** Отображаемая цена: нет цены/0 → «Бесплатно», иначе «1 999 ₽». */
export function formatCoursePrice(price) {
  if (price == null || price === '' || Number(price) === 0) return 'Бесплатно';
  const n = Number(price);
  if (Number.isNaN(n)) return 'Бесплатно';
  return new Intl.NumberFormat('ru-RU', { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' ₽';
}

export const PRICE_FILTER_OPTIONS = [
  { value: '', label: 'Все курсы' },
  { value: 'free', label: 'Бесплатные' },
  { value: 'certificate', label: 'С сертификатом' },
];
