import { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Shield, Users, Crown, Clock, Check, X, Loader2, RefreshCw,
  Send, LogOut, BarChart3, Search, ChevronDown, Eye, EyeOff,
  Package, Bell, MessageSquare, FileText, Trash2, Ban, UserCheck,
  Plus, Edit2, Star, MapPin, Tag, Image as ImageIcon, ChevronUp,
  AlertCircle, CheckCircle2, XCircle, Inbox, Reply,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ── Types ──────────────────────────────────────────────────────────────────
type AdminUser = {
  user_id: string; email: string; full_name: string;
  telegram_id: string | null; telegram_username: string | null;
  registered_at: string; last_seen: string;
  is_premium: boolean; request_status: string | null;
  is_blocked?: boolean;
};
type PremiumRequest = {
  user_id: string; user_email: string; user_name: string;
  telegram_username: string; status: string;
  requested_at: string; reviewed_at: string | null; is_premium: boolean;
};
type Product = {
  id: string; category: string; name: string; description: string;
  price: number; region: string; material: string; rating: number;
  badge: string | null; img_url: string | null; is_active: boolean;
  created_at: string;
};
type Notification = {
  id: string; title: string; message: string; target: string; sent_at: string;
};
type AdminMessage = {
  id: string; to_user_id: string | null; to_user_name: string | null;
  to_user_email: string | null; subject: string | null; message: string;
  admin_reply: string | null; sent_at: string; replied_at: string | null;
};
type Contract = {
  id: string; applicant_type: string; full_name: string;
  organization_name: string | null; phone: string; email: string | null;
  region: string | null; address: string | null; certificate_number: string | null;
  message: string | null; status: string; admin_reply: string | null;
  created_at: string; reviewed_at: string | null;
};

const STORAGE_KEY = 'ziyorat_admin_token';
const fmt = (d: string) => { try { return format(new Date(d), 'dd.MM.yyyy HH:mm'); } catch { return d || '—'; } };

const api = async (path: string, method = 'GET', body?: object, token?: string) => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  return res.json();
};

const CATEGORIES = [
  { value: 'ziyoratgoh', label: 'Ziyoratgoh buyumlari' },
  { value: 'ayollar', label: "Ayollar kiyimi" },
  { value: 'erkaklar', label: "Erkaklar kiyimi" },
  { value: 'gilamlar', label: 'Gilamlar / Suzana' },
  { value: 'kulolchilik', label: 'Kulolchilik' },
  { value: 'sovgalik', label: "Sovg'alik narsalar" },
  { value: 'boshqa', label: 'Boshqa' },
];

