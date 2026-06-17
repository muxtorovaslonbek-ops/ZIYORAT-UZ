import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AdminGate } from '@/components/AdminGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import {
  Users, ShoppingBag, Star, BarChart3, RefreshCw, Loader2,
  Send, Mail, Crown, Search, Shield, UserCheck, Calendar, ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────────────────────
type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  telegram_id: string | null;
  telegram_username: string | null;
  language: string | null;
  created_at: string;
  role?: string;
  has_sub?: boolean;
};

type Booking = {
  id: string;
  user_id: string;
  viloyat: string;
  service_type: string;
  service_name: string;
  booking_date: string | null;
  booking_time: string | null;
  notes: string | null;
  created_at: string;
  profile?: { full_name: string | null; email: string | null };
};

type Review = {
  id: string;
  user_id: string;
  service_type: string;
  service_name: string | null;
  service_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: { full_name: string | null };
};

type Stats = {
  users: number;
  bookings: number;
  reviews: number;
  admins: number;
  telegram_users: number;
  today_signups: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (d: string) => {
  try { return format(new Date(d), 'dd.MM.yyyy HH:mm'); } catch { return d; }
};

const RoleBadge = ({ role }: { role?: string }) =>
  role === 'admin'
    ? <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]"><Shield className="w-2.5 h-2.5 mr-0.5" />Admin</Badge>
    : <Badge variant="secondary" className="text-[10px]">Foydalanuvchi</Badge>;

const SubBadge = ({ has }: { has?: boolean }) =>
  has ? <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[10px]"><Crown className="w-2.5 h-2.5 mr-0.5" />Premium</Badge> : null;

