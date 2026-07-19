import { useMemo, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Landmark,
  Shirt,
  UserSquare2,
  Layers,
  Utensils,
  Gift,
  ToyBrick,
  Sparkles,
  Search,
  Star,
  MapPin,
  ShoppingCart,
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  desc: string;
  price: number;
  region: string;
  material: string;
  rating: number;
  badge?: 'Yangi' | 'Hit' | 'Cheklangan';
  img: string;
};

type Section = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Product[];
};

const fmt = (n: number) => new Intl.NumberFormat('uz-UZ').format(n) + ' soʻm';

// Real product photos from Unsplash CDN (stable photo IDs, w=600 q=70)
const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

const sections: Section[] = [
  {
    id: 'ziyoratgoh',
    title: 'Ziyoratgoh buyumlari',
    subtitle: 'Muqaddas joylardan tabarruk yodgorliklar',
    icon: Landmark,
    items: [
      { id: 'z1', name: 'Tasbeh — yashma toshli', desc: '99 donali, qoʻlda terilgan, ipakli ip', price: 120000, region: 'Buxoro', material: 'Yashma + ipak', rating: 4.8, badge: 'Hit', img: '/market/z1.jpg' },
      { id: 'z2', name: 'Qurʼoni Karim — naqshli', desc: 'Zarhal muqova, sovgʻa qutisi va xaltacha bilan', price: 350000, region: 'Toshkent', material: 'Charm + zarhal', rating: 4.9, img: '/market/z2.jpg' },
      { id: 'z3', name: 'Joynamoz — atlas', desc: 'Margʻilon atlasidan, mehrobli naqsh, qoʻl tikuvi', price: 280000, region: 'Margʻilon', material: 'Sof ipak atlas', rating: 4.7, img: '/market/z3.jpg' },
      { id: 'z4', name: 'Misk attori (3 ml)', desc: 'Spirtsiz, sharqona muborak hid, flakon bilan', price: 95000, region: 'Buxoro', material: 'Tabiiy efir moyi', rating: 4.6, img: '/market/z4.jpg' },
      { id: 'z5', name: 'Daloil ul-xayrot — kitob', desc: 'Arab-oʻzbek, qattiq muqova, salovotlar majmuasi', price: 180000, region: 'Samarqand', material: 'Bosma + charm', rating: 4.8, img: '/market/z5.jpg' },
      { id: 'z6', name: 'Misvok cho‘tkasi (5 dona)', desc: 'Sof arak yogʻochidan, vakuum qadoq', price: 45000, region: 'Import — Madina', material: 'Salvadora persica', rating: 4.5, img: '/market/z6.jpg' },
      { id: 'z7', name: 'Tasbeh — qora aqiq', desc: '33 donali, kumush bezakli', price: 220000, region: 'Buxoro', material: 'Aqiq + kumush', rating: 4.7, badge: 'Cheklangan', img: '/market/z7.jpg' },
      { id: 'z8', name: 'Suvli idishcha — Zamzam', desc: '500 ml, naqshli qopqoq, sovgʻa qutisi', price: 75000, region: 'Toshkent', material: 'Ruxsiz po‘lat', rating: 4.4, img: '/market/z8.jpg' },
    ],
  },
  {
    id: 'ayollar',
    title: 'Ayollar uchun kiyimlar',
    subtitle: 'Atlas, adras va zamonaviy milliy uslub',
    icon: Shirt,
    items: [
      { id: 'a1', name: 'Atlas koʻylak — uzun', desc: 'Margʻilon atlasi, qoʻl tikuvi, M/L/XL', price: 650000, region: 'Margʻilon', material: '100% ipak atlas', rating: 4.9, badge: 'Hit', img: '/market/a1.jpg' },
      { id: 'a2', name: 'Adras chopon — yengil', desc: 'Yoz uchun, ipak-paxta aralashma, astarli', price: 780000, region: 'Buxoro', material: 'Adras (ipak+paxta)', rating: 4.8, img: '/market/a2.jpg' },
      { id: 'a3', name: 'Zardoʻzi doʻppi', desc: 'Oltin ip bilan qoʻl kashtasi, baxmal asos', price: 420000, region: 'Buxoro', material: 'Baxmal + zarhal ip', rating: 4.8, img: '/market/a3.jpg' },
      { id: 'a4', name: 'Ipak roʻmol — 90×90', desc: 'Buxoro naqshi, jiyak qoʻl tikuvi', price: 230000, region: 'Buxoro', material: 'Sof ipak', rating: 4.7, img: '/market/a4.jpg' },
      { id: 'a5', name: 'Xan-atlas yubka', desc: 'Klassik rang-baranglik, elastik bel', price: 380000, region: 'Margʻilon', material: 'Xan-atlas', rating: 4.6, img: '/market/a5.jpg' },
      { id: 'a6', name: 'Suzana koʻylak', desc: 'Qoʻl kashta, yengida suzana naqshi', price: 540000, region: 'Shahrisabz', material: 'Paxta + ipak kashta', rating: 4.7, badge: 'Yangi', img: '/market/a6.jpg' },
      { id: 'a7', name: 'Milliy kombinezon', desc: 'Zamonaviy kesim, ikat naqsh', price: 690000, region: 'Toshkent', material: 'Aralash mato', rating: 4.5, img: '/market/a7.jpg' },
      { id: 'a8', name: 'Tilla qoshli zirak', desc: 'Anʼanaviy oʻzbek zargarligi, kumush asos', price: 320000, region: 'Buxoro', material: 'Kumush + tilla suvi', rating: 4.8, img: '/market/a8.jpg' },
    ],
  },
  {
    id: 'erkaklar',
    title: 'Erkaklar uchun kiyimlar',
    subtitle: 'Chopon, doʻppi va milliy aksessuarlar',
    icon: UserSquare2,
    items: [
      { id: 'e1', name: 'Bekasam chopon', desc: 'Anʼanaviy chiziqli ipak-paxta, astarli', price: 820000, region: 'Buxoro', material: 'Bekasam', rating: 4.8, badge: 'Hit', img: '/market/e1.jpg' },
      { id: 'e2', name: 'Chust doʻppisi — klassik', desc: 'Qora atlas, 4 ta oq qalampir naqshi', price: 180000, region: 'Chust', material: 'Atlas + qoʻl tikuv', rating: 4.9, img: '/market/e2.jpg' },
      { id: 'e3', name: 'Belbogʻ — ipak', desc: 'Margʻilon ipagi, jiyakli, 2.5 m', price: 210000, region: 'Margʻilon', material: 'Sof ipak', rating: 4.6, img: '/market/e3.jpg' },
      { id: 'e4', name: 'Mahsi-kavush — qoʻlbola', desc: 'Tabiiy charm, ichi paxta astar', price: 540000, region: 'Buxoro', material: 'Buyvol charmi', rating: 4.7, img: '/market/e4.jpg' },
      { id: 'e5', name: 'Yaktak koʻylak', desc: 'Yengil paxta, yozgi anʼanaviy koʻylak', price: 290000, region: 'Toshkent', material: '100% paxta', rating: 4.5, img: '/market/e5.jpg' },
      { id: 'e6', name: 'Samarqand doʻppisi', desc: 'Iroqi kashta, zamonaviy yosh uslubi', price: 220000, region: 'Samarqand', material: 'Atlas + iroqi', rating: 4.6, badge: 'Yangi', img: '/market/e6.jpg' },
      { id: 'e7', name: 'Qish choponi — paxtali', desc: 'Ichi quvvatlangan, sovuq kunlar uchun', price: 1150000, region: 'Buxoro', material: 'Bekasam + paxta', rating: 4.7, img: '/market/e7.jpg' },
      { id: 'e8', name: 'Chorsi roʻmol', desc: 'Boshga oʻralalidigan, 110×110', price: 160000, region: 'Margʻilon', material: 'Ipak-paxta', rating: 4.4, img: '/market/e8.jpg' },
    ],
  },
  {
    id: 'gilamlar',
    title: 'Milliy gilamlar va suzanalar',
    subtitle: 'Qoʻlbola jun gilam, palos va devor kashtalari',
    icon: Layers,
    items: [
      { id: 'g1', name: 'Buxoro gilami 2×3 m', desc: 'Qoʻl tugun, tabiiy jun, an’anaviy gul naqsh', price: 4200000, region: 'Buxoro', material: '100% qoʻy juni', rating: 4.9, badge: 'Cheklangan', img: '/market/g1.jpg' },
      { id: 'g2', name: 'Samarqand palosi 1.5×2', desc: 'Geometrik naqsh, ikki tomonlama', price: 2800000, region: 'Samarqand', material: 'Jun + paxta', rating: 4.7, img: '/market/g2.jpg' },
      { id: 'g3', name: 'Suzana — devor pannosi', desc: 'Qoʻl kashtasi, 2×1.5 m, anor naqshi', price: 1600000, region: 'Shahrisabz', material: 'Paxta + ipak kashta', rating: 4.8, badge: 'Hit', img: '/market/g3.jpg' },
      { id: 'g4', name: 'Joynamoz gilam', desc: 'Mehrobli naqsh, 70×120 sm', price: 950000, region: 'Buxoro', material: 'Jun', rating: 4.6, img: '/market/g4.jpg' },
      { id: 'g5', name: 'Qoraqalpoq kigizi', desc: 'Qoʻlbola kigiz, etnik naqsh', price: 1450000, region: 'Nukus', material: '100% qoʻy juni', rating: 4.5, img: '/market/g5.jpg' },
      { id: 'g6', name: 'Mini gilam (yostiq)', desc: '40×40 sm, divan uchun', price: 380000, region: 'Buxoro', material: 'Jun', rating: 4.4, img: '/market/g6.jpg' },
    ],
  },
  {
    id: 'idishlar',
    title: 'Milliy idishlar',
    subtitle: 'Rishton, Gʻijduvon va Xiva sopol san’ati',
    icon: Utensils,
    items: [
      { id: 'i1', name: 'Rishton lagani — 32 sm', desc: 'An’anaviy koʻk-oq, qoʻl rasm', price: 320000, region: 'Rishton', material: 'Sopol + ishqorli sir', rating: 4.9, badge: 'Hit', img: '/market/i1.jpg' },
      { id: 'i2', name: 'Choynak — paxta guli', desc: '800 ml, Gʻijduvon naqshi', price: 180000, region: 'Gʻijduvon', material: 'Sopol', rating: 4.7, img: '/market/i2.jpg' },
      { id: 'i3', name: 'Piyola toʻplami (6 ta)', desc: 'Qoʻl rasm, paxta guli', price: 240000, region: 'Gʻijduvon', material: 'Sopol', rating: 4.8, img: '/market/i3.jpg' },
      { id: 'i4', name: 'Kosa — Xiva', desc: 'Yashil sirli, qoʻl ishi', price: 160000, region: 'Xiva', material: 'Sopol', rating: 4.6, img: '/market/i4.jpg' },
      { id: 'i5', name: 'Osh lagan — 40 sm', desc: 'Katta oilaviy osh uchun', price: 480000, region: 'Rishton', material: 'Sopol', rating: 4.8, img: '/market/i5.jpg' },
      { id: 'i6', name: 'Tuz/qalampir toʻplami', desc: 'Mini sopol idishlar juftligi', price: 95000, region: 'Rishton', material: 'Sopol', rating: 4.5, badge: 'Yangi', img: '/market/i6.jpg' },
      { id: 'i7', name: 'Mis dasturxon choynagi', desc: '1 l, anʼanaviy mis ishi', price: 520000, region: 'Buxoro', material: 'Mis + qalay qoplama', rating: 4.7, img: '/market/i7.jpg' },
      { id: 'i8', name: 'Sopol guldon', desc: 'Stol uchun, kichik o‘lcham', price: 140000, region: 'Xiva', material: 'Sopol', rating: 4.4, img: '/market/i8.jpg' },
    ],
  },
  {
    id: 'suvenir',
    title: 'Suvenirlar',
    subtitle: 'Sayohatdan esdalik sovgʻalar',
    icon: Gift,
    items: [
      { id: 's1', name: 'Registon magniti', desc: 'Metall, jilolangan, 7×5 sm', price: 35000, region: 'Samarqand', material: 'Metall', rating: 4.5, badge: 'Hit', img: '/market/s1.jpg' },
      { id: 's2', name: 'Yashma kalit jild', desc: 'Tabiiy yashma toshli', price: 60000, region: 'Buxoro', material: 'Yashma + metall', rating: 4.4, img: '/market/s2.jpg' },
      { id: 's3', name: 'Yogʻoch oʻymakorlik quticha', desc: 'Qoʻl ishi, 12×8 sm', price: 210000, region: 'Xiva', material: 'Yong‘oq yog‘ochi', rating: 4.7, img: '/market/s3.jpg' },
      { id: 's4', name: 'Kalon minorasi maketi', desc: 'Gips + qoʻl rasm, 15 sm', price: 150000, region: 'Buxoro', material: 'Gips', rating: 4.5, img: '/market/s4.jpg' },
      { id: 's5', name: 'Ipak kartochka — naqshli', desc: 'Tabrik uchun, konvert bilan', price: 28000, region: 'Margʻilon', material: 'Ipak qogʻoz', rating: 4.3, img: '/market/s5.jpg' },
      { id: 's6', name: 'Bibi-Xonim modeli', desc: 'Metall maket, 18 sm', price: 290000, region: 'Samarqand', material: 'Metall', rating: 4.6, img: '/market/s6.jpg' },
    ],
  },
  {
    id: 'oyinchoq',
    title: 'Milliy oʻyinchoqlar',
    subtitle: 'Bolalar uchun qoʻlbola oʻyinchoqlar',
    icon: ToyBrick,
    items: [
      { id: 'o1', name: 'Yogʻoch ot — chopadigan', desc: 'Qoʻlda yasalgan, 3+ yosh', price: 140000, region: 'Xiva', material: 'Tut yog‘ochi', rating: 4.6, img: '/market/o1.jpg' },
      { id: 'o2', name: 'Milliy qoʻgʻirchoq — atlas', desc: 'Atlas koʻylakda, 30 sm', price: 170000, region: 'Margʻilon', material: 'Mato + paxta', rating: 4.7, badge: 'Hit', img: '/market/o2.jpg' },
      { id: 'o3', name: 'Sopol hushtak — qush', desc: 'Rishton ustalari ishi', price: 45000, region: 'Rishton', material: 'Sopol', rating: 4.5, img: '/market/o3.jpg' },
      { id: 'o4', name: 'Chillak-tayoq toʻplami', desc: 'An’anaviy ko‘cha oʻyini', price: 90000, region: 'Toshkent', material: 'Yog‘och', rating: 4.4, img: '/market/o4.jpg' },
      { id: 'o5', name: 'Mini doira', desc: 'Bolalar uchun, 20 sm', price: 220000, region: 'Buxoro', material: 'Yog‘och + teri', rating: 4.5, img: '/market/o5.jpg' },
      { id: 'o6', name: 'Yogʻoch ot-arava', desc: 'Tortib yuriladigan oʻyinchoq', price: 260000, region: 'Xiva', material: 'Tut yog‘ochi', rating: 4.6, badge: 'Yangi', img: '/market/o6.jpg' },
    ],
  },
];

