import { Link } from 'react-router-dom';
import './Footer.css';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-wrap">
        <div className="footer-top">
          <div className="footer-left">
            <p className="footer-copy">© 2025 – {currentYear}. CodeMentor</p>
            <div className="footer-legal">
              <Link to="/agreement">Пользовательское соглашение</Link>
              <Link to="/privacy">Политика конфиденциальности</Link>
            </div>
          </div>

          <nav className="footer-nav">
            <div className="footer-nav-col">
              <Link to="/authors">Авторам курсов</Link>
              <Link to="/companies">Компаниям</Link>
              <Link to="/help">Помощь</Link>
              <Link to="/contacts">Контакты</Link>
            </div>
            <div className="footer-nav-col">
              <Link to="/partnership">Партнёрство</Link>
              <Link to="/about">О проекте</Link>
              <Link to="/team">Команда</Link>
              <Link to="/jobs">Вакансии</Link>
            </div>
          </nav>

          <div className="footer-right">
            <div className="footer-social">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="ВКонтакте">
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
            Материалы платформы доступны по лицензии{' '}
            <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> с указанием авторства.
          </p>
        </div>
      </div>
    </footer>
  );
}
