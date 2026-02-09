export function getCourseImageUrl(courseId: number): string {
  return `https://picsum.photos/seed/${courseId}/400/220`;
}

export function getLevelKey(levelDisplayOrLevel: string | undefined): string {
  if (!levelDisplayOrLevel) return 'all';
  const s = String(levelDisplayOrLevel).toLowerCase();
  if (s === 'beginner' || s === 'начальный') return 'beginner';
  if (s === 'intermediate' || s === 'средний') return 'intermediate';
  if (s === 'advanced' || s === 'продвинутый') return 'advanced';
  return 'all';
}

export function levelLabel(levelDisplayOrLevel: string | undefined): string {
  return levelDisplayOrLevel || 'Любой';
}

export const LEVEL_FILTER_OPTIONS = [
  { value: '', label: 'Все уровни' },
  { value: 'beginner', label: 'Начальный' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутый' },
  { value: 'all', label: 'Любой' },
];

export function filterCoursesByLevel<T extends { level_display?: string; level?: string }>(
  courses: T[],
  levelFilter: string
): T[] {
  if (!levelFilter) return courses;
  return courses.filter((c) => getLevelKey(c.level_display ?? c.level) === levelFilter);
}

export function formatCoursePrice(price: number | string | null | undefined): string {
  if (price == null || price === '' || Number(price) === 0) return 'Бесплатно';
  const n = Number(price);
  if (Number.isNaN(n)) return 'Бесплатно';
  return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' ₽';
}

export const PRICE_FILTER_OPTIONS = [
  { value: '', label: 'Все курсы' },
  { value: 'free', label: 'Бесплатные' },
  { value: 'certificate', label: 'С сертификатом' },
];

export const COURSE_TABS = [
  { id: 'trending', label: 'В тренде' },
  { id: 'new', label: 'Новые курсы' },
  { id: 'support', label: 'Курсы с поддержкой' },
  { id: 'ege', label: 'ЕГЭ и ОГЭ' },
  { id: 'ai', label: 'ИИ на каждый день' },
];

export const PROGRAM_TABS = [
  { id: 'python', label: 'Python' },
  { id: 'data', label: 'Анализ данных' },
  { id: 'qa', label: 'QA и тестирование' },
  { id: 'web', label: 'Веб-разработка' },
  { id: 'ege', label: 'ЕГЭ и ОГЭ' },
];
