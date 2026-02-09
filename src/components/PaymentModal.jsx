import { useState, useEffect } from 'react';
import { auth, courses } from '../api';
import { formatCoursePrice } from '../utils/courseHelpers';
import './PaymentModal.css';

export default function PaymentModal({ open, onClose, course }) {
  const [tab, setTab] = useState('self');
  const [email, setEmail] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [foreignCard, setForeignCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setError(null);
      auth.me().then((user) => setEmail(user.email || '')).catch(() => setEmail(''));
    }
  }, [open]);

  if (!open) return null;

  const handlePay = () => {
    if (!course?.id) return;
    setLoading(true);
    setError(null);
    courses
      .createCheckoutSession(course.id)
      .then((data) => {
        if (data?.url) window.location.href = data.url;
        else setError('Не получена ссылка на оплату.');
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message || 'Ошибка при создании оплаты.');
      })
      .finally(() => setLoading(false));
  };

  const priceDisplay = course ? formatCoursePrice(course.price) : '';

  return (
    <div className="payment-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2 id="payment-modal-title" className="payment-modal-title">
            Оплата доступа к курсу «{course?.title || ''}»
          </h2>
          <button type="button" className="payment-modal-close" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className="payment-modal-tabs">
          <button
            type="button"
            className={`payment-modal-tab ${tab === 'self' ? 'active' : ''}`}
            onClick={() => setTab('self')}
          >
            Себе
          </button>
          <button
            type="button"
            className={`payment-modal-tab ${tab === 'gift' ? 'active' : ''}`}
            onClick={() => setTab('gift')}
          >
            В подарок
          </button>
        </div>

        <div className="payment-modal-body">
          <label className="payment-modal-field">
            <span className="payment-modal-label">Ваш e-mail</span>
            <input
              type="email"
              className="payment-modal-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </label>

          <div className="payment-modal-field">
            <span className="payment-modal-label">Стоимость</span>
            <p className="payment-modal-price">{priceDisplay}</p>
          </div>

          <button
            type="button"
            className="payment-modal-promo-toggle"
            onClick={() => setShowPromo((v) => !v)}
          >
            У меня есть промокод
            <span className={`payment-modal-chevron ${showPromo ? 'open' : ''}`}>▼</span>
          </button>
          {showPromo && (
            <div className="payment-modal-promo">
              <input type="text" className="payment-modal-input" placeholder="Введите промокод" />
            </div>
          )}

          <label className="payment-modal-checkbox">
            <input
              type="checkbox"
              checked={foreignCard}
              onChange={(e) => setForeignCard(e.target.checked)}
            />
            <span>Хочу оплатить картой иностранного банка</span>
            <span className="payment-modal-info" title="Оплата картой иностранного банка">ⓘ</span>
          </label>

          {error && <p className="payment-modal-error">{error}</p>}

          <button
            type="button"
            className="payment-modal-pay-btn"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? 'Подготовка…' : 'Оплатить'}
          </button>

          <div className="payment-modal-links">
            <a href="#how-to-pay">Как оплатить курс?</a>
            <a href="#installment">Как оплатить курс в рассрочку?</a>
            <a href="#company">Оплатить от компании</a>
          </div>
        </div>

        <p className="payment-modal-footer">
          Оплачивая доступ к этому курсу, вы соглашаетесь с условиями пользовательского соглашения.
          Если у вас возникли проблемы с оплатой или не пришло письмо с подарком, напишите нам на help@codementor.example.org.
        </p>
      </div>
    </div>
  );
}
