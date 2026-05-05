import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Footer.css';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer">
      <div className="footer-wrap">
        <div className="footer-top">
          <div className="footer-left">
            <p className="footer-copy">© 2025 – {currentYear}. CodeMentor</p>
            <div className="footer-legal">
              <Link to="/agreement">{t('footer.agreement')}</Link>
              <Link to="/privacy">{t('footer.privacy')}</Link>
            </div>
          </div>

          <nav className="footer-nav">
            <div className="footer-nav-col">
              <Link to="/authors">{t('footer.authors')}</Link>
              <Link to="/companies">{t('footer.companies')}</Link>
              <Link to="/help">{t('footer.help')}</Link>
              <Link to="/contacts">{t('footer.contacts')}</Link>
            </div>
            <div className="footer-nav-col">
              <Link to="/partnership">{t('footer.partnership')}</Link>
              <Link to="/about">{t('footer.about')}</Link>
              <Link to="/team">{t('footer.team')}</Link>
              <Link to="/jobs">{t('footer.jobs')}</Link>
            </div>
          </nav>

          <div className="footer-right">
            <div className="footer-social">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="VK">
                <span className="footer-social-vk">VK</span>
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </a>
            </div>
            <a href="mailto:help@codementor.ru" className="footer-email">help@codementor.ru</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-license">
            {t('footer.license')}{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">{t('footer.licenseLink')}</a>{t('footer.licenseSuffix')}
          </p>
        </div>
      </div>
    </footer>
  );
}
