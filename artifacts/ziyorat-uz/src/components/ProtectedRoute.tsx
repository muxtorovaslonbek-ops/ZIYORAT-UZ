import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
};
