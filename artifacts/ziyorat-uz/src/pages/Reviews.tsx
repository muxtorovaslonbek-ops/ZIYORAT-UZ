import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { StarRating } from '@/components/StarRating';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const Reviews = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [serviceType, setServiceType] = useState('hotel');
  const [serviceName, setServiceName] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase.from('bookings').select('*').eq('user_id', user.id).then(({ data }) => setBookings(data || []));
    supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setReviews(data || []));
  }, [user]);

  const submit = async () => {
    if (!user || rating === 0 || !serviceName) { toast.error('Toʻldiring'); return; }
    const { error } = await supabase.from('reviews').insert({
      user_id: user.id, service_type: serviceType, service_id: serviceName.toLowerCase().replace(/\s/g, '-'),
      service_name: serviceName, rating, comment,
    });
    if (error) toast.error(error.message);
    else {
      toast.success(t('rating.thanks'));
      setRating(0); setComment(''); setServiceName('');
      const { data } = await supabase.from('reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setReviews(data || []);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">{t('loginRequired')}</p>
          <Link to="/auth"><Button className="bg-gold text-noir">{t('nav.signin')}</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Baholash — ZIYORAT UZ" description="Sayohatlaringizdan keyin mehmonxona, gid va xizmatlarni baholang." path="/baholash" />
      <Navbar />
      <div className="container py-10 max-w-4xl animate-fade-in">
        <div className="text-center mb-8 animate-fade-in-down">
          <h1 className="font-display text-4xl text-gold-gradient">{t('sections.reviews.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('sections.reviews.desc')}</p>
          <div className="ornament-divider" />
        </div>

        <Card className="bg-card-gradient border-gold/30 p-6 mb-8 animate-fade-in-up">
          <h2 className="font-display text-xl text-gold mb-4">{t('rating.rate')}</h2>
          <div className="space-y-4">
            <div>
              <Label>Xizmat turi</Label>
              <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} className="w-full h-10 rounded-md bg-input border border-gold/30 px-3 text-sm">
                <option value="hotel">{t('services.hotel')}</option>
                <option value="translator">{t('services.translator')}</option>
                <option value="guide">{t('services.guide')}</option>
                <option value="companion">{t('services.companion')}</option>
                <option value="restaurant">{t('services.restaurant')}</option>
              </select>
            </div>
            <div>
              <Label>Xizmat nomi</Label>
              <Input value={serviceName} onChange={(e) => setServiceName(e.target.value)} placeholder="Masalan: Grand Plaza Hotel" className="bg-input border-gold/30" />
            </div>
            <div>
              <Label className="block mb-2">{t('rating.yourRating')}</Label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <Label>{t('rating.leaveComment')}</Label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} className="bg-input border-gold/30" rows={3} />
            </div>
            <Button onClick={submit} className="bg-gold hover:bg-gold-soft text-noir font-semibold">{t('rating.submit')}</Button>
          </div>
        </Card>

        <h2 className="font-display text-2xl text-gold mb-4">Sizning baholaringiz</h2>
        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-muted-foreground text-sm">Hali baholar yo'q</p>}
          {reviews.map((r, i) => (
            <Card key={r.id} className="bg-card border-gold/20 p-4 animate-fade-in-up hover-lift" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="text-xs uppercase text-gold tracking-wider">{t(`services.${r.service_type}`, { defaultValue: r.service_type })}</p>
                  <h3 className="font-display text-foreground">{r.service_name}</h3>
                </div>
                <StarRating value={r.rating} readOnly size="sm" />
              </div>
              {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Reviews;
