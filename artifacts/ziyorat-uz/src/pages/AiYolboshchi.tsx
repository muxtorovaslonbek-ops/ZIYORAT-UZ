import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Seo } from '@/components/Seo';
import { AiGuide } from '@/components/AiGuide';
import { PremiumGate } from '@/components/PremiumGate';
import { Sparkles } from 'lucide-react';

const AiYolboshchi = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo title="AI Yoʻlboshchi — ZIYORAT UZ" description="Sun’iy intellekt asosidagi shaxsiy ziyorat va sayohat yoʻlboshchisi." path="/ai-yolboshchi" />
      <Navbar />
      <main className="flex-1 container py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-noir/40 backdrop-blur-sm mb-4">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-xs uppercase tracking-[0.2em] text-gold-soft">AI Powered</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            <span className="text-gold-gradient">AI Ziyorat</span> Yo'lboshchi
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Sun'iy intellektli virtual hamroh — gapiring yoki yozing, har qanday tilda javob beradi,
            ziyoratgohlar haqida hikoya qiladi va savollaringizga jonli javob beradi.
          </p>
          <div className="ornament-divider" />
        </div>
        <PremiumGate featureName="AI Yo'lboshchi">
          <AiGuide variant="page" />
        </PremiumGate>
      </main>
      <Footer />
    </div>
  );
};

export default AiYolboshchi;
