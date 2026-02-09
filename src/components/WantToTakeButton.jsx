import { useFavorites } from '../contexts/FavoritesContext';

export default function WantToTakeButton({ courseId, onCard, className = '' }) {
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
      className={`course-want-btn ${active ? 'course-want-btn-active' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {active ? 'В избранном' : 'Хочу пройти'}
    </button>
  );
}
