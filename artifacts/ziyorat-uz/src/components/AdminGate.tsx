import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldAlert, Copy, Check, ExternalLink, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/hooks/useUserRole';
import { useAuth } from '@/hooks/useAuth';

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading, refetch } = useIsAdmin();
  const [copied, setCopied] = useState<'id' | 'sql' | null>(null);
  const [checking, setChecking] = useState(false);

  if (authLoading || loading) return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader2 className="w-6 h-6 text-gold animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-2xl border border-destructive/40 bg-card p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="font-display text-2xl text-foreground mb-2">Kirish kerak</h2>
        <p className="text-sm text-muted-foreground mb-6">Admin panelga kirish uchun tizimga kiring.</p>
        <Link to="/auth"><Button className="bg-gold hover:bg-gold/90 text-black">Kirish</Button></Link>
      </div>
    </div>
  );

  if (!isAdmin) {
    const userId = user.id;
    const sql = `INSERT INTO public.user_roles (user_id, role)\nVALUES ('${userId}', 'admin');`;
    const supabaseUrl = `https://supabase.com/dashboard/project/hoofyqhayogecrmemtss/sql/new`;

    const copy = (type: 'id' | 'sql', text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    };

    const recheck = async () => {
      setChecking(true);
      await refetch?.();
      setChecking(false);
    };

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-10">
        <div className="max-w-lg w-full rounded-2xl border border-gold/30 bg-card p-8 space-y-6">
          {/* Title */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-gold" />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-1">Admin huquqi yo'q</h2>
            <p className="text-sm text-muted-foreground">
              Quyidagi ko'rsatmalar orqali o'zingizga admin huquqi bering
            </p>
          </div>

          {/* Step 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <p className="text-sm font-medium">Supabase SQL Editor ga o'ting</p>
            </div>
            <a
              href={supabaseUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-gold hover:underline pl-8"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              supabase.com → SQL Editor → New query
            </a>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <p className="text-sm font-medium">Quyidagi SQL ni nusxa oling va ishga tushiring</p>
            </div>
            <div className="relative pl-8">
              <pre className="bg-secondary rounded-lg p-3 text-xs font-mono text-foreground/90 overflow-x-auto border border-gold/20 whitespace-pre-wrap">
                {sql}
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 h-7 w-7 p-0 border-gold/30"
                onClick={() => copy('sql', sql)}
              >
                {copied === 'sql' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground pl-8">
              Sizning User ID:{' '}
              <button
                className="font-mono text-gold hover:underline"
                onClick={() => copy('id', userId)}
              >
                {userId.slice(0, 8)}...{userId.slice(-4)}
                {copied === 'id' && <span className="text-green-500 ml-1">✓</span>}
              </button>
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0">3</span>
              <p className="text-sm font-medium">SQL ni bajargandan so'ng tekshiring</p>
            </div>
            <div className="pl-8">
              <Button
                onClick={recheck}
                disabled={checking}
                className="bg-gold hover:bg-gold/90 text-black gap-2 h-9"
              >
                {checking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Admin huquqini tekshirish
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <Link to="/"><Button variant="ghost" className="text-muted-foreground text-sm w-full">← Bosh sahifaga</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
