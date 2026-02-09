import { useState, useEffect } from 'react';
import { news as newsApi } from '../api';
import './WhatsNew.css';

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

export default function WhatsNew() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    newsApi
      .list()
      .then(setItems)
      .catch(() => setError('Не удалось загрузить новости.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page whatsnew-page">
      <h1 className="page-title">Новости CodeMentor</h1>
      {loading ? (
        <p className="text-muted">Загрузка...</p>
      ) : error ? (
        <p className="form-error">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-muted">Пока нет новостей.</p>
      ) : (
        <ul className="whatsnew-page-list">
          {items.map((item) => (
            <li key={item.id} className="whatsnew-page-item">
              <time className="whatsnew-page-date" dateTime={item.published_at}>
                {formatNewsDate(item.published_at)}
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
