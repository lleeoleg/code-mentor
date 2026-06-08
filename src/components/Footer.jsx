import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Footer.css';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-wrap">
        <div className="footer-grid">

          <div className="footer-col footer-col-brand">
            <span className="footer-logo">CodeMentor</span>
            <p className="footer-tagline">{t('footer.tagline')}</p>
            <a href="mailto:help@codementor.kz" className="footer-email">
              help@codementor.kz
            </a>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">{t('footer.about')}</p>
            <nav className="footer-nav-list">
              <Link to="/about">{t('footer.about')}</Link>
              <Link to="/contacts">{t('footer.contacts')}</Link>
              <Link to="/partnership">{t('footer.partnership')}</Link>
            </nav>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">{t('footer.help')}</p>
            <nav className="footer-nav-list">
              <Link to="/help">{t('footer.help')}</Link>
              <Link to="/agreement">{t('footer.agreement')}</Link>
              <Link to="/privacy">{t('footer.privacy')}</Link>
            </nav>
          </div>

          <div className="footer-col footer-col-social">
            <p className="footer-col-title">{t('footer.follow')}</p>
            <a
              href="https://t.me/codementor_kz"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-item"
              aria-label="Telegram"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </a>
            <a
              href="https://linkedin.com/company/codementor-kz"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-item"
              aria-label="LinkedIn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>

        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2025 – {currentYear} CodeMentor</p>
        </div>
      </div>
    </footer>
  );
}
