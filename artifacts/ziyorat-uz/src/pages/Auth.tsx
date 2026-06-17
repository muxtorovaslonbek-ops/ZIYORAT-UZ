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

  // Telegram flow state
  const [tgCode, setTgCode] = useState('');
  const [tgInfo, setTgInfo] = useState<TelegramInfo | null>(null);
  const [tgVerifying, setTgVerifying] = useState(false);
  const [tgEmail, setTgEmail] = useState('');
  const [tgPassword, setTgPassword] = useState('');

  if (user) return <Navigate to="/" replace />;

  // ── Email sign-in / sign-up ──────────────────────────────────────────────
  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (tab === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });
      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        toast.success("Roʻyxatdan oʻtdingiz!");
        navigate('/');
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) toast.error(signInErr.message);
        else { toast.success('Xush kelibsiz!'); navigate('/'); }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message.toLowerCase().includes('email not confirmed')
          ? 'Email hali tasdiqlanmagan.'
          : error.message.toLowerCase().includes('invalid login')
          ? 'Email yoki parol notoʻgʻri.'
          : error.message;
        toast.error(msg);
      } else { toast.success('Xush kelibsiz!'); navigate('/'); }
    }
    setLoading(false);
  };

  // ── Telegram: verify code ────────────────────────────────────────────────
  const verifyTgCode = async () => {
    const code = tgCode.trim();
    if (code.length !== 6) { toast.error("6 xonali kod kiriting"); return; }
    setTgVerifying(true);
    try {
      const res = await fetch(`/api/telegram/verify-code/${code}`);
      const json = await res.json();
      if (!json.ok) { toast.error(json.error || "Kod topilmadi"); return; }
      setTgInfo(json.data);
      const name = [json.data.first_name, json.data.last_name].filter(Boolean).join(' ');
      toast.success(`Telegram tasdiqlandi: ${name}`);
    } catch {
      toast.error("Ulanish xatosi");
    } finally {
      setTgVerifying(false);
    }
  };

  // ── Telegram: complete registration ─────────────────────────────────────
  const submitTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tgInfo) return;
    setLoading(true);
    try {
      const fullNameFromTg = [tgInfo.first_name, tgInfo.last_name].filter(Boolean).join(' ');
      const { data, error } = await supabase.auth.signUp({
        email: tgEmail,
        password: tgPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullNameFromTg,
            telegram_id: String(tgInfo.telegram_id),
            telegram_username: tgInfo.username || '',
          },
        },
      });
      if (error) { toast.error(error.message); return; }

      // Consume the code
      fetch(`/api/telegram/verify-code/${tgCode.trim()}`, { method: 'DELETE' }).catch(() => {});

      if (data.session) {
        toast.success("Roʻyxatdan oʻtdingiz! Telegram hisobingiz ulandi.");
        navigate('/');
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email: tgEmail, password: tgPassword });
        if (signInErr) toast.error(signInErr.message);
        else { toast.success("Xush kelibsiz!"); navigate('/'); }
      }
    } finally {
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
      <Seo title="Kirish va roʻyxat — ZIYORAT UZ" description="ZIYORAT UZ tizimiga kirish yoki yangi hisob yarating." path="/auth" />
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

          {/* ── Email sign-in ── */}
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
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-input border-gold/30" />
              </div>
              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="bg-input border-gold/30" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold-soft text-noir font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (tab === 'signin' ? t('auth.signIn') : t('auth.signUp'))}
              </Button>
            </form>
          )}

          {/* ── Telegram registration ── */}
          {tab === 'telegram' && (
            <div className="space-y-5">
              {/* Step 1 */}
              <div className={`rounded-xl border p-4 space-y-3 transition-all ${tgInfo ? 'border-green-500/40 bg-green-500/5' : 'border-gold/20 bg-secondary/40'}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${tgInfo ? 'bg-green-500 text-white' : 'bg-gold text-noir'}`}>
                    {tgInfo ? <CheckCircle className="w-4 h-4" /> : '1'}
                  </span>
                  <p className="text-sm font-medium">Telegram botdan kod oling</p>
                </div>
                <a
                  href="https://t.me/ziyorat_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 w-full justify-center py-2 rounded-lg bg-[#229ED9] text-white text-sm font-medium hover:bg-[#1a8bc4] transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Telegram botni ochish
                </a>
                <p className="text-xs text-muted-foreground text-center">
                  Botga /start yuboring — 6 xonali kod olasiz
                </p>
                {!tgInfo && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="000000"
                      value={tgCode}
                      onChange={(e) => setTgCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="bg-input border-gold/30 text-center tracking-[0.4em] text-lg font-mono"
                    />
                    <Button
                      onClick={verifyTgCode}
                      disabled={tgVerifying || tgCode.length !== 6}
                      className="bg-gold text-noir hover:bg-gold-soft shrink-0"
                    >
                      {tgVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tekshir'}
                    </Button>
                  </div>
                )}
                {tgInfo && (
                  <div className="flex items-center gap-2 bg-green-500/10 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      {[tgInfo.first_name, tgInfo.last_name].filter(Boolean).join(' ')}
                      {tgInfo.username && ` (@${tgInfo.username})`} — tasdiqlandi
                    </span>
                  </div>
                )}
              </div>

              {/* Step 2 — shown after code verified */}
              {tgInfo && (
                <form onSubmit={submitTelegram} className="space-y-4">
                  <div className={`rounded-xl border border-gold/20 bg-secondary/40 p-4 space-y-3`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-gold text-noir flex items-center justify-center text-xs font-bold">2</span>
                      <p className="text-sm font-medium">Email va parol o'rnating</p>
                    </div>
                    <div>
                      <Label htmlFor="tg-email">Email</Label>
                      <Input
                        id="tg-email"
                        type="email"
                        value={tgEmail}
                        onChange={(e) => setTgEmail(e.target.value)}
                        required
                        placeholder="email@example.com"
                        className="bg-input border-gold/30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tg-password">Parol (kamida 6 ta belgi)</Label>
                      <Input
                        id="tg-password"
                        type="password"
                        value={tgPassword}
                        onChange={(e) => setTgPassword(e.target.value)}
                        required
                        minLength={6}
                        className="bg-input border-gold/30"
                      />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold-soft text-noir font-semibold">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ro'yxatdan o'tish"}
                    </Button>
                  </div>
                </form>
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
