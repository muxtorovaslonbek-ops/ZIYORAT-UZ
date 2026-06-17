import { useParams, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { REGIONS } from '@/data/regions';
import { getServicesForRegion, SERVICE_TYPES, ServiceType } from '@/data/services';
import { ServiceCard } from '@/components/ServiceCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, Languages, Hotel, Users, UtensilsCrossed, Star } from 'lucide-react';

const ICONS: Record<ServiceType, any> = {
  translator: Languages, hotel: Hotel, companion: Users, food: UtensilsCrossed, guide: Star,
};

const RegionPlan = () => {
  const { viloyat } = useParams();
  const { t } = useTranslation();
  const region = REGIONS.find((r) => r.slug === viloyat);
  if (!region) return <Navigate to="/plan" replace />;

  const services = getServicesForRegion(region.slug);
  const labels: Record<ServiceType, string> = {
    translator: t('services.translator'), hotel: t('services.hotel'),
    companion: t('services.companion'), food: t('services.food'), guide: t('services.guide'),
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${region.name} sayohat rejasi | ZIYORAT UZ`} description={`${region.nameEn} (${region.name}): ${region.description}. Mehmonxonalar, gidlar va xizmatlar.`} path={`/plan/${region.slug}`} jsonLd={{ "@context": "https://schema.org", "@type": "TouristDestination", name: region.name, description: region.description, url: `https://ziyoratuzz.lovable.app/plan/${region.slug}` }} />
      <Navbar />

      {/* Region hero */}
      <section className="relative h-[40vh] overflow-hidden">
        <img src={region.image} alt={region.name} className="w-full h-full object-cover animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/60 to-noir/20" />
        <div className="container relative z-10 h-full flex flex-col justify-end pb-8 animate-fade-in-up">
          <Link to="/plan" className="inline-flex items-center gap-1 text-sm text-gold mb-3 hover:underline w-fit">
            <ChevronLeft className="w-4 h-4" /> Viloyatlar
          </Link>
          <p className="text-xs uppercase tracking-[0.3em] text-gold mb-2">{region.nameEn}</p>
          <h1 className="font-display text-4xl md:text-6xl text-foreground">{region.name}</h1>
          <p className="text-muted-foreground mt-2">{region.description}</p>
        </div>
      </section>

      <div className="container py-10 animate-fade-in">
        <Tabs defaultValue="translator" className="w-full">
          <TabsList className="bg-card border border-gold/20 h-auto p-1 flex flex-wrap gap-1 w-full justify-start">
            {SERVICE_TYPES.map((type) => {
              const Icon = ICONS[type];
              return (
                <TabsTrigger
                  key={type}
                  value={type}
                  className="data-[state=active]:bg-gold data-[state=active]:text-noir gap-1.5 text-xs sm:text-sm"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {labels[type]}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {SERVICE_TYPES.map((type) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {services[type].map((s, i) => (
                  <div key={s.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                    <ServiceCard service={s} viloyat={region.slug} serviceType={type} />
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default RegionPlan;
