import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PremiumPlan } from '@/lib/premium';

export type PremiumState = {
  id: string;
  plan: PremiumPlan;
  source: 'stripe' | 'manual';
  startedAt: number;
  expiresAt: number;
};

export const usePremium = () => {
  const { user } = useAuth();
  const [state, setState] = useState<PremiumState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!user) { setState(null); setLoading(false); return; }
    const { data } = await supabase.rpc('get_active_subscription', { _user_id: user.id });
    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      setState({
        id: row.id, plan: row.plan, source: row.source,
        startedAt: new Date(row.started_at).getTime(),
        expiresAt: new Date(row.expires_at).getTime(),
      });
    } else setState(null);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('premium:changed', onChange);
    return () => window.removeEventListener('premium:changed', onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { premium: state, loading, refresh };
};

// Premium to'lov tizimi hozircha to'liq faollashtirilmagan.
// Barcha foydalanuvchilarga premium bo'limlar BEPUL ochiq.
// Keyinroq to'lov tasdiqlash to'liq ishlaganda, pastdagi `BYPASS` ni `false` ga o'zgartiring.
const BYPASS_PREMIUM = true;

export const PremiumGate = ({ featureName: _featureName, children }: { featureName: string; children: ReactNode }) => {
  if (BYPASS_PREMIUM) return <>{children}</>;
  return <>{children}</>;
};
