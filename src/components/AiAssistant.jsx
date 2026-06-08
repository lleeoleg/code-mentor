import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ai as aiApi } from '../api';
import './AiAssistant.css';

function renderMessageContent(text) {
  const parts = String(text).split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const inner = part.slice(3, -3).replace(/^[\w+-]*\n?/, '');
      return (
        <pre key={i} className="ai-assistant-code">
          <code>{inner}</code>
        </pre>
      );
    }
    return (
      <span key={i} className="ai-assistant-text">
        {part.split('\n').map((line, j, arr) => (
          <span key={j}>
            {line}
            {j < arr.length - 1 ? <br /> : null}
          </span>
        ))}
      </span>
    );
  });
}

export default function AiAssistant() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [open, messages, loading]);

  useEffect(() => {
    if (open) {
      const tId = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(tId);
    }
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!user) return;

    setError('');
    setInput('');
    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const history = messages.slice(-10);
      const { reply } = await aiApi.chat(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : t('aiAssistant.error'));
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`ai-assistant ${open ? 'ai-assistant--open' : ''}`}>
      {open && (
        <div className="ai-assistant-panel" role="dialog" aria-label={t('aiAssistant.title')}>
          <div className="ai-assistant-header">
            <div className="ai-assistant-header-text">
              <span className="ai-assistant-header-icon" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                  <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1 1 3z" />
                </svg>
              </span>
              <div>
                <h3 className="ai-assistant-title">{t('aiAssistant.title')}</h3>
                <p className="ai-assistant-subtitle">{t('aiAssistant.subtitle')}</p>
              </div>
            </div>
            <button
              type="button"
              className="ai-assistant-close"
              onClick={() => setOpen(false)}
              aria-label={t('aiAssistant.close')}
            >
              ×
            </button>
          </div>

          <div className="ai-assistant-body" ref={bodyRef}>
            {!user ? (
              <div className="ai-assistant-welcome">
                <p>{t('aiAssistant.loginRequired')}</p>
                <Link to="/login" className="ai-assistant-login-link" onClick={() => setOpen(false)}>
                  {t('header.login')}
                </Link>
              </div>
            ) : messages.length === 0 && !loading ? (
              <div className="ai-assistant-welcome">
                <p>{t('aiAssistant.welcome')}</p>
              </div>
            ) : (
              <ul className="ai-assistant-messages">
                {messages.map((msg, idx) => (
                  <li
                    key={idx}
                    className={`ai-assistant-message ai-assistant-message--${msg.role}`}
                  >
                    <div className="ai-assistant-bubble">{renderMessageContent(msg.content)}</div>
                  </li>
                ))}
                {loading && (
                  <li className="ai-assistant-message ai-assistant-message--assistant">
                    <div className="ai-assistant-bubble ai-assistant-bubble--typing">
                      {t('aiAssistant.thinking')}
                    </div>
                  </li>
                )}
              </ul>
            )}
            {error ? <p className="ai-assistant-error">{error}</p> : null}
          </div>

          {user && (
            <div className="ai-assistant-footer">
              <textarea
                ref={inputRef}
                className="ai-assistant-input"
                placeholder={t('aiAssistant.placeholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                disabled={loading}
              />
              <button
                type="button"
                className="ai-assistant-send"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label={t('aiAssistant.send')}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 11 13 2 9 22 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        className="ai-assistant-fab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? t('aiAssistant.close') : t('aiAssistant.open')}
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
            <path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1 1 3z" />
          </svg>
        )}
      </button>
    </div>
  );
}
