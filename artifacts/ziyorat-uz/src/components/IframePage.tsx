import { useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface Props {
  title: string;
  description: string;
  url: string;
  /** Optional gallery of models for 3D pages */
  gallery?: { id: string; title: string; embed: string; group?: string }[];
}

export const IframePage = ({ title, description, url, gallery }: Props) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(gallery?.[0]);
  const [activeGroup, setActiveGroup] = useState<string | null>(gallery?.[0]?.group ?? null);

  const currentUrl = active?.embed ?? url;
  const externalUrl = active ? `https://sketchfab.com/3d-models/${active.id}` : url;

  return (
    <div className="container py-8 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap animate-fade-in-down">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-gold-gradient">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
          {active && <p className="text-sm text-gold mt-2">{active.title}</p>}
        </div>
        <a href={externalUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="border-gold/40 text-gold hover:bg-gold hover:text-noir gap-2">
            <ExternalLink className="w-4 h-4" />
            {t('openInNewTab')}
          </Button>
        </a>
      </div>

      <div className="ornament-divider" />

      {gallery && gallery.length > 0 && (() => {
        const groups = gallery.reduce<Record<string, typeof gallery>>((acc, g) => {
          const key = g.group ?? 'Modellar';
          (acc[key] = acc[key] || []).push(g);
          return acc;
        }, {});
        const groupNames = Object.keys(groups);
        const currentGroup = activeGroup && groups[activeGroup] ? activeGroup : groupNames[0];
        return (
          <div className="space-y-4">
            {groupNames.length > 1 && (
              <div className="flex gap-2 flex-wrap border-b border-gold/20 pb-3">
                {groupNames.map((name) => (
                  <button
                    key={name}
                    onClick={() => setActiveGroup(name)}
                    className={`px-5 py-2.5 rounded-lg text-sm font-display font-semibold transition-smooth ${
                      currentGroup === name
                        ? 'bg-gold text-noir shadow-gold'
                        : 'bg-secondary/40 text-foreground hover:bg-gold/10 hover:text-gold'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2 flex-wrap">
              {groups[currentGroup].map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setActive(g); setLoading(true); }}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-smooth ${
                    active?.id === g.id
                      ? 'bg-gold text-noir border-gold'
                      : 'border-gold/30 text-foreground hover:border-gold hover:text-gold'
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="relative rounded-lg overflow-hidden border border-gold/30 shadow-elegant animate-scale-in" style={{ height: '75vh' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-noir z-10">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-gold animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">{t('externalSite')}</p>
            </div>
          </div>
        )}
        <iframe
          key={currentUrl}
          src={currentUrl}
          title={active?.title ?? title}
          className="w-full h-full bg-white"
          onLoad={() => setLoading(false)}
          allow="autoplay; fullscreen; xr-spatial-tracking"
          allowFullScreen
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        ⚠️ Ba'zi saytlar iframe ichida ochilishni cheklashi mumkin. Bu holatda yuqoridagi "{t('openInNewTab')}" tugmasidan foydalaning.
      </p>
    </div>
  );
};
