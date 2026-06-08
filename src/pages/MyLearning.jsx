import { useState, useEffect, useRef } from 'react';
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
  const { t, locale } = useLanguage();
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
        <span className="course-card-price">
          {formatCoursePrice(course.price, {
            freeLabel: t('common.priceFree'),
            numberLocale: locale === 'en' ? 'en-US' : 'ru-RU',
          })}
        </span>
      </div>
    </Link>
  );
}

function FavoritesSlider({ courses, loading, title, emptyText, loadingText }) {
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const [scrollPct, setScrollPct] = useState(0);

  const isDraggingTrack = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const isDraggingThumb = useRef(false);
  const thumbDragStartX = useRef(0);
  const thumbDragStartScroll = useRef(0);

  const updateScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setScrollPct(max > 0 ? el.scrollLeft / max : 0);
  };

  const onTrackMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingTrack.current = true;
    dragStartX.current = e.clientX;
    dragStartScroll.current = trackRef.current.scrollLeft;
    e.preventDefault();
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDraggingTrack.current) {
        trackRef.current.scrollLeft = dragStartScroll.current - (e.clientX - dragStartX.current);
      }
      if (isDraggingThumb.current) {
        const bar = barRef.current;
        const track = trackRef.current;
        if (!bar || !track) return;
        const barW = bar.clientWidth;
        const dx = e.clientX - thumbDragStartX.current;
        const max = track.scrollWidth - track.clientWidth;
        track.scrollLeft = thumbDragStartScroll.current + (dx / (barW * 0.8)) * max;
      }
    };
    const onMouseUp = () => {
      isDraggingTrack.current = false;
      isDraggingThumb.current = false;
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onThumbMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingThumb.current = true;
    thumbDragStartX.current = e.clientX;
    thumbDragStartScroll.current = trackRef.current.scrollLeft;
    e.preventDefault();
    e.stopPropagation();
  };

  const onBarClick = (e) => {
    const bar = barRef.current;
    const track = trackRef.current;
    if (!bar || !track) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    track.scrollLeft = pct * (track.scrollWidth - track.clientWidth);
  };

  return (
    <section className="my-learning-section">
      <h2 className="my-learning-section-title">{title}</h2>
      {loading ? (
        <p className="text-muted">{loadingText}</p>
      ) : courses.length === 0 ? (
        <p className="text-muted">{emptyText}</p>
      ) : (
        <div className="fav-slider">
          <div
            className="fav-slider-track"
            ref={trackRef}
            onScroll={updateScroll}
            onMouseDown={onTrackMouseDown}
          >
            {courses.map((course) => (
              <FavoriteCourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="fav-slider-nav">
            <div className="fav-slider-bar" ref={barRef} onClick={onBarClick}>
              <div
                className="fav-slider-thumb"
                style={{ left: `calc(${scrollPct * 80}%)` }}
                onMouseDown={onThumbMouseDown}
              />
            </div>
          </div>
        </div>
      )}
    </section>
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
  }, [favoriteIds.join(','), locale]);

  useEffect(() => {
    enrollments
      .list()
      .then(setEnrolledList)
      .catch(() => setEnrolledList([]))
      .finally(() => setEnrollmentsLoading(false));
  }, [locale]);

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
  }, [enrolledList, locale]);

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
        <FavoritesSlider
          courses={allCourses}
          loading={loading}
          title={t('myLearning.favorites')}
          emptyText={t('myLearning.coursesNotFound')}
          loadingText={t('myLearning.loading')}
        />
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
                      <div className="enrolled-meta">
                        <div className="enrolled-progress-row">
                          <span className="enrolled-progress-label">
                            {locale === 'ru' ? 'Прогресс курса: ' : 'Course progress: '}
                            <strong>{percent}%</strong>
                            {totalLessons ? <span className="enrolled-progress-count"> ({completed.length}/{totalLessons})</span> : null}
                          </span>
                          <div className="enrolled-progress-bar">
                            <div className="enrolled-progress-fill" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                        <div className="enrolled-meta-row">
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
                          <div className="enrolled-meta-row">
                            {locale === 'ru' ? 'Последняя попытка: ' : 'Last attempt: '}
                            <strong>{last.score_percent}%</strong>
                            {' • '}
                            <span className={last.status === 'passed' ? 'enrolled-status-pass' : 'enrolled-status-fail'}>{last.status}</span>
                          </div>
                        ) : null}
                        {Array.isArray(info.attempts_recent) && info.attempts_recent.length > 0 ? (
                          <details className="enrolled-history">
                            <summary>
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
                <div className="enrolled-actions">
                  <Link
                    to={`/courses/${e.course}/learn`}
                    className="btn btn-primary enrolled-action-btn"
                    data-tooltip={t('myLearning.continue')}
                    aria-label={t('myLearning.continue')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </Link>
                  <Link
                    to={`/courses/${e.course}/learn?lesson=exam`}
                    className="btn btn-secondary enrolled-action-btn enrolled-action-btn--exam"
                    data-tooltip={locale === 'ru' ? 'Итоговый тест' : 'Final Exam'}
                    aria-label={locale === 'ru' ? 'Итоговый тест' : 'Final Exam'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
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
