import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { courses } from '../api';
import {
  levelBadgeClass,
  getLevelKey,
  formatCoursePrice,
  filterCoursesByLevel,
} from '../utils/courseHelpers';
import { getCourseLogo } from '../utils/courseLogos';
import FavoriteButton from '../components/FavoriteButton';
import './Home.css';

const COURSE_TABS = [
  { id: 'trending', labelKey: 'trending' },
  { id: 'new', labelKey: 'newCourses' },
  { id: 'support', labelKey: 'withSupport' },
  { id: 'ege', labelKey: 'ege' },
  { id: 'ai', labelKey: 'ai' },
];

const PROGRAM_TABS = [
  { id: 'python', labelKey: 'python' },
  { id: 'data', labelKey: 'dataAnalysis' },
  { id: 'qa', labelKey: 'qa' },
  { id: 'web', labelKey: 'web' },
  { id: 'ege', labelKey: 'ege' },
];

function CourseCard({ course }) {
  const { t } = useLanguage();
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
        <span className="course-card-price">{formatCoursePrice(course.price, course)}</span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { t } = useLanguage();
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
        setError(err.response?.status === 401 ? null : (err.message || t('courses.loadError')));
        setCourseList([]);
      })
      .finally(() => setLoading(false));
  }, [t]);

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
              placeholder={t('home.searchPlaceholder')}
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
            <span>{t('home.withCertificate')}</span>
          </label>
          <label className="search-strip-check">
            <input
              type="checkbox"
              checked={priceFilter === 'free'}
              onChange={(e) => setPriceFilter(e.target.checked ? 'free' : '')}
            />
            <span>{t('home.free')}</span>
          </label>
          <button type="submit" className="search-strip-btn">{t('home.search')}</button>
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
          <h2 className="section-title section-title-with-arrow">{t('home.onlineCourses')} <span className="section-arrow">↓</span></h2>
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
              <div className="course-grid-wrap">
                <div className="course-grid">
                  {courseList.map((course) => (
                    <CourseCard key={course.id} course={course} />
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
            <h2 className="section-title section-title-with-arrow">{t('home.programs')} <span className="section-arrow">↓</span></h2>
            {showCourses && (
              <Link to="/courses" className="section-more-link" aria-label={t('home.allCourses')}>
                <span>{t('home.more')}</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            )}
          </div>

          {showCourses && (
            <>
              <nav className="course-tabs program-tabs" aria-label={t('home.programs')}>
                {PROGRAM_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`course-tab ${activeProgramTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveProgramTab(tab.id)}
                  >
                    {t('home.' + tab.labelKey)}
                  </button>
                ))}
              </nav>

              {loading ? (
                <div className="loading">{t('home.loading')}</div>
              ) : filtered.length === 0 ? (
                <p className="text-muted">{t('home.noPrograms')}</p>
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
            <p className="section-subtitle">{t('home.subtitleNoAuth')}</p>
          )}
        </section>
      </div>
    </>
  );
}
