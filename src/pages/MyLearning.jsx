import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courses, enrollments } from '../api';
import { useFavorites } from '../contexts/FavoritesContext';
import {
  levelBadgeClass,
  levelLabel,
  formatCoursePrice,
} from '../utils/courseHelpers';
import FavoriteButton from '../components/FavoriteButton';

function isPowerBICourse(course) {
  return course.title && String(course.title).toLowerCase().includes('power bi');
}

function FavoriteCourseCard({ course }) {
  const showPowerBILogo = isPowerBICourse(course);
  return (
    <Link to={`/courses/${course.id}`} className="card-link course-card course-card-ref course-card-square">
      <FavoriteButton courseId={course.id} onCard />
      <div className="course-card-top">
        {showPowerBILogo && (
          <div className="course-card-logo">
            <img src="/images/powerbi-logo.png" alt="" />
          </div>
        )}
      </div>
      <div className="course-card-body">
        <h2 className="course-card-title">{course.title}</h2>
        <p className="course-card-meta">
          <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
            {levelLabel(course.level_display ?? course.level)}
          </span>
        </p>
        <p className="course-card-desc">
          {course.description
            ? course.description.slice(0, 100) + (course.description.length > 100 ? '…' : '')
            : 'Без описания'}
        </p>
        <span className="course-card-price">{formatCoursePrice(course.price)}</span>
      </div>
    </Link>
  );
}

export default function MyLearning() {
  const { favoriteIds } = useFavorites();
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolledList, setEnrolledList] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);

  useEffect(() => {
    if (favoriteIds.length === 0) {
      setAllCourses([]);
      return;
    }
    setLoading(true);
    courses
      .list()
      .then((list) => {
        const byId = new Map(list.map((c) => [c.id, c]));
        const ordered = favoriteIds.map((id) => byId.get(id)).filter(Boolean);
        setAllCourses(ordered);
      })
      .catch(() => setAllCourses([]))
      .finally(() => setLoading(false));
  }, [favoriteIds.join(',')]);

  useEffect(() => {
    enrollments
      .list()
      .then(setEnrolledList)
      .catch(() => setEnrolledList([]))
      .finally(() => setEnrollmentsLoading(false));
  }, []);

  const hasFavorites = favoriteIds.length > 0;

  return (
    <div className="page">
      <h1 className="page-title">Моё обучение</h1>

      {hasFavorites && (
        <section className="my-learning-section my-learning-favorites">
          <h2 className="my-learning-section-title">Избранные</h2>
          {loading ? (
            <p className="text-muted">Загрузка...</p>
          ) : allCourses.length === 0 ? (
            <p className="text-muted">Курсы не найдены.</p>
          ) : (
            <div className="course-grid course-grid-favorites">
              {allCourses.map((course) => (
                <FavoriteCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="my-learning-section">
        <h2 className="my-learning-section-title">Мои курсы</h2>
        <p className="page-subtitle">
          Курсы, на которые вы записались (попробовать бесплатно или купили).
        </p>
        {enrollmentsLoading ? (
          <p className="text-muted">Загрузка...</p>
        ) : enrolledList.length === 0 ? (
          <div className="my-learning-empty">
            <p className="text-muted">Пока вы не начали ни одного курса.</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <ul className="my-learning-enrolled-list">
            {enrolledList.map((e) => (
              <li key={e.id} className="my-learning-enrolled-item">
                <span className="my-learning-enrolled-title">{e.course_title}</span>
                <Link to={`/courses/${e.course}/learn`} className="btn btn-primary">
                  Продолжить
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
