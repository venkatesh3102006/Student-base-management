import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export const useProtectedRoute = (requiredRole = null) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router, requiredRole]);

  return { user, loading };
};
