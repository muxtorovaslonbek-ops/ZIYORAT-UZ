import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Check, Sparkles, Globe2, Shirt, Users, Box, X, Upload, Copy, Clock, Loader2, AlertCircle } from 'lucide-react';
import { formatUSD, formatUZS, PRICING, PremiumPlan, PLAN_LABEL, PLAN_DAYS } from '@/lib/premium';
import { usePremium } from '@/components/PremiumGate';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Currency = 'uzs' | 'usd';
type PaymentMethod = 'card' | 'click' | 'payme';

const PLANS: { id: PremiumPlan; badge?: string; months: number }[] = [
  { id: '1m', months: 1 },
  { id: '3m', months: 3, badge: '−10%' },
  { id: '12m', months: 12, badge: 'Eng foydali −16%' },
];

const FEATURES = [
  { icon: Users, label: 'Zamonlar Aro Suhbat — allomalar bilan AI suhbat' },
  { icon: Shirt, label: 'Tarixiy Liboslar — virtual try-on' },
  { icon: Box, label: '3D Sayohat — virtual ziyoratgohlar' },
  { icon: Sparkles, label: "AI Yo'lboshchi — ovozli hamroh" },
];

const Premium = () => {
  const { user } = useAuth();
  const { premium, refresh } = usePremium();
  const [currency, setCurrency] = useState<Currency>('uzs');
  const [selected, setSelected] = useState<PremiumPlan>('1m');
  const [settings, setSettings] = useState<any>(null);
  const [myRequest, setMyRequest] = useState<any>(null);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from('payment_settings').select('*').eq('id', 1).maybeSingle()
      .then(({ data }) => setSettings(data));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from('payment_requests')
      .select('*').eq('user_id', user.id).eq('status', 'pending')
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => setMyRequest(data));
  }, [user]);

  const fmt = (plan: PremiumPlan) =>
    currency === 'uzs' ? formatUZS(PRICING.uzs[plan]) : formatUSD(PRICING.usd[plan]);

  const copy = (txt: string, label: string) => {
    navigator.clipboard.writeText(txt);
    toast.success(`${label} nusxalandi`);
  };

  const submitManualPayment = async () => {
    if (!user) { toast.error('Avval tizimga kiring'); return; }
    if (!file) { toast.error('Chek rasmini yuklang'); return; }
    setSubmitting(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('payment-receipts').upload(path, file);
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from('payment_requests').insert({
        user_id: user.id, plan: selected, amount_uzs: PRICING.uzs[selected],
        payment_method: method, receipt_url: path, user_note: note || null, status: 'pending',
      });
      if (insErr) throw insErr;

      toast.success("So'rov yuborildi! Admin 24 soat ichida tasdiqlaydi.");
      setFile(null); setNote('');
      const { data } = await supabase.from('payment_requests')
        .select('*').eq('user_id', user.id).eq('status', 'pending')
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      setMyRequest(data);
    } catch (e: any) {
      toast.error(e.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo title="Premium obuna — ZIYORAT UZ" description="ZIYORAT UZ Premium: AI yoʻlboshchi, 3D sayohat va boshqa eksklyuziv imkoniyatlar." path="/premium" />
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-noir/40 backdrop-blur-sm mb-4">
            <Crown className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-soft">Premium xizmatlar</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            <span className="text-gold-gradient">ZIYORAT UZ</span> Premium
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Eng yuqori darajadagi tajriba: AI suhbat, virtual liboslar, 3D sayohat va ovozli yo'lboshchi.
          </p>
          <div className="ornament-divider" />
        </div>

        {premium && (
          <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-gold bg-gold/10 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-gold" />
              <div>
                <p className="font-display text-gold-gradient">Premium faol — {PLAN_LABEL[premium.plan]}</p>
                <p className="text-xs text-muted-foreground">
                  Tugash sanasi: {new Date(premium.expiresAt).toLocaleDateString('uz-UZ')} · Manba: {premium.source === 'stripe' ? 'Stripe' : "Qo'lda tasdiqlangan"}
                </p>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-gold/30 bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">Premium sotib olish uchun avval tizimga kiring.</p>
            <Link to="/auth"><Button className="bg-gold text-noir hover:bg-gold-soft">Kirish / Ro'yxatdan o'tish</Button></Link>
          </div>
        )}

        {myRequest && (
          <div className="max-w-2xl mx-auto mb-8 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-foreground">To'lov so'rovingiz ko'rib chiqilmoqda</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tarif: <b>{PLAN_LABEL[myRequest.plan as PremiumPlan]}</b> · Yuborilgan: {new Date(myRequest.created_at).toLocaleString('uz-UZ')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Admin tasdiqlagach Premium avtomatik yoqiladi.</p>
              </div>
            </div>
          </div>
        )}

        {/* Currency toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full border border-gold/30 bg-noir/40 p-1">
            <button onClick={() => setCurrency('uzs')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-smooth ${currency === 'uzs' ? 'bg-gold text-noir' : 'text-muted-foreground hover:text-gold'}`}>
              🇺🇿 So'm (UZS)
            </button>
            <button onClick={() => setCurrency('usd')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-smooth flex items-center gap-1.5 ${currency === 'usd' ? 'bg-gold text-noir' : 'text-muted-foreground hover:text-gold'}`}>
              <Globe2 className="w-3.5 h-3.5" /> USD (Chet ellik)
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto mb-10">
          {PLANS.map((p) => {
            const isActive = selected === p.id;
            const monthly = currency === 'uzs'
              ? Math.round(PRICING.uzs[p.id] / p.months)
              : +(PRICING.usd[p.id] / p.months).toFixed(2);
            return (
              <button key={p.id} onClick={() => setSelected(p.id)}
                className={`relative text-left rounded-2xl border p-6 transition-all ${
                  isActive ? 'border-gold bg-gradient-to-br from-gold/15 to-transparent ring-2 ring-gold/50 shadow-gold'
                  : 'border-gold/20 bg-card hover:border-gold/60'
                }`}>
                {p.badge && (
                  <span className="absolute -top-2 right-4 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gold text-noir">{p.badge}</span>
                )}
                <h3 className="font-display text-xl text-gold-gradient mb-1">{PLAN_LABEL[p.id]}</h3>
                <p className="text-3xl font-display text-foreground mb-1">{fmt(p.id)}</p>
                <p className="text-xs text-muted-foreground mb-4">
                  {currency === 'uzs' ? formatUZS(monthly) : formatUSD(monthly)} / oyiga
                </p>
                <div className={`text-xs font-medium ${isActive ? 'text-gold' : 'text-muted-foreground'}`}>
                  {isActive ? '✓ Tanlangan' : 'Tanlash'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Payment flow */}
        {user && !premium && !myRequest && (
          <div className="max-w-3xl mx-auto rounded-2xl border border-gold/20 bg-card p-6 mb-8">
            <Tabs defaultValue={currency === 'usd' ? 'stripe' : 'manual'} className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="manual">🇺🇿 Karta / Click / Payme</TabsTrigger>
                <TabsTrigger value="stripe"><Globe2 className="w-3.5 h-3.5 mr-1.5" /> Xalqaro karta (USD)</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-5">
                <div className="rounded-xl border border-gold/20 bg-noir/30 p-5">
                  <h4 className="font-display text-gold-gradient mb-3">1-qadam: To'lov rekvizitlari</h4>
                  <p className="text-sm text-foreground mb-4">
                    Tanlangan tarif: <b className="text-gold">{PLAN_LABEL[selected]} — {formatUZS(PRICING.uzs[selected])}</b>
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {settings?.card_number && (
                      <div className="rounded-lg border border-gold/20 bg-card p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Karta (Uzcard / Humo)</p>
                        <p className="font-mono text-sm text-foreground">{settings.card_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{settings.card_holder}</p>
                        <Button size="sm" variant="ghost" className="mt-2 h-7 text-gold hover:bg-gold/10" onClick={() => copy(settings.card_number, 'Karta raqami')}>
                          <Copy className="w-3 h-3 mr-1" /> Nusxalash
                        </Button>
                      </div>
                    )}
                    {settings?.click_phone && (
                      <div className="rounded-lg border border-gold/20 bg-card p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Click</p>
                        <p className="font-mono text-sm text-foreground">{settings.click_phone}</p>
                        {settings.click_id && <p className="text-xs text-muted-foreground mt-0.5">ID: {settings.click_id}</p>}
                        <Button size="sm" variant="ghost" className="mt-2 h-7 text-gold hover:bg-gold/10" onClick={() => copy(settings.click_phone, 'Click raqami')}>
                          <Copy className="w-3 h-3 mr-1" /> Nusxalash
                        </Button>
                      </div>
                    )}
                    {settings?.payme_phone && (
                      <div className="rounded-lg border border-gold/20 bg-card p-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Payme</p>
                        <p className="font-mono text-sm text-foreground">{settings.payme_phone}</p>
                        {settings.payme_id && <p className="text-xs text-muted-foreground mt-0.5">ID: {settings.payme_id}</p>}
                        <Button size="sm" variant="ghost" className="mt-2 h-7 text-gold hover:bg-gold/10" onClick={() => copy(settings.payme_phone, 'Payme raqami')}>
                          <Copy className="w-3 h-3 mr-1" /> Nusxalash
                        </Button>
                      </div>
                    )}
                  </div>
                  {settings?.instructions && (
                    <p className="text-xs text-muted-foreground mt-4 italic">{settings.instructions}</p>
                  )}
                </div>

                <div className="rounded-xl border border-gold/20 bg-noir/30 p-5 space-y-4">
                  <h4 className="font-display text-gold-gradient">2-qadam: Chek yuklash</h4>

                  <div>
                    <Label className="text-xs">To'lov turi</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1.5">
                      {(['card', 'click', 'payme'] as PaymentMethod[]).map((m) => (
                        <button key={m} onClick={() => setMethod(m)}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border transition ${method === m ? 'border-gold bg-gold/10 text-gold' : 'border-border text-muted-foreground hover:border-gold/40'}`}>
                          {m === 'card' ? 'Karta' : m === 'click' ? 'Click' : 'Payme'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="receipt" className="text-xs">Chek (screenshot yoki rasm)</Label>
                    <div className="mt-1.5">
                      <label htmlFor="receipt" className="flex items-center justify-center gap-2 h-24 rounded-lg border-2 border-dashed border-gold/30 bg-card hover:border-gold cursor-pointer transition">
                        <Upload className="w-5 h-5 text-gold" />
                        <span className="text-sm text-foreground">{file ? file.name : 'Rasm tanlash'}</span>
                      </label>
                      <input id="receipt" type="file" accept="image/*" className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="note" className="text-xs">Qo'shimcha izoh (ixtiyoriy)</Label>
                    <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)}
                      placeholder="Telefon raqamingiz yoki qo'shimcha ma'lumot..." className="mt-1.5 h-20" />
                  </div>

                  <Button onClick={submitManualPayment} disabled={submitting || !file}
                    className="w-full h-12 bg-gradient-to-r from-gold to-gold-deep hover:from-gold-soft hover:to-gold text-noir font-semibold">
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Crown className="w-4 h-4 mr-2" />}
                    So'rov yuborish — {formatUZS(PRICING.uzs[selected])}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Admin chekni tekshirib, 24 soat ichida Premium'ni faollashtiradi.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="stripe" className="space-y-4">
                <div className="rounded-xl border border-gold/20 bg-noir/30 p-6 text-center">
                  <Globe2 className="w-10 h-10 text-gold mx-auto mb-3" />
                  <h4 className="font-display text-xl text-gold-gradient mb-2">Xalqaro to'lov (Visa / Mastercard)</h4>
                  <p className="text-3xl font-display text-foreground mb-2">{formatUSD(PRICING.usd[selected])}</p>
                  <p className="text-sm text-muted-foreground mb-4">{PLAN_LABEL[selected]} — avtomatik faollashtirish</p>
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 mb-4 text-left">
                    <div className="flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-foreground/90">
                        Stripe avtomatik to'lov tizimi tez orada ishga tushadi. Hozircha O'zbekiston kartasi
                        yoki Click/Payme orqali to'lashingiz mumkin (yuqoridagi tab).
                      </p>
                    </div>
                  </div>
                  <Button disabled className="w-full h-12 bg-muted text-muted-foreground cursor-not-allowed">
                    Stripe orqali to'lov (tez orada)
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Features */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-gold/20 bg-card p-6 mb-8">
          <h3 className="font-display text-lg text-gold-gradient mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Premium ichida nimalar bor?
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-gold" />
                </span>
                <span className="text-foreground/90 leading-relaxed pt-1">{f.label}</span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-sm">
              <span className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-gold" />
              </span>
              <span className="text-foreground/90 leading-relaxed pt-1">Reklamasiz tajriba va ustuvor qo'llab-quvvatlash</span>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Premium;
