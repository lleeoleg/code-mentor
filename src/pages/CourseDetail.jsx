import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { courses } from '../api';
import { levelBadgeClass, levelLabel, formatCoursePrice } from '../utils/courseHelpers';
import WantToTakeButton from '../components/WantToTakeButton';
import PaymentModal from '../components/PaymentModal';

function formatDate(s) {
  if (!s) return '—';
  try {
    const d = new Date(s);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return s;
  }
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [tryFreeLoading, setTryFreeLoading] = useState(false);

  const handleTryFree = () => {
    setTryFreeLoading(true);
    courses
      .tryFree(id)
      .then(() => navigate(`/courses/${id}/learn`))
      .catch((err) => setError(err.response?.data?.detail || err.message || 'Ошибка'))
      .finally(() => setTryFreeLoading(false));
  };

  useEffect(() => {
    courses
      .get(id)
      .then(setCourse)
      .catch((err) => setError(err.response?.status === 401 ? 'Нужно войти' : (err.message || 'Ошибка загрузки')))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page loading">Загрузка...</div>;
  if (error) return <div className="page"><div className="form-error" style={{ maxWidth: 500 }}>{error}</div></div>;
  if (!course) return <div className="page">Курс не найден.</div>;

  return (
    <div className="page">
      <Link to="/courses" className="back-link">← К списку курсов</Link>
      <article className="course-detail">
        <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
          {levelLabel(course.level_display ?? course.level)}
        </span>
        <h1 className="course-detail-title">{course.title}</h1>
        <p className="course-detail-meta">
          Обновлён: {formatDate(course.updated_at)}
        </p>

        <div className="course-detail-actions">
          <p className="course-detail-price-block">{formatCoursePrice(course.price)}</p>
          <button type="button" className="course-detail-btn course-detail-btn-primary" onClick={() => setPaymentOpen(true)}>
            Купить
          </button>
          <button
            type="button"
            className="course-detail-btn course-detail-btn-outline"
            onClick={handleTryFree}
            disabled={tryFreeLoading}
          >
            {tryFreeLoading ? 'Добавление…' : 'Попробовать бесплатно'}
          </button>
          <WantToTakeButton courseId={course.id} className="course-detail-want-btn" />
        </div>

        <div className="course-detail-description">
          {course.description || 'Описание отсутствует.'}
        </div>
      </article>
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} course={course} />
    </div>
  );
}
