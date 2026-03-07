import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireParent?: boolean;
}

export function ProtectedRoute({ children, requireParent = false }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireParent && user?.role !== 'parent') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
