import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { courses } from '../api';
import {
  levelBadgeClass,
  getLevelKey,
  formatCoursePrice,
  LEVEL_FILTER_OPTIONS,
  PRICE_FILTER_OPTIONS,
  filterCoursesByLevel,
} from '../utils/courseHelpers';
import { getCourseLogo } from '../utils/courseLogos';
import FavoriteButton from '../components/FavoriteButton';

function levelOptionLabel(value, t) {
  if (value === '') return t('home.allLevels');
  if (value === 'all') return t('home.any');
  return t('home.' + value);
}

function priceOptionLabel(value, t) {
  if (value === '') return t('courses.all');
  if (value === 'free') return t('courses.free');
  if (value === 'certificate') return t('courses.withCertificate');
  return t('courses.all');
}

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

export default function CourseList() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const searchQ = searchParams.get('q') || '';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState(() => searchParams.get('price_type') || '');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (priceFilter) params.price_type = priceFilter;
    if (searchQ.trim()) params.q = searchQ.trim();
    courses
      .list(params)
      .then(setList)
      .catch((err) => setError(err.response?.status === 401 ? t('courses.needLogin') : (err.message || t('courses.loadError'))))
      .finally(() => setLoading(false));
  }, [priceFilter, searchQ, t]);

  const byLevel = filterCoursesByLevel(list, levelFilter);
  const filtered = byLevel;

  if (loading) return <div className="page loading">{t('courses.loading')}</div>;
  if (error) return <div className="page"><div className="form-error" style={{ maxWidth: 500 }}>{error}</div></div>;

  return (
    <div className="page">
      <h1 className="page-title">{t('courses.catalog')}</h1>
      <p className="page-subtitle">
        {searchQ ? `${t('courses.search')}: «${searchQ}»` : t('courses.chooseCourse')}
      </p>

      <div className="filter-bar">
        <span className="filter-label">{t('courses.price')}:</span>
        {PRICE_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all'}
            type="button"
            className={`filter-chip ${priceFilter === opt.value ? 'active' : ''}`}
            onClick={() => setPriceFilter(opt.value)}
          >
            {priceOptionLabel(opt.value, t)}
          </button>
        ))}
      </div>
      <div className="filter-bar">
        <span className="filter-label">{t('courses.level')}:</span>
        {LEVEL_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value || 'all'}
            type="button"
            className={`filter-chip ${levelFilter === opt.value ? 'active' : ''}`}
            onClick={() => setLevelFilter(opt.value)}
          >
            {levelOptionLabel(opt.value, t)}
          </button>
        ))}
      </div>

      <div className="course-grid">
        {filtered.length === 0 ? (
          <p className="text-muted">
            {list.length === 0
              ? t('courses.noCourses')
              : searchQ
                ? t('courses.searchResult')
                : t('courses.noCoursesByLevel')}
          </p>
        ) : (
          filtered.map((course) => {
            const logo = getCourseLogo(course);
            const levelKey = getLevelKey(course.level_display ?? course.level);
            return (
              <Link key={course.id} to={`/courses/${course.id}`} className="card-link course-card course-card-square course-card-catalog">
                <FavoriteButton courseId={course.id} onCard />
                <div className="course-card-top">
                  {logo && (
                    <div className="course-card-logo">
                      <img src={logo.src} alt={logo.alt || ''} />
                    </div>
                  )}
                </div>
                <div className="course-card-body">
                  <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
                    {t('home.' + (levelKey === 'all' ? 'any' : levelKey))}
                  </span>
                  <h2 className="course-card-title">{course.title}</h2>
                  <p className="course-card-desc">
                    {course.description
                      ? course.description.slice(0, 120) + (course.description.length > 120 ? '…' : '')
                      : t('home.noDescription')}
                  </p>
                  <span className="course-card-price">{formatCoursePrice(course.price, course)}</span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
