import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { REGIONS } from '@/data/regions';
import { ArrowRight } from 'lucide-react';

const Plan = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Sayohat rejasi — 14 viloyat | ZIYORAT UZ" description="Oʻzbekistonning 14 viloyati boʻyicha shaxsiy ziyorat va sayohat rejasi: ziyoratgohlar, mehmonxonalar, gidlar." path="/plan" jsonLd={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Sayohat rejasi", url: "https://ziyoratuzz.lovable.app/plan" }} />
      <Navbar />
      <div className="container py-12">
        <div className="text-center mb-12 animate-fade-in-down">
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">14 Viloyat</p>
          <h1 className="font-display text-4xl md:text-5xl text-gold-gradient">{t('sections.plan.title')}</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{t('sections.plan.desc')}</p>
          <div className="ornament-divider" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REGIONS.map((r, i) => (
            <Link
              key={r.slug}
              to={`/plan/${r.slug}`}
              className="group block animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="premium-card overflow-hidden h-full hover-lift">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={r.image} alt={r.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-smooth duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/30 to-transparent" />
                  <div className="absolute top-3 right-3 px-2 py-1 rounded bg-gold/20 backdrop-blur-md border border-gold/40 text-xs text-gold">
                    {r.nameEn}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-foreground group-hover:text-gold transition-smooth mb-1">{r.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{r.description}</p>
                  <span className="inline-flex items-center text-xs text-gold font-medium gap-1">
                    {t('regionPlan')} <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-smooth" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Plan;
