import { useState, useEffect } from 'react';
import { news as newsApi } from '../api';
import './WhatsNewModal.css';

const MONTHS_RU = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function formatNewsDate(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDate();
  const month = MONTHS_RU[d.getMonth()];
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} г. в ${h}:${m}`;
}

export default function WhatsNewModal({ open, onClose }) {
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
        setError('Не удалось загрузить новости.');
      })
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  return (
    <div className="whatsnew-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="whatsnew-title">
      <div className="whatsnew-modal" onClick={(e) => e.stopPropagation()}>
        <div className="whatsnew-header">
          <h2 id="whatsnew-title" className="whatsnew-title">Новости CodeMentor</h2>
          <button type="button" className="whatsnew-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>
        <div className="whatsnew-body">
          {loading ? (
            <p className="whatsnew-loading">Загрузка...</p>
          ) : error ? (
            <p className="whatsnew-error">{error}</p>
          ) : items.length === 0 ? (
            <p className="whatsnew-empty">Пока нет новостей.</p>
          ) : (
            <ul className="whatsnew-list">
              {items.map((item) => (
                <li key={item.id} className="whatsnew-item">
                  <time className="whatsnew-date" dateTime={item.published_at}>
                    {formatNewsDate(item.published_at)}
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
