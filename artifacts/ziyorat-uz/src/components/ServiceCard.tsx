import { useState } from 'react';
import { StarRating } from './StarRating';
import { FavoriteButton } from './FavoriteButton';
import { BookingDialog } from './BookingDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';
import { Service } from '@/data/services';
import { ExternalLink, MapPin, BadgeCheck, Languages } from 'lucide-react';

type ExtService = Service & {
  certificate?: string;
  languages?: string;
  externalUrl?: string;
  embedUrl?: string;
};

interface Props {
  service: ExtService;
  viloyat: string;
  serviceType: string;
}

export const ServiceCard = ({ service, viloyat, serviceType }: Props) => {
  const { t } = useTranslation();
  const [mapOpen, setMapOpen] = useState(false);
  const itemTypeMap: Record<string, string> = {
    translator: 'translator', hotel: 'hotel', companion: 'companion',
    food: 'restaurant', guide: 'guide',
  };
  const priceUnit = serviceType === 'hotel' ? t('perDay') : serviceType === 'food' ? t('perPerson') : t('perHour');
  const hasMap = !!service.embedUrl || !!service.externalUrl;

  return (
    <div className="premium-card overflow-hidden group">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={service.image}
          alt={service.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
        <div className="absolute top-3 right-3">
          <FavoriteButton
            itemType={itemTypeMap[serviceType]}
            itemId={service.id}
            itemData={{ ...service, viloyat, serviceType }}
          />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-display text-base font-semibold text-foreground line-clamp-1">{service.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{service.description}</p>
        {service.languages && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Languages className="w-3 h-3 text-gold" /> {service.languages}
          </div>
        )}
        {service.certificate && (
          <div className="flex items-center gap-1.5 text-[11px] text-gold">
            <BadgeCheck className="w-3 h-3" /> Sertifikat: {service.certificate}
          </div>
        )}
        <div className="flex items-center justify-between">
          <StarRating value={Math.round(service.rating)} readOnly size="sm" />
          <span className="text-sm font-display text-gold">${service.price}<span className="text-xs text-muted-foreground">{priceUnit}</span></span>
        </div>
        {hasMap ? (
          <Button
            size="sm"
            onClick={() => setMapOpen(true)}
            className="w-full bg-gold/10 hover:bg-gold text-gold hover:text-noir border border-gold/40 font-semibold transition-smooth gap-1"
          >
            <MapPin className="w-3.5 h-3.5" /> Xaritada koʻrish
          </Button>
        ) : (
          <BookingDialog
            trigger={<Button size="sm" className="w-full bg-gold/10 hover:bg-gold text-gold hover:text-noir border border-gold/40 font-semibold transition-smooth">{t('book')}</Button>}
            viloyat={viloyat}
            serviceType={serviceType}
            serviceId={service.id}
            serviceName={service.name}
          />
        )}
      </div>

      {hasMap && (
        <Dialog open={mapOpen} onOpenChange={setMapOpen}>
          <DialogContent className="max-w-4xl bg-card border-gold/30">
            <DialogHeader>
              <DialogTitle className="text-gold-gradient font-display flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gold" /> {service.name}
              </DialogTitle>
            </DialogHeader>
            {service.embedUrl ? (
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-gold/20">
                <iframe
                  src={service.embedUrl}
                  className="w-full h-full"
                  allow="fullscreen"
                  loading="lazy"
                  title={service.name}
                />
              </div>
            ) : null}
            {service.externalUrl && (
              <a href={service.externalUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-gold/40 text-gold hover:bg-gold hover:text-noir gap-2">
                  <ExternalLink className="w-4 h-4" /> Yangi tabda ochish
                </Button>
              </a>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
