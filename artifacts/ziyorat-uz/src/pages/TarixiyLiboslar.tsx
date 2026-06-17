import { useEffect, useRef, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { PremiumGate } from '@/components/PremiumGate';
import { Button } from '@/components/ui/button';
import {
  Camera, Upload, Sparkles, Download, Share2, Loader2, RefreshCw, Shirt,
  X, Image as ImageIcon, SwitchCamera,
} from 'lucide-react';
import { ATTIRES, MALE_ATTIRES, FEMALE_ATTIRES, Attire, AttireGender } from '@/data/attires';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const TarixiyLiboslar = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo title="Tarixiy Liboslar — ZIYORAT UZ" description="O‘zining suratini Oʻzbekistonning turli davrlardagi tarixiy liboslarida koʻring." path="/tarixiy-liboslar" />
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-noir/40 backdrop-blur-sm mb-4">
            <Shirt className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-soft">AI Virtual Try-On</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            <span className="text-gold-gradient">Tarixiy Liboslar</span>
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            O'z suratingizni yuklang yoki kameradan tushiring va tarixiy allomalar yoki milliy qahramonlar liboslarida virtual portretingizni yarating.
          </p>
          <div className="ornament-divider" />
        </div>

        <PremiumGate featureName="Tarixiy Liboslar">
          <Inner />
        </PremiumGate>
      </main>
      <Footer />
    </div>
  );
};