const Stars = ({ n }: { n: number }) => (
  <span className="text-gold text-xs">{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const Admin = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 container py-8">
      <AdminGate><Inner /></AdminGate>
    </main>
    <Footer />
  </div>
);

// ── Inner (admin-only) ─────────────────────────────────────────────────────
const Inner = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('stats');
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Load profiles
      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Load roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Load subscriptions
      const { data: subs } = await supabase
        .from('subscriptions')
        .select('user_id, status')
        .eq('status', 'active');

      const roleMap = new Map((roles || []).map((r: any) => [r.user_id, r.role]));
      const subSet = new Set((subs || []).map((s: any) => s.user_id));

      const enriched: Profile[] = (profs || []).map((p: any) => ({
        ...p,
        role: roleMap.get(p.id),
        has_sub: subSet.has(p.id),
      }));
      setProfiles(enriched);

      // Load bookings
      const { data: bks } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      // Enrich bookings with profile names
      const userIds = [...new Set((bks || []).map((b: any) => b.user_id))];
      const profileMap = new Map(enriched.map((p) => [p.id, p]));
      setBookings(
        (bks || []).map((b: any) => ({
          ...b,
          profile: profileMap.get(b.user_id)
            ? { full_name: profileMap.get(b.user_id)!.full_name, email: profileMap.get(b.user_id)!.email }
            : undefined,
        }))
      );

      // Load reviews
      const { data: revs } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      setReviews(
        (revs || []).map((r: any) => ({
          ...r,
          profile: profileMap.get(r.user_id)
            ? { full_name: profileMap.get(r.user_id)!.full_name }
            : undefined,
        }))
      );

      // Stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setStats({
        users: enriched.length,
        bookings: (bks || []).length,
        reviews: (revs || []).length,
        admins: enriched.filter((p) => p.role === 'admin').length,
        telegram_users: enriched.filter((p) => p.telegram_id).length,
        today_signups: enriched.filter((p) => new Date(p.created_at) >= today).length,
      });
    } catch (err) {
      console.error(err);
      toast.error('Ma\'lumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Toggle admin role
  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    setRoleLoading(userId);
    if (isAdmin) {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
      toast.success('Admin huquqi olib tashlandi');
    } else {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
      toast.success('Admin huquqi berildi');
    }
    setRoleLoading(null);
    load();
  };

  const filteredProfiles = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.telegram_username?.toLowerCase().includes(q) ||
      p.telegram_id?.includes(q)
    );
  });

  if (loading) return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-gold-gradient">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">ZIYORAT UZ boshqaruv markazi</p>
        </div>
        <Button onClick={load} variant="outline" size="sm" className="gap-2 border-gold/30">
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-xl bg-secondary">
          <TabsTrigger value="stats" className="gap-1.5 text-xs"><BarChart3 className="w-3.5 h-3.5" />Statistika</TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />Foydalanuvchilar</TabsTrigger>
          <TabsTrigger value="bookings" className="gap-1.5 text-xs"><ShoppingBag className="w-3.5 h-3.5" />Buyurtmalar</TabsTrigger>
          <TabsTrigger value="reviews" className="gap-1.5 text-xs"><Star className="w-3.5 h-3.5" />Baholashlar</TabsTrigger>
        </TabsList>

        {/* ── Stats ── */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Jami foydalanuvchilar", value: stats?.users ?? 0, icon: Users, color: "text-blue-400" },
              { label: "Telegram orqali", value: stats?.telegram_users ?? 0, icon: Send, color: "text-[#229ED9]" },
              { label: "Bugun ro'yxatdan o'tgan", value: stats?.today_signups ?? 0, icon: UserCheck, color: "text-green-400" },
              { label: "Jami buyurtmalar", value: stats?.bookings ?? 0, icon: ShoppingBag, color: "text-gold" },
              { label: "Jami baholashlar", value: stats?.reviews ?? 0, icon: Star, color: "text-yellow-400" },
              { label: "Adminlar soni", value: stats?.admins ?? 0, icon: Shield, color: "text-purple-400" },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-gold/20 bg-card-gradient">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick links to existing admin pages */}
          <Card className="border-gold/20 bg-card-gradient mt-4">
            <CardHeader><CardTitle className="text-sm">Boshqa admin sahifalar</CardTitle></CardHeader>
            <CardContent className="flex gap-3 flex-wrap">
              <a href="/admin/payments"><Button variant="outline" size="sm" className="border-gold/30">💳 To'lovlar</Button></a>
              <a href="/admin/applications"><Button variant="outline" size="sm" className="border-gold/30">📋 Arizalar</Button></a>
            </CardContent>
          </Card>

          {/* Migration reminder */}
          <Card className="border-amber-500/30 bg-amber-500/5 mt-4">
            <CardContent className="p-4">
              <p className="text-xs text-amber-400 font-medium mb-1">⚠️ Telegram va email ustunlarini ko'rish uchun</p>
              <p className="text-xs text-muted-foreground">
                Supabase SQL editorida migratsiyani qo'llang:{' '}
                <code className="bg-secondary px-1 rounded text-[10px]">
                  supabase/migrations/20260617152812_admin_panel_and_profiles.sql
                </code>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Users ── */}
        <TabsContent value="users" className="mt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ism, email yoki Telegram..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-input border-gold/30"
              />
            </div>
            <p className="text-sm text-muted-foreground">{filteredProfiles.length} ta</p>
          </div>

          <div className="space-y-2">
            {filteredProfiles.map((p) => (
              <Card key={p.id} className="border-gold/20 bg-card-gradient overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedUser(expandedUser === p.id ? null : p.id)}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center shrink-0">
                    <span className="text-gold font-bold text-sm">
                      {(p.full_name || p.email || '?')[0].toUpperCase()}
                    </span>
                  </div>

                  {/* Name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">{p.full_name || 'Nomsiz'}</p>
                      <RoleBadge role={p.role} />
                      <SubBadge has={p.has_sub} />
                      {p.telegram_id && (
                        <Badge className="bg-[#229ED9]/20 text-[#229ED9] border-[#229ED9]/30 text-[10px]">
                          <Send className="w-2.5 h-2.5 mr-0.5" />Telegram
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.email || 'Email yo\'q'} · {fmt(p.created_at)}
                    </p>
                  </div>

                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedUser === p.id ? 'rotate-180' : ''}`} />
                </div>

                {expandedUser === p.id && (
                  <div className="border-t border-gold/10 px-4 pb-4 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground mb-0.5">ID</p>
                        <p className="font-mono text-[10px] truncate">{p.id}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Til</p>
                        <p>{p.language || '—'}</p>
                      </div>
                      {p.telegram_id && (
                        <div>
                          <p className="text-muted-foreground mb-0.5">Telegram ID</p>
                          <p>{p.telegram_id}</p>
                        </div>
                      )}
                      {p.telegram_username && (
                        <div>
                          <p className="text-muted-foreground mb-0.5">Telegram username</p>
                          <a
                            href={`https://t.me/${p.telegram_username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#229ED9] hover:underline"
                          >
                            @{p.telegram_username}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground mb-0.5">Ro'yxat sanasi</p>
                        <p>{fmt(p.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-0.5">Buyurtmalar</p>
                        <p>{bookings.filter((b) => b.user_id === p.id).length} ta</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant={p.role === 'admin' ? 'destructive' : 'outline'}
                        className={p.role !== 'admin' ? 'border-gold/30 text-gold hover:bg-gold/10' : ''}
                        disabled={roleLoading === p.id}
                        onClick={() => toggleAdmin(p.id, p.role === 'admin')}
                      >
                        {roleLoading === p.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : p.role === 'admin' ? (
                          'Admin huquqini olish'
                        ) : (
                          'Admin qilish'
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            {filteredProfiles.length === 0 && (
              <p className="text-center text-muted-foreground py-10 text-sm">
                {search ? 'Qidiruv natijalari yo\'q' : 'Foydalanuvchilar yo\'q'}
              </p>
            )}
          </div>
        </TabsContent>

        {/* ── Bookings ── */}
        <TabsContent value="bookings" className="mt-6 space-y-3">
          {bookings.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">
              Buyurtmalar yo'q yoki admin ko'rish huquqi yo'q.<br />
              <span className="text-xs">Migratsiyani qo'llang: admin booking ko'rish uchun.</span>
            </p>
          ) : (
            bookings.map((b) => (
              <Card key={b.id} className="border-gold/20 bg-card-gradient">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px] border-gold/30">{b.service_type}</Badge>
                        <span className="font-medium text-sm">{b.service_name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        📍 {b.viloyat}
                        {b.booking_date && ` · 📅 ${b.booking_date}`}
                        {b.booking_time && ` ${b.booking_time}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        👤 {b.profile?.full_name || 'Nomsiz'}
                        {b.profile?.email && ` · ${b.profile.email}`}
                      </p>
                      {b.notes && <p className="text-xs text-muted-foreground italic">"{b.notes}"</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-muted-foreground">{fmt(b.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* ── Reviews ── */}
        <TabsContent value="reviews" className="mt-6 space-y-3">
          {reviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">Baholashlar yo'q</p>
          ) : (
            reviews.map((r) => (
              <Card key={r.id} className="border-gold/20 bg-card-gradient">
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Stars n={r.rating} />
                      <Badge variant="outline" className="text-[10px] border-gold/30">{r.service_type}</Badge>
                      <span className="font-medium text-sm">{r.service_name || r.service_id}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground shrink-0">{fmt(r.created_at)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    👤 {r.profile?.full_name || 'Nomsiz foydalanuvchi'}
                  </p>
                  {r.comment && <p className="text-xs mt-1 italic text-foreground/80">"{r.comment}"</p>}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
