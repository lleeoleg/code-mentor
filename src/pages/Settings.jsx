import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, saveProfile } from '../utils/profileStore';
import { auth as authApi } from '../api';
import { SOCIAL_LINK_FIELDS } from '../constants/socialLinks';
import './Settings.css';

const SETTINGS_NAV = [
  { to: '/settings', label: 'Редактировать профиль' },
  { to: '/settings/email', label: 'Изменить почту' },
  { to: '/settings/social', label: 'Вход через социальные сети' },
  { to: '/settings/social-links', label: 'Ссылки на социальные сети' },
  { to: '/settings/password', label: 'Установить пароль' },
  { to: '/settings/details', label: 'Реквизиты' },
];

function getInitials(profile, username) {
  if (profile?.firstName && profile?.lastName) {
    return (profile.firstName[0] + profile.lastName[0]).toUpperCase().slice(0, 2);
  }
  if (profile?.firstName) return profile.firstName.slice(0, 2).toUpperCase();
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

export default function Settings() {
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfileState] = useState(() => {
    const p = getProfile(user?.username);
    return { ...p, firstName: p.firstName || user?.username || '' };
  });
  const [saved, setSaved] = useState(false);
  const avatarInputRef = useRef(null);
  const [userMe, setUserMe] = useState(null);
  const [userMeLoading, setUserMeLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [socialLinks, setSocialLinksState] = useState(() => {
    const p = getProfile(user?.username);
    return { ...(p.socialLinks || {}) };
  });
  const [socialLinksSaved, setSocialLinksSaved] = useState(false);
  const isEmailTab = location.pathname === '/settings/email';
  const isSocialTab = location.pathname === '/settings/social';
  const isSocialLinksTab = location.pathname === '/settings/social-links';
  const isPasswordTab = location.pathname === '/settings/password';
  const isDetailsTab = location.pathname === '/settings/details';
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const p = getProfile(user?.username);
    setProfileState((prev) => ({ ...p, firstName: p.firstName || user?.username || '' }));
  }, [user?.username]);

  useEffect(() => {
    if (isSocialLinksTab && user?.username) {
      const p = getProfile(user.username);
      setSocialLinksState({ ...(p.socialLinks || {}) });
    }
  }, [isSocialLinksTab, user?.username]);

  useEffect(() => {
    if ((isEmailTab || isDetailsTab) && user) {
      setUserMeLoading(true);
      authApi
        .me()
        .then(setUserMe)
        .catch(() => setUserMe(null))
        .finally(() => setUserMeLoading(false));
    }
  }, [isEmailTab, isDetailsTab, user]);

  const setProfile = (patch) => {
    setProfileState((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (user?.username) {
      saveProfile(user.username, profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setProfile({ avatar: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAvatarRemove = () => setProfile({ avatar: null });

  const handleAddEmail = (e) => {
    e.preventDefault();
    setEmailError('');
    const email = newEmail.trim();
    if (!email) {
      setEmailError('Введите новый адрес почты.');
      return;
    }
    authApi
      .updateMe({ email })
      .then((data) => {
        setUserMe(data);
        setNewEmail('');
        setEmailSaved(true);
        setTimeout(() => setEmailSaved(false), 2000);
      })
      .catch((err) => {
        const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || 'Не удалось обновить почту.';
        setEmailError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      });
  };

  const handleSocialLinksSave = (e) => {
    e.preventDefault();
    if (user?.username) {
      saveProfile(user.username, { socialLinks: socialLinks });
      setSocialLinksSaved(true);
      setTimeout(() => setSocialLinksSaved(false), 2000);
    }
  };

  const setSocialLink = (id, value) => {
    setSocialLinksState((prev) => ({ ...prev, [id]: value }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Пароль должен быть не менее 8 символов.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError('Пароли не совпадают.');
      return;
    }
    setPasswordLoading(true);
    authApi
      .setPassword({ new_password: newPassword, new_password_confirm: newPasswordConfirm })
      .then(() => {
        setNewPassword('');
        setNewPasswordConfirm('');
        setPasswordSaved(true);
        setTimeout(() => setPasswordSaved(false), 3000);
      })
      .catch((err) => {
        const msg = err.response?.data?.new_password || err.response?.data?.new_password_confirm || err.response?.data?.detail;
        const text = Array.isArray(msg) ? msg.join(' ') : (msg || 'Не удалось изменить пароль.');
        setPasswordError(text);
      })
      .finally(() => setPasswordLoading(false));
  };

  const initials = getInitials(profile, user?.username);

  const breadcrumbLabel = isEmailTab
    ? 'Изменить почту'
    : isSocialTab
      ? 'Вход через социальные сети'
      : isSocialLinksTab
        ? 'Ссылки на социальные сети'
        : isPasswordTab
          ? 'Установить пароль'
          : isDetailsTab
            ? 'Реквизиты'
            : 'Редактирование профиля';

  return (
    <div className="page settings-page">
      <nav className="settings-breadcrumb" aria-label="Хлебные крошки">
        <Link to="/profile">Профиль</Link>
        <span className="settings-breadcrumb-sep">›</span>
        <Link to="/settings">Настройки</Link>
        <span className="settings-breadcrumb-sep">›</span>
        <span>{breadcrumbLabel}</span>
      </nav>

      <div className="settings-layout">
        <aside className="settings-nav">
          {SETTINGS_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`settings-nav-link ${item.to === location.pathname ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </aside>

        <main className="settings-main">
          {isSocialTab ? (
            <>
              <h1 className="settings-title">Вход через социальные сети</h1>
              <ul className="settings-social-list">
                <li className="settings-social-item">
                  <span>Facebook</span>
                  <a href="/api/auth/facebook/login/" className="settings-social-link">Подключить</a>
                </li>
                <li className="settings-social-item">
                  <span>GitHub</span>
                  <a href="/api/auth/github/login/" className="settings-social-link">Подключить</a>
                </li>
                <li className="settings-social-item">
                  <span>Google</span>
                  <a href="/api/auth/google/login/" className="settings-social-link">Подключить</a>
                </li>
                <li className="settings-social-item">
                  <span>VK</span>
                  <a href="/api/auth/vk/login/" className="settings-social-link">Подключить</a>
                </li>
                <li className="settings-social-item">
                  <span>Twitter</span>
                  <a href="/api/auth/twitter/login/" className="settings-social-link">Подключить</a>
                </li>
                <li className="settings-social-item">
                  <span>Яндекс</span>
                  <a href="/api/auth/yandex/login/" className="settings-social-link">Подключить</a>
                </li>
              </ul>
            </>
          ) : isSocialLinksTab ? (
            <>
              <h1 className="settings-title">Ссылки на социальные сети</h1>
              <p className="settings-section-heading">Эти ссылки будут отображаться в вашем профиле:</p>
              <form onSubmit={handleSocialLinksSave} className="settings-form settings-social-links-form">
                {SOCIAL_LINK_FIELDS.map((field) => (
                  <div key={field.id} className="settings-social-link-row">
                    <label className="settings-social-link-label" htmlFor={`social-${field.id}`}>
                      <span className="settings-social-link-prefix">{field.prefix || field.label}</span>
                    </label>
                    <input
                      id={`social-${field.id}`}
                      type="text"
                      className="settings-input settings-social-link-input"
                      placeholder={field.placeholder}
                      value={socialLinks[field.id] ?? ''}
                      onChange={(e) => setSocialLink(field.id, e.target.value)}
                      aria-label={field.label}
                    />
                  </div>
                ))}
                <button type="submit" className="settings-submit">
                  {socialLinksSaved ? 'Сохранено' : 'Сохранить изменения'}
                </button>
              </form>
            </>
          ) : isPasswordTab ? (
            <>
              <h1 className="settings-title">Установить пароль</h1>
              <form onSubmit={handlePasswordSubmit} className="settings-form">
                <div className="settings-field">
                  <label className="settings-label" htmlFor="new-password">Новый пароль</label>
                  <input
                    id="new-password"
                    type="password"
                    className="settings-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Минимум 8 символов"
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                </div>
                <div className="settings-field">
                  <label className="settings-label" htmlFor="new-password-confirm">Новый пароль (ещё раз)</label>
                  <input
                    id="new-password-confirm"
                    type="password"
                    className="settings-input"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    placeholder="Повторите пароль"
                    autoComplete="new-password"
                    required
                  />
                </div>
                {passwordError && <p className="form-error">{passwordError}</p>}
                <button type="submit" className="settings-submit" disabled={passwordLoading}>
                  {passwordSaved ? 'Сохранено' : passwordLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
              </form>
            </>
          ) : isDetailsTab ? (
            <>
              <h1 className="settings-title">Реквизиты для перечисления денежных средств</h1>
              <div className="settings-details-form">
                <div className="settings-field">
                  <label className="settings-label settings-label-with-hint" htmlFor="details-contact-email">
                    Контактный e-mail
                    <span className="settings-hint-icon" title="Для отправки платёжных документов" aria-label="Подсказка">?</span>
                  </label>
                  <input
                    id="details-contact-email"
                    type="email"
                    className="settings-input"
                    value={userMeLoading ? '' : (userMe?.email || '')}
                    readOnly
                    aria-describedby="details-email-hint"
                  />
                  <p id="details-email-hint" className="settings-details-hint">Для отправки платёжных документов</p>
                </div>
                <div className="settings-details-section">
                  <h2 className="settings-details-heading">Получение средств в КЗ</h2>
                  <p className="settings-details-links">
                    <a href="#financial-conditions" className="settings-social-link">Финансовые условия</a>
                  </p>
                  <p className="settings-details-agreement">
                    Переходя к заполнению реквизитов, вы соглашаетесь с{' '}
                    <a href="#offer" className="settings-social-link">офертой (агентским договором)</a>
                    {' '}о продажах курсов в рублях.
                  </p>
                  <button type="button" className="settings-submit">Заполнить реквизиты</button>
                </div>
              </div>
            </>
          ) : isEmailTab ? (
            <>
              <h1 className="settings-title">Изменить почту</h1>
              <p className="settings-section-heading">Ваши почтовые адреса:</p>
              {userMeLoading ? (
                <p className="text-muted">Загрузка...</p>
              ) : (
                <>
                  <div className="settings-email-row">
                    <input
                      type="email"
                      className="settings-input settings-email-current"
                      value={userMe?.email || ''}
                      readOnly
                      aria-label="Текущий адрес"
                    />
                    <span className="settings-email-badges">
                      <span className="settings-email-badge">Основной</span>
                      <span className="settings-email-badge">Подтверждён</span>
                    </span>
                  </div>
                  <form onSubmit={handleAddEmail} className="settings-form" style={{ marginTop: 16 }}>
                    <div className="settings-field">
                      <input
                        type="email"
                        className="settings-input"
                        placeholder="Новый адрес"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        aria-label="Новый адрес почты"
                      />
                    </div>
                    {emailError && <p className="form-error">{emailError}</p>}
                    <button type="submit" className="settings-submit">
                      {emailSaved ? 'Сохранено' : 'Добавить почту'}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
          <h1 className="settings-title">Редактирование профиля</h1>

          <form onSubmit={handleSave} className="settings-form">
            <div className="settings-field">
              <label className="settings-label" htmlFor="firstName">Ваше имя *</label>
              <input
                id="firstName"
                type="text"
                className="settings-input"
                value={profile.firstName}
                onChange={(e) => setProfile({ firstName: e.target.value })}
              />
            </div>
            <div className="settings-field">
              <label className="settings-label" htmlFor="lastName">Фамилия *</label>
              <input
                id="lastName"
                type="text"
                className="settings-input"
                value={profile.lastName}
                onChange={(e) => setProfile({ lastName: e.target.value })}
              />
            </div>
            <p className="settings-hint">Ваше официальное имя, используемое в сертификатах.</p>

            <div className="settings-field">
              <label className="settings-label">Приватность</label>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={profile.isPrivate}
                  onChange={(e) => setProfile({ isPrivate: e.target.checked })}
                />
                <span>Сделать профиль приватным</span>
              </label>
            </div>

            <div className="settings-field">
              <label className="settings-label">Программа бета-тестирования</label>
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={profile.betaProgram}
                  onChange={(e) => setProfile({ betaProgram: e.target.checked })}
                />
                <span>Хочу участвовать</span>
              </label>
            </div>

            <div className="settings-field">
              <label className="settings-label" htmlFor="shortBio">Краткая биография (до 255 символов)</label>
              <textarea
                id="shortBio"
                className="settings-textarea settings-textarea-short"
                maxLength={255}
                value={profile.shortBio}
                onChange={(e) => setProfile({ shortBio: e.target.value })}
                rows={3}
              />
              <span className="settings-char">{profile.shortBio.length} / 255</span>
            </div>

            <div className="settings-field">
              <label className="settings-label" htmlFor="aboutMe">Обо мне</label>
              <textarea
                id="aboutMe"
                className="settings-textarea"
                value={profile.aboutMe}
                onChange={(e) => setProfile({ aboutMe: e.target.value })}
                rows={6}
              />
            </div>

            <button type="submit" className="settings-submit">
              {saved ? 'Сохранено' : 'Сохранить изменения'}
            </button>
          </form>

          <section className="settings-section">
            <div className="settings-field settings-field-row">
              <label className="settings-label">Аватарка</label>
              <div className="settings-avatar-block">
                <div className="settings-avatar-preview">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="settings-file-hidden"
                  onChange={handleAvatarUpload}
                  aria-label="Загрузить аватар"
                />
                <div className="settings-avatar-actions">
                  <button type="button" className="settings-link" onClick={() => avatarInputRef.current?.click()}>
                    Загрузить
                  </button>
                  <button type="button" className="settings-link" onClick={handleAvatarRemove}>
                    Убрать
                  </button>
                </div>
              </div>
            </div>
          </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
