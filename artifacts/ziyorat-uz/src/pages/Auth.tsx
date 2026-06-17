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

const Auth = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: fullName } }
      });
      if (error) {
        toast.error(error.message);
      } else if (data.session) {
        toast.success("Roʻyxatdan oʻtdingiz!");
        navigate('/');
      } else {
        // Auto-confirm yoniq bo'lsa ham, mavjud tasdiqlanmagan akkaunt uchun sessiya kelmasligi mumkin —
        // shuning uchun darhol login qilib ko'ramiz
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) toast.error(signInErr.message);
        else { toast.success('Xush kelibsiz!'); navigate('/'); }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message.toLowerCase().includes('email not confirmed')
          ? 'Email hali tasdiqlanmagan. Iltimos, qaytadan roʻyxatdan oʻting yoki boshqa email kiriting.'
          : error.message.toLowerCase().includes('invalid login')
          ? 'Email yoki parol notoʻgʻri.'
          : error.message;
        toast.error(msg);
      } else { toast.success('Xush kelibsiz!'); navigate('/'); }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Kirish va roʻyxat — ZIYORAT UZ" description="ZIYORAT UZ tizimiga kirish yoki yangi hisob yarating." path="/auth" />
      <Navbar />
      <div className="container max-w-md py-16 animate-fade-in">
        <Card className="bg-card-gradient border-gold/30 p-8 shadow-elegant animate-scale-in">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl text-gold-gradient mb-2">
              {mode === 'signin' ? t('auth.signIn') : t('auth.signUp')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signin' ? t('auth.signInDesc') : t('auth.signUpDesc')}
            </p>
            <div className="ornament-divider mt-4 mb-0" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
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
              {loading ? '...' : (mode === 'signin' ? t('auth.signIn') : t('auth.signUp'))}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-gold hover:underline font-medium">
              {mode === 'signin' ? t('auth.signUp') : t('auth.signIn')}
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
