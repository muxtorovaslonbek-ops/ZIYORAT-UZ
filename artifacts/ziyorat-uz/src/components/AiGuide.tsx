import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Sparkles, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { speakMale, stopSpeaking } from '@/lib/voice';
import { supabase } from '@/integrations/supabase/client';

type Msg = { role: 'user' | 'assistant'; content: string };

interface Props {
  variant?: 'page' | 'widget';
  onClose?: () => void;
}

// Browser SpeechRecognition (vendor-prefixed)
const SR: any =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export const AiGuide = ({ variant = 'page', onClose }: Props) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        "Assalomu alaykum! Men sizning AI Ziyorat Yo'lboshchingizman. Istalgan tilda gaplashing yoki yozing — O'zbekiston ziyoratgohlari haqida hikoya qilib beraman. 🕌",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsOn, setTtsOn] = useState(true);
  const recogRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Stop TTS + abort streaming when component unmounts (e.g. widget closed, page left)
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      abortRef.current?.abort();
      try { recogRef.current?.stop(); } catch {}
    };
  }, []);

  // Stop TTS when user toggles it off
  useEffect(() => {
    if (!ttsOn && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [ttsOn]);

  // Init speech recognition
  useEffect(() => {
    if (!SR) return;
    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = 'uz-UZ';
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setListening(false);
      setTimeout(() => send(text), 200);
    };
    r.onerror = (e: any) => {
      setListening(false);
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        toast.error("Mikrofonga ruxsat berilmagan. Brauzer sozlamalaridan ruxsat bering.");
      } else if (e?.error === 'no-speech') {
        toast.error("Ovoz eshitilmadi, qaytadan urinib ko'ring");
      }
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
  }, []);

  const speak = (text: string) => {
    if (!ttsOn) return;
    speakMale(text);
  };

  const toggleMic = async () => {
    if (!SR) {
      toast.error("Brauzer ovozli kirishni qo'llab-quvvatlamaydi (Chrome ishlating)");
      return;
    }
    if (listening) {
      try { recogRef.current?.stop(); } catch {}
      setListening(false);
      return;
    }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error("Mikrofonga ruxsat bering");
      return;
    }
    try { recogRef.current?.start(); setListening(true); }
    catch { setListening(false); }
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput('');
    const next = [...messages, { role: 'user' as const, content }];
    setMessages(next);
    setLoading(true);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Avval tizimga kiring");
        setLoading(false);
        return;
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-yolboshchi`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
        signal: abortRef.current.signal,
      });

      if (resp.status === 401) {
        toast.error("Sessiya tugagan, qayta kiring");
        setLoading(false); return;
      }

      if (resp.status === 429) {
        toast.error("So'rovlar ko'p — 1 daqiqadan keyin urinib ko'ring.");
        setLoading(false); return;
      }
      if (resp.status === 402) {
        toast.error("AI kreditlar tugagan. Admin bilan bog'laning yoki keyinroq urinib ko'ring.");
        setLoading(false); return;
      }
      if (!resp.ok || !resp.body) throw new Error('Stream failed');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let acc = '';
      let started = false;

      const upsert = (chunk: string) => {
        acc += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && started) {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: acc } : m));
          }
          started = true;
          return [...prev, { role: 'assistant' as const, content: acc }];
        });
      };

      let done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf('\n')) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const j = line.slice(6).trim();
          if (j === '[DONE]') { done = true; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) upsert(c);
          } catch {
            buf = line + '\n' + buf;
            break;
          }
        }
      }
      if (acc) speak(acc);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        console.error(e);
        toast.error("Javob olishda xatolik");
      }
    } finally {
      setLoading(false);
    }
  };

  const stopTts = () => stopSpeaking();

  const containerCls =
    variant === 'widget'
      ? 'fixed bottom-24 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[560px] max-h-[80vh] rounded-2xl border border-gold/30 bg-card shadow-2xl flex flex-col overflow-hidden'
      : 'w-full max-w-3xl mx-auto h-[calc(100vh-12rem)] min-h-[500px] rounded-2xl border border-gold/30 bg-card flex flex-col overflow-hidden shadow-xl';

  return (
    <div className={containerCls}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-gradient-to-r from-gold/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center shadow-gold">
            <Sparkles className="w-4 h-4 text-noir" />
          </div>
          <div>
            <p className="font-display text-sm text-gold-gradient leading-tight">AI Ziyorat Yo'lboshchi</p>
            <p className="text-[10px] text-muted-foreground">Ko'p tilli virtual hamroh</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-gold hover:bg-gold/10"
            onClick={() => { setTtsOn((v) => !v); stopTts(); }}
            aria-label="Ovoz"
          >
            {ttsOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          {variant === 'widget' && onClose && (
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onClose} aria-label="Yopish">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-gold text-noir rounded-br-sm'
                  : 'bg-secondary text-foreground rounded-bl-sm'
              }`}
            >
              {m.content || (loading && i === messages.length - 1 ? '...' : '')}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-gold" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gold/20 p-3 bg-background/50">
        <div className="flex items-end gap-2">
          <Button
            size="icon"
            variant={listening ? 'default' : 'outline'}
            onClick={toggleMic}
            className={listening ? 'bg-destructive text-destructive-foreground animate-pulse' : 'border-gold/40 text-gold hover:bg-gold/10'}
            aria-label="Mikrofon"
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={listening ? "Tinglayapman..." : "Savolingizni yozing yoki mikrofonni bosing..."}
            rows={1}
            className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 max-h-32"
          />
          <Button
            size="icon"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="bg-gold hover:bg-gold-soft text-noir"
            aria-label="Yuborish"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 text-center">
          Istalgan tilda gapiring — AI avtomatik tushunadi
        </p>
      </div>
    </div>
  );
};
