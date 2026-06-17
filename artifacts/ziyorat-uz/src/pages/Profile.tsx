import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Camera, User as UserIcon } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { LANGUAGES } from '@/lib/i18n';

const Profile = () => {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [language, setLanguage] = useState('uz');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name || '');
        setAvatarUrl(data.avatar_url || '');
        setLanguage(data.language || 'uz');
      }
    });
  }, [user]);

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const MIME_EXT: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = MIME_EXT[file.type];
    if (!ext) {
      toast.error('Faqat JPEG / PNG / WEBP / GIF rasm yuklang');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5 MB dan oshmasligi kerak');
      e.target.value = '';
      return;
    }

    setUploading(true);
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const url = `${data.publicUrl}?t=${Date.now()}`;
    setAvatarUrl(url);
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    toast.success(t('profile.updated'));
    setUploading(false);
  };


  const save = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName, language }).eq('id', user.id);
    if (error) toast.error(error.message);
    else { toast.success(t('profile.updated')); i18n.changeLanguage(language); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Profilim — ZIYORAT UZ" description="Sizning ZIYORAT UZ profilingiz va sozlamalaringiz." path="/profile" />
      <Navbar />
      <div className="container max-w-2xl py-12 animate-fade-in">
        <Card className="bg-card-gradient border-gold/30 p-8 shadow-elegant animate-fade-in-up">
          <h1 className="font-display text-3xl text-gold-gradient text-center mb-2">{t('profile.title')}</h1>
          <div className="ornament-divider" />

          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative">
              <Avatar className="w-32 h-32 border-2 border-gold shadow-gold">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-secondary text-gold">
                  <UserIcon className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gold text-noir flex items-center justify-center shadow-lg hover:bg-gold-soft transition-smooth"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </div>
            <p className="text-xs text-muted-foreground">
              {uploading ? '...' : t('profile.changeAvatar')}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>{t('auth.email')}</Label>
              <Input value={user?.email || ''} disabled className="bg-input border-gold/30" />
            </div>
            <div>
              <Label>{t('auth.fullName')}</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-input border-gold/30" />
            </div>
            <div>
              <Label>{t('profile.language')}</Label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 rounded-md bg-input border border-gold/30 px-3 text-sm"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={save} disabled={loading} className="w-full bg-gold hover:bg-gold-soft text-noir font-semibold">
              {loading ? '...' : t('save')}
            </Button>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
