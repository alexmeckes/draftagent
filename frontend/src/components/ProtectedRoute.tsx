import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const hasStoredUserId = localStorage.getItem('userId');

  if (!user && !hasStoredUserId) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}