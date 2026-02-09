import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { courses as coursesApi } from '../api';
import { getProfile } from '../utils/profileStore';
import Footer from './Footer';
import WhatsNewModal from './WhatsNewModal';
import './Layout.css';

function getInitials(profile, username) {
  if (profile?.firstName && profile?.lastName) {
    return (profile.firstName[0] + profile.lastName[0]).toUpperCase().slice(0, 2);
  }
  if (profile?.firstName) return profile.firstName.slice(0, 2).toUpperCase();
  if (!username) return '?';
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
  return username.slice(0, 2).toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [catalogList, setCatalogList] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState(() => getProfile(user?.username));
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);
  const catalogRef = useRef(null);
  const avatarRef = useRef(null);

  useEffect(() => {
    if (user?.username) {
      const updateProfile = () => setProfile(getProfile(user.username));
      updateProfile();
      const handleProfileUpdate = (e) => {
        if (e.detail?.username === user.username) updateProfile();
      };
      const handleFocus = updateProfile;
      window.addEventListener('profileUpdated', handleProfileUpdate);
      window.addEventListener('storage', handleProfileUpdate);
      window.addEventListener('focus', handleFocus);
      return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
        window.removeEventListener('storage', handleProfileUpdate);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [user?.username]);

  const handleLogout = () => {
    setAvatarOpen(false);
    logout();
    navigate('/login');
  };

  const closeCatalog = () => setCatalogOpen(false);
  const closeAvatar = () => setAvatarOpen(false);

  useEffect(() => {
    if (catalogOpen && user) {
      setCatalogLoading(true);
      coursesApi
        .list()
        .then(setCatalogList)
        .catch(() => setCatalogList([]))
        .finally(() => setCatalogLoading(false));
    }
  }, [catalogOpen, user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (catalogRef.current && !catalogRef.current.contains(e.target)) closeCatalog();
      if (avatarRef.current && !avatarRef.current.contains(e.target)) closeAvatar();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (user) {
      navigate(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
    } else {
      navigate('/login');
    }
  };

  const avatarInitials = getInitials(profile, user?.username);
  const location = useLocation();
  const isCourseLearn = /^\/courses\/\d+\/learn\/?$/.test(location.pathname);

  return (
    <div className={`layout ${isCourseLearn ? 'layout--course-learn' : ''}`}>
      <header className="header header-dark">
        <div className="header-left">
          <Link to="/" className="header-logo">
            CodeMentor
          </Link>

          {user && (
            <div className="header-nav-left" ref={catalogRef}>
              <button
                type="button"
                className="header-catalog-btn"
                onClick={() => setCatalogOpen((v) => !v)}
                aria-expanded={catalogOpen}
              >
                Каталог
                <span className="header-catalog-chevron">▼</span>
              </button>
              {catalogOpen && (
                <div className="header-dropdown header-catalog-dropdown">
                  {catalogLoading ? (
                    <div className="header-dropdown-loading">Загрузка...</div>
                  ) : catalogList.length === 0 ? (
                    <div className="header-dropdown-empty">Нет курсов</div>
                  ) : (
                    <ul className="header-catalog-list">
                      {catalogList.map((c) => (
                        <li key={c.id}>
                          <Link to={`/courses/${c.id}`} onClick={closeCatalog}>
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {user && (
            <Link to="/my-learning" className="header-link-btn">
              Моё обучение
            </Link>
          )}
        </div>

        <div className="header-right">
          {user && (
            <form className="header-search" onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Поиск по курсам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="header-search-input"
              />
              <button type="submit" className="header-search-btn" aria-label="Искать">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form>
          )}

          {user ? (
            <div className="header-avatar-wrap" ref={avatarRef}>
              <button
                type="button"
                className="header-avatar"
                onClick={() => setAvatarOpen((v) => !v)}
                aria-expanded={avatarOpen}
                aria-label="Меню пользователя"
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="" />
                ) : (
                  avatarInitials
                )}
              </button>
              {avatarOpen && (
                <div className="header-dropdown header-avatar-dropdown">
                  <Link to="/profile" onClick={closeAvatar} className="header-dropdown-item">
                    Профиль
                  </Link>
                  <Link to="/settings" onClick={closeAvatar} className="header-dropdown-item">
                    Настройки
                  </Link>
                  <button type="button" onClick={() => { closeAvatar(); setWhatsNewOpen(true); }} className="header-dropdown-item header-dropdown-item-btn">
                    Что нового
                  </button>
                  <button type="button" onClick={handleLogout} className="header-dropdown-item header-dropdown-item-logout">
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="header-auth">
              <Link to="/login" className="header-btn-ghost">Вход</Link>
              <Link to="/register" className="header-btn-primary">Регистрация</Link>
            </div>
          )}
        </div>
      </header>
      <main className={`main ${isCourseLearn ? 'main--course-learn' : ''}`}>
        <div className="main-wrap">
          <Outlet />
        </div>
      </main>
      {!isCourseLearn && <Footer />}
      <WhatsNewModal open={whatsNewOpen} onClose={() => setWhatsNewOpen(false)} />
    </div>
  );
}
