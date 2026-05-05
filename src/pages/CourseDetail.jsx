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
  }, [id, t]);

  if (loading) return <div className="page loading">{t('common.loading')}</div>;
  if (error) return <div className="page"><div className="form-error" style={{ maxWidth: 500 }}>{error}</div></div>;
  if (!course) return <div className="page">{t('courseDetail.notFound')}</div>;

  const levelKey = getLevelKey(course.level_display ?? course.level);
  const isFreeCourse = course.price == null || Number(course.price) === 0;

  return (
    <div className="page">
      <Link to="/courses" className="back-link">{t('courseDetail.toCourseList')}</Link>
      <article className="course-detail">
        <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
          {t('home.' + (levelKey === 'all' ? 'any' : levelKey))}
        </span>
        <h1 className="course-detail-title">{course.title}</h1>
        <p className="course-detail-meta">
          {t('courseDetail.updated')} {formatDate(course.updated_at, locale)}
        </p>

        <div className="course-detail-actions">
          <p className="course-detail-price-block">{formatCoursePrice(course.price, course)}</p>
          <button type="button" className="course-detail-btn course-detail-btn-primary" onClick={() => setPaymentOpen(true)}>
            {t('courseDetail.buy')}
          </button>
          <button
            type="button"
            className="course-detail-btn course-detail-btn-outline"
            onClick={handleStartLearning}
            disabled={tryFreeLoading}
          >
            {tryFreeLoading
              ? t('courseDetail.adding')
              : (isFreeCourse
                ? (locale === 'en' ? 'I want to learn' : 'Хочу пройти')
                : (locale === 'en' ? 'Try for free' : 'Попробовать бесплатно'))}
          </button>
          <WantToTakeButton courseId={course.id} className="course-detail-want-btn" />
        </div>

        <div className="course-detail-description">
          {course.description || t('courseDetail.noDescription')}
        </div>
      </article>
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} course={course} />
    </div>
  );
}