const Inner = () => {
  const [selfie, setSelfie] = useState<string | null>(null);
  const [selfieMime, setSelfieMime] = useState<string>('image/jpeg');
  const [gender, setGender] = useState<AttireGender>('male');
  const [attire, setAttire] = useState<Attire>(MALE_ATTIRES[0]);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');

  const list = gender === 'male' ? MALE_ATTIRES : FEMALE_ATTIRES;

  // Switch attire when gender changes
  useEffect(() => {
    if (attire.gender !== gender) setAttire(list[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gender]);

  const onFile = (f: File) => {
    if (!f.type.startsWith('image/')) { toast.error("Faqat rasm fayl yuklang"); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Rasm 8MB dan kichik bo'lsin"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setSelfie(reader.result as string);
      setSelfieMime(f.type);
      setResult(null);
    };
    reader.readAsDataURL(f);
  };

  // ===== Camera =====
  const openCamera = async () => {
    setCameraOpen(true);
    await startStream(facing);
  };
  const startStream = async (mode: 'user' | 'environment') => {
    stopStream();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      console.error(e);
      toast.error("Kameraga ruxsat berilmadi");
      setCameraOpen(false);
    }
  };
  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };
  const closeCamera = () => { stopStream(); setCameraOpen(false); };
  const flipCamera = async () => {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    await startStream(next);
  };
  const snap = () => {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth, h = video.videoHeight;
    if (!w || !h) { toast.error("Kamera tayyor emas"); return; }
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d')!;
    if (facing === 'user') {
      // Mirror selfie so result matches what user sees
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = c.toDataURL('image/jpeg', 0.92);
    setSelfie(dataUrl);
    setSelfieMime('image/jpeg');
    setResult(null);
    closeCamera();
  };
  useEffect(() => () => stopStream(), []);

  const generate = async () => {
    if (!selfie) { toast.error("Avval o'z suratingizni yuklang yoki kameradan oling"); return; }
    setLoading(true);
    setResult(null);
    try {
      const base64 = selfie.split(',')[1];
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Avval tizimga kiring");
        setLoading(false);
        return;
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tarixiy-liboslar`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ imageBase64: base64, mimeType: selfieMime, attireId: attire.id }),
      });
      const data = await resp.json();
      if (resp.status === 401) { toast.error("Sessiya tugagan, qayta kiring"); return; }
      if (!resp.ok) { toast.error(data.error || "Yaratishda xatolik"); return; }
      setResult(data.imageUrl);
      toast.success("Tarixiy portretingiz tayyor!");
    } catch (e) {
      console.error(e);
      toast.error("Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result;
    a.download = `ziyorat-uz-${attire.id}.png`;
    a.click();
  };

  const share = async () => {
    if (!result) return;
    try {
      const blob = await (await fetch(result)).blob();
      const file = new File([blob], `ziyorat-uz-${attire.id}.png`, { type: blob.type });
      if ((navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({ files: [file], title: 'ZIYORAT UZ — Tarixiy Liboslar', text: `Men ${attire.name} liboslarida!` });
      } else {
        await navigator.clipboard.writeText(result);
        toast.success("Havola nusxalandi");
      }
    } catch { /* user cancelled */ }
  };

  return (
    <>
      {/* Camera modal */}
      {cameraOpen && (
        <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col items-center justify-center p-4">
          <button onClick={closeCamera} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-gold/40 bg-noir">
            <video
              ref={videoRef} autoPlay playsInline muted
              className={`w-full h-full object-cover ${facing === 'user' ? 'scale-x-[-1]' : ''}`}
            />
            <div className="absolute inset-4 border-2 border-dashed border-gold/40 rounded-2xl pointer-events-none" />
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={flipCamera} className="w-12 h-12 rounded-full border-gold/40 text-gold bg-white/5">
              <SwitchCamera className="w-5 h-5" />
            </Button>
            <button
              onClick={snap}
              className="w-20 h-20 rounded-full bg-gold border-4 border-white shadow-gold hover:scale-105 transition-transform flex items-center justify-center"
            >
              <Camera className="w-8 h-8 text-noir" />
            </button>
            <Button variant="outline" size="icon" onClick={closeCamera} className="w-12 h-12 rounded-full border-gold/40 text-gold bg-white/5">
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-white/70 text-xs mt-4">Yuzni doira ichiga joylashtiring va tugmani bosing</p>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Step 1 */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gold/20 bg-card p-6">
            <h2 className="font-display text-xl text-gold-gradient mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" /> 1. Suratingizni qo'shing
            </h2>

            {selfie ? (
              <div className="relative">
                <img src={selfie} alt="Sizning suratingiz" className="w-full rounded-xl aspect-square object-cover border border-gold/30" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={openCamera} className="border-gold/40 text-gold bg-background/80 backdrop-blur">
                    <Camera className="w-3.5 h-3.5 mr-1" /> Kamera
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="border-gold/40 text-gold bg-background/80 backdrop-blur">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> O'zgartirish
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={openCamera}
                  className="aspect-square rounded-xl border-2 border-dashed border-gold/40 hover:border-gold hover:bg-gold/5 transition-smooth flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-gold"
                >
                  <Camera className="w-9 h-9" />
                  <span className="font-medium text-sm">Kameradan olish</span>
                  <span className="text-[10px]">Birdan suratga tushish</span>
                </button>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gold/40 hover:border-gold hover:bg-gold/5 transition-smooth flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-gold"
                >
                  <Upload className="w-9 h-9" />
                  <span className="font-medium text-sm">Galereyadan</span>
                  <span className="text-[10px]">JPG / PNG, 8MB</span>
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gold/20 bg-card p-6">
            <h2 className="font-display text-xl text-gold-gradient mb-4 flex items-center gap-2">
              <Shirt className="w-5 h-5" /> 2. Libosni tanlang
            </h2>

            {/* Gender toggle */}
            <div className="inline-flex rounded-full border border-gold/30 bg-noir/40 p-1 mb-4">
              <button
                onClick={() => setGender('male')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-smooth ${gender === 'male' ? 'bg-gold text-noir' : 'text-muted-foreground hover:text-gold'}`}
              >
                👨 Erkaklar
              </button>
              <button
                onClick={() => setGender('female')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-smooth ${gender === 'female' ? 'bg-gold text-noir' : 'text-muted-foreground hover:text-gold'}`}
              >
                👩 Ayollar
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {list.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAttire(a)}
                  className={`p-3 rounded-xl border text-left transition-smooth ${
                    attire.id === a.id
                      ? 'border-gold bg-gold/10 ring-2 ring-gold/40'
                      : 'border-gold/20 hover:border-gold/60 bg-secondary/30'
                  }`}
                >
                  <div className="text-2xl mb-1">{a.preview}</div>
                  <div className="font-display text-sm text-gold-gradient leading-tight">{a.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.era}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generate}
            disabled={loading || !selfie}
            className="w-full h-12 bg-gradient-to-r from-gold to-gold-deep hover:from-gold-soft hover:to-gold text-noir font-semibold text-base shadow-gold"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> AI yaratmoqda... (15-30s)</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-2" /> Tarixiy portret yaratish</>
            )}
          </Button>
        </div>

        {/* Step 2: Result */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-gold/20 bg-card p-6">
            <h2 className="font-display text-xl text-gold-gradient mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> 3. Natija
            </h2>

            {loading && (
              <div className="aspect-square rounded-xl border border-gold/30 bg-noir/40 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-gold" />
                  <Sparkles className="w-6 h-6 text-gold absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="text-sm text-muted-foreground text-center px-4">
                  AI sizni <span className="text-gold">{attire.name}</span> liboslarida chizmoqda...
                </p>
              </div>
            )}

            {!loading && result && (
              <div className="space-y-4">
                <img src={result} alt={`${attire.name} portreti`} className="w-full rounded-xl border border-gold/40 shadow-xl" />
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={download} variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">
                    <Download className="w-4 h-4 mr-2" /> Yuklab olish
                  </Button>
                  <Button onClick={share} className="bg-gold hover:bg-gold-soft text-noir">
                    <Share2 className="w-4 h-4 mr-2" /> Ulashish
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center italic">
                  "Men {attire.name} liboslarida — ZIYORAT UZ" #ZiyoratUZ
                </p>
              </div>
            )}

            {!loading && !result && (
              <div className="aspect-square rounded-xl border-2 border-dashed border-gold/20 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6 text-center">
                <ImageIcon className="w-12 h-12 opacity-40" />
                <p className="text-sm">Suratingizni yuklang va libosni tanlang.<br/>Natija shu yerda paydo bo'ladi.</p>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-gold/20 bg-card p-5">
            <h3 className="font-display text-sm text-gold-gradient mb-2">{attire.name}</h3>
            <p className="text-xs text-muted-foreground mb-2">{attire.era}</p>
            <p className="text-xs text-foreground/80 leading-relaxed">{attire.description}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TarixiyLiboslar;
