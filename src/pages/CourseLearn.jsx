import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { courses, lessons } from '../api';
import { formatCoursePrice } from '../utils/courseHelpers';
import Comments from '../components/Comments';
import './CourseLearn.css';

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
  return idx >= 0 && idx < all.length - 1 ? all[idx + 1].id : null;
}

export default function CourseLearn() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const lessonIdParam = searchParams.get('lesson');
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonError, setLessonError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([courses.get(id), courses.curriculum(id)])
      .then(([c, curr]) => {
        setCourse(c);
        setCurriculum(curr);
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [id]);

  const allLessons = getAllLessons(curriculum);
  const currentLessonId = lessonIdParam ? Number(lessonIdParam) : getFirstLessonId(curriculum);

  useEffect(() => {
    if (!currentLessonId || !allLessons.length) {
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
        setLessonError(data?.detail || 'Урок недоступен');
      });
  }, [currentLessonId, allLessons.length]);

  const setLesson = (lesId) => {
    setSearchParams(lesId ? { lesson: lesId } : {});
  };

  const nextLessonId = getNextLessonId(curriculum, currentLessonId);

  if (loading) return <div className="course-learn loading">Загрузка курса...</div>;
  if (!course) return <div className="page"><div className="form-error">Курс не найден.</div></div>;

  return (
    <div className="course-learn">
      <header className="course-learn-header">
        <div className="course-learn-header-inner">
          <Link to={`/courses/${id}`} className="course-learn-back">← Курс</Link>
          <h1 className="course-learn-title">{course.title}</h1>
          <Link to={`/courses/${id}`} className="course-learn-buy-btn">
            Купить курс за {formatCoursePrice(course.price)}
          </Link>
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
                        className={`course-learn-lesson-btn ${currentLessonId === les.id ? 'active' : ''}`}
                        onClick={() => setLesson(les.id)}
                      >
                        {!les.is_free && (
                          <span className="course-learn-lock" title="Платный контент" aria-hidden>
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
          </nav>
        </aside>

        <main className="course-learn-main">
          {lessonError && !currentLesson?.locked && (
            <p className="course-learn-error">{lessonError}</p>
          )}
          {currentLesson?.locked && (
            <div className="course-learn-locked">
              <p>Этот урок доступен после записи на курс или покупки.</p>
              <Link to={`/courses/${id}`} className="btn btn-primary">Перейти к курсу</Link>
            </div>
          )}
          {currentLesson && !currentLesson.locked && (
            <>
              <h2 className="course-learn-lesson-title">{currentLesson.title}</h2>
              <div className="course-learn-content">
                {currentLesson.content_type === 'video' && currentLesson.content ? (
                  <div className="course-learn-video-wrap">
                    <iframe
                      title={currentLesson.title}
                      src={currentLesson.content}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="course-learn-text" dangerouslySetInnerHTML={{ __html: (currentLesson.content || '').replace(/\n/g, '<br/>') }} />
                )}
              </div>
              <div className="course-learn-footer">
                {nextLessonId ? (
                  <button
                    type="button"
                    className="course-learn-next-btn"
                    onClick={() => setLesson(nextLessonId)}
                  >
                    Следующий шаг →
                  </button>
                ) : (
                  <Link to={`/courses/${id}`} className="course-learn-next-btn">К списку курсов</Link>
                )}
              </div>
              <Comments lessonId={currentLessonId} />
            </>
          )}
          {!currentLesson && !lessonError && allLessons.length > 0 && (
            <p className="text-muted">Выберите урок в меню слева.</p>
          )}
        </main>
      </div>
    </div>
  );
}
