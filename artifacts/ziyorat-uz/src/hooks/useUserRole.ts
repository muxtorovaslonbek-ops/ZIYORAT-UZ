import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Admin check is done via the backend admin token — regular users are never admins.
// This hook just returns false always (admin panel has its own auth flow).
export const useIsAdmin = () => {
  const { user } = useAuth();
  const [isAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user !== undefined) check();
  }, [user, check]);

  return { isAdmin, loading, refetch: check };
};
