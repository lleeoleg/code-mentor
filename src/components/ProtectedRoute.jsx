import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function ProtectedRoute({ children }) {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page loading">{t('common.loading')}</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
