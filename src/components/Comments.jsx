import { useState, useEffect } from 'react';
import { comments } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getProfile } from '../utils/profileStore';
import './Comments.css';

export default function Comments({ lessonId }) {
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  const [commentsList, setCommentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [, setProfileUpdateTick] = useState(0);

  useEffect(() => {
    const onProfileUpdated = () => setProfileUpdateTick((t) => t + 1);
    window.addEventListener('profileUpdated', onProfileUpdated);
    return () => window.removeEventListener('profileUpdated', onProfileUpdated);
  }, []);

  useEffect(() => {
    if (!lessonId) {
      setCommentsList([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    comments
      .list(lessonId)
      .then((data) => {
        setCommentsList(data || []);
      })
      .catch(() => {
        setCommentsList([]);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !lessonId) return;

    setSubmitting(true);
    try {
      const created = await comments.create(lessonId, newComment.trim());
      setCommentsList([created, ...commentsList]);
      setNewComment('');
    } catch (err) {
      alert(t('comments.errorAdd'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const updated = await comments.update(commentId, editText.trim());
      setCommentsList(commentsList.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      alert(t('comments.errorEdit'));
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm(t('comments.confirmDelete'))) {
      return;
    }

    setDeletingId(commentId);
    try {
      await comments.delete(commentId);
      setCommentsList(commentsList.filter((c) => c.id !== commentId));
    } catch (err) {
      alert(t('comments.errorDelete'));
    } finally {
      setDeletingId(null);
    }
  };

  const isAuthor = (comment) => user && comment.user_id === user.id;

  const getInitials = (username) => {
    if (!username) return '?';
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
    return username.slice(0, 2).toUpperCase();
  };

  const loc = locale === 'en' ? 'en-US' : 'ru-RU';
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const timeStr = date.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });

    if (diffMins < 1) return timeStr;
    if (diffMins < 60) return `${diffMins} ${locale === 'en' ? 'min ago' : 'мин. назад'} (${timeStr})`;
    if (diffHours < 24) return `${diffHours} ${locale === 'en' ? 'hr ago' : 'ч. назад'} (${timeStr})`;
    if (diffDays < 7) return `${diffDays} ${locale === 'en' ? 'd ago' : 'дн. назад'} (${date.toLocaleDateString(loc, { day: 'numeric', month: 'short' })} ${timeStr})`;

    return date.toLocaleString(loc, {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">{t('comments.title')}</h3>

      {user && (
        <form className="comments-form" onSubmit={handleSubmit}>
          <textarea
            className="comments-input"
            placeholder={t('comments.placeholder')}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            disabled={submitting}
          />
          <button
            type="submit"
            className="comments-submit-btn"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? t('comments.submitting') : t('comments.submit')}
          </button>
        </form>
      )}

      {!user && (
        <p className="comments-login-hint">
          <a href="/login">{t('comments.loginLink')}</a> {t('comments.loginSuffix')}
        </p>
      )}

      {loading ? (
        <div className="comments-loading">{t('comments.loading')}</div>
      ) : commentsList.length === 0 ? (
        <div className="comments-empty">{t('comments.empty')}</div>
      ) : (
        <div className="comments-list">
          {commentsList.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-avatar" aria-hidden title={comment.username}>
                  {getProfile(comment.username).avatar ? (
                    <img src={getProfile(comment.username).avatar} alt="" />
                  ) : (
                    getInitials(comment.username)
                  )}
                </div>
                <div className="comment-header-left">
                  <span className="comment-author">{comment.username}</span>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                {isAuthor(comment) && editingId !== comment.id && (
                  <div className="comment-actions">
                    <button
                      type="button"
                      className="comment-edit-btn"
                      onClick={() => handleEdit(comment)}
                      disabled={deletingId === comment.id}
                      title={t('comments.edit')}
                      aria-label={t('comments.edit')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="comment-delete-btn"
                      onClick={() => handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      title={deletingId === comment.id ? t('comments.deleting') : t('comments.delete')}
                      aria-label={t('comments.delete')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <div className="comment-edit-form">
                  <textarea
                    className="comments-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows="3"
                  />
                  <div className="comment-edit-actions">
                    <button
                      type="button"
                      className="comment-save-btn"
                      onClick={() => handleSaveEdit(comment.id)}
                      disabled={!editText.trim()}
                    >
                      {t('comments.save')}
                    </button>
                    <button
                      type="button"
                      className="comment-cancel-btn"
                      onClick={handleCancelEdit}
                    >
                      {t('comments.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-text">{comment.text}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
