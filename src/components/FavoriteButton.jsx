import { useFavorites } from '../contexts/FavoritesContext';

const HeartOutline = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const HeartFilled = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function FavoriteButton({ courseId, onCard, className = '' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(courseId);

  const handleClick = (e) => {
    if (onCard) {
      e.preventDefault();
      e.stopPropagation();
    }
    toggleFavorite(courseId);
  };

  return (
    <button
      type="button"
      className={`course-fav-btn ${active ? 'course-fav-btn-active' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {active ? <HeartFilled /> : <HeartOutline />}
    </button>
  );
}
