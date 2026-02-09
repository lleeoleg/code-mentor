import './SocialAuthButtons.css';

const PROVIDERS = [
  { id: 'google', label: 'Google', href: '/api/auth/google/login/' },
  { id: 'vk', label: 'VK', href: '/api/auth/vk/login/' },
  { id: 'github', label: 'GitHub', href: '/api/auth/github/login/' },
  { id: 'facebook', label: 'Facebook', href: '/api/auth/facebook/login/' },
  { id: 'twitter', label: 'Twitter', href: '/api/auth/twitter/login/' },
  { id: 'yandex', label: 'Яндекс', href: '/api/auth/yandex/login/' },
];

export default function SocialAuthButtons({ variant = 'login' }) {
  const text = variant === 'register' ? 'Зарегистрироваться через' : 'Войти через';
  return (
    <div className="social-auth">
      <p className="social-auth-divider">
        <span>или</span>
      </p>
      <p className="social-auth-label">{text} соцсети:</p>
      <div className="social-auth-buttons">
        {PROVIDERS.map((p) => (
          <a
            key={p.id}
            href={p.href}
            className="social-auth-btn"
            data-provider={p.id}
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  );
}