const CONTRACT_TYPES: Record<string, string> = {
  guide: 'Gid', hotel: 'Mehmonxona', restaurant: 'Restoran',
};
const CONTRACT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:      { label: 'Yangi',       color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  review:   { label: "Ko'rib chiqilmoqda", color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  approved: { label: 'Tasdiqlandi', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  rejected: { label: 'Rad etildi',  color: 'bg-red-500/20 text-red-400 border-red-500/30' },
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
        <Card className="w-full max-w-sm border-gold/30 bg-card p-8 shadow-elegant">
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
              <Input id="uname" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="admin login" required autoComplete="username"
                className="bg-input border-gold/30 mt-1" />
            </div>
            <div>
              <Label htmlFor="pw">Parol</Label>
              <div className="relative mt-1">
                <Input id="pw" type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  required autoComplete="current-password" className="bg-input border-gold/30 pr-10" />
                <button type="button" onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
  <Card className="border-gold/20 bg-card">
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
);

// ── Dashboard ──────────────────────────────────────────────────────────────
const Dashboard = ({ token, onLogout }: { token: string; onLogout: () => void }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [requests, setRequests] = useState<PremiumRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState('stats');

  // Product form
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ category: 'ziyoratgoh', name: '', description: '', price: '', region: '', material: '', rating: '4.5', badge: '', img_url: '' });
  const [savingProduct, setSavingProduct] = useState(false);

  // Notification form
  const [notifForm, setNotifForm] = useState({ title: '', message: '', target: 'all' });
  const [sendingNotif, setSendingNotif] = useState(false);

  // Message form
  const [msgForm, setMsgForm] = useState({ to_user_id: '', to_user_name: '', to_user_email: '', subject: '', message: '' });
  const [sendingMsg, setSendingMsg] = useState(false);
  const [replyTarget, setReplyTarget] = useState<AdminMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Contract
  const [contractExpanded, setContractExpanded] = useState<string | null>(null);
  const [contractReply, setContractReply] = useState('');
  const [contractStatus, setContractStatus] = useState('approved');
  const [sendingContract, setSendingContract] = useState(false);

  // User search
  const [userSearch, setUserSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ud, rd, pd, nd, md, cd] = await Promise.all([
        api('/admin/users', 'GET', undefined, token),
        api('/admin/requests', 'GET', undefined, token),
        api('/admin/products', 'GET', undefined, token),
        api('/admin/notifications', 'GET', undefined, token),
        api('/admin/messages', 'GET', undefined, token),
        api('/admin/contracts', 'GET', undefined, token),
      ]);
      if (ud.ok) setUsers(ud.users || []);
      if (rd.ok) setRequests(rd.requests || []);
      if (pd.ok) setProducts(pd.products || []);
      if (nd.ok) setNotifications(nd.notifications || []);
      if (md.ok) setMessages(md.messages || []);
      if (cd.ok) setContracts(cd.contracts || []);
    } catch { toast.error("Ma'lumot yuklanmadi"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  // ── Actions ──
  const grantPremium = async (userId: string) => {
    setActing(userId);
    const d = await api(`/admin/grant/${userId}`, 'POST', undefined, token);
    if (d.ok) { toast.success('Premium berildi ✓'); load(); } else toast.error(d.error || 'Xato');
    setActing(null);
  };
  const revokePremium = async (userId: string) => {
    setActing(userId);
    const d = await api(`/admin/grant/${userId}`, 'DELETE', undefined, token);
    if (d.ok) { toast.success('Premium olib tashlandi'); load(); } else toast.error(d.error || 'Xato');
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
    if (d.ok) { toast.success('Rad etildi'); load(); }
    setActing(null);
  };
  const blockUser = async (userId: string, blocked: boolean) => {
    setActing(userId);
    const d = await api(`/admin/users/${userId}/block`, 'PATCH', { blocked }, token);
    if (d.ok) { toast.success(blocked ? 'Bloklandi' : 'Blokdan chiqarildi'); load(); } else toast.error('Xato');
    setActing(null);
  };
  const deleteUser = async (userId: string) => {
    if (!confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi.")) return;
    setActing(userId);
    const d = await api(`/admin/users/${userId}`, 'DELETE', undefined, token);
    if (d.ok) { toast.success("O'chirildi"); load(); } else toast.error('Xato');
    setActing(null);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return toast.error('Nomi kerak');
    setSavingProduct(true);
    const d = await api('/admin/products', 'POST', {
      ...productForm,
      price: Number(productForm.price),
      rating: Number(productForm.rating),
    }, token);
    if (d.ok) { toast.success("Mahsulot qo'shildi ✓"); setShowProductForm(false); setProductForm({ category: 'ziyoratgoh', name: '', description: '', price: '', region: '', material: '', rating: '4.5', badge: '', img_url: '' }); load(); }
    else toast.error(d.error || 'Xato');
    setSavingProduct(false);
  };
  const deleteProduct = async (id: string) => {
    if (!confirm("Mahsulotni o'chirish?")) return;
    const d = await api(`/admin/products/${id}`, 'DELETE', undefined, token);
    if (d.ok) { toast.success("O'chirildi"); load(); }
  };

  const sendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title || !notifForm.message) return toast.error('Sarlavha va xabar kerak');
    setSendingNotif(true);
    const d = await api('/admin/notifications/send', 'POST', notifForm, token);
    if (d.ok) { toast.success('Bildirishnoma yuborildi ✓'); setNotifForm({ title: '', message: '', target: 'all' }); load(); }
    else toast.error(d.error || 'Xato');
    setSendingNotif(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgForm.message) return toast.error('Xabar matni kerak');
    setSendingMsg(true);
    const d = await api('/admin/messages/send', 'POST', msgForm, token);
    if (d.ok) { toast.success('Xabar yuborildi ✓'); setMsgForm({ to_user_id: '', to_user_name: '', to_user_email: '', subject: '', message: '' }); load(); }
    else toast.error(d.error || 'Xato');
    setSendingMsg(false);
  };
  const sendReply = async () => {
    if (!replyTarget || !replyText.trim()) return;
    setSendingReply(true);
    const d = await api(`/admin/messages/${replyTarget.id}/reply`, 'POST', { reply: replyText }, token);
    if (d.ok) { toast.success('Javob yuborildi ✓'); setReplyTarget(null); setReplyText(''); load(); }
    else toast.error('Xato');
    setSendingReply(false);
  };
  const deleteMessage = async (id: string) => {
    if (!confirm("Xabarni o'chirish?")) return;
    const d = await api(`/admin/messages/${id}`, 'DELETE', undefined, token);
    if (d.ok) { toast.success("O'chirildi"); load(); }
  };

  const sendContractReply = async (id: string) => {
    if (!contractReply.trim()) return toast.error('Javob matni kerak');
    setSendingContract(true);
    const d = await api(`/admin/contracts/${id}/reply`, 'POST', { reply: contractReply, status: contractStatus }, token);
    if (d.ok) { toast.success('Javob yuborildi ✓'); setContractExpanded(null); setContractReply(''); load(); }
    else toast.error('Xato');
    setSendingContract(false);
  };

  const logout = async () => {
    await api('/admin/logout', 'POST', undefined, token).catch(() => {});
    localStorage.removeItem(STORAGE_KEY);
    onLogout();
  };

  const premiumUsers = users.filter((u) => u.is_premium);
  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const newContracts = contracts.filter((c) => c.status === 'new');
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.telegram_username?.toLowerCase().includes(q);
  });

  const tabs = [
    { value: 'stats',    icon: BarChart3,     label: 'Statistika' },
    { value: 'users',    icon: Users,          label: 'Foydalanuvchilar', badge: users.length },
    { value: 'products', icon: Package,        label: 'Mahsulotlar', badge: products.length },
    { value: 'notifs',   icon: Bell,           label: 'Bildirishnomalar' },
    { value: 'messages', icon: MessageSquare,  label: 'Xabarlar', badge: messages.length || undefined },
    { value: 'contracts',icon: FileText,       label: 'Shartnomalar', badge: newContracts.length || undefined, badgeColor: 'bg-blue-500' },
    { value: 'requests', icon: Clock,          label: "So'rovlar", badge: pendingRequests.length || undefined, badgeColor: 'bg-amber-500' },
    { value: 'premium',  icon: Crown,          label: 'Premium', badge: premiumUsers.length },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-2xl text-gold-gradient">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">ZIYORAT UZ boshqaruv markazi</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={load} variant="outline" size="sm" className="gap-1.5 border-gold/30" disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Yangilash</span>
            </Button>
            <Button onClick={logout} variant="outline" size="sm" className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Chiqish</span>
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          {/* Scrollable tab list */}
          <div className="overflow-x-auto pb-1 mb-5">
            <TabsList className="inline-flex w-max bg-secondary gap-0.5 h-auto p-1">
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs px-3 py-2 relative">
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                  {t.badge !== undefined && t.badge > 0 && (
                    <span className={`ml-0.5 text-[10px] rounded-full px-1.5 py-0 font-semibold ${t.badgeColor || 'bg-secondary-foreground/15'} ${t.badgeColor ? 'text-black' : ''}`}>
                      {t.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── STATS ── */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Jami foydalanuvchilar" value={users.length} icon={Users} color="text-blue-400" />
              <StatCard label="Premium foydalanuvchilar" value={premiumUsers.length} icon={Crown} color="text-gold" />
              <StatCard label="Kutayotgan so'rovlar" value={pendingRequests.length} icon={Clock} color="text-amber-400" />
              <StatCard label="Telegram orqali" value={users.filter((u) => u.telegram_id).length} icon={Send} color="text-[#229ED9]" />
              <StatCard label="Jami mahsulotlar" value={products.length} icon={Package} color="text-purple-400" />
              <StatCard label="Yuborilgan bildirishnomalar" value={notifications.length} icon={Bell} color="text-green-400" />
              <StatCard label="Shartnoma arizalar" value={contracts.length} icon={FileText} color="text-orange-400" />
              <StatCard label="Bloklangan" value={users.filter((u) => u.is_blocked).length} icon={Ban} color="text-red-400" />
            </div>
            <Card className="border-gold/20 bg-card">
              <CardHeader><CardTitle className="text-sm">Premium bo'limlar</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["AI Yo'lboshchi", '3D Sayohat', 'Tarixiy Liboslar', 'Zamonlar Aro Suhbat'].map((f) => (
                    <Badge key={f} className="bg-gold/20 text-gold border-gold/30">{f}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── USERS ── */}
          <TabsContent value="users" className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Ism, email yoki Telegram..." value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)} className="pl-9 bg-input border-gold/30" />
              </div>
              <p className="text-sm text-muted-foreground shrink-0">{filteredUsers.length} ta</p>
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <Card key={u.user_id} className={`border-gold/20 bg-card overflow-hidden ${u.is_blocked ? 'opacity-60' : ''}`}>
                    <div className="flex items-center gap-3 p-4 cursor-pointer"
                      onClick={() => setExpanded(expanded === u.user_id ? null : u.user_id)}>
                      <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                        <span className="text-gold font-bold text-sm">{(u.full_name || u.email || '?')[0].toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-medium text-sm truncate">{u.full_name || 'Nomsiz'}</p>
                          {u.is_premium && <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]"><Crown className="w-2.5 h-2.5 mr-0.5" />Premium</Badge>}
                          {u.telegram_id && <Badge className="bg-[#229ED9]/20 text-[#229ED9] border-[#229ED9]/30 text-[10px]"><Send className="w-2.5 h-2.5 mr-0.5" />TG</Badge>}
                          {u.is_blocked && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"><Ban className="w-2.5 h-2.5 mr-0.5" />Bloklangan</Badge>}
                          {u.request_status === 'pending' && <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 text-[10px]">So'rov</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{u.email || '—'} · {fmt(u.last_seen)}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${expanded === u.user_id ? 'rotate-180' : ''}`} />
                    </div>
                    {expanded === u.user_id && (
                      <div className="border-t border-gold/10 px-4 pb-4 pt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><p className="text-muted-foreground mb-0.5">Email</p><p className="truncate">{u.email || '—'}</p></div>
                          <div><p className="text-muted-foreground mb-0.5">Ro'yxat</p><p>{fmt(u.registered_at)}</p></div>
                          {u.telegram_id && <div><p className="text-muted-foreground mb-0.5">Telegram ID</p><p>{u.telegram_id}</p></div>}
                          {u.telegram_username && (
                            <div><p className="text-muted-foreground mb-0.5">@username</p>
                              <a href={`https://t.me/${u.telegram_username}`} target="_blank" rel="noreferrer" className="text-[#229ED9] hover:underline">@{u.telegram_username}</a>
                            </div>
                          )}
                          <div className="col-span-2"><p className="text-muted-foreground mb-0.5">User ID</p><p className="font-mono text-[10px] break-all">{u.user_id}</p></div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {u.is_premium ? (
                            <Button size="sm" variant="destructive" disabled={acting === u.user_id} onClick={() => revokePremium(u.user_id)}>
                              {acting === u.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Premium olish'}
                            </Button>
                          ) : (
                            <Button size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1" disabled={acting === u.user_id} onClick={() => grantPremium(u.user_id)}>
                              {acting === u.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Crown className="w-3.5 h-3.5" />Premium berish</>}
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className={`gap-1 border-${u.is_blocked ? 'green' : 'amber'}-500/40 text-${u.is_blocked ? 'green' : 'amber'}-400 hover:bg-${u.is_blocked ? 'green' : 'amber'}-500/10`}
                            disabled={acting === u.user_id} onClick={() => blockUser(u.user_id, !u.is_blocked)}>
                            {acting === u.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : u.is_blocked ? <><UserCheck className="w-3.5 h-3.5" />Blokdan chiqar</> : <><Ban className="w-3.5 h-3.5" />Bloklash</>}
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1 ml-auto" disabled={acting === u.user_id}
                            onClick={() => deleteUser(u.user_id)}>
                            <Trash2 className="w-3.5 h-3.5" />O'chirish
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-10 text-sm">
                    {userSearch ? "Qidiruv natijalari yo'q" : "Foydalanuvchilar yo'q"}
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── PRODUCTS ── */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Milliy Market mahsulotlari ({products.length})</h2>
              <Button size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1.5"
                onClick={() => setShowProductForm((v) => !v)}>
                <Plus className="w-4 h-4" />Mahsulot qo'shish
              </Button>
            </div>

            {showProductForm && (
              <Card className="border-gold/30 bg-card">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4 text-gold" />Yangi mahsulot</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={saveProduct} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Kategoriya</Label>
                        <select value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                          className="w-full mt-1 h-9 rounded-md border border-gold/30 bg-input px-3 text-sm">
                          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Nomi *</Label>
                        <Input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                          placeholder="Mahsulot nomi" required className="bg-input border-gold/30 mt-1" />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-xs">Tavsif</Label>
                        <Input value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                          placeholder="Qisqacha tavsif" className="bg-input border-gold/30 mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Narxi (so'm)</Label>
                        <Input type="number" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                          placeholder="150000" className="bg-input border-gold/30 mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Reyting (0–5)</Label>
                        <Input type="number" step="0.1" min="0" max="5" value={productForm.rating}
                          onChange={(e) => setProductForm((p) => ({ ...p, rating: e.target.value }))}
                          className="bg-input border-gold/30 mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Viloyat / Hudud</Label>
                        <Input value={productForm.region} onChange={(e) => setProductForm((p) => ({ ...p, region: e.target.value }))}
                          placeholder="Buxoro" className="bg-input border-gold/30 mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Material</Label>
                        <Input value={productForm.material} onChange={(e) => setProductForm((p) => ({ ...p, material: e.target.value }))}
                          placeholder="Ipak, Paxta..." className="bg-input border-gold/30 mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Badge (ixtiyoriy)</Label>
                        <select value={productForm.badge} onChange={(e) => setProductForm((p) => ({ ...p, badge: e.target.value }))}
                          className="w-full mt-1 h-9 rounded-md border border-gold/30 bg-input px-3 text-sm">
                          <option value="">—</option>
                          <option value="Yangi">Yangi</option>
                          <option value="Hit">Hit</option>
                          <option value="Cheklangan">Cheklangan</option>
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Rasm URL</Label>
                        <Input value={productForm.img_url} onChange={(e) => setProductForm((p) => ({ ...p, img_url: e.target.value }))}
                          placeholder="https://..." className="bg-input border-gold/30 mt-1" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button type="submit" size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1" disabled={savingProduct}>
                        {savingProduct ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />Saqlash</>}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setShowProductForm(false)}>Bekor</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Mahsulotlar yo'q. Yuqoridagi tugmani bosing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((p) => (
                  <Card key={p.id} className="border-gold/20 bg-card overflow-hidden">
                    {p.img_url && (
                      <div className="h-36 overflow-hidden">
                        <img src={p.img_url} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{p.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                        </div>
                        {p.badge && <Badge className="text-[10px] shrink-0 bg-gold/20 text-gold border-gold/30">{p.badge}</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        {p.region && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.region}</span>}
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-gold" />{p.rating}</span>
                        <span className="ml-auto font-semibold text-foreground">{new Intl.NumberFormat('uz-UZ').format(p.price)} so'm</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px]">{CATEGORIES.find(c => c.value === p.category)?.label || p.category}</Badge>
                        <Button size="sm" variant="destructive" className="ml-auto h-7 text-xs gap-1 px-2" onClick={() => deleteProduct(p.id)}>
                          <Trash2 className="w-3 h-3" />O'chirish
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── NOTIFICATIONS ── */}
          <TabsContent value="notifs" className="space-y-4">
            <Card className="border-gold/30 bg-card">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Bell className="w-4 h-4 text-gold" />Yangi bildirishnoma yuborish</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={sendNotification} className="space-y-3">
                  <div>
                    <Label className="text-xs">Sarlavha</Label>
                    <Input value={notifForm.title} onChange={(e) => setNotifForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="Bildirishnoma sarlavhasi" className="bg-input border-gold/30 mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Xabar matni</Label>
                    <Textarea value={notifForm.message} onChange={(e) => setNotifForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Xabar mazmuni..." className="bg-input border-gold/30 mt-1 min-h-[80px]" />
                  </div>
                  <div>
                    <Label className="text-xs">Kimga</Label>
                    <select value={notifForm.target} onChange={(e) => setNotifForm((p) => ({ ...p, target: e.target.value }))}
                      className="w-full mt-1 h-9 rounded-md border border-gold/30 bg-input px-3 text-sm">
                      <option value="all">Barcha foydalanuvchilar</option>
                      <option value="premium">Faqat premium</option>
                      <option value="telegram">Telegram foydalanuvchilari</option>
                    </select>
                  </div>
                  <Button type="submit" size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1.5" disabled={sendingNotif}>
                    {sendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Yuborish</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Yuborilgan bildirishnomalar ({notifications.length})</h3>
              {notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Hali yuborilmagan</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <Card key={n.id} className="border-gold/20 bg-card">
                      <CardContent className="p-4 flex items-start gap-3">
                        <Bell className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{n.title}</p>
                            <Badge variant="outline" className="text-[10px]">{n.target === 'all' ? 'Barchaga' : n.target === 'premium' ? 'Premium' : 'Telegram'}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{n.message}</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1">{fmt(n.sent_at)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── MESSAGES ── */}
          <TabsContent value="messages" className="space-y-4">
            {/* Send new message */}
            <Card className="border-gold/30 bg-card">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="w-4 h-4 text-gold" />Foydalanuvchiga xabar yuborish</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={sendMessage} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Qabul qiluvchi ismi</Label>
                      <Input value={msgForm.to_user_name} onChange={(e) => setMsgForm((p) => ({ ...p, to_user_name: e.target.value }))}
                        placeholder="Ism familiya" className="bg-input border-gold/30 mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Email (ixtiyoriy)</Label>
                      <Input value={msgForm.to_user_email} onChange={(e) => setMsgForm((p) => ({ ...p, to_user_email: e.target.value }))}
                        placeholder="email@example.com" className="bg-input border-gold/30 mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Mavzu</Label>
                      <Input value={msgForm.subject} onChange={(e) => setMsgForm((p) => ({ ...p, subject: e.target.value }))}
                        placeholder="Xabar mavzusi" className="bg-input border-gold/30 mt-1" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Xabar matni *</Label>
                      <Textarea value={msgForm.message} onChange={(e) => setMsgForm((p) => ({ ...p, message: e.target.value }))}
                        placeholder="Xabar mazmuni..." required className="bg-input border-gold/30 mt-1 min-h-[80px]" />
                    </div>
                  </div>
                  <Button type="submit" size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1.5" disabled={sendingMsg}>
                    {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Yuborish</>}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Reply dialog */}
            {replyTarget && (
              <Card className="border-amber-500/30 bg-card">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Reply className="w-4 h-4 text-amber-400" />Javob yozish
                    <Button size="sm" variant="ghost" className="ml-auto h-7 w-7 p-0" onClick={() => setReplyTarget(null)}><X className="w-4 h-4" /></Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">Kimga: {replyTarget.to_user_name || replyTarget.to_user_email || 'Noma\'lum'}</p>
                  <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Javob matni..." className="bg-input border-gold/30 min-h-[80px]" />
                  <Button size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1.5" disabled={sendingReply} onClick={sendReply}>
                    {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />Javob yuborish</>}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Xabarlar tarixi ({messages.length})</h3>
              {messages.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground"><Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Xabarlar yo'q</p></div>
              ) : (
                <div className="space-y-2">
                  {messages.map((m) => (
                    <Card key={m.id} className="border-gold/20 bg-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{m.to_user_name || 'Umumiy xabar'}</p>
                              {m.to_user_email && <span className="text-xs text-muted-foreground">{m.to_user_email}</span>}
                            </div>
                            {m.subject && <p className="text-xs font-medium text-gold/80 mb-1">{m.subject}</p>}
                            <p className="text-xs text-muted-foreground">{m.message}</p>
                            {m.admin_reply && (
                              <div className="mt-2 pl-3 border-l-2 border-gold/30">
                                <p className="text-[11px] text-muted-foreground/70 mb-0.5">Javob:</p>
                                <p className="text-xs">{m.admin_reply}</p>
                              </div>
                            )}
                            <p className="text-[11px] text-muted-foreground/60 mt-1">{fmt(m.sent_at)}</p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 border-gold/30" onClick={() => { setReplyTarget(m); setReplyText(''); }}>
                              <Reply className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10" onClick={() => deleteMessage(m.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── CONTRACTS ── */}
          <TabsContent value="contracts" className="space-y-3">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-medium">Shartnoma arizalari ({contracts.length})</h2>
              {newContracts.length > 0 && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{newContracts.length} yangi</Badge>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gold" /></div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground"><FileText className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="text-sm">Shartnoma arizalari yo'q</p></div>
            ) : (
              <div className="space-y-2">
                {contracts.map((c) => {
                  const st = CONTRACT_STATUS_LABELS[c.status] || CONTRACT_STATUS_LABELS.new;
                  return (
                    <Card key={c.id} className="border-gold/20 bg-card overflow-hidden">
                      <div className="flex items-center gap-3 p-4 cursor-pointer"
                        onClick={() => setContractExpanded(contractExpanded === c.id ? null : c.id)}>
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="font-medium text-sm">{c.full_name}</p>
                            <Badge className={`text-[10px] ${st.color}`}>{st.label}</Badge>
                            <Badge variant="outline" className="text-[10px]">{CONTRACT_TYPES[c.applicant_type] || c.applicant_type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{c.phone}{c.email ? ` · ${c.email}` : ''} · {fmt(c.created_at)}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${contractExpanded === c.id ? 'rotate-180' : ''}`} />
                      </div>
                      {contractExpanded === c.id && (
                        <div className="border-t border-gold/10 px-4 pb-4 pt-3 space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {c.organization_name && <div><p className="text-muted-foreground mb-0.5">Tashkilot</p><p>{c.organization_name}</p></div>}
                            {c.region && <div><p className="text-muted-foreground mb-0.5">Hudud</p><p>{c.region}</p></div>}
                            {c.address && <div className="col-span-2"><p className="text-muted-foreground mb-0.5">Manzil</p><p>{c.address}</p></div>}
                            {c.certificate_number && <div><p className="text-muted-foreground mb-0.5">Sertifikat №</p><p>{c.certificate_number}</p></div>}
                          </div>
                          {c.message && (
                            <div className="text-xs"><p className="text-muted-foreground mb-1">Xabar:</p>
                              <p className="bg-secondary/50 rounded-md p-2">{c.message}</p></div>
                          )}
                          {c.admin_reply && (
                            <div className="text-xs pl-3 border-l-2 border-gold/30">
                              <p className="text-muted-foreground mb-0.5">Admin javobi:</p>
                              <p>{c.admin_reply}</p>
                            </div>
                          )}
                          {/* Reply form */}
                          <div className="space-y-2 pt-1">
                            <Textarea value={contractExpanded === c.id ? contractReply : ''}
                              onChange={(e) => setContractReply(e.target.value)}
                              placeholder="Javob matni yozing..." className="bg-input border-gold/30 min-h-[70px] text-xs" />
                            <div className="flex gap-2 items-center">
                              <select value={contractStatus} onChange={(e) => setContractStatus(e.target.value)}
                                className="h-8 rounded-md border border-gold/30 bg-input px-2 text-xs flex-1">
                                <option value="review">Ko'rib chiqilmoqda</option>
                                <option value="approved">Tasdiqlash</option>
                                <option value="rejected">Rad etish</option>
                              </select>
                              <Button size="sm" className="bg-gold hover:bg-gold/90 text-black gap-1 h-8 text-xs"
                                disabled={sendingContract} onClick={() => sendContractReply(c.id)}>
                                {sendingContract ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" />Javob</>}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
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
                <Card key={r.user_id} className="border-gold/20 bg-card">
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
                            {acting === r.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}Tasdiqlash
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-1 h-8" disabled={acting === r.user_id} onClick={() => reject(r.user_id)}>
                            <X className="w-3 h-3" />Rad
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
                <Card key={u.user_id} className="border-gold/20 bg-card">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{u.full_name || 'Nomsiz'}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email || '—'}</p>
                    </div>
                    {u.telegram_id && <Badge className="bg-[#229ED9]/20 text-[#229ED9] border-[#229ED9]/30 text-[10px] shrink-0">TG</Badge>}
                    <Button size="sm" variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 shrink-0"
                      disabled={acting === u.user_id} onClick={() => revokePremium(u.user_id)}>
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
      .then((d) => { if (!d.ok) { localStorage.removeItem(STORAGE_KEY); setToken(null); } })
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
