import { useState, useRef, useEffect } from 'react';
import { Bell, X, MessageSquare, BellRing, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, type InboxItem } from '@/hooks/useNotifications';
import { format } from 'date-fns';

const fmt = (d: string) => {
  try {
    const date = new Date(d);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60_000) return 'Hozir';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} daqiqa oldin`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} soat oldin`;
    return format(date, 'dd.MM.yyyy HH:mm');
  } catch {
    return d;
  }
};

const ICON_MAP: Record<string, string> = {
  bell: '🔔',
  star: '⭐',
  crown: '👑',
  info: 'ℹ️',
  check: '✅',
  warning: '⚠️',
  gift: '🎁',
};

type Props = {
  authToken?: string | null;
};

export const NotificationBell = ({ authToken }: Props) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { items, unreadCount, loading, markAllRead, markRead, refresh } = useNotifications(authToken);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOpen = () => {
    setOpen((v) => !v);
  };

  const handleMarkAll = () => {
    markAllRead();
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpen}
        className="relative text-foreground hover:text-gold"
        aria-label="Bildirishnomalar"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-4 h-4 text-gold animate-[wiggle_0.5s_ease-in-out]" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 max-h-[480px] flex flex-col rounded-xl border border-gold/20 bg-card/95 backdrop-blur-xl shadow-2xl z-[200] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10 shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gold" />
              <span className="font-semibold text-sm">Bildirishnomalar</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0 text-[10px] font-bold rounded-full bg-destructive text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
                  onClick={handleMarkAll}
                >
                  <Check className="w-3 h-3" />
                  Barchasini o'qilgan
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => refresh()}
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">Bildirishnomalar yo'q</p>
              </div>
            ) : (
              <div className="divide-y divide-gold/5">
                {items.map((item) => {
                  const isUnread = !isSeenId(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors hover:bg-secondary/50 ${isUnread ? 'bg-gold/5' : ''}`}
                      onClick={() => markRead(item.id)}
                    >
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'message'
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-gold/15 text-gold'
                      }`}>
                        {item.type === 'message' ? (
                          <MessageSquare className="w-4 h-4" />
                        ) : (
                          <span className="text-sm leading-none">
                            {ICON_MAP[(item as any).icon] || '🔔'}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-tight ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {item.type === 'message'
                              ? ((item as any).subject || 'Admin xabari')
                              : (item as any).title}
                          </p>
                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {item.message}
                        </p>
                        {item.type === 'message' && (item as any).admin_reply && (
                          <p className="text-xs text-gold/70 mt-0.5 line-clamp-1">
                            Javob: {(item as any).admin_reply}
                          </p>
                        )}
                        <p className="text-[10px] text-muted-foreground/50 mt-1">{fmt(item.sent_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to check seen state without React state
function isSeenId(id: string): boolean {
  try {
    const raw = localStorage.getItem('ziyorat_seen_notifs');
    const arr: string[] = raw ? JSON.parse(raw) : [];
    return arr.includes(id);
  } catch {
    return false;
  }
}
