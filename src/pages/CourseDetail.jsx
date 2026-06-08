import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { courses } from '../api';
import { levelBadgeClass, getLevelKey, formatCoursePrice } from '../utils/courseHelpers';
import WantToTakeButton from '../components/WantToTakeButton';
import PaymentModal from '../components/PaymentModal';

function formatDate(s, locale) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return s;
  }
}

export default function CourseDetail() {
  const { t, locale } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [tryFreeLoading, setTryFreeLoading] = useState(false);

  const handleStartLearning = () => {
    // В "Моё обучение" добавляем только по клику (не при открытии курса).
    setTryFreeLoading(true);
    courses
      .tryFree(id)
      .then(() => navigate(`/courses/${id}/learn`))
      .catch((err) => setError(err.response?.data?.detail || err.message || t('courseDetail.errorDefault')))
      .finally(() => setTryFreeLoading(false));
  };

  useEffect(() => {
    courses
      .get(id)
      .then(setCourse)
      .catch((err) => setError(err.response?.status === 401 ? t('courses.needLogin') : (err.message || t('courses.loadError'))))
      .finally(() => setLoading(false));
  }, [id, t, locale]);

  if (loading) return <div className="page loading">{t('common.loading')}</div>;
  if (error) return <div className="page"><div className="form-error" style={{ maxWidth: 500 }}>{error}</div></div>;
  if (!course) return <div className="page">{t('courseDetail.notFound')}</div>;

  const levelKey = getLevelKey(course.level_display ?? course.level);
  const isFreeCourse = course.price == null || Number(course.price) === 0;

  return (
    <div className="page">
      <Link to="/courses" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        {t('courseDetail.toCourseList')}
      </Link>

      <div className="cd-layout">
        {/* Left: main info */}
        <article className="cd-main">
          <div className="cd-badges">
            <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
              {t('home.' + (levelKey === 'all' ? 'any' : levelKey))}
            </span>
          </div>

          <h1 className="cd-title">{course.title}</h1>

          <div className="cd-meta-row">
            <span className="cd-meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              {t('courseDetail.updated')} {formatDate(course.updated_at, locale)}
            </span>
          </div>

          <p className="cd-description">
            {course.description || t('courseDetail.noDescription')}
          </p>

          <div className="cd-features">
            <div className="cd-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span>{locale === 'ru' ? 'Сертификат по завершении' : 'Certificate upon completion'}</span>
            </div>
            <div className="cd-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>{locale === 'ru' ? 'Доступ в любое время' : 'Access anytime'}</span>
            </div>
            <div className="cd-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span>{locale === 'ru' ? 'Практические задания' : 'Hands-on exercises'}</span>
            </div>
          </div>
        </article>

        {/* Right: purchase card */}
        <aside className="cd-card">
          <div className="cd-card-price">
            {formatCoursePrice(course.price, {
              freeLabel: t('common.priceFree'),
              numberLocale: locale === 'en' ? 'en-US' : 'ru-RU',
            })}
          </div>

          {isFreeCourse ? (
            <button
              type="button"
              className="cd-btn cd-btn-primary"
              onClick={handleStartLearning}
              disabled={tryFreeLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="5 3 19 12 5 21 5 3"/></svg>
              {tryFreeLoading
                ? t('courseDetail.adding')
                : (locale === 'en' ? 'Start course for free' : 'Начать курс бесплатно')}
            </button>
          ) : (
            <>
              <button
                type="button"
                className="cd-btn cd-btn-primary"
                onClick={() => setPaymentOpen(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {t('courseDetail.buy')}
              </button>
              <button
                type="button"
                className="cd-btn cd-btn-outline"
                onClick={handleStartLearning}
                disabled={tryFreeLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="5 3 19 12 5 21 5 3"/></svg>
                {tryFreeLoading
                  ? t('courseDetail.adding')
                  : (locale === 'en' ? 'Try for free' : 'Попробовать бесплатно')}
              </button>
            </>
          )}

          <WantToTakeButton courseId={course.id} className="cd-btn cd-btn-ghost" />

          <div className="cd-card-divider" />

          <ul className="cd-card-perks">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
              {locale === 'ru' ? 'Полный доступ к материалам' : 'Full access to materials'}
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
              {locale === 'ru' ? 'Итоговый экзамен' : 'Final exam'}
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
              {locale === 'ru' ? 'Сертификат об окончании' : 'Completion certificate'}
            </li>
          </ul>
        </aside>
      </div>

      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} course={course} />
    </div>
  );
}
