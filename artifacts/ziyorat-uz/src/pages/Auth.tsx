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
import { Send, Mail, Loader2, CheckCircle, Shield } from 'lucide-react';

const TG_SESSION_KEY = 'ziyorat_tg_session';
type Tab = 'signin' | 'signup' | 'telegram';

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
  const [tgStep, setTgStep] = useState<'code' | 'done'>('code');
  const [tgLoading, setTgLoading] = useState(false);

  if (user) return <Navigate to="/profile" replace />;

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
            ? 'Email hali tasdiqlanmagan. Inbox ni tekshiring.'
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

  // ── Telegram: code → backend → custom JWT ────────────────────────────────
  const verifyTgCode = async () => {
    const code = tgCode.trim();
    if (code.length !== 6) { toast.error('6 xonali kod kiriting'); return; }
    setTgLoading(true);
    try {
      const res = await fetch('/api/telegram/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();

      if (!json.ok) {
        toast.error(json.error || 'Kod topilmadi. Botdan yangi kod oling.');
        return;
      }

      // Store custom JWT in localStorage — useAuth will pick it up on reload
      localStorage.setItem(TG_SESSION_KEY, json.token);
      setTgStep('done');
      toast.success(`Xush kelibsiz, ${json.user.full_name || 'do\'st'}! 🎉`);
      // Force page reload so useAuth picks up the new TG session
      setTimeout(() => {
        window.location.href = '/profile';
      }, 900);
    } catch {
      toast.error('Server bilan ulanishda xato. Qayta urinib ko\'ring.');
    } finally {
      setTgLoading(false);
    }
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'signin', label: 'Kirish', icon: <Mail className="w-4 h-4" /> },
    { id: 'signup', label: "Ro'yxat", icon: <Mail className="w-4 h-4" /> },
    { id: 'telegram', label: 'Telegram', icon: <Send className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Kirish va ro'yxat — ZIYORAT UZ"
        description="ZIYORAT UZ tizimiga kirish yoki yangi hisob yarating."
        path="/auth"
      />
      <Navbar />
      <div className="container max-w-md py-12 animate-fade-in">
        <Card className="bg-card-gradient border-gold/30 p-8 shadow-elegant animate-scale-in">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl text-gold-gradient mb-2">
              {tab === 'telegram' ? 'Telegram orqali kirish' : tab === 'signin' ? t('auth.signIn') : t('auth.signUp')}
            </h1>
            <div className="ornament-divider mt-4 mb-0" />
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-lg border border-gold/20 overflow-hidden mb-6">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-gold text-noir'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Email sign-in / sign-up ── */}
          {(tab === 'signin' || tab === 'signup') && (
            <form onSubmit={submitEmail} className="space-y-4">
              {tab === 'signup' && (
                <div>
                  <Label htmlFor="name">{t('auth.fullName')}</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-input border-gold/30 mt-1"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-input border-gold/30 mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  className="bg-input border-gold/30 mt-1"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gold hover:bg-gold-soft text-noir font-semibold mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (tab === 'signin' ? t('auth.signIn') : t('auth.signUp'))}
              </Button>
            </form>
          )}

          {/* ── Telegram ── */}
          {tab === 'telegram' && (
            <div className="space-y-5">
              {tgStep === 'done' ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <p className="text-lg font-medium text-green-500">Muvaffaqiyatli kirdingiz!</p>
                  <p className="text-xs text-muted-foreground">Sahifa yuklanmoqda...</p>
                </div>
              ) : (
                <>
                  {/* Step 1: Open bot */}
                  <div className="rounded-xl border border-gold/20 bg-secondary/40 p-4 space-y-3">
                    <p className="text-sm font-semibold text-center">1-qadam: Botni oching</p>
                    <a
                      href="https://t.me/ziyorat_bot"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 w-full justify-center py-2.5 rounded-lg bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1a8bc4] transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      @ziyorat_bot ga o'ting
                    </a>
                    <p className="text-xs text-muted-foreground text-center">
                      /start yuboring → bot sizga 6 xonali kod beradi
                    </p>
                  </div>

                  {/* Step 2: Enter code */}
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">2-qadam: Kodni kiriting</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="123456"
                        value={tgCode}
                        onChange={(e) => setTgCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        className="bg-input border-gold/30 text-center tracking-[0.5em] text-xl font-mono"
                        onKeyDown={(e) => { if (e.key === 'Enter' && tgCode.length === 6) verifyTgCode(); }}
                        autoComplete="one-time-code"
                      />
                      <Button
                        onClick={verifyTgCode}
                        disabled={tgLoading || tgCode.length !== 6}
                        className="bg-gold text-noir hover:bg-gold-soft shrink-0 min-w-[90px] font-semibold"
                      >
                        {tgLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirish'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Email yoki parol kerak emas — faqat Telegram kodi kifoya
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sign in / sign up toggle */}
          {(tab === 'signin' || tab === 'signup') && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {tab === 'signin' ? t('auth.noAccount') : "Hisobingiz bormi?"}{' '}
              <button
                onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
                className="text-gold hover:underline font-medium"
              >
                {tab === 'signin' ? t('auth.signUp') : t('auth.signIn')}
              </button>
            </p>
          )}

          {/* Admin link */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-gold/10">
            <Link to="/" className="text-xs text-muted-foreground hover:text-gold">
              ← Asosiy sahifa
            </Link>
            <span className="text-gold/20">·</span>
            <Link
              to="/admin"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-gold transition-colors"
            >
              <Shield className="w-3 h-3" />
              Admin kirish
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
