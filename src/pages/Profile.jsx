import { useMemo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getProfile } from '../utils/profileStore';
import { SOCIAL_LINK_FIELDS, getSocialLinkUrl } from '../constants/socialLinks';
import { activity as activityApi } from '../api';
import './Profile.css';

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

function getDisplayName(profile, username, userFallback) {
  if (profile?.firstName || profile?.lastName) {
    return [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  }
  return username ?? userFallback;
}

function getUserId(username) {
  if (!username) return '—';
  let h = 0;
  for (let i = 0; i < username.length; i++) h = ((h << 5) - h) + username.charCodeAt(i) | 0;
  return String(1000000000 + Math.abs(h)).slice(0, 10);
}

function SocialLinkIcon({ id }) {
  const size = 20;
  const icons = {
    github: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    vk: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.154-1.744-1.154-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4 8.57 4 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.49-.085.744-.576.744z" />
      </svg>
    ),
    coursera: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.4c5.302 0 9.6 4.298 9.6 9.6s-4.298 9.6-9.6 9.6S2.4 17.302 2.4 12 6.698 2.4 12 2.4zM8.4 8.4v7.2l6-3.6-6-3.6z" />
      </svg>
    ),
    edx: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.18l7.5 3.75v7.14L12 19.82l-7.5-3.75V7.93L12 4.18z" />
      </svg>
    ),
    skype: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95 0-5.52-4.48-10-10-10z" />
      </svg>
    ),
    telegram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    website: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    youtube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  };
  return icons[id] || icons.website;
}

export default function Profile() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => getProfile(user?.username));

  useEffect(() => {
    setProfile(getProfile(user?.username));
  }, [user?.username]);

  const initials = getInitials(profile, user?.username);
  const displayName = getDisplayName(profile, user?.username, t('profile.userFallback'));
  const userId = getUserId(user?.username);
  const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => t('profileMonths.' + i));
  const hasBio = !!(profile.shortBio?.trim() || profile.aboutMe?.trim());

  const socialLinksList = useMemo(() => {
    const links = profile.socialLinks || {};
    return SOCIAL_LINK_FIELDS.filter((f) => {
      const v = (links[f.id] || '').trim();
      return v && getSocialLinkUrl(f, v);
    }).map((f) => ({ field: f, url: getSocialLinkUrl(f, (links[f.id] || '').trim()) }));
  }, [profile.socialLinks]);

  const [activityDates, setActivityDates] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setActivityLoading(true);
      activityApi
        .get()
        .then((data) => {
          setActivityDates(data.dates || []);
        })
        .catch(() => {
          setActivityDates([]);
        })
        .finally(() => {
          setActivityLoading(false);
        });
    }
  }, [user]);

  const activityGrid = useMemo(() => {
    const rows = 7; // Дни недели (воскресенье = 0, понедельник = 1, ...)
    const cols = 53; // Недели в году
    const grid = [];
    
    // Создаем Set для быстрого поиска активных дат
    const activeDatesSet = new Set(activityDates);
    
    // Вычисляем дату начала (365 дней назад от сегодня)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 365);
    
    // Находим день недели начала (0 = воскресенье, 1 = понедельник, ...)
    // Преобразуем: воскресенье (0) -> 6, понедельник (1) -> 0, и т.д.
    let startDayOfWeek = startDate.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Понедельник = 0
    
    // Создаем сетку: заполняем пустые ячейки до начала периода
    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push(false);
    }
    
    // Заполняем сетку для каждого дня за последний год
    const currentDate = new Date(startDate);
    for (let day = 0; day < 365; day++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      grid.push(activeDatesSet.has(dateStr));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Дополняем до полной сетки (7 * 53 = 371 ячейка)
    while (grid.length < rows * cols) {
      grid.push(false);
    }
    
    return grid;
  }, [activityDates]);

  return (
    <div className="page profile-page">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-avatar" aria-hidden>
            {profile?.avatar ? <img src={profile.avatar} alt="" /> : initials}
          </div>
          <div className="profile-meta">
            <p className="profile-meta-line">
              <span className="profile-meta-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span>0 {t('profile.followers')}</span>
            </p>
            <p className="profile-meta-line">
              <span className="profile-meta-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 12l10 10 10-10L12 2z"/></svg>
              </span>
              <span>0 {t('profile.skills')}</span>
            </p>
          </div>
          <nav className="profile-links">
            <span className="profile-links-current">{t('profile.profile')}</span>
            <Link to="/certificates" className="profile-links-link">{t('profile.certificates')}</Link>
          </nav>
          <p className="profile-joined">{t('profile.joined')}</p>
          <p className="profile-userid">{t('profile.userId')}: {userId}</p>
        </aside>

        <main className="profile-main">
          <h1 className="profile-name">{displayName}</h1>

          {hasBio && (
            <section className="profile-bio">
              {profile.shortBio?.trim() && (
                <p className="profile-bio-short">{profile.shortBio.trim()}</p>
              )}
              {profile.aboutMe?.trim() && (
                <div className="profile-bio-about">
                  <h2 className="profile-bio-title">{t('profile.aboutMe')}</h2>
                  <div className="profile-bio-text">{profile.aboutMe.trim()}</div>
                </div>
              )}
            </section>
          )}

          {socialLinksList.length > 0 && (
            <section className="profile-links-section">
              <h2 className="profile-links-section-title">{t('profile.links')}</h2>
              <div className="profile-links-grid">
                {socialLinksList.map(({ field, url }) => (
                  <a
                    key={field.id}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-link-card"
                    title={field.label}
                  >
                    <span className="profile-link-icon" aria-hidden>
                      <SocialLinkIcon id={field.id} />
                    </span>
                    <span className="profile-link-label">{field.label}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          <section className="profile-activity">
            <h2 className="profile-activity-title">{t('profile.activity')}</h2>
            <div className="profile-activity-card">
              {activityLoading ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  {t('profile.loadingActivity')}
                </div>
              ) : (
                <>
                  <div className="profile-activity-grid" role="img" aria-label={t('profile.activityGridLabel')}>
                    {activityGrid.map((active, i) => (
                      <span
                        key={i}
                        className={`profile-activity-cell ${active ? 'active' : ''}`}
                        title={active ? t('profile.startedThisDay') : t('profile.noActivity')}
                      />
                    ))}
                  </div>
                  <div className="profile-activity-months">
                    {months.map((m, idx) => (
                      <span key={idx} className="profile-activity-month">{m}</span>
                    ))}
                  </div>
                  <p className="profile-activity-utc">{t('profile.nextDayUtc')}</p>
                </>
              )}
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">0</span>
                <span className="profile-stat-label">{t('profile.streakDays')}</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">0</span>
                <span className="profile-stat-label">{t('profile.streakMax')}</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">0</span>
                <span className="profile-stat-label">{t('profile.tasksSolved')}</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
