import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

import halimova from '@/assets/team/halimova.jpeg';
import jorayeva from '@/assets/team/jorayeva.jpeg';
import abduraimov from '@/assets/team/abduraimov.png';
import yusupov from '@/assets/team/yusupov.jpg';
import aslonbek from '@/assets/team/aslonbek.png';
import aziza from '@/assets/team/aziza.png';

const About = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sendFeedback = async () => {
    if (!user) { toast.error(t('loginRequired')); return; }
    if (!message.trim()) return;
    setSending(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id, name, email, message,
    });
    setSending(false);
    if (error) toast.error(error.message);
    else { toast.success(t('about.sent')); setMessage(''); }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Biz haqimizda — ZIYORAT UZ" description="ZIYORAT UZ jamoasi va loyiha haqida: Oʻzbekiston ziyorat turizmini raqamlashtirish missiyamiz." path="/about" />
      <Navbar />
      <div className="container py-12 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">ZIYORAT UZ</p>
          <h1 className="font-display text-5xl md:text-6xl text-gold-gradient">{t('about.title')}</h1>
          <div className="ornament-divider" />
          <p className="max-w-2xl mx-auto text-muted-foreground leading-relaxed">{t('about.intro')}</p>
        </div>

        {/* Mission */}
        <Card className="bg-card-gradient border-gold/30 p-8 mb-12 text-center animate-fade-in-up hover-lift">
          <Heart className="w-10 h-10 text-gold mx-auto mb-4 animate-pulse" />
          <h2 className="font-display text-3xl text-gold mb-3">{t('about.mission')}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed">{t('about.missionText')}</p>
        </Card>

        {/* Team */}
        <h2 className="font-display text-3xl text-center text-gold-gradient mb-2">{t('about.team')}</h2>
        <div className="ornament-divider" />
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          <Card className="bg-card-gradient border-gold/30 p-6 text-center hover:shadow-gold transition-smooth animate-fade-in-up hover-lift" style={{ animationDelay: '100ms' }}>
            <img src={aslonbek} alt="Muxtorov Aslonbek" className="w-32 h-32 rounded-full object-cover border-2 border-gold mx-auto mb-4 shadow-gold hover:scale-105 transition-transform" />
            <h3 className="font-display text-xl text-foreground">Muxtorov Aslonbek Maksudovich</h3>
            <p className="text-sm text-muted-foreground mb-3">Asoschi va dasturchi</p>
            <a href="https://t.me/ASLONBEK_MUXTOROV" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-gold hover:underline">
              <Send className="w-3.5 h-3.5" /> @ASLONBEK_MUXTOROV
            </a>
          </Card>
          <Card className="bg-card-gradient border-gold/30 p-6 text-center hover:shadow-gold transition-smooth animate-fade-in-up hover-lift" style={{ animationDelay: '220ms' }}>
            <img src={aziza} alt="Botirova Aziza" className="w-32 h-32 rounded-full object-cover border-2 border-gold mx-auto mb-4 shadow-gold hover:scale-105 transition-transform" />
            <h3 className="font-display text-xl text-foreground">BOTIROVA AZIZA NURALIYEVNA</h3>
            <p className="text-sm text-muted-foreground">Loyiha egasi va tashkilotchisi</p>
          </Card>
        </div>

        {/* Thanks */}
        <h2 className="font-display text-3xl text-center text-gold-gradient mb-2">{t('about.thanks')}</h2>
        <div className="ornament-divider" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {[
            { img: yusupov, name: "Yusupov Doston Faxriddin o'g'li", role: "Qo'llab-quvvatlovchi ustoz" },
            { img: halimova, name: "Halimova Nazokat To'xtasinovna", role: "Qo'llab-quvvatlovchi ustoz" },
            { img: jorayeva, name: "Jo'rayeva Dildora Yunusovna", role: "Qo'llab-quvvatlovchi ustoz" },
            { img: abduraimov, name: "Oybek Abduraimov", role: "Yordam beruvchi ustoz" },
          ].map((m, i) => (
            <Card key={m.name} className="bg-card-gradient border-gold/20 p-5 text-center animate-fade-in-up hover-lift" style={{ animationDelay: `${i * 120}ms` }}>
              <img src={m.img} alt={m.name} className="w-24 h-24 rounded-full object-cover border-2 border-gold/60 mx-auto mb-3 hover:scale-105 transition-transform" />
              <h3 className="font-display text-base text-foreground leading-tight">{m.name}</h3>
              <p className="text-xs text-gold mt-1">{m.role}</p>
            </Card>
          ))}
        </div>

        {/* Feedback */}
        <Card className="bg-card-gradient border-gold/30 p-8 animate-fade-in-up">
          <h2 className="font-display text-3xl text-gold-gradient text-center">{t('about.feedbackTitle')}</h2>
          <p className="text-muted-foreground text-center mt-2">{t('about.feedbackDesc')}</p>
          <div className="ornament-divider" />

          {!user ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{t('loginRequired')}</p>
              <Link to="/auth"><Button className="bg-gold text-noir">{t('nav.signin')}</Button></Link>
            </div>
          ) : (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Ism</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-input border-gold/30" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input border-gold/30" />
                </div>
              </div>
              <div>
                <Label>Xabar</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('about.feedbackPlaceholder')} rows={5} className="bg-input border-gold/30" />
              </div>
              <Button onClick={sendFeedback} disabled={sending || !message.trim()} className="w-full bg-gold hover:bg-gold-soft text-noir font-semibold gap-2">
                <Send className="w-4 h-4" /> {sending ? '...' : t('about.send')}
              </Button>
            </div>
          )}
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default About;
