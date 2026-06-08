import { useState, useEffect } from 'react';
import { news as newsApi } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import './WhatsNew.css';

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

export default function WhatsNew() {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    newsApi
      .list()
      .then(setItems)
      .catch(() => setError(t('news.loadError')))
      .finally(() => setLoading(false));
  }, [t, locale]);

  return (
    <div className="page whatsnew-page">
      <h1 className="page-title">{t('news.title')}</h1>
      {loading ? (
        <p className="text-muted">{t('news.loading')}</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-muted">{t('news.empty')}</p>
      ) : (
        <ul className="whatsnew-page-list">
          {items.map((item) => (
            <li key={item.id} className="whatsnew-page-item">
              <time className="whatsnew-page-date" dateTime={item.published_at}>
                {formatNewsDate(item.published_at, locale)}
              </time>
              <div
                className="whatsnew-page-content"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
