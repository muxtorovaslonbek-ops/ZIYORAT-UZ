import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { AiGuide } from './AiGuide';
import { useLocation } from 'react-router-dom';

export const AiGuideFloating = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Hide on the dedicated page itself and on auth
  if (pathname.startsWith('/ai-yolboshchi') || pathname.startsWith('/auth')) return null;

  return (
    <>
      {open && <AiGuide variant="widget" onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Ziyorat Yo'lboshchi"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-deep text-noir shadow-gold flex items-center justify-center hover:scale-110 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
        )}
      </button>
    </>
  );
};
