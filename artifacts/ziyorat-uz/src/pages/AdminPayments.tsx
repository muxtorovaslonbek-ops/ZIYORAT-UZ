import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminGate } from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2, ImageIcon, Crown, RefreshCw } from 'lucide-react';
import { formatUZS, PLAN_LABEL, PremiumPlan } from '@/lib/premium';
import { toast } from 'sonner';

type Status = 'pending' | 'approved' | 'rejected';
type Req = {
  id: string; user_id: string; plan: PremiumPlan; amount_uzs: number;
  payment_method: string; receipt_url: string; user_note: string | null;
  status: Status; admin_note: string | null; created_at: string; reviewed_at: string | null;
};

const AdminPayments = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 container py-10">
      <AdminGate><Inner /></AdminGate>
    </main>
    <Footer />
  </div>
);

const Inner = () => {
  const [tab, setTab] = useState<Status>('pending');
  const [reqs, setReqs] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('payment_requests')
      .select('*').eq('status', tab).order('created_at', { ascending: false });
    const rows = (data || []) as Req[];
    setReqs(rows);
    // Sign URLs
    const urls: Record<string, string> = {};
    for (const r of rows) {
      const { data: u } = await supabase.storage.from('payment-receipts').createSignedUrl(r.receipt_url, 3600);
      if (u?.signedUrl) urls[r.id] = u.signedUrl;
    }
    setSignedUrls(urls);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setActingId(id);
    try {
      const { data, error } = await supabase.functions.invoke('approve-payment', {
        body: { request_id: id, action, admin_note: notes[id] || null },
      });
      if (error || (data as any)?.error) throw new Error((data as any)?.error || error?.message);
      toast.success(action === 'approve' ? 'Tasdiqlandi va Premium yoqildi!' : 'Rad etildi');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Xatolik');
    } finally { setActingId(null); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-gold-gradient flex items-center gap-2">
            <Crown className="w-7 h-7" /> Admin — To'lov so'rovlari
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Foydalanuvchilarning manual to'lovlarini tasdiqlash</p>
        </div>
        <Button variant="outline" onClick={load} className="border-gold/40 text-gold"><RefreshCw className="w-4 h-4 mr-2" /> Yangilash</Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Status)}>
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="pending">Kutilmoqda</TabsTrigger>
          <TabsTrigger value="approved">Tasdiqlangan</TabsTrigger>
          <TabsTrigger value="rejected">Rad etilgan</TabsTrigger>
        </TabsList>

        <TabsContent value={tab}>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>
          ) : reqs.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">Hozircha so'rovlar yo'q</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-5">
              {reqs.map((r) => (
                <div key={r.id} className="rounded-2xl border border-gold/20 bg-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-display text-lg text-gold-gradient">{PLAN_LABEL[r.plan]}</p>
                      <p className="text-sm text-foreground">{formatUZS(r.amount_uzs)} · {r.payment_method.toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString('uz-UZ')}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">User: {r.user_id.slice(0, 8)}…</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      r.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                      r.status === 'approved' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>{r.status}</span>
                  </div>

                  {r.user_note && (
                    <div className="rounded-lg border border-border bg-noir/30 p-2 mb-3">
                      <p className="text-[10px] uppercase text-muted-foreground mb-1">Foydalanuvchi izohi</p>
                      <p className="text-xs text-foreground">{r.user_note}</p>
                    </div>
                  )}

                  {signedUrls[r.id] ? (
                    <a href={signedUrls[r.id]} target="_blank" rel="noreferrer" className="block">
                      <img src={signedUrls[r.id]} alt="chek" className="w-full max-h-64 object-contain rounded-lg border border-gold/20 bg-black/30" />
                    </a>
                  ) : (
                    <div className="h-40 rounded-lg border border-border bg-noir/30 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}

                  {r.status === 'pending' && (
                    <div className="mt-4 space-y-3">
                      <Textarea placeholder="Izoh (ixtiyoriy)" value={notes[r.id] || ''}
                        onChange={(e) => setNotes((s) => ({ ...s, [r.id]: e.target.value }))} className="h-16 text-sm" />
                      <div className="flex gap-2">
                        <Button onClick={() => act(r.id, 'approve')} disabled={actingId === r.id}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                          {actingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Tasdiqlash</>}
                        </Button>
                        <Button onClick={() => act(r.id, 'reject')} disabled={actingId === r.id}
                          variant="outline" className="flex-1 border-red-500/40 text-red-500 hover:bg-red-500/10">
                          <X className="w-4 h-4 mr-1" /> Rad etish
                        </Button>
                      </div>
                    </div>
                  )}

                  {r.admin_note && r.status !== 'pending' && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      <b>Admin izohi:</b> {r.admin_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
