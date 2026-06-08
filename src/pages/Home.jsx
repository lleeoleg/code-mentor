import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courses } from '../api';
import {
  levelBadgeClass,
  getLevelKey,
  formatCoursePrice,
} from '../utils/courseHelpers';
import { getCourseLogo } from '../utils/courseLogos';
import FavoriteButton from '../components/FavoriteButton';
import './Home.css';

const COURSE_TABS = [
  { id: 'trending', labelKey: 'trending' },
  { id: 'new', labelKey: 'newCourses' },
  { id: 'support', labelKey: 'withSupport' },
  { id: 'ai', labelKey: 'ai' },
];

const PROGRAM_TABS = [
  { id: 'python', labelKey: 'python' },
  { id: 'data', labelKey: 'dataAnalysis' },
  { id: 'qa', labelKey: 'qa' },
  { id: 'web', labelKey: 'web' },
];

const PROGRAMS = [
  { id: 'python',  label: 'python',      logo: '/images/python.svg',     href: '/courses?q=python' },
  { id: 'data',    label: 'dataAnalysis', logo: '/images/data.svg',       href: '/courses?q=data' },
  { id: 'qa',      label: 'qa',           logo: '/images/qa.svg',         href: '/courses?q=qa' },
  { id: 'web',     label: 'web',          logo: '/images/react.svg',      href: '/courses?q=web' },
  { id: 'js',      label: 'web',          logo: '/images/javascript.svg', href: '/courses?q=javascript' },
  { id: 'sql',     label: 'dataAnalysis', logo: '/images/sql.svg',        href: '/courses?q=sql' },
  { id: 'django',  label: 'web',          logo: '/images/django.svg',     href: '/courses?q=django' },
  { id: 'csharp',  label: 'web',          logo: '/images/csharp.svg',     href: '/courses?q=csharp' },
];

