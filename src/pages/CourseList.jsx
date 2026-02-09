import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courses } from '../api';
import {
  levelBadgeClass,
  levelLabel,
  formatCoursePrice,
  LEVEL_FILTER_OPTIONS,
  PRICE_FILTER_OPTIONS,
  filterCoursesByLevel,
} from '../utils/courseHelpers';
import FavoriteButton from '../components/FavoriteButton';

function filterBySearch(coursesList, query) {
  if (!query || !query.trim()) return coursesList;
  const lower = query.trim().toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  return coursesList.filter((c) => {
    const title = (c.title || '').toLowerCase();
    const desc = (c.description || '').toLowerCase();
    return words.every((word) => title.includes(word) || desc.includes(word));
  });
}

function isPowerBICourse(course) {
  return course.title && String(course.title).toLowerCase().includes('power bi');
}

export default function CourseList() {
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get('q') || '';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState('');
  // Читаем фильтр по цене из URL при первой загрузке
  const [priceFilter, setPriceFilter] = useState(() => searchParams.get('price_type') || '');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (priceFilter) params.price_type = priceFilter;
    if (searchQ.trim()) params.q = searchQ.trim();
    courses
      .list(params)
      .then(setList)
      .catch((err) => setError(err.response?.status === 401 ? 'Нужно войти' : (err.message || 'Ошибка загрузки')))
      .finally(() => setLoading(false));
  }, [priceFilter, searchQ]);

  const byLevel = filterCoursesByLevel(list, levelFilter);
  const filtered = byLevel;

  if (loading) return <div className="page loading">Загрузка курсов...</div>;
  if (error) return <div className="page"><div className="form-error" style={{ maxWidth: 500 }}>{error}</div></div>;

  return (
    <div className="page">
      <h1 className="page-title">Каталог курсов</h1>
      <p className="page-subtitle">
        {searchQ ? `Поиск: «${searchQ}»` : 'Выберите курс для изучения'}
      </p>

      <div className="filter-bar">
        <span className="filter-label">Цена:</span>
        {PRICE_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all'}
            type="button"
            className={`filter-chip ${priceFilter === opt.value ? 'active' : ''}`}
            onClick={() => setPriceFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="filter-bar">
        <span className="filter-label">Уровень:</span>
        {LEVEL_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all'}
            type="button"
            className={`filter-chip ${levelFilter === opt.value ? 'active' : ''}`}
            onClick={() => setLevelFilter(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="course-grid">
        {filtered.length === 0 ? (
          <p className="text-muted">
            {list.length === 0
              ? 'Пока нет курсов.'
              : searchQ
                ? 'По запросу ничего не найдено.'
                : 'Нет курсов по выбранному уровню.'}
          </p>
        ) : (
          filtered.map((course) => {
            const showPowerBILogo = isPowerBICourse(course);
            return (
              <Link key={course.id} to={`/courses/${course.id}`} className="card-link course-card course-card-square course-card-catalog">
                <FavoriteButton courseId={course.id} onCard />
                <div className="course-card-top">
                  {showPowerBILogo && (
                    <div className="course-card-logo">
                      <img src="/images/powerbi-logo.png" alt="" />
                    </div>
                  )}
                </div>
                <div className="course-card-body">
                  <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
                    {levelLabel(course.level_display ?? course.level)}
                  </span>
                  <h2 className="course-card-title">{course.title}</h2>
                  <p className="course-card-desc">
                    {course.description
                      ? course.description.slice(0, 120) + (course.description.length > 120 ? '…' : '')
                      : 'Без описания'}
                  </p>
                  <span className="course-card-price">{formatCoursePrice(course.price)}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
