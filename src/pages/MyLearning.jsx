import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courses, enrollments, exams } from '../api';
import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  levelBadgeClass,
  getLevelKey,
  formatCoursePrice,
} from '../utils/courseHelpers';
import { getCourseLogo } from '../utils/courseLogos';
import FavoriteButton from '../components/FavoriteButton';
import { getCompletedLessonIds } from '../utils/progressStore';

function FavoriteCourseCard({ course }) {
  const { t } = useLanguage();
  const logo = getCourseLogo(course);
  const levelKey = getLevelKey(course.level_display ?? course.level);
  return (
    <Link to={`/courses/${course.id}`} className="card-link course-card course-card-ref course-card-square">
      <FavoriteButton courseId={course.id} onCard />
      <div className="course-card-top">
        {logo && (
          <div className="course-card-logo">
            <img src={logo.src} alt={logo.alt || ''} />
          </div>
        )}
      </div>
      <div className="course-card-body">
        <h2 className="course-card-title">{course.title}</h2>
        <p className="course-card-meta">
          <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
            {t('home.' + (levelKey === 'all' ? 'any' : levelKey))}
          </span>
        </p>
        <p className="course-card-desc">
          {course.description
            ? course.description.slice(0, 100) + (course.description.length > 100 ? '…' : '')
            : t('home.noDescription')}
        </p>
        <span className="course-card-price">{formatCoursePrice(course.price, course)}</span>
      </div>
    </Link>
  );
}

