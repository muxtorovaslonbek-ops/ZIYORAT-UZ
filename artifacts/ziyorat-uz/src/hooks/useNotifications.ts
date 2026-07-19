import { useState, useEffect, useCallback, useRef } from 'react';

export type UserNotification = {
  id: string;
  title: string;
  message: string;
  target: string;
  icon?: string;
  sent_at: string;
  type: 'notification';
};

export type UserMessage = {
  id: string;
  subject: string | null;
  message: string;
  admin_reply: string | null;
  sent_at: string;
  replied_at: string | null;
  type: 'message';
};

export type InboxItem = UserNotification | UserMessage;

const SEEN_KEY = 'ziyorat_seen_notifs';
const POLL_MS = 30_000;

/** Play a pleasant two-tone chime using Web Audio API */
export const playNotifSound = () => {
  try {
    const ctx = new AudioContext();
    const play = (freq: number, start: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    };
    play(880, 0, 0.35);
    play(1100, 0.18, 0.4);
    setTimeout(() => ctx.close(), 800);
  } catch {}
};

const getSeenIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
};

const addSeenIds = (ids: string[]) => {
  try {
    const seen = getSeenIds();
    ids.forEach((id) => seen.add(id));
    // Keep max 200 IDs
    const arr = [...seen].slice(-200);
    localStorage.setItem(SEEN_KEY, JSON.stringify(arr));
  } catch {}
};

export const useNotifications = (authToken?: string | null) => {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstLoad = useRef(true);

  const fetchInbox = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
      const res = await fetch('/api/user/inbox', { headers });
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ok) return;

      const notifs: UserNotification[] = (data.notifications || []).map((n: any) => ({
        ...n, type: 'notification' as const,
      }));
      const msgs: UserMessage[] = (data.messages || []).map((m: any) => ({
        ...m, type: 'message' as const,
      }));

      const all: InboxItem[] = [...notifs, ...msgs].sort(
        (a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
      );

      const seen = getSeenIds();
      const newItems = all.filter((item) => !seen.has(item.id));

      if (newItems.length > 0 && !isFirstLoad.current) {
        playNotifSound();
      }
      isFirstLoad.current = false;

      setItems(all);
      setUnreadCount(newItems.length);
    } catch {}
  }, [authToken]);

  useEffect(() => {
    setLoading(true);
    fetchInbox().finally(() => setLoading(false));
    timerRef.current = setInterval(fetchInbox, POLL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchInbox]);

  const markAllRead = useCallback(() => {
    const ids = items.map((i) => i.id);
    addSeenIds(ids);
    setUnreadCount(0);
  }, [items]);

  const markRead = useCallback((id: string) => {
    addSeenIds([id]);
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return { items, unreadCount, loading, markAllRead, markRead, refresh: fetchInbox };
};
