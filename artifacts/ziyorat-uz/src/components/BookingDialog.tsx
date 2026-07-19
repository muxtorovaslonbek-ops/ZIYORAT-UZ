import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface Props {
  trigger: React.ReactNode;
  viloyat: string;
  serviceType: string;
  serviceId: string;
  serviceName: string;
}

export const BookingDialog = ({ trigger, viloyat, serviceType, serviceId, serviceName }: Props) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.error(t('loginRequired'));
      navigate('/auth');
    }
  };

  const submit = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('bookings').insert({
      user_id: user.id, viloyat, service_type: serviceType, service_id: serviceId,
      service_name: serviceName, booking_date: date || null, booking_time: time || null, notes,
    });
    setLoading(false);
    if (error) {
      toast.error(t('bookingError'));
    } else {
      toast.success(t('bookingSuccess'));
      setOpen(false);
      setDate(''); setTime(''); setNotes('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleClick}>{trigger}</DialogTrigger>
      <DialogContent className="bg-card border-gold/30">
        <DialogHeader>
          <DialogTitle className="font-display text-gold">{t('bookingTitle')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{serviceName}</p>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label htmlFor="date">{t('bookingDate')}</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-input border-gold/30" />
          </div>
          <div>
            <Label htmlFor="time">{t('bookingTime')}</Label>
            <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-input border-gold/30" />
          </div>
          <div>
            <Label htmlFor="notes">{t('bookingNotes')}</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-input border-gold/30" rows={3} />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full bg-gold hover:bg-gold-soft text-noir font-semibold">
            {loading ? '...' : t('book')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
