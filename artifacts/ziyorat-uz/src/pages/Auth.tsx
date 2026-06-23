import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/Navbar';
import { Seo } from '@/components/Seo';
import { Send, Mail, Loader2, CheckCircle } from 'lucide-react';

type Tab = 'signin' | 'signup' | 'telegram';

interface TelegramInfo {
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
}

const Auth = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const [tgCode, setTgCode] = useState('');
  const [tgVerifying, setTgVerifying] = useState(false);
  const [tgDone, setTgDone] = useState(false);

  if (user) return <Navigate to="/" replace />;

  // ── Email sign-in / sign-up ──────────────────────────────────────────────
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) { toast.error(error.message); return; }
        if (data.session) {
          toast.success("Ro'yxatdan o'tdingiz!");
          navigate('/profile');
        } else {
          // Try sign in directly (email confirmation may be disabled)
          const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) {
            toast.success("Ro'yxatdan o'tdingiz! Emailingizni tasdiqlang.");
          } else {
            toast.success('Xush kelibsiz!');
            navigate('/profile');
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const msg = error.message.toLowerCase().includes('email not confirmed')
            ? 'Email hali tasdiqlanmagan.'
            : error.message.toLowerCase().includes('invalid login')
            ? "Email yoki parol noto'g'ri."
            : error.message;
          toast.error(msg);
        } else {
          toast.success('Xush kelibsiz!');
          navigate('/profile');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Telegram: verify code → auto login (no email needed) ─────────────────
  const verifyTgCode = async () => {
    const code = tgCode.trim();
    if (code.length !== 6) { toast.error('6 xonali kod kiriting'); return; }
    setTgVerifying(true);
    try {
      const res = await fetch(`/api/telegram/verify-code/${code}`);
      const json = await res.json();
      if (!json.ok) { toast.error(json.error || 'Kod topilmadi'); return; }
      const info: TelegramInfo = json.data;

      // Auto-generate internal Supabase credentials (user never sees these)
      const internalEmail = `tg_${info.telegram_id}@ziyorat.app`;
      const internalPassword = `ZRTG_${info.telegram_id}_2026!`;
      const fullNameFromTg = [info.first_name, info.last_name].filter(Boolean).join(' ');

      setLoading(true);
      // Try sign up
      const { data, error } = await supabase.auth.signUp({
        email: internalEmail,
        password: internalPassword,
        options: {
          data: {
            full_name: fullNameFromTg,
            telegram_id: String(info.telegram_id),
            telegram_username: info.username || '',
          },
        },
      });

      if (error && !error.message.toLowerCase().includes('already registered')) {
        toast.error(error.message);
        return;
      }

      // If already registered or no session, sign in
      if (!data?.session) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: internalEmail,
          password: internalPassword,
        });
        if (signInErr) { toast.error(signInErr.message); return; }
      }

      // Consume the code
      fetch(`/api/telegram/verify-code/${code}`, { method: 'DELETE' }).catch(() => {});

      setTgDone(true);
      toast.success(`Xush kelibsiz, ${info.first_name}! 🎉`);
      setTimeout(() => navigate('/profile'), 800);
    } catch {
      toast.error('Ulanish xatosi');
    } finally {
      setTgVerifying(false);
      setLoading(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'signin', label: 'Kirish', icon: <Mail className="w-4 h-4" /> },
    { id: 'signup', label: "Ro'yxat (email)", icon: <Mail className="w-4 h-4" /> },
    { id: 'telegram', label: 'Telegram orqali', icon: <Send className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Kirish va ro'yxat — ZIYORAT UZ" description="ZIYORAT UZ tizimiga kirish yoki yangi hisob yarating." path="/auth" />
      <Navbar />
      <div className="container max-w-md py-16 animate-fade-in">
        <Card className="bg-card-gradient border-gold/30 p-8 shadow-elegant animate-scale-in">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl text-gold-gradient mb-2">
              {tab === 'telegram' ? 'Telegram orqali' : tab === 'signin' ? t('auth.signIn') : t('auth.signUp')}
            </h1>
            <div className="ornament-divider mt-4 mb-0" />
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-gold/20 overflow-hidden mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-gold text-noir'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* ── Email sign-in / sign-up ── */}
          {(tab === 'signin' || tab === 'signup') && (
            <form onSubmit={submitEmail} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <Label htmlFor="name">{t('auth.fullName')}</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-input border-gold/30" />
                </div>
              )}
              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="bg-input border-gold/30" />
              </div>
              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} className="bg-input border-gold/30" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold-soft text-noir font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (tab === 'signin' ? t('auth.signIn') : t('auth.signUp'))}
              </Button>
            </form>
          )}

          {/* ── Telegram ── */}
          {tab === 'telegram' && (
            <div className="space-y-5">
              {tgDone ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle className="w-14 h-14 text-green-500" />
                  <p className="text-lg font-medium text-green-500">Muvaffaqiyatli kirdingiz!</p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-gold/20 bg-secondary/40 p-4 space-y-3">
                    <p className="text-sm font-medium text-center">Telegram bot orqali kiring</p>
                    <a
                      href="https://t.me/ziyorat_bot"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 w-full justify-center py-2.5 rounded-lg bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1a8bc4] transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      @ziyorat_bot ga /start yuboring
                    </a>
                    <p className="text-xs text-muted-foreground text-center">
                      Bot sizga 6 xonali kod yuboradi
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm">Botdan kelgan kodni kiriting</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="000000"
                        value={tgCode}
                        onChange={(e) => setTgCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="bg-input border-gold/30 text-center tracking-[0.4em] text-lg font-mono"
                        onKeyDown={(e) => { if (e.key === 'Enter' && tgCode.length === 6) verifyTgCode(); }}
                      />
                      <Button
                        onClick={verifyTgCode}
                        disabled={tgVerifying || loading || tgCode.length !== 6}
                        className="bg-gold text-noir hover:bg-gold-soft shrink-0 min-w-[90px]"
                      >
                        {tgVerifying || loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirish'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Email yoki parol kerak emas — faqat Telegram kodi
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            {tab === 'signin' ? t('auth.noAccount') : "Hisobingiz bormi?"}{' '}
            <button
              onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
              className="text-gold hover:underline font-medium"
            >
              {tab === 'signin' ? t('auth.signUp') : t('auth.signIn')}
            </button>
          </p>
          <p className="text-center mt-4">
            <Link to="/" className="text-xs text-muted-foreground hover:text-gold">← Asosiy sahifaga</Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
