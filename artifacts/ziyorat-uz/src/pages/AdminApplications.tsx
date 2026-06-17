import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminGate } from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, RefreshCw, FileText, Phone, Mail, MapPin, Building2, UserCheck, Hotel, Utensils, ExternalLink, Handshake } from 'lucide-react';

type Application = {
  id: string;
  applicant_type: 'guide' | 'hotel' | 'restaurant';
  full_name: string;
  organization_name: string | null;
  phone: string;
  email: string | null;
  region: string | null;
  address: string | null;
  certificate_number: string | null;
  certificate_file_url: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const typeMeta = {
  guide: { label: 'Gid', icon: UserCheck },
  hotel: { label: 'Mehmonxona', icon: Hotel },
  restaurant: { label: 'Restoran', icon: Utensils },
};

const AdminApplications = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 container py-10">
      <AdminGate><Inner /></AdminGate>
    </main>
    <Footer />
  </div>
);

const Inner = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contract_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error(error);
    setApps((data || []) as Application[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center shadow-gold">
            <Handshake className="w-6 h-6 text-noir" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl text-gold-gradient">Shartnoma arizalari</h1>
            <p className="text-sm text-muted-foreground">Hamkorlik uchun qoldirilgan arizalar</p>
          </div>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="border-gold/30 text-gold hover:bg-gold/10 gap-2">
          <RefreshCw className="w-4 h-4" /> Yangilash
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      ) : apps.length === 0 ? (
        <Card className="border-gold/20">
          <CardContent className="py-16 text-center text-muted-foreground">
            Hozircha ariza yo'q
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {apps.map((app) => {
            const meta = typeMeta[app.applicant_type] ?? typeMeta.guide;
            const Icon = meta.icon;
            return (
              <Card key={app.id} className="border-gold/20 hover:border-gold/40 transition-smooth">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{app.full_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-gold/40 text-gold text-xs">{meta.label}</Badge>
                          <Badge variant="secondary" className="text-xs">{app.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(app.created_at).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {app.organization_name && (
                    <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-gold/70" /><span>{app.organization_name}</span></div>
                  )}
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gold/70" /><a href={`tel:${app.phone}`} className="hover:text-gold">{app.phone}</a></div>
                  {app.email && (
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gold/70" /><a href={`mailto:${app.email}`} className="hover:text-gold">{app.email}</a></div>
                  )}
                  {app.region && (
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gold/70" /><span>{app.region}{app.address ? `, ${app.address}` : ''}</span></div>
                  )}
                  {app.certificate_number && (
                    <div className="flex items-center gap-2"><FileText className="w-4 h-4 text-gold/70" /><span>№ {app.certificate_number}</span></div>
                  )}
                  {app.certificate_file_url && (
                    <a href={app.certificate_file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gold hover:underline">
                      <ExternalLink className="w-4 h-4" /> Sertifikatni ko'rish
                    </a>
                  )}
                  {app.message && (
                    <div className="sm:col-span-2 mt-2 p-3 rounded-md bg-card border border-gold/10 text-muted-foreground whitespace-pre-wrap">
                      {app.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminApplications;
