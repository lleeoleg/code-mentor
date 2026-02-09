import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SocialAuthButtons from '../components/SocialAuthButtons';

const OAUTH_ERRORS = {
  oauth_failed: 'Ошибка OAuth. Попробуйте снова.',
  oauth_token: 'Не удалось получить токен от провайдера.',
  oauth_user: 'Не удалось получить данные пользователя.',
  not_configured: 'Вход через эту соцсеть пока не настроен.',
};

export default function Login() {
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
      }).catch(() => setError('Ошибка входа по соцсети'));
      return;
    }
    const q = new URLSearchParams(location.search);
    const err = q.get('error');
    const social = q.get('social');
    if (err && (OAUTH_ERRORS[err] || social)) {
      setError(OAUTH_ERRORS[err] || OAUTH_ERRORS.not_configured);
    }
  }, [location.search, loginWithTokens, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail ?? err.response?.data ?? 'Ошибка входа';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-card">
        <h1 className="form-title">Вход</h1>
        <p className="form-subtitle">Войдите в аккаунт, чтобы смотреть курсы</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Логин</label>
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
            <label htmlFor="password">Пароль</label>
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
            {loading ? 'Вход...' : 'Войти'}
          </button>
          <SocialAuthButtons variant="login" />
        </form>
        <p className="form-footer">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
