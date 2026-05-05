import { useFavorites } from '../contexts/FavoritesContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function WantToTakeButton({ courseId, onCard, className = '' }) {
  const { t } = useLanguage();
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
      aria-label={active ? t('courseDetail.removeFromFavorites') : t('courseDetail.addToFavorites')}
    >
      {active ? t('courseDetail.inFavorites') : t('courseDetail.addToFavorites')}
    </button>
  );
}
