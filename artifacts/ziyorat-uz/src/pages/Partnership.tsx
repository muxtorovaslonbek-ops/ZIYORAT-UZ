import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Handshake, UserCheck, Hotel, Utensils, Upload, FileCheck2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ApplicantType = 'guide' | 'hotel' | 'restaurant';

const Partnership = () => {
  const [type, setType] = useState<ApplicantType>('guide');
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    full_name: '',
    organization_name: '',
    phone: '',
    email: '',
    region: '',
    address: '',
    certificate_number: '',
    message: '',
  });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast.error("Ism va telefon raqam majburiy");
      return;
    }
    setSubmitting(true);
    try {
      let certificate_file_url: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('certificates').upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('certificates').getPublicUrl(path);
        certificate_file_url = data.publicUrl;
      }

      const { error } = await supabase.from('contract_applications').insert({
        applicant_type: type,
        full_name: form.full_name,
        organization_name: form.organization_name || null,
        phone: form.phone,
        email: form.email || null,
        region: form.region || null,
        address: form.address || null,
        certificate_number: form.certificate_number || null,
        message: form.message || null,
        certificate_file_url,
      });
      if (error) throw error;

      toast.success("Arizangiz qabul qilindi! Tez orada bog'lanamiz.");
      setForm({
        full_name: '', organization_name: '', phone: '', email: '',
        region: '', address: '', certificate_number: '', message: '',
      });
      setFile(null);
    } catch (err: any) {
      toast.error(err?.message ?? 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const tabConfig: Record<ApplicantType, { label: string; icon: any; orgLabel: string }> = {
    guide: { label: 'Gid', icon: UserCheck, orgLabel: "Tashkilot (ixtiyoriy)" },
    hotel: { label: 'Mehmonxona', icon: Hotel, orgLabel: 'Mehmonxona nomi' },
    restaurant: { label: 'Restoran', icon: Utensils, orgLabel: 'Restoran nomi' },
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Shartnoma va hamkorlik — ZIYORAT UZ" description="Gid, mehmonxona va restoran egalari uchun hamkorlik shartnomasi va ariza." path="/shartnoma" />
      <Navbar />
      <div className="container py-10 max-w-4xl animate-fade-in">
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-deep shadow-gold mb-2 animate-scale-in">
            <Handshake className="w-8 h-8 text-noir" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-gold-gradient">Shartnoma tuzish</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gidlar, mehmonxonalar va restoran egalari ZIYORAT UZ bilan rasmiy hamkorlik shartnomasi tuzish uchun ariza qoldira oladi.
            Maxsus sertifikat va malumotnoma bilan ariza yuboring.
          </p>
        </div>

        <Card className="border-gold/30 shadow-elegant">
          <CardHeader>
            <CardTitle className="font-display text-gold-gradient">Hamkorlik arizasi</CardTitle>
            <CardDescription>Quyidagi shakl orqali ariza yuboring. Barcha maydonlar maxfiy.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={type} onValueChange={(v) => setType(v as ApplicantType)} className="mb-6">
              <TabsList className="grid grid-cols-3 w-full bg-card border border-gold/20">
                {(Object.keys(tabConfig) as ApplicantType[]).map((k) => {
                  const Cfg = tabConfig[k];
                  const Icon = Cfg.icon;
                  return (
                    <TabsTrigger key={k} value={k} className="data-[state=active]:bg-gold data-[state=active]:text-noir gap-2">
                      <Icon className="w-4 h-4" /> {Cfg.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              {(Object.keys(tabConfig) as ApplicantType[]).map((k) => (
                <TabsContent key={k} value={k} />
              ))}
            </Tabs>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <div className="space-y-2">
                <Label>To'liq ism *</Label>
                <Input value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required className="bg-card border-gold/30" />
              </div>
              <div className="space-y-2">
                <Label>{tabConfig[type].orgLabel}</Label>
                <Input value={form.organization_name} onChange={(e) => update('organization_name', e.target.value)} className="bg-card border-gold/30" />
              </div>
              <div className="space-y-2">
                <Label>Telefon *</Label>
                <Input type="tel" placeholder="+998 90 123 45 67" value={form.phone} onChange={(e) => update('phone', e.target.value)} required className="bg-card border-gold/30" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="bg-card border-gold/30" />
              </div>
              <div className="space-y-2">
                <Label>Viloyat</Label>
                <Input value={form.region} onChange={(e) => update('region', e.target.value)} placeholder="Masalan: Buxoro" className="bg-card border-gold/30" />
              </div>
              <div className="space-y-2">
                <Label>Manzil</Label>
                <Input value={form.address} onChange={(e) => update('address', e.target.value)} className="bg-card border-gold/30" />
              </div>
              <div className="space-y-2">
                <Label>Sertifikat / litsenziya raqami</Label>
                <Input value={form.certificate_number} onChange={(e) => update('certificate_number', e.target.value)} placeholder="Masalan: BX-2023-091" className="bg-card border-gold/30" />
              </div>
              <div className="space-y-2">
                <Label>Sertifikat / malumotnoma fayli</Label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-gold/40 bg-card cursor-pointer hover:bg-gold/5 transition-smooth">
                  <Upload className="w-4 h-4 text-gold" />
                  <span className="text-sm text-muted-foreground truncate flex-1">
                    {file ? file.name : 'Fayl tanlash (PDF/JPG/PNG)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Qo'shimcha ma'lumot</Label>
                <Textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={4}
                  placeholder="Tajribangiz, xizmatlaringiz, takliflaringiz..."
                  className="bg-card border-gold/30 resize-none"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gold text-noir hover:bg-gold/90 gap-2 hover-scale"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck2 className="w-4 h-4" />}
                  Arizani yuborish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Arizangiz ko'rib chiqilgach, biz siz bilan telefon yoki email orqali bog'lanamiz.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Partnership;
