import { useState, useEffect } from 'react';
import { news as newsApi } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import './WhatsNewModal.css';

const MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function formatNewsDate(dateStr, locale) {
  const d = new Date(dateStr);
  if (locale === 'en') {
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  }
  const day = d.getDate();
  const month = MONTHS_RU[d.getMonth()];
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} г. в ${h}:${m}`;
}

export default function WhatsNewModal({ open, onClose }) {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setLoading(true);
    newsApi
      .list()
      .then(setItems)
      .catch(() => {
        setItems([]);
        setError(t('news.loadError'));
      })
      .finally(() => setLoading(false));
  }, [open, t, locale]);

  if (!open) return null;

  return (
    <div className="whatsnew-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="whatsnew-title">
      <div className="whatsnew-modal" onClick={(e) => e.stopPropagation()}>
        <div className="whatsnew-header">
          <h2 id="whatsnew-title" className="whatsnew-title">{t('news.title')}</h2>
          <button type="button" className="whatsnew-close" onClick={onClose} aria-label={t('news.close')}>
            ×
          </button>
        </div>
        <div className="whatsnew-body">
          {loading ? (
            <p className="whatsnew-loading">{t('news.loading')}</p>
          ) : error ? (
            <p className="whatsnew-error">{error}</p>
          ) : items.length === 0 ? (
            <p className="whatsnew-empty">{t('news.empty')}</p>
          ) : (
            <ul className="whatsnew-list">
              {items.map((item) => (
                <li key={item.id} className="whatsnew-item">
                  <time className="whatsnew-date" dateTime={item.published_at}>
                    {formatNewsDate(item.published_at, locale)}
                  </time>
                  <div
                    className="whatsnew-content"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
