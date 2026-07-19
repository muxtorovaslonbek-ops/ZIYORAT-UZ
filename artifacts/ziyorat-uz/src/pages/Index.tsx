import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Map, Building2, UserCheck, Box, Heart, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Seo } from '@/components/Seo';
import { Footer } from '@/components/Footer';
import { REGIONS } from '@/data/regions';
import heroBukhara from '@/assets/hero-bukhara.jpg';
import heroKhiva from '@/assets/hero-khiva.jpg';
import patternGold from '@/assets/pattern-gold.png';

const Index = () => {
  const { t } = useTranslation();

  const sections = [
    { to: '/plan', icon: Map, key: 'plan', img: '/hero-registan.jpg' },
    { to: '/ziyoratgohlar', icon: Building2, key: 'shrines', img: heroBukhara },
    { to: '/gidlar', icon: UserCheck, key: 'guides', img: heroKhiva },
    { to: '/3d-sayohat', icon: Box, key: 'tour3d', img: '/hero-registan.jpg' },
    { to: '/sevimli', icon: Heart, key: 'favorites', img: heroBukhara },
    { to: '/baholash', icon: Star, key: 'reviews', img: heroKhiva },
  ];

  const stats = [
    { value: '12+1', label: 'Viloyat va Respublika' },
    { value: '200+', label: 'Ziyoratgoh' },
    { value: '50+', label: 'Professional gid' },
    { value: '6', label: 'Til' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Seo title="ZIYORAT UZ — Oʻzbekiston ziyorat turizmi" description="Oʻzbekiston ziyoratgohlari, gidlar va 3D sayohat — premium ziyorat turizm ilovasi 6 tilda." path="/" jsonLd={{ "@context": "https://schema.org", "@type": "TravelAgency", name: "ZIYORAT UZ", url: "https://ziyoratuzz.lovable.app/", areaServed: "Uzbekistan" }} />
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/hero-registan.jpg"
            alt="Samarkand Registan"
            width={1920}
            height={1080}
            fetchPriority="high"
            decoding="async"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)' }} />
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-screen"
            style={{ backgroundImage: `url(${patternGold})`, backgroundSize: '300px' }}
          />
        </div>

        <div className="container relative z-10 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-noir/40 backdrop-blur-sm mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-soft hero-glow-text">{t('tagline')}</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6 animate-fade-in" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
            <span className="block text-foreground hero-glow-text">
              {t('heroTitle').split(' ').slice(0, -2).join(' ')}
            </span>
            <span className="block text-gold-gradient italic hero-glow-text">
              {t('heroTitle').split(' ').slice(-2).join(' ')}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10 leading-relaxed animate-fade-in hero-glow-text" style={{ animationDelay: '260ms', animationFillMode: 'both' }}>
            {t('heroSubtitle')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <Link to="/plan">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-soft text-noir font-semibold px-8 gold-glow transition-transform hover:scale-105"
              >
                {t('ctaStart')} <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/ziyoratgohlar">
              <Button size="lg" variant="outline" className="border-gold/50 text-gold hover:bg-gold/10 px-8 transition-transform hover:scale-105">
                {t('ctaExplore')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-gold/10 bg-card/40 backdrop-blur">
        <div className="container py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label} className="space-y-1">
              <div className="font-display text-3xl md:text-4xl text-gold-gradient">{s.value}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTIONS GRID */}
      <section className="container py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">Imkoniyatlar</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-3">Bizning xizmatlar</h2>
          <div className="ornament-divider" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.to} to={s.to} className="group block h-full">
                <div className="premium-card overflow-hidden h-full transition-all duration-300 hover:-translate-y-1 hover:border-gold/40">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={s.img}
                      alt={t(`sections.${s.key}.title`)}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
                    <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gold/20 backdrop-blur-md border border-gold/40 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-xl text-foreground mb-1 transition-colors group-hover:text-gold">
                      {t(`sections.${s.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{t(`sections.${s.key}.desc`)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* REGIONS PREVIEW */}
      <section className="container py-20 border-t border-gold/10 relative">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">12 Viloyat va 1 Respublika</p>
          <h2 className="font-display text-4xl md:text-5xl text-foreground">Oʻzbekiston bo'ylab</h2>
          <div className="ornament-divider" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {REGIONS.slice(0, 8).map((r) => (
            <Link key={r.slug} to={`/plan/${r.slug}`} className="group block">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gold/20 transition-all duration-300 group-hover:border-gold/60">
                <img
                  src={r.image}
                  alt={r.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-display text-sm text-foreground transition-colors group-hover:text-gold">{r.nameEn}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link to="/plan">
            <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold hover:text-noir">
              Barcha viloyatlar <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