export default function MyLearning() {
  const { t, locale } = useLanguage();
  const { favoriteIds } = useFavorites();
  const [, setProgressTick] = useState(0);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [enrolledList, setEnrolledList] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [examInfoByCourse, setExamInfoByCourse] = useState({});
  const [curriculumByCourse, setCurriculumByCourse] = useState({});

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

  useEffect(() => {
    const onProgressSynced = () => setProgressTick((n) => n + 1);
    window.addEventListener('lessonProgressSynced', onProgressSynced);
    return () => window.removeEventListener('lessonProgressSynced', onProgressSynced);
  }, []);

  useEffect(() => {
    if (!enrolledList.length) {
      setExamInfoByCourse({});
      return;
    }
    let cancelled = false;
    Promise.all(
      enrolledList.map((e) =>
        exams
          .info(e.course, { lang: locale })
          .then((data) => [e.course, data])
          .catch(() => [e.course, { has_exam: false }])
      )
    ).then((pairs) => {
      if (cancelled) return;
      const next = {};
      pairs.forEach(([courseId, data]) => {
        next[String(courseId)] = data;
      });
      setExamInfoByCourse(next);
    });
    return () => {
      cancelled = true;
    };
  }, [enrolledList, locale]);

  useEffect(() => {
    if (!enrolledList.length) {
      setCurriculumByCourse({});
      return;
    }
    let cancelled = false;
    Promise.all(
      enrolledList.map((e) =>
        courses
          .curriculum(e.course)
          .then((curr) => [e.course, curr])
          .catch(() => [e.course, []])
      )
    ).then((pairs) => {
      if (cancelled) return;
      const next = {};
      pairs.forEach(([courseId, curr]) => {
        next[String(courseId)] = curr;
      });
      setCurriculumByCourse(next);
    });
    return () => {
      cancelled = true;
    };
  }, [enrolledList]);

  const countLessons = (modules) =>
    (modules || []).reduce((sum, m) => sum + ((m.lessons || []).length), 0);

  const formatResetAt = (dt) => {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      return d.toLocaleString(locale === 'en' ? 'en-US' : 'ru-RU');
    } catch {
      return String(dt);
    }
  };

  const formatCountdown = (dt) => {
    if (!dt) return '';
    const ms = new Date(dt).getTime() - Date.now();
    if (!Number.isFinite(ms)) return '';
    const left = Math.max(0, ms);
    const h = Math.floor(left / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const hasFavorites = favoriteIds.length > 0;

  return (
    <div className="page">
      <h1 className="page-title">{t('myLearning.title')}</h1>

      {hasFavorites && (
        <section className="my-learning-section my-learning-favorites">
          <h2 className="my-learning-section-title">{t('myLearning.favorites')}</h2>
          {loading ? (
            <p className="text-muted">{t('myLearning.loading')}</p>
          ) : allCourses.length === 0 ? (
            <p className="text-muted">{t('myLearning.coursesNotFound')}</p>
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
        <h2 className="my-learning-section-title">{t('myLearning.myCourses')}</h2>
        <p className="page-subtitle">
          {t('myLearning.enrolledSubtitle')}
        </p>
        {enrollmentsLoading ? (
          <p className="text-muted">{t('myLearning.loading')}</p>
        ) : enrolledList.length === 0 ? (
          <div className="my-learning-empty">
            <p className="text-muted">{t('myLearning.noStarted')}</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>
              {t('myLearning.goToCatalog')}
            </Link>
          </div>
        ) : (
          <ul className="my-learning-enrolled-list">
            {enrolledList.map((e) => (
              <li key={e.id} className="my-learning-enrolled-item">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="my-learning-enrolled-title">{e.course_title}</div>
                  {(() => {
                    const info = examInfoByCourse[String(e.course)];
                    if (!info || !info.has_exam) return null;
                    const last = info.last_attempt;
                    const totalLessons = countLessons(curriculumByCourse[String(e.course)] || []);
                    const completed = getCompletedLessonIds(e.course);
                    const percent = totalLessons ? Math.min(100, Math.round((completed.length / totalLessons) * 100)) : 0;
                    return (
                      <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        <div style={{ marginBottom: 6 }}>
                          {locale === 'ru' ? 'Прогресс курса: ' : 'Course progress: '}
                          <strong>{percent}%</strong>
                          {totalLessons ? (
                            <span> ({completed.length}/{totalLessons})</span>
                          ) : null}
                          <div style={{ marginTop: 6, height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${percent}%`, height: '100%', background: '#16a34a' }} />
                          </div>
                        </div>
                        <div>
                          {locale === 'ru' ? 'Попыток осталось (3ч): ' : 'Attempts left (3h): '}
                          <strong>{info.attempts_left_24h}</strong>
                          {info.attempts_reset_at ? (
                            <>
                              {' • '}
                              {locale === 'ru' ? 'Снова можно через: ' : 'Available in: '}
                              <strong>{formatCountdown(info.attempts_reset_at)}</strong>
                              {' • '}
                              {locale === 'ru' ? 'Обновятся: ' : 'Resets at: '}
                              <strong>{formatResetAt(info.attempts_reset_at)}</strong>
                            </>
                          ) : null}
                        </div>
                        {last ? (
                          <div style={{ marginTop: 4 }}>
                            {locale === 'ru' ? 'Последняя попытка: ' : 'Last attempt: '}
                            <strong>{last.score_percent}%</strong>
                            {' • '}
                            <span>{last.status}</span>
                          </div>
                        ) : null}
                        {Array.isArray(info.attempts_recent) && info.attempts_recent.length > 0 ? (
                          <details style={{ marginTop: 6 }}>
                            <summary style={{ cursor: 'pointer' }}>
                              {locale === 'ru' ? 'История тестирований' : 'Exam history'}
                            </summary>
                            <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                              {info.attempts_recent.map((a) => (
                                <li key={a.id}>
                                  <strong>{a.score_percent}%</strong> — {a.status}{' '}
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    ({formatResetAt(a.submitted_at || a.started_at)})
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Link to={`/courses/${e.course}/learn`} className="btn btn-primary">
                    {t('myLearning.continue')}
                  </Link>
                  <Link to={`/courses/${e.course}/learn?lesson=exam`} className="btn btn-secondary">
                    {locale === 'ru' ? 'Тест' : 'Exam'}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
