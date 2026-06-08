import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { courses, lessons, enrollments } from '../api';
import { formatCoursePrice, isCourseFree } from '../utils/courseHelpers';
import Comments from '../components/Comments';
import CourseFinalExam from '../components/CourseFinalExam';
import PythonEditor from '../components/PythonEditor';
import { getCompletedLessonIds, markLessonCompleted } from '../utils/progressStore';
import './CourseLearn.css';

function formatLessonHtml(content) {
  const raw = content || '';
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }
  return raw.replace(/\n/g, '<br/>');
}

function getAllLessons(modules) {
  const list = [];
  (modules || []).forEach((mod) => {
    (mod.lessons || []).forEach((les) => list.push({ ...les, moduleOrder: mod.order }));
  });
  return list;
}

function getFirstLessonId(modules) {
  const all = getAllLessons(modules);
  return all.length ? all[0].id : null;
}

function getNextLessonId(modules, currentId) {
  const all = getAllLessons(modules);
  const idx = all.findIndex((l) => l.id === currentId);
  if (idx >= 0 && idx < all.length - 1) return all[idx + 1].id;
  if (idx === all.length - 1) return 'exam';
  return null;
}

export default function CourseLearn() {
  const { t, locale } = useLanguage();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lesson');
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonError, setLessonError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedIds, setCompletedIds] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([courses.get(id), courses.curriculum(id), enrollments.list()])
      .then(([c, curr, enr]) => {
        if (cancelled) return;
        setCourse(c);
        setCurriculum(curr);
        setCompletedIds(getCompletedLessonIds(id));
        const courseIdNum = Number(id);
        const enrolled = Array.isArray(enr) && enr.some((e) => Number(e.course) === courseIdNum);
        const hasToken = Boolean(typeof localStorage !== 'undefined' && localStorage.getItem('access'));
        setIsEnrolled(Boolean(enrolled || (isCourseFree(c) && hasToken)));
      })
      .catch(() => {
        if (cancelled) return;
        setCourse(null);
        setCurriculum([]);
        setIsEnrolled(false);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, locale]);

  useEffect(() => {
    const onProgressSynced = () => setCompletedIds(getCompletedLessonIds(id));
    window.addEventListener('lessonProgressSynced', onProgressSynced);
    return () => window.removeEventListener('lessonProgressSynced', onProgressSynced);
  }, [id]);

  const handleEnrollAndStart = () => {
    if (enrollLoading) return;
    setEnrollLoading(true);
    courses
      .tryFree(id)
      .then(() => setIsEnrolled(true))
      .catch(() => {
        // Не блокируем просмотр страницы; просто не удалось записаться.
      })
      .finally(() => setEnrollLoading(false));
  };

  const allLessons = getAllLessons(curriculum);
  const currentLessonId = lessonIdParam === 'exam'
    ? 'exam'
    : (lessonIdParam ? Number(lessonIdParam) : getFirstLessonId(curriculum));

  useEffect(() => {
    if (!currentLessonId || !allLessons.length || currentLessonId === 'exam') {
      setCurrentLesson(null);
      setLessonError(null);
      return;
    }
    setLessonError(null);
    lessons
      .get(currentLessonId)
      .then(setCurrentLesson)
      .catch((err) => {
        const data = err.response?.data;
        setCurrentLesson(data?.locked ? { locked: true, detail: data.detail } : null);
        setLessonError(data?.detail || t('courseDetail.lessonUnavailable'));
      });
  }, [currentLessonId, allLessons.length, t, locale]);

  const setLesson = (lesId) => {
    setSearchParams(lesId ? { lesson: String(lesId) } : {});
  };

  const completeCurrentLesson = () => {
    if (typeof currentLessonId !== 'number') return;
    markLessonCompleted(id, currentLessonId);
    setCompletedIds(getCompletedLessonIds(id));
  };

  const nextLessonId = getNextLessonId(curriculum, currentLessonId);

  if (loading) return <div className="course-learn loading">{t('courseLearn.loading')}</div>;
  if (!course) return <div className="page"><div className="form-error">{t('courseDetail.notFound')}</div></div>;

  return (
    <div className="course-learn">
      <header className="course-learn-header">
        <div className="course-learn-header-inner">
          <Link to={`/courses/${id}`} className="course-learn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            {t('courseDetail.backToCourse')}
          </Link>
          <h1 className="course-learn-title">{course.title}</h1>
          {!isCourseFree(course) && (
            <Link
              to={`/courses/${id}`}
              className="course-learn-buy-btn"
            >
              {t('courseDetail.buyCourseFor')}{' '}
              {formatCoursePrice(course.price, {
                freeLabel: t('common.priceFree'),
                numberLocale: locale === 'en' ? 'en-US' : 'ru-RU',
              })}
            </Link>
          )}
        </div>
      </header>

      <div className="course-learn-body">
        <aside className="course-learn-sidebar">
          <div className="course-learn-sidebar-title">
            <span>{course.title}</span>
          </div>
          <nav className="course-learn-nav">
            {curriculum.map((mod) => (
              <div key={mod.id} className="course-learn-module">
                <div className="course-learn-module-title">
                  {mod.order}. {mod.title}
                </div>
                <ul className="course-learn-lessons">
                  {mod.lessons.map((les) => (
                    <li key={les.id}>
                      <button
                        type="button"
                        className={`course-learn-lesson-btn ${currentLessonId === les.id ? 'active' : ''} ${completedIds.includes(les.id) ? 'done' : ''}`}
                        onClick={() => setLesson(les.id)}
                      >
                        {les.content_type === 'code' && (
                          <span className="course-learn-code-icon" aria-hidden title={t('courseLearn.practiceTitle')}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                            </svg>
                          </span>
                        )}
                        {!les.is_free && (
                          <span className="course-learn-lock" title={t('courseLearn.paidContent')} aria-hidden>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          </span>
                        )}
                        <span>{mod.order}.{les.order} {les.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="course-learn-module">
              <div className="course-learn-module-title">
                {t('courseLearn.examModule')}
              </div>
              <ul className="course-learn-lessons">
                <li>
                  <button
                    type="button"
                    className={`course-learn-lesson-btn ${currentLessonId === 'exam' ? 'active' : ''}`}
                    onClick={() => setLesson('exam')}
                  >
                    <span>{t('courseLearn.examLesson')}</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <main className="course-learn-main">
          {!isEnrolled && (
            <div className="course-learn-locked" style={{ marginBottom: 16 }}>
              <p>
                {t('courseDetail.locked')}
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleEnrollAndStart}
                disabled={enrollLoading}
              >
                {enrollLoading ? t('courseDetail.adding') : (t('courseDetail.wantToTake') || 'Начать обучение')}
              </button>
            </div>
          )}
          {currentLessonId === 'exam' && (
            <CourseFinalExam courseId={id} />
          )}
          {lessonError && !currentLesson?.locked && (
            <p className="course-learn-error">{lessonError}</p>
          )}
          {currentLesson?.locked && (
            <div className="course-learn-locked">
              <p>{t('courseDetail.locked')}</p>
              <Link to={`/courses/${id}`} className="btn btn-primary">{t('courseDetail.goToCourse')}</Link>
            </div>
          )}
          {currentLesson && !currentLesson.locked && (
            <>
              <h2 className="course-learn-lesson-title">{currentLesson.title}</h2>
              <div className="course-learn-content">
                {currentLesson.content_type === 'video' && currentLesson.content ? (
                  <div className="course-learn-video-block">
                    <div className="course-learn-video-wrap">
                      <iframe
                        title={currentLesson.title}
                        src={currentLesson.content}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    {currentLesson.video_summary ? (
                      <div className="course-learn-video-summary">
                        <h3 className="course-learn-video-summary-title">{t('courseLearn.videoSummaryHeading')}</h3>
                        <p className="course-learn-video-summary-text">{currentLesson.video_summary}</p>
                      </div>
                    ) : null}
                  </div>
                ) : currentLesson.content_type === 'code' ? (
                  <PythonEditor lessonData={currentLesson.content} />
                ) : (
                  <div className="course-learn-text" dangerouslySetInnerHTML={{ __html: formatLessonHtml(currentLesson.content) }} />
                )}
              </div>
              <div className="course-learn-footer">
                {nextLessonId ? (
                  nextLessonId === 'exam' ? (
                    <button
                      type="button"
                      className="course-learn-next-btn"
                      onClick={() => { completeCurrentLesson(); setLesson('exam'); }}
                    >
                      {t('courseDetail.nextStep')}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="course-learn-next-btn"
                      onClick={() => { completeCurrentLesson(); setLesson(nextLessonId); }}
                    >
                      {t('courseDetail.nextStep')}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                    </button>
                  )
                ) : (
                  <Link to={`/courses/${id}`} className="course-learn-next-btn">
                    {t('courseDetail.toCourseList')}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  </Link>
                )}
              </div>
              <Comments lessonId={Number(currentLessonId)} />
            </>
          )}
          {currentLessonId !== 'exam' && !currentLesson && !lessonError && allLessons.length > 0 && (
            <p className="text-muted">{t('courseDetail.chooseLesson')}</p>
          )}
        </main>
      </div>
    </div>
  );
}
