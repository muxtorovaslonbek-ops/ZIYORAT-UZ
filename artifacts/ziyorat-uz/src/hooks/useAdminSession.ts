import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ziyorat_admin_token';

export type AdminSession = {
  isAdmin: boolean;
  token: string | null;
  loading: boolean;
  logout: () => void;
};

/** Reads & verifies the admin token from localStorage.
 *  Returns isAdmin=true when a valid, non-expired token is found. */
export const useAdminSession = (): AdminSession => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(!!localStorage.getItem(STORAGE_KEY));

  const verify = useCallback(async (tok: string) => {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      const data = await res.json();
      if (data.ok) {
        setIsAdmin(true);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) { setLoading(false); setIsAdmin(false); return; }
    setToken(stored);
    verify(stored);
  }, [verify]);

  const logout = useCallback(() => {
    const tok = localStorage.getItem(STORAGE_KEY);
    if (tok) {
      fetch('/api/admin/logout', { method: 'POST', headers: { Authorization: `Bearer ${tok}` } }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setIsAdmin(false);
  }, []);

  return { isAdmin, token, loading, logout };
};
