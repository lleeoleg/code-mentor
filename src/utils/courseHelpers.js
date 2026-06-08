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
  if (s === 'any level' || s === 'любой') return 'all';
  return 'all';
}

export function levelBadgeClass(levelDisplayOrLevel) {
  const k = getLevelKey(levelDisplayOrLevel);
  return `badge-${k}`;
}

export function levelLabel(levelDisplayOrLevel) {
  return levelDisplayOrLevel || 'Любой';
}

export function filterCoursesByLevel(courses, levelFilter) {
  if (!levelFilter) return courses;
  return courses.filter((c) => getLevelKey(c.level_display ?? c.level) === levelFilter);
}

/** Проверка, что курс — Power BI (используем для логотипа/маркетинга). */
export function isPowerBICourse(course) {
  return course?.title && String(course.title).toLowerCase().includes('power bi');
}

/** Курс без оплаты: нет цены, 0 или нечисло — как в API (price_type=free). */
export function isCourseFree(courseOrPrice) {
  const price =
    courseOrPrice != null && typeof courseOrPrice === 'object' && !Array.isArray(courseOrPrice)
      ? courseOrPrice.price
      : courseOrPrice;
  if (price == null || price === '') return true;
  const n = Number(price);
  if (Number.isNaN(n)) return true;
  return n <= 0;
}

/** Отображаемая цена: нет цены/0 → «Бесплатно», иначе «15 590 ₸». */
export function formatCoursePrice(price, options = {}) {
  const { freeLabel = 'Бесплатно', numberLocale = 'ru-RU' } = options;
  if (price == null || price === '' || Number(price) === 0) return freeLabel;
  const n = Number(price);
  if (Number.isNaN(n)) return freeLabel;
  const formatted = new Intl.NumberFormat(numberLocale, { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  return formatted + ' ₸';
}
