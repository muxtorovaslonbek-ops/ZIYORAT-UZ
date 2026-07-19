import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const TG_SESSION_KEY = 'ziyorat_tg_session';

interface TgUser {
  user_id: string;
  full_name: string;
  telegram_id: string;
  telegram_username: string | null;
  email: string;
}

interface AuthContextValue {
  user: User | TgUser | null;
  session: Session | null;
  tgToken: string | null;
  loading: boolean;
  isTelegramUser: boolean;
  signOut: () => Promise<void>;
  authToken: string | null; // whichever token is active
}

const AuthContext = createContext<AuthContextValue>({
  user: null, session: null, tgToken: null, loading: true,
  isTelegramUser: false, signOut: async () => {}, authToken: null,
});

const syncProfile = async (token: string, meta?: Record<string, unknown>) => {
  try {
    await fetch('/api/profile/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(meta || {}),
    });
  } catch { /* silent */ }
};

// JWT uses base64url (RFC 4648): '-' instead of '+', '_' instead of '/'
// Standard atob() does not handle this — we must convert first.
const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // Convert base64url → base64, then add padding
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch { return null; }
};

const parseTgToken = (token: string): TgUser | null => {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.type !== 'telegram') return null;
  return {
    user_id: String(payload.user_id || ''),
    full_name: String(payload.full_name || ''),
    telegram_id: String(payload.telegram_id || ''),
    telegram_username: payload.telegram_username ? String(payload.telegram_username) : null,
    email: String(payload.email || ''),
  };
};

const isTgTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload.exp as number | undefined;
  return !!exp && Date.now() / 1000 > exp;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [tgToken, setTgToken] = useState<string | null>(null);
  const [tgUser, setTgUser] = useState<TgUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Supabase auth listener + TG session loader (single combined effect to avoid race)
  useEffect(() => {
    // Load TG session immediately (sync)
    const stored = localStorage.getItem(TG_SESSION_KEY);
    if (stored && !isTgTokenExpired(stored)) {
      const parsed = parseTgToken(stored);
      if (parsed) {
        setTgToken(stored);
        setTgUser(parsed);
        syncProfile(stored);
      } else {
        localStorage.removeItem(TG_SESSION_KEY);
      }
    } else if (stored) {
      localStorage.removeItem(TG_SESSION_KEY);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSupabaseUser(newSession?.user ?? null);
      setLoading(false);
      if (newSession?.access_token) {
        syncProfile(newSession.access_token, {
          full_name: newSession.user?.user_metadata?.full_name || '',
          telegram_id: newSession.user?.user_metadata?.telegram_id || null,
          telegram_username: newSession.user?.user_metadata?.telegram_username || null,
        });
        // Supabase session wins — clear TG session
        localStorage.removeItem(TG_SESSION_KEY);
        setTgToken(null);
        setTgUser(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      setLoading(false);
      if (s?.access_token) {
        syncProfile(s.access_token, {
          full_name: s.user?.user_metadata?.full_name || '',
          telegram_id: s.user?.user_metadata?.telegram_id || null,
          telegram_username: s.user?.user_metadata?.telegram_username || null,
        });
        localStorage.removeItem(TG_SESSION_KEY);
        setTgToken(null);
        setTgUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem(TG_SESSION_KEY);
    setTgToken(null);
    setTgUser(null);
    await supabase.auth.signOut();
  };

  const isTelegramUser = !supabaseUser && !!tgUser;
  const user = supabaseUser ?? tgUser;
  const authToken = session?.access_token ?? tgToken;

  return (
    <AuthContext.Provider value={{ user, session, tgToken, loading, isTelegramUser, signOut, authToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export const TG_SESSION_KEY_EXPORT = TG_SESSION_KEY;