const allItems = sections.flatMap((s) => s.items.map((i) => ({ ...i, sectionId: s.id, sectionTitle: s.title })));

// Fallback image when an Unsplash photo ID is invalid/removed
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=70';

export default function MilliyMarket() {
  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  const cartCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);
  const cartTotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const it = allItems.find((p) => p.id === id);
      return sum + (it ? it.price * qty : 0);
    }, 0);
  }, [cart]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = active === 'all' ? sections : sections.filter((s) => s.id === active);
    if (!q) return base;
    return base
      .map((s) => ({
        ...s,
        items: s.items.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            i.desc.toLowerCase().includes(q) ||
            i.region.toLowerCase().includes(q) ||
            i.material.toLowerCase().includes(q),
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [active, query]);

  const addToCart = (p: Product) => {
    setCart((c) => ({ ...c, [p.id]: (c[p.id] || 0) + 1 }));
    toast.success(`${p.name} savatga qo‘shildi`);
  };

  const badgeStyles: Record<NonNullable<Product['badge']>, string> = {
    Yangi: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    Hit: 'bg-gold/20 text-gold border-gold/40',
    Cheklangan: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Milliy Market — Oʻzbek hunarmandchilik buyumlari | ZIYORAT UZ"
        description="Ziyoratgohlardan tabarruk yodgorliklar, milliy kiyimlar, gilamlar, sopol idishlar, suvenirlar va oʻyinchoqlar — bir joyda."
        path="/milliy-market"
      />
      <Navbar />

      {/* HERO */}
      <section className="border-b border-gold/20 bg-gradient-to-b from-noir to-background">
        <div className="container py-12 md:py-16">
          <div className="flex items-center gap-3 text-gold mb-3">
            <ShoppingBag className="w-5 h-5" />
            <span className="text-xs tracking-[0.3em] uppercase">Milliy Market</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-gold-gradient leading-tight">
            Oʻzbek hunarmandchiligi <br className="hidden md:block" /> bir bozorda
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl">
            Bevosita ustalardan: Margʻilon atlasidan Rishton sopoligacha, Buxoro gilamidan
            Shahrisabz suzanasigacha — har bir buyum kelib chiqishi, materiali va narxi bilan.
          </p>

          {/* Search + cart */}
          <div className="mt-8 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Mahsulot, viloyat yoki material bo'yicha qidirish..."
                className="pl-9 bg-card/60 border-gold/20 focus-visible:ring-gold/40"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-gold/30 bg-card/60 text-sm">
              <ShoppingCart className="w-4 h-4 text-gold" />
              <span className="text-foreground">{cartCount} ta</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-gold font-semibold">{fmt(cartTotal)}</span>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mt-6">
            <Button
              variant={active === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActive('all')}
              className={
                active === 'all'
                  ? 'bg-gold text-noir hover:bg-gold-soft'
                  : 'border-gold/40 text-foreground hover:bg-gold/10'
              }
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Hammasi
            </Button>
            {sections.map((s) => (
              <Button
                key={s.id}
                variant={active === s.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActive(s.id)}
                className={
                  active === s.id
                    ? 'bg-gold text-noir hover:bg-gold-soft'
                    : 'border-gold/40 text-foreground hover:bg-gold/10'
                }
              >
                <s.icon className="w-3.5 h-3.5 mr-1.5" />
                {s.title}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTIONS */}
      <main className="container py-12 space-y-16">
        {visible.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            "<span className="text-foreground">{query}</span>" bo‘yicha mahsulot topilmadi.
          </div>
        )}

        {visible.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20">
            <div className="flex items-end justify-between mb-6 border-b border-gold/15 pb-4">
              <div>
                <div className="flex items-center gap-2 text-gold">
                  <section.icon className="w-5 h-5" />
                  <h2 className="font-display text-2xl md:text-3xl font-bold">{section.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{section.subtitle}</p>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                {section.items.length} ta mahsulot
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.items.map((item) => (
                <Card
                  key={item.id}
                  className="group bg-card/60 border-gold/15 hover:border-gold/50 hover:shadow-lg hover:shadow-gold/10 transition-smooth overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-noir">
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        const el = e.currentTarget;
                        if (el.src !== FALLBACK_IMG) el.src = FALLBACK_IMG;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent pointer-events-none" />
                    {item.badge && (
                      <Badge
                        variant="outline"
                        className={`absolute top-2 left-2 text-[10px] tracking-wide ${badgeStyles[item.badge]}`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-noir/80 border border-gold/20 text-[10px] text-gold">
                      <Star className="w-2.5 h-2.5 fill-gold" />
                      {item.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-foreground line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2rem]">
                      {item.desc}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                      <MapPin className="w-3 h-3 text-gold/70" />
                      <span>{item.region}</span>
                      <span className="opacity-40">•</span>
                      <span className="line-clamp-1">{item.material}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gold/10">
                      <span className="text-gold font-semibold text-sm">{fmt(item.price)}</span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="h-7 px-2.5 text-xs bg-gold/15 hover:bg-gold hover:text-noir text-gold border border-gold/30"
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {cart[item.id] ? cart[item.id] : 'Savatga'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}

        {/* Info banner */}
        <section className="rounded-xl border border-gold/20 bg-gradient-to-br from-noir via-card/60 to-noir p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">Yetkazib berish</p>
              <h3 className="font-display text-xl md:text-2xl text-foreground">
                O‘zbekiston bo‘ylab 2–5 kun ichida
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                500 ming so‘mdan yuqori xaridlar uchun yetkazib berish bepul. Xalqaro yuborish — kelishilgan holda.
              </p>
            </div>
            <Button className="bg-gold text-noir hover:bg-gold-soft">
              Ustalar bilan bog‘lanish
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
