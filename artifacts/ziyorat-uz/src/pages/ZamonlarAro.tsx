import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { ScholarChat } from '@/components/ScholarChat';
import { PremiumGate } from '@/components/PremiumGate';
import { SCHOLARS, Scholar } from '@/data/scholars';
import { Sparkles, ArrowLeft, Quote, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ZamonlarAro = () => {
  const [selected, setSelected] = useState<Scholar | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo title="Zamonlar Aro — ZIYORAT UZ" description="Oʻzbekiston tarixiy olimlari bilan sun’iy intellekt orqali suhbat." path="/zamonlar-aro" />
      <Navbar />
      <main className="flex-1 container py-10">
        <PremiumGate featureName="Zamonlar Aro Suhbat">
        {!selected ? (
          <>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-noir/40 backdrop-blur-sm mb-4">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span className="text-xs uppercase tracking-[0.2em] text-gold-soft">AI Powered</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
                <span className="text-gold-gradient">Zamonlar Aro</span> Suhbat
              </h1>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Tarixiy allomalar bilan jonli suhbatlashing — savol bering, ovozli javob oling, hikmatlarini eshiting.
              </p>
              <div className="ornament-divider" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SCHOLARS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="group relative overflow-hidden rounded-2xl border border-gold/20 bg-card hover:border-gold transition-all duration-500 text-left shadow-lg hover:shadow-gold"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-[10px] uppercase tracking-widest text-gold-soft mb-1">{s.era}</p>
                    <h3 className="font-display text-xl text-gold-gradient mb-1">{s.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.title}</p>
                  </div>
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-full bg-gold/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth">
                    <Sparkles className="w-4 h-4 text-gold" />
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <SelectedView scholar={selected} onBack={() => setSelected(null)} />
        )}
        </PremiumGate>
      </main>
      <Footer />
    </div>
  );
};

const SelectedView = ({ scholar, onBack }: { scholar: Scholar; onBack: () => void }) => {
  const [speaking, setSpeaking] = useState(false);
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-6 text-gold hover:bg-gold/10">
        <ArrowLeft className="w-4 h-4 mr-2" /> Allomalarga qaytish
      </Button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: portrait + info */}
        <div className="space-y-6">
          <div className={`relative rounded-2xl overflow-hidden border shadow-xl transition-all ${speaking ? 'border-gold ring-2 ring-gold/60 shadow-gold' : 'border-gold/30'}`}>
            <img src={scholar.image} alt={scholar.name} className="w-full h-auto" />

            {speaking && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-gold/20 via-transparent to-transparent animate-pulse pointer-events-none" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-[27%] flex flex-col items-center gap-0.5 pointer-events-none">
                  <div className="w-16 h-1 rounded-full bg-gold/70 animate-[pulse_0.28s_ease-in-out_infinite]" />
                  <div className="w-20 h-2.5 rounded-full bg-gold/50 blur-[2px] animate-[pulse_0.42s_ease-in-out_infinite]" />
                  <div className="w-12 h-1 rounded-full bg-gold/80 animate-[pulse_0.32s_ease-in-out_infinite]" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex items-end gap-1 pointer-events-none">
                  {[0,1,2,3,4,5,6].map((i) => (
                    <span
                      key={i}
                      className="w-1 bg-gold rounded-full animate-[pulse_0.6s_ease-in-out_infinite]"
                      style={{ height: `${8 + (i % 3) * 6}px`, animationDelay: `${i * 0.08}s` }}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-noir via-noir/70 to-transparent">
              <p className="text-[10px] uppercase tracking-widest text-gold-soft mb-1">{scholar.era}</p>
              <h2 className="font-display text-3xl text-gold-gradient flex items-center gap-2">
                {scholar.name}
                {speaking && <span className="text-xs font-sans text-gold animate-pulse">● gapirmoqda</span>}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">{scholar.title}</p>
            </div>
          </div>

          <div className="rounded-xl border border-gold/20 bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-gold" />
              <h3 className="font-display text-lg text-gold-gradient">Tarjimai hol</h3>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{scholar.bio}</p>
          </div>

          <div className="rounded-xl border border-gold/20 bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Quote className="w-4 h-4 text-gold" />
              <h3 className="font-display text-lg text-gold-gradient">Hikmatli so'zlar</h3>
            </div>
            <ul className="space-y-3">
              {scholar.quotes.map((q, i) => (
                <li key={i} className="text-sm italic text-foreground/85 border-l-2 border-gold/40 pl-3">
                  "{q}"
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: chat */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <ScholarChat scholar={scholar} onSpeakingChange={setSpeaking} />
        </div>
      </div>
    </div>
  );
};

export default ZamonlarAro;
