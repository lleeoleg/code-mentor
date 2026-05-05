import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SocialAuthButtons from '../components/SocialAuthButtons';

const OAUTH_ERROR_KEYS = ['oauth_failed', 'oauth_token', 'oauth_user', 'not_configured'];

export default function Login() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithTokens } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = Object.fromEntries(new URLSearchParams(hash));
    const access = params.access;
    const refresh = params.refresh;
    if (access && refresh) {
      loginWithTokens(access, refresh).then(() => {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        navigate(from, { replace: true });
      }).catch(() => setError(t('login.oauthError')));
      return;
    }
    const q = new URLSearchParams(location.search);
    const err = q.get('error');
    const social = q.get('social');
    if (err && (OAUTH_ERROR_KEYS.includes(err) || social)) {
      setError(t('login.' + (OAUTH_ERROR_KEYS.includes(err) ? err : 'not_configured')));
    }
  }, [location.search, loginWithTokens, navigate, from, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.response?.data ?? t('login.errorDefault');
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-card">
        <h1 className="form-title">{t('login.title')}</h1>
        <p className="form-subtitle">{t('login.subtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('login.username')}</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
          <SocialAuthButtons variant="login" />
        </form>
        <p className="form-footer">
          {t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link>
        </p>
      </div>
    </div>
  );
}
