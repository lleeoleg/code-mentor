import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courses } from '../api';
import {
  levelBadgeClass,
  levelLabel,
  formatCoursePrice,
  LEVEL_FILTER_OPTIONS,
  filterCoursesByLevel,
} from '../utils/courseHelpers';
import FavoriteButton from '../components/FavoriteButton';
import './Home.css';

const COURSE_TABS = [
  { id: 'trending', label: 'В тренде' },
  { id: 'new', label: 'Новые курсы' },
  { id: 'support', label: 'Курсы с поддержкой' },
  { id: 'ege', label: 'Подготовка к ЕГЭ и ОГЭ' },
  { id: 'ai', label: 'ИИ на каждый день' },
];

const PROGRAM_TABS = [
  { id: 'python', label: 'Python' },
  { id: 'data', label: 'Анализ данных' },
  { id: 'qa', label: 'QA и тестирование ПО' },
  { id: 'web', label: 'Веб-разработка' },
  { id: 'ege', label: 'ЕГЭ и ОГЭ' },
];

function isPowerBICourse(course) {
  return course.title && String(course.title).toLowerCase().includes('power bi');
}

function CourseCard({ course, hideLevel }) {
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
        {!hideLevel && (
          <p className="course-card-meta">
            <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
              {levelLabel(course.level_display ?? course.level)}
            </span>
          </p>
        )}
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

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [levelFilter, setLevelFilter] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const [activeProgramTab, setActiveProgramTab] = useState('python');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState(''); // '', 'free', 'certificate'

  useEffect(() => {
    setLoading(true);
    setError(null);
    courses
      .list()
      .then(setCourseList)
      .catch((err) => {
        setError(err.response?.status === 401 ? null : (err.message || 'Ошибка загрузки'));
        setCourseList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterCoursesByLevel(courseList, levelFilter);
  const showCourses = !error;

  const handleSearch = (e) => {
    e.preventDefault();
    if (user) {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      // Передаём фильтры по цене в каталог курсов
      if (priceFilter) params.set('price_type', priceFilter);
      navigate(params.toString() ? `/courses?${params}` : '/courses');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* Поисковая строка */}
      <section className="search-strip">
        <form className="search-strip-form" onSubmit={handleSearch}>
          <div className="search-strip-input-wrap">
            <svg className="search-strip-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              className="search-strip-input"
              placeholder="Название курса, автор или предмет"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="search-strip-check">
            <input
              type="checkbox"
              checked={priceFilter === 'certificate'}
              onChange={(e) => setPriceFilter(e.target.checked ? 'certificate' : '')}
            />
            <span>С сертификатом</span>
          </label>
          <label className="search-strip-check">
            <input
              type="checkbox"
              checked={priceFilter === 'free'}
              onChange={(e) => setPriceFilter(e.target.checked ? 'free' : '')}
            />
            <span>Бесплатные</span>
          </label>
          <button type="submit" className="search-strip-btn">Искать</button>
        </form>
      </section>

      <section className="hero">
        <a
          className="hero-bg hero-bg-link"
          href="https://welcome.stepik.org/go_career"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Вебинар: Go-разработка в 2026 — путь middle-разработчика на Stepik"
        >
          <img src="/images/webinar-banner.png" alt="Вебинар: Go-разработка в 2026, путь middle-разработчика. 10 февраля 2026, 18:00 МСК." />
        </a>
        <div className="hero-content">
          <h1 className="hero-title">Учитесь с CodeMentor</h1>
          <p className="hero-desc">
            Платформа для обучения программированию и не только. Выбирайте курсы по уровню,
            проходите уроки в удобном темпе и получайте практические навыки.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/courses" className="btn btn-primary">Каталог курсов</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">Начать бесплатно</Link>
                <Link to="/login" className="btn btn-ghost">Войти</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="page home-courses">
        <div className="section-head-row">
          <h2 className="section-title section-title-with-arrow">Онлайн-курсы <span className="section-arrow">↓</span></h2>
          {showCourses && (
            <Link to="/courses" className="section-more-link" aria-label="Все курсы">
              <span>Ещё</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          )}
        </div>

        {showCourses && (
          <nav className="course-tabs" aria-label="Фильтр курсов">
            {COURSE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`course-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        <p className="section-subtitle">
          {user
            ? 'Выберите курс по уровню сложности и начните обучение.'
            : 'Войдите или зарегистрируйтесь, чтобы увидеть каталог курсов.'}
        </p>

        {!user && (
          <div className="home-login-cta">
            <Link to="/login" className="btn btn-primary">Войти в аккаунт</Link>
            <Link to="/register" className="btn btn-ghost">Зарегистрироваться</Link>
          </div>
        )}

        {showCourses && (
          <>
            {loading ? (
              <div className="loading">Загрузка курсов...</div>
            ) : courseList.length === 0 ? (
              <p className="text-muted">Пока нет курсов.</p>
            ) : (
              <div className="course-grid-wrap">
                <div className="course-grid">
                  {courseList.map((course) => (
                    <CourseCard key={course.id} course={course} hideLevel />
                  ))}
                </div>
                <Link to="/courses" className="course-grid-more" aria-label="Больше курсов">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              </div>
            )}
          </>
        )}

        {/* Программы курсов */}
        <section className="home-programs">
          <div className="section-head-row">
            <h2 className="section-title section-title-with-arrow">Программы курсов <span className="section-arrow">↓</span></h2>
            {showCourses && (
              <Link to="/courses" className="section-more-link" aria-label="Все программы">
                <span>Ещё</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            )}
          </div>

          {showCourses && (
            <>
              <nav className="course-tabs program-tabs" aria-label="Направления программ">
                {PROGRAM_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`course-tab ${activeProgramTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveProgramTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>

              {loading ? (
                <div className="loading">Загрузка...</div>
              ) : filtered.length === 0 ? (
                <p className="text-muted">Пока нет программ по выбранному направлению.</p>
              ) : (
                <div className="course-grid-wrap">
                  <div className="course-grid">
                    {filtered.slice(0, 6).map((course) => (
                      <CourseCard key={`program-${course.id}`} course={course} />
                    ))}
                  </div>
                  <Link to="/courses" className="course-grid-more" aria-label="Больше программ">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                </div>
              )}
            </>
          )}

          {!user && (
            <p className="section-subtitle">Войдите в аккаунт, чтобы увидеть программы курсов.</p>
          )}
        </section>
      </div>
    </>
  );
}