function ProgramSlider({ t }) {
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

  // Track drag-to-scroll
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
        const dx = e.clientX - dragStartX.current;
        trackRef.current.scrollLeft = dragStartScroll.current - dx;
      }
      if (isDraggingThumb.current) {
        const bar = barRef.current;
        const track = trackRef.current;
        if (!bar || !track) return;
        const barW = bar.clientWidth;
        const thumbW = barW * 0.2;
        const dx = e.clientX - thumbDragStartX.current;
        const pct = dx / (barW - thumbW);
        const max = track.scrollWidth - track.clientWidth;
        track.scrollLeft = thumbDragStartScroll.current + pct * max;
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

  // Thumb drag
  const onThumbMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingThumb.current = true;
    thumbDragStartX.current = e.clientX;
    thumbDragStartScroll.current = trackRef.current.scrollLeft;
    e.preventDefault();
    e.stopPropagation();
  };

  // Click on bar to jump
  const onBarClick = (e) => {
    const bar = barRef.current;
    const track = trackRef.current;
    if (!bar || !track) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const max = track.scrollWidth - track.clientWidth;
    track.scrollLeft = pct * max;
  };

  const thumbLeft = `calc(${scrollPct * 80}%)`;

  return (
    <section className="home-programs">
      <div className="section-head-row">
        <h2 className="section-title section-title-with-arrow">
          {t('home.programs')}{' '}
          <span className="section-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </span>
        </h2>
      </div>

      <div className="program-slider">
        <div
          className="program-track"
          ref={trackRef}
          onScroll={updateScroll}
          onMouseDown={onTrackMouseDown}
        >
          {PROGRAMS.map((p) => (
            <Link key={p.id} to={p.href} className="program-card">
              <div className="program-card-icon">
                <img src={p.logo} alt={p.id} />
              </div>
              <span className="program-card-name">{t('home.' + p.label)}</span>
            </Link>
          ))}
        </div>

        <div className="program-slider-nav">
          <div className="program-slider-bar" ref={barRef} onClick={onBarClick}>
            <div
              className="program-slider-thumb"
              style={{ left: thumbLeft }}
              onMouseDown={onThumbMouseDown}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const REVIEWS = [
  {
    id: 1,
    name: 'Kamilla Sembekova',
    course: { ru: 'Power BI: от данных до аналитики', en: 'Power BI: From data to analytics' },
    courseHref: '/courses/1',
    date: 'April 28, 2026',
    text: {
      ru: 'Отличный курс! Очень структурировано и понятно объясняется работа с Power BI. За несколько недель смогла построить свои первые дашборды для работы. Рекомендую всем, кто хочет работать с данными.',
      en: 'Great course! Power BI is explained in a very structured, clear way. Within a few weeks I built my first work dashboards. I recommend it to anyone who wants to work with data.',
    },
    initials: 'KS',
    color: '#7c3aed',
  },
  {
    id: 2,
    name: 'Nurdaulet Kapyshov',
    course: { ru: 'React: Practical Components & State', en: 'React: Practical Components & State' },
    courseHref: '/courses/6',
    date: 'May 1, 2026',
    text: {
      ru: 'Наконец-то курс по React, где реально учат практике, а не просто теории. Компоненты, хуки, управление состоянием — всё разобрано на живых проектах. После курса сразу взял коммерческий заказ.',
      en: 'Finally a React course that teaches real practice, not just theory. Components, hooks, state — all on real projects. I took a commercial job right after the course.',
    },
    initials: 'NK',
    color: '#0ea5e9',
  },
  {
    id: 3,
    name: 'Lee Oleg',
    course: { ru: 'REST APIs with Django REST Framework', en: 'REST APIs with Django REST Framework' },
    courseHref: '/courses/8',
    date: 'May 3, 2026',
    text: {
      ru: 'Очень полезный курс для бэкенд-разработчиков. Django REST Framework разобран детально: сериализаторы, ViewSets, авторизация по токенам. Всё на реальном проекте — зачёт!',
      en: 'Very useful for backend developers. Django REST Framework in depth: serializers, viewsets, token auth. All on a real project — top marks!',
    },
    initials: 'LO',
    color: '#059669',
  },
  {
    id: 4,
    name: 'Dinmukhamed Kabzhanov',
    course: { ru: 'Data Engineering: ETL Pipelines', en: 'Data Engineering: ETL Pipelines' },
    courseHref: '/courses/12',
    date: 'May 5, 2026',
    text: {
      ru: 'Курс дал чёткое понимание как строить ETL-пайплайны с нуля. Airflow, трансформации данных — всё подробно и на практике. Отличный старт в Data Engineering!',
      en: 'The course gave a clear picture of how to build ETL pipelines from scratch. Airflow, data transforms — detailed and hands-on. A great start in data engineering!',
    },
    initials: 'DK',
    color: '#d97706',
  },
];

function ReviewsSection() {
  const { t, locale } = useLanguage();
  return (
    <section className="home-reviews">
      <div className="section-head-row">
        <h2 className="section-title section-title-with-arrow">
          {t('home.studentReviews')}{' '}
          <span className="section-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
        </h2>
      </div>
      <div className="reviews-grid">
        {REVIEWS.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-card-header">
              <div className="review-avatar" style={{ background: r.color }}>
                {r.initials}
              </div>
              <div className="review-meta">
                <span className="review-name">{r.name}</span>
                <span className="review-date">{r.date}</span>
              </div>
            </div>
            <Link to={r.courseHref} className="review-course-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              {r.course[locale] || r.course.ru}
            </Link>
            <p className="review-text">{r.text[locale] || r.text.ru}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CourseCard({ course }) {
  const { t, locale } = useLanguage();
  const logo = getCourseLogo(course);
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
        <p className="course-card-meta">
          <span className={`badge ${levelBadgeClass(course.level_display ?? course.level)}`}>
            {t('home.' + (getLevelKey(course.level_display ?? course.level) === 'all' ? 'any' : getLevelKey(course.level_display ?? course.level)))}
          </span>
        </p>
        <h2 className="course-card-title">{course.title}</h2>
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

export default function Home() {
  const { user } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState(''); // '', 'free', 'certificate'

  useEffect(() => {
    setLoading(true);
    setError(null);
    courses
      .list()
      .then(setCourseList)
      .catch((err) => {
        setError(err.response?.status === 401 ? null : (err.message || t('courses.loadError')));
        setCourseList([]);
      })
      .finally(() => setLoading(false));
  }, [t, locale]);

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
              placeholder={t('home.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <label className="search-strip-check" title={t('home.withCertificate')}>
            <input
              type="checkbox"
              checked={priceFilter === 'certificate'}
              onChange={(e) => setPriceFilter(e.target.checked ? 'certificate' : '')}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
          </label>
          <label className="search-strip-check" title={t('home.free')}>
            <input
              type="checkbox"
              checked={priceFilter === 'free'}
              onChange={(e) => setPriceFilter(e.target.checked ? 'free' : '')}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </label>
          <button type="submit" className="search-strip-btn" aria-label={t('home.search')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </form>
      </section>

      <section className="hero">
        <a
          className="hero-webinar-card"
          href="https://welcome.stepik.org/go_career"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('home.webinarTitle')}
        >
          <span className="hero-webinar-label">{t('home.webinar')}</span>
          <span className="hero-webinar-title">{t('home.webinarTitle')}</span>
        </a>
        <div className="hero-content">
          <h1 className="hero-title">{t('home.heroTitle')}</h1>
          <p className="hero-desc">
            {t('home.heroDesc')}
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/courses" className="btn btn-primary">{t('home.catalogBtn')}</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">{t('home.startFree')}</Link>
                <Link to="/login" className="btn btn-ghost">{t('home.login')}</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="page home-courses">
        <div className="section-head-row">
          <h2 className="section-title section-title-with-arrow">{t('home.onlineCourses')} <span className="section-arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm-7 8.09L12 15l7-3.91V15l-7 3.82L5 15v-3.91z"/></svg></span></h2>
          {showCourses && (
            <Link to="/courses" className="section-more-link" aria-label={t('home.allCourses')}>
              <span>{t('home.more')}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </Link>
          )}
        </div>

        {showCourses && (
          <nav className="course-tabs" aria-label={t('home.filterCourses')}>
            {COURSE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`course-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {t('home.' + tab.labelKey)}
              </button>
            ))}
          </nav>
        )}

        <p className="section-subtitle">
          {user ? t('home.subtitleAuth') : t('home.subtitleNoAuth')}
        </p>

        {!user && (
          <div className="home-login-cta">
            <Link to="/login" className="btn btn-primary">{t('home.loginToAccount')}</Link>
            <Link to="/register" className="btn btn-ghost">{t('home.register')}</Link>
          </div>
        )}

        {showCourses && (
          <>
            {loading ? (
              <div className="loading">{t('home.loadingCourses')}</div>
            ) : courseList.length === 0 ? (
              <p className="text-muted">{t('home.noCourses')}</p>
            ) : (
              <div className="course-grid">
                {courseList.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Программы курсов */}
        <ProgramSlider t={t} />

        <ReviewsSection />
      </div>
    </>
  );
}
