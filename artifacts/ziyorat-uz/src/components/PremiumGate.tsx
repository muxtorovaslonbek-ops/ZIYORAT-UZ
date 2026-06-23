import { useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Lock, Send, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

type PremiumStatus = {
  premium: boolean;
  requestStatus: 'pending' | 'approved' | 'rejected' | null;
};

export const usePremium = () => {
  const { session } = useAuth();
  const [status, setStatus] = useState<PremiumStatus>({ premium: false, requestStatus: null });
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!session?.access_token) { setStatus({ premium: false, requestStatus: null }); setLoading(false); return; }
    try {
      const res = await fetch('/api/premium/status', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      setStatus({ premium: data.premium ?? false, requestStatus: data.requestStatus ?? null });
    } catch {
      setStatus({ premium: false, requestStatus: null });
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => { check(); }, [check]);
  return { ...status, loading, refresh: check };
};

// ── PremiumGate ────────────────────────────────────────────────────────────
export const PremiumGate = ({ featureName, children }: { featureName: string; children: ReactNode }) => {
  const { user, session } = useAuth();
  const { premium, requestStatus, loading, refresh } = usePremium();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  const requestAccess = async () => {
    if (!session?.access_token) return;
    setRequesting(true);
    try {
      const res = await fetch('/api/premium/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_name: user?.user_metadata?.full_name || '',
          telegram_username: user?.user_metadata?.telegram_username || '',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setRequested(true);
        toast.success("So'rov yuborildi! Admin tez orada ko'rib chiqadi.");
        refresh();
      } else {
        toast.error(data.error || 'Xato yuz berdi');
      }
    } catch {
      toast.error('Ulanish xatosi');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-gold animate-spin" />
    </div>
  );

  if (premium) return <>{children}</>;

  // Not logged in
  if (!user) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-gold" />
        </div>
        <div>
          <h2 className="font-display text-xl text-foreground mb-2">Kirish kerak</h2>
          <p className="text-sm text-muted-foreground">
            <span className="text-gold font-medium">{featureName}</span> bo'limidan foydalanish uchun tizimga kiring.
          </p>
        </div>
        <Link to="/auth">
          <Button className="bg-gold hover:bg-gold/90 text-black w-full">Kirish / Ro'yxat</Button>
        </Link>
      </div>
    </div>
  );

  // Logged in but no premium
  const isPending = requestStatus === 'pending' || requested;
  const isRejected = requestStatus === 'rejected';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto">
          <Crown className="w-8 h-8 text-gold" />
        </div>
        <div>
          <h2 className="font-display text-xl text-foreground mb-2">Premium bo'lim</h2>
          <p className="text-sm text-muted-foreground mb-1">
            <span className="text-gold font-medium">{featureName}</span> faqat premium foydalanuvchilar uchun.
          </p>
          <p className="text-xs text-muted-foreground">
            Admin tasdiqlashidan so'ng to'liq kirish imkoniyati beriladi.
          </p>
        </div>

        {isPending ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="w-5 h-5 text-amber-500" />
              <p className="text-sm font-medium text-amber-500">So'rov yuborildi</p>
            </div>
            <p className="text-xs text-muted-foreground">Admin ko'rib chiqmoqda. Tasdiqlangach kirish imkoniyati beriladi.</p>
          </div>
        ) : isRejected ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm text-destructive">So'rovingiz rad etildi. Admin bilan bog'laning.</p>
            <a href="https://t.me/ziyorat_bot" target="_blank" rel="noreferrer">
              <Button variant="outline" className="border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/10 w-full gap-2">
                <Send className="w-4 h-4" />
                Admin bilan bog'lanish
              </Button>
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={requestAccess}
              disabled={requesting}
              className="bg-gold hover:bg-gold/90 text-black w-full gap-2"
            >
              {requesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              Admin tasdiqlashini so'rash
            </Button>
            <p className="text-xs text-muted-foreground">
              So'rov yuborilgach admin tez orada ko'rib chiqadi
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
