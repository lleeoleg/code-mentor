import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import SocialAuthButtons from '../components/SocialAuthButtons';

export default function Register() {
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ username, password, email: email.trim() });
      navigate('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      let msg = t('register.errorDefault');
      if (typeof data === 'string') msg = data;
      else if (data?.username) msg = data.username.join?.(' ') ?? data.username;
      else if (data?.password) msg = data.password.join?.(' ') ?? data.password;
      else if (data?.email) msg = data.email.join?.(' ') ?? data.email;
      else if (data && typeof data === 'object') msg = JSON.stringify(data);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-card">
        <h1 className="form-title">{t('register.title')}</h1>
        <p className="form-subtitle">{t('register.subtitle')}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('register.username')}</label>
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
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">{t('register.passwordHint')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? t('register.submitting') : t('register.submit')}
          </button>
          <SocialAuthButtons variant="register" />
        </form>
        <p className="form-footer">
          {t('register.hasAccount')} <Link to="/login">{t('register.loginLink')}</Link>
        </p>
      </div>
    </div>
  );
}
