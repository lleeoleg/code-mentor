import { useState, useEffect } from 'react';
import { auth, courses } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { formatCoursePrice } from '../utils/courseHelpers';
import './PaymentModal.css';

export default function PaymentModal({ open, onClose, course }) {
  const { t, locale } = useLanguage();
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
        else setError(t('payment.noPaymentUrl'));
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message || t('payment.errorCreate'));
      })
      .finally(() => setLoading(false));
  };

  const priceDisplay = course
    ? formatCoursePrice(course.price, {
        freeLabel: t('common.priceFree'),
        numberLocale: locale === 'en' ? 'en-US' : 'ru-RU',
      })
    : '';

  return (
    <div className="payment-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
      <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div className="payment-modal-header">
          <h2 id="payment-modal-title" className="payment-modal-title">
            {t('payment.title')} «{course?.title || ''}»
          </h2>
          <button type="button" className="payment-modal-close" onClick={onClose} aria-label={t('payment.close')}>
            ×
          </button>
        </div>

        <div className="payment-modal-tabs">
          <button
            type="button"
            className={`payment-modal-tab ${tab === 'self' ? 'active' : ''}`}
            onClick={() => setTab('self')}
          >
            {t('payment.forSelf')}
          </button>
          <button
            type="button"
            className={`payment-modal-tab ${tab === 'gift' ? 'active' : ''}`}
            onClick={() => setTab('gift')}
          >
            {t('payment.asGift')}
          </button>
        </div>

        <div className="payment-modal-body">
          <label className="payment-modal-field">
            <span className="payment-modal-label">{t('payment.yourEmail')}</span>
            <input
              type="email"
              className="payment-modal-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </label>

          <div className="payment-modal-field">
            <span className="payment-modal-label">{t('payment.cost')}</span>
            <p className="payment-modal-price">{priceDisplay}</p>
          </div>

          <button
            type="button"
            className="payment-modal-promo-toggle"
            onClick={() => setShowPromo((v) => !v)}
          >
            {t('payment.havePromo')}
            <span className={`payment-modal-chevron ${showPromo ? 'open' : ''}`}>▼</span>
          </button>
          {showPromo && (
            <div className="payment-modal-promo">
              <input type="text" className="payment-modal-input" placeholder={t('payment.promoPlaceholder')} />
            </div>
          )}

          <label className="payment-modal-checkbox">
            <input
              type="checkbox"
              checked={foreignCard}
              onChange={(e) => setForeignCard(e.target.checked)}
            />
            <span>{t('payment.foreignCard')}</span>
            <span className="payment-modal-info" title={t('payment.foreignCard')}>ⓘ</span>
          </label>

          {error && <p className="payment-modal-error">{error}</p>}

          <button
            type="button"
            className="payment-modal-pay-btn"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? t('payment.preparing') : t('payment.pay')}
          </button>

          <div className="payment-modal-links">
            <a href="#how-to-pay">{t('payment.howToPay')}</a>
            <a href="#installment">{t('payment.installment')}</a>
            <a href="#company">{t('payment.companyPay')}</a>
          </div>
        </div>

        <p className="payment-modal-footer">
          {t('payment.footer')}
        </p>
      </div>
    </div>
  );
}
