import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0A2540] dark:text-amber-400" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
          Verifying Jan Parichay Government Credentials...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the Login Page or Landing Page
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
