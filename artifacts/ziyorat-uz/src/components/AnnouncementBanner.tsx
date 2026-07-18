import { useState, useEffect } from 'react';
import { X, Info, CheckCircle2, AlertTriangle, Crown } from 'lucide-react';

type BannerType = 'info' | 'success' | 'warning' | 'gold';

const STYLES: Record<BannerType, { bg: string; border: string; text: string; icon: any }> = {
  info:    { bg: 'bg-blue-500/10',   border: 'border-blue-500/30',   text: 'text-blue-300',  icon: Info },
  success: { bg: 'bg-green-500/10',  border: 'border-green-500/30',  text: 'text-green-300', icon: CheckCircle2 },
  warning: { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-300', icon: AlertTriangle },
  gold:    { bg: 'bg-gold/10',       border: 'border-gold/30',       text: 'text-gold',      icon: Crown },
};

const DISMISS_KEY = 'ziyorat_banner_dismissed';

export const AnnouncementBanner = () => {
  const [text, setText] = useState<string | null>(null);
  const [type, setType] = useState<BannerType>('info');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/settings/public');
        const data = await res.json();
        if (data.ok && data.settings?.announcement) {
          const msg = data.settings.announcement as string;
          const lastDismissed = localStorage.getItem(DISMISS_KEY);
          // Only show if content changed since last dismiss
          if (lastDismissed === msg) return;
          setText(msg);
          setType((data.settings.announcement_type as BannerType) || 'info');
        }
      } catch {}
    };
    check();
  }, []);

  if (!text || dismissed) return null;

  const s = STYLES[type] || STYLES.info;
  const Icon = s.icon;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, text);
    setDismissed(true);
  };

  return (
    <div className={`w-full px-4 py-2.5 border-b ${s.bg} ${s.border} flex items-center gap-3`}>
      <Icon className={`w-4 h-4 shrink-0 ${s.text}`} />
      <p className={`flex-1 text-xs sm:text-sm ${s.text} font-medium`}>{text}</p>
      <button
        onClick={dismiss}
        className={`shrink-0 ${s.text} hover:opacity-70 transition-opacity`}
        aria-label="Yopish"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
