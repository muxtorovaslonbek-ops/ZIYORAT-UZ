import { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, Users, Crown, Clock, Check, X, Loader2, RefreshCw,
  Send, LogOut, BarChart3, Search, ChevronDown, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ── Types ──────────────────────────────────────────────────────────────────
type AdminUser = {
  user_id: string; email: string; full_name: string;
  telegram_id: string | null; telegram_username: string | null;
  registered_at: string; last_seen: string;
  is_premium: boolean; request_status: string | null;
};
type PremiumRequest = {
  user_id: string; user_email: string; user_name: string;
  telegram_username: string; status: string;
  requested_at: string; reviewed_at: string | null; is_premium: boolean;
};

const STORAGE_KEY = 'ziyorat_admin_token';
const fmt = (d: string) => { try { return format(new Date(d), 'dd.MM.yyyy HH:mm'); } catch { return d; } };

const api = async (path: string, method = 'GET', body?: object, token?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return res.json();
};

// ── Login Page ─────────────────────────────────────────────────────────────
const LoginPage = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api('/admin/login', 'POST', { username, password });
      if (data.ok && data.token) {
        localStorage.setItem(STORAGE_KEY, data.token);
        onLogin(data.token);
        toast.success('Admin paneliga xush kelibsiz!');
      } else {
        toast.error(data.error || "Login yoki parol noto'g'ri");
      }
    } catch {
      toast.error('Ulanish xatosi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm border-gold/30 bg-card-gradient p-8 shadow-elegant">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-display text-2xl text-gold-gradient">Admin Panel</h1>
            <p className="text-xs text-muted-foreground mt-1">ZIYORAT UZ boshqaruv tizimi</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="uname">Login</Label>
              <Input
                id="uname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin login"
                required
                autoComplete="username"
                className="bg-input border-gold/30 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pw">Parol</Label>
              <div className="relative mt-1">
                <Input
                  id="pw"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="bg-input border-gold/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gold hover:bg-gold/90 text-black font-semibold mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Kirish'}
            </Button>
          </form>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = ({ token, onLogout }: { token: string; onLogout: () => void }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState('stats');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ud, rd] = await Promise.all([
        api('/admin/users', 'GET', undefined, token),
        api('/admin/requests', 'GET', undefined, token),
      ]);
      if (ud.ok) setUsers(ud.users || []);
      if (rd.ok) setRequests(rd.requests || []);
    } catch { toast.error("Ma'lumot yuklanmadi"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const grantPremium = async (userId: string) => {
    setActing(userId);
    const d = await api(`/admin/grant/${userId}`, 'POST', undefined, token);
    if (d.ok) { toast.success('Premium berildi ✓'); load(); }
    else toast.error(d.error || 'Xato');
    setActing(null);
  };

  const revokePremium = async (userId: string) => {
    setActing(userId);
    const d = await api(`/admin/grant/${userId}`, 'DELETE', undefined, token);
    if (d.ok) { toast.success('Premium olib tashlandi'); load(); }
    else toast.error(d.error || 'Xato');
    setActing(null);
  };

  const approve = async (userId: string) => {
    setActing(userId);
    const d = await api(`/admin/approve/${userId}`, 'POST', undefined, token);
    if (d.ok) { toast.success('Tasdiqlandi ✓'); load(); }
    setActing(null);
  };

  const reject = async (userId: string) => {
    setActing(userId);
    const d = await api(`/admin/reject/${userId}`, 'POST', undefined, token);
    if (d.ok) { toast.success("Rad etildi"); load(); }
    setActing(null);
  };

  const logout = async () => {
    await api('/admin/logout', 'POST', undefined, token).catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    onLogout();
  };

  const premiumUsers = users.filter((u) => u.is_premium);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.telegram_username?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl text-gold-gradient">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">ZIYORAT UZ boshqaruv markazi</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" size="sm" className="gap-2 border-gold/30" disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Yangilash
            </Button>
            <Button onClick={logout} variant="outline" size="sm" className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4" />
              Chiqish
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-xl bg-secondary mb-6">
            <TabsTrigger value="stats" className="gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />Statistika
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Foydalanuvchilar
              {users.length > 0 && <span className="ml-1 text-[10px] bg-secondary-foreground/10 rounded-full px-1">{users.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5" />
              So'rovlar
              {pendingRequests.length > 0 && (
                <span className="ml-1 bg-amber-500 text-black text-[10px] rounded-full px-1.5">{pendingRequests.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="premium" className="gap-1.5 text-xs">
              <Crown className="w-3.5 h-3.5" />Premium
              {premiumUsers.length > 0 && <span className="ml-1 text-[10px] bg-secondary-foreground/10 rounded-full px-1">{premiumUsers.length}</span>}
            </TabsTrigger>
          </TabsList>

          {/* ── STATS ── */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Jami foydalanuvchilar', value: users.length, icon: Users, color: 'text-blue-400' },
                { label: 'Premium foydalanuvchilar', value: premiumUsers.length, icon: Crown, color: 'text-gold' },
                { label: "Kutayotgan so'rovlar", value: pendingRequests.length, icon: Clock, color: 'text-amber-400' },
                { label: 'Telegram orqali', value: users.filter((u) => u.telegram_id).length, icon: Send, color: 'text-[#229ED9]' },
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="border-gold/20 bg-card-gradient">
                  <CardContent className="p-5 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{value}</p>
                      <p className="text-[11px] text-muted-foreground">{label}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-gold/20 bg-card-gradient mt-4">
              <CardHeader><CardTitle className="text-sm">Premium bo'limlar</CardTitle></CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">Quyidagi bo'limlarga faqat premium foydalanuvchilar kira oladi:</p>
                <div className="flex flex-wrap gap-2">
                  {['AI Yo\'lboshchi', '3D Sayohat', 'Tarixiy Liboslar', 'Zamonlar Aro Suhbat'].map((f) => (
                    <Badge key={f} className="bg-gold/20 text-gold border-gold/30">{f}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Ism, email yoki Telegram..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-input border-gold/30" />
              </div>
              <p className="text-sm text-muted-foreground">{filteredUsers.length} ta</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <Card key={u.user_id} className="border-gold/20 bg-card-gradient overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpanded(expanded === u.user_id ? null : u.user_id)}
                    >
                      <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-gold font-bold text-sm">{(u.full_name || u.email || '?')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm truncate">{u.full_name || 'Nomsiz'}</p>
                          {u.is_premium && <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]"><Crown className="w-2.5 h-2.5 mr-0.5" />Premium</Badge>}
                          {u.telegram_id && <Badge className="bg-[#229ED9]/20 text-[#229ED9] border-[#229ED9]/30 text-[10px]"><Send className="w-2.5 h-2.5 mr-0.5" />Telegram</Badge>}
                          {u.request_status === 'pending' && <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]">So'rov kutmoqda</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email || '—'} · {fmt(u.last_seen)}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded === u.user_id ? 'rotate-180' : ''}`} />
                    </div>
                    {expanded === u.user_id && (
                      <div className="border-t border-gold/10 px-4 pb-4 pt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><p className="text-muted-foreground mb-0.5">Email</p><p>{u.email || '—'}</p></div>
                          <div><p className="text-muted-foreground mb-0.5">Ro'yxat</p><p>{fmt(u.registered_at)}</p></div>
                          {u.telegram_id && <div><p className="text-muted-foreground mb-0.5">Telegram ID</p><p>{u.telegram_id}</p></div>}
                          {u.telegram_username && <div><p className="text-muted-foreground mb-0.5">@username</p><a href={`https://t.me/${u.telegram_username}`} target="_blank" rel="noreferrer" className="text-[#229ED9] hover:underline">@{u.telegram_username}</a></div>}
                          <div><p className="text-muted-foreground mb-0.5">User ID</p><p className="font-mono text-[10px] truncate">{u.user_id}</p></div>
                        </div>
                        <div className="flex gap-2 pt-1">
                          {u.is_premium ? (
                            <Button size="sm" variant="destructive" disabled={acting === u.user_id} onClick={() => revokePremium(u.user_id)}>
                              {acting === u.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Premium olish'}
                            </Button>
                          ) : (
                            <Button size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1" disabled={acting === u.user_id} onClick={() => grantPremium(u.user_id)}>
                              {acting === u.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Crown className="w-3.5 h-3.5" />Premium berish</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-10 text-sm">
                    {search ? "Qidiruv natijalari yo'q" : "Foydalanuvchilar yo'q — saytga kirgandan keyin ko'rinadi"}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── REQUESTS ── */}
          <TabsContent value="requests" className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
            ) : requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Premium so'rovlar yo'q</p>
            ) : (
              requests.map((r) => (
                <Card key={r.user_id} className="border-gold/20 bg-card-gradient">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{r.user_name || 'Nomsiz'}</p>
                          <Badge className={
                            r.status === 'pending' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]' :
                            r.status === 'approved' ? 'bg-green-500/20 text-green-500 border-green-500/30 text-[10px]' :
                            'bg-destructive/20 text-destructive border-destructive/30 text-[10px]'
                          }>
                            {r.status === 'pending' ? 'Kutmoqda' : r.status === 'approved' ? 'Tasdiqlandi' : 'Rad etildi'}
                          </Badge>
                          {r.is_premium && <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]"><Crown className="w-2.5 h-2.5" />Premium</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{r.user_email || '—'}</p>
                        {r.telegram_username && (
                          <a href={`https://t.me/${r.telegram_username}`} target="_blank" rel="noreferrer" className="text-xs text-[#229ED9] hover:underline">@{r.telegram_username}</a>
                        )}
                        <p className="text-[11px] text-muted-foreground">So'rov: {fmt(r.requested_at)}</p>
                      </div>
                      {r.status === 'pending' && (
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1 h-8" disabled={acting === r.user_id} onClick={() => approve(r.user_id)}>
                            {acting === r.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            Tasdiqlash
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1 h-8" disabled={acting === r.user_id} onClick={() => reject(r.user_id)}>
                            <X className="w-3 h-3" />
                            Rad
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ── PREMIUM ── */}
          <TabsContent value="premium" className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
            ) : premiumUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Premium foydalanuvchilar yo'q</p>
            ) : (
              premiumUsers.map((u) => (
                <Card key={u.user_id} className="border-gold/20 bg-card-gradient">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{u.full_name || 'Nomsiz'}</p>
                      <p className="text-xs text-muted-foreground">{u.email || '—'}</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0" disabled={acting === u.user_id} onClick={() => revokePremium(u.user_id)}>
                      {acting === u.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Olish'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

// ── Root Component ─────────────────────────────────────────────────────────
const Admin = () => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [verifying, setVerifying] = useState(!!localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) { setVerifying(false); return; }
    fetch('/api/admin/verify', { headers: { Authorization: `Bearer ${stored}` } })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) { localStorage.removeItem(STORAGE_KEY); setToken(null); }
      })
      .catch(() => { localStorage.removeItem(STORAGE_KEY); setToken(null); })
      .finally(() => setVerifying(false));
  }, []);

  if (verifying) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-gold animate-spin" />
    </div>
  );

  if (!token) return <LoginPage onLogin={setToken} />;
  return <Dashboard token={token} onLogout={() => setToken(null)} />;
};

export default Admin;
