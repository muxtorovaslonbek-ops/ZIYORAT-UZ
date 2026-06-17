import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExternalLink, Phone, Send, Star, MapPin, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GUIDES } from '@/data/guides';
import { FavoriteButton } from '@/components/FavoriteButton';

interface Props {
  title: string;
  description: string;
}

export const GuidesCatalog = ({ title, description }: Props) => {
  const { t } = useTranslation();
  const [region, setRegion] = useState<string>('all');
  const [lang, setLang] = useState<string>('all');
  const [role, setRole] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [siteOpen, setSiteOpen] = useState(false);

  const regions = Array.from(new Set(GUIDES.map((g) => g.region)));
  const languages = Array.from(new Set(GUIDES.flatMap((g) => g.languages)));
  const roles = Array.from(new Set(GUIDES.map((g) => g.role).filter(Boolean) as string[]));

  const filtered = GUIDES.filter(
    (g) =>
      (region === 'all' || g.region === region) &&
      (lang === 'all' || g.languages.includes(lang)) &&
      (role === 'all' || g.role === role) &&
      (query === '' || g.name.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-gold-gradient">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setSiteOpen(true)}
          className="border-gold/40 text-gold hover:bg-gold hover:text-noir gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          gidlar.uz
        </Button>

        <Dialog open={siteOpen} onOpenChange={setSiteOpen}>
          <DialogContent className="max-w-6xl h-[85vh] bg-card border-gold/30 p-3 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-gold-gradient font-display flex items-center justify-between gap-2">
                <span>gidlar.uz</span>
                <a href="https://gidlar.uz/" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="border-gold/40 text-gold hover:bg-gold hover:text-noir gap-2">
                    <ExternalLink className="w-3.5 h-3.5" /> Yangi tabda
                  </Button>
                </a>
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 rounded-lg overflow-hidden border border-gold/20">
              <iframe
                src="https://gidlar.uz/"
                className="w-full h-full bg-white"
                title="gidlar.uz"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Agar sahifa yuklanmasa, "Yangi tabda" tugmasini bosing.
            </p>
          </DialogContent>
        </Dialog>
      </div>

      <div className="ornament-divider" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="Gid ismi boʻyicha qidirish..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs bg-card border-gold/30"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="bg-card border border-gold/30 rounded-md px-3 py-2 text-sm text-foreground"
        >
          <option value="all">Barcha viloyatlar</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-card border border-gold/30 rounded-md px-3 py-2 text-sm text-foreground"
        >
          <option value="all">Barcha tillar</option>
          {languages.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="bg-card border border-gold/30 rounded-md px-3 py-2 text-sm text-foreground"
        >
          <option value="all">Barcha rollar</option>
          {roles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} ta gid</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((g, idx) => (
          <div
            key={g.id}
            style={{ animationDelay: `${idx * 60}ms` }}
            className="group relative rounded-xl overflow-hidden bg-card border border-gold/20 hover:border-gold/60 transition-smooth shadow-elegant hover:shadow-glow animate-fade-in hover:-translate-y-1 duration-300"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-noir">
              <img
                src={g.avatar}
                alt={g.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                <FavoriteButton
                  itemId={g.id}
                  itemType="guide"
                  itemData={{ name: g.name, region: g.region, avatar: g.avatar }}
                />
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-noir/80 backdrop-blur px-2 py-1 rounded-full text-xs text-gold border border-gold/30">
                <Star className="w-3 h-3 fill-gold" />
                {g.rating}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg text-foreground">{g.name}</h3>
                {g.role && (
                  <Badge className="bg-gold/15 text-gold border border-gold/30 text-[10px] uppercase tracking-wider">
                    {g.role}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" /> {g.region} · {g.experience} yil
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <Languages className="w-3 h-3 text-gold" />
                {g.languages.map((l) => (
                  <Badge key={l} variant="outline" className="text-[10px] border-gold/30 text-gold">
                    {l}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{g.bio}</p>
              {g.certificate && (
                <p className="text-[11px] text-gold/80 font-mono">Sertifikat: {g.certificate}</p>
              )}
              <div className="flex items-center justify-between pt-2">
                <span className="text-gold font-semibold">${g.pricePerDay}<span className="text-xs text-muted-foreground">/kun</span></span>
              </div>
              <div className="flex gap-2 pt-1">
                <a href={`tel:${g.phone}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full border-gold/40 text-gold hover:bg-gold hover:text-noir gap-1">
                    <Phone className="w-3 h-3" /> Qoʻngʻiroq
                  </Button>
                </a>
                <a href={`https://t.me/${g.telegram}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button size="sm" className="w-full bg-gold text-noir hover:bg-gold/90 gap-1">
                    <Send className="w-3 h-3" /> Telegram
                  </Button>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">Hech qanday gid topilmadi.</p>
      )}
    </div>
  );
};
