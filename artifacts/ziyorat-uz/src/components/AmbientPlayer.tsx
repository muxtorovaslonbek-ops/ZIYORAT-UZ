import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface Track {
  label: string;
  src: string;
}

const TRACKS: Track[] = [
  {
    label: 'Eski Samarqand bozori',
    src: 'https://assets.mixkit.co/active_storage/sfx/2434/2434-preview.mp3',
  },
  {
    label: 'Masjid azoni',
    src: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0c/Adhan_Egypt.ogg/Adhan_Egypt.ogg.mp3',
  },
  {
    label: 'Shamol va qushlar',
    src: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
  },
];

export const AmbientPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(40);
  const [trackIdx, setTrackIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.play().catch(() => setPlaying(false));
    } else {
      a.pause();
    }
  }, [playing, trackIdx]);

  // Stop on unmount
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  const track = TRACKS[trackIdx];

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg border border-gold/20 bg-card/60 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Music2 className="w-4 h-4 text-gold" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground">Atmosfera ovozi</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {TRACKS.map((tr, i) => (
          <button
            key={tr.label}
            onClick={() => { setTrackIdx(i); if (!playing) setPlaying(true); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-smooth ${
              trackIdx === i
                ? 'bg-gold text-noir border-gold shadow-gold'
                : 'border-gold/30 text-foreground hover:border-gold hover:text-gold'
            }`}
          >
            {tr.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-[180px] ml-auto">
        <Button
          size="icon"
          variant={playing ? 'default' : 'outline'}
          onClick={() => setPlaying((v) => !v)}
          className={playing ? 'bg-gold text-noir hover:bg-gold-soft' : 'border-gold/40 text-gold hover:bg-gold/10'}
          aria-label={playing ? "O'chirish" : 'Yoqish'}
        >
          {playing ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
        <Slider
          value={[volume]}
          onValueChange={(v) => setVolume(v[0])}
          min={0}
          max={100}
          step={5}
          disabled={!playing}
          aria-label="Ovoz balandligi"
          className="flex-1"
        />
      </div>

      <audio ref={audioRef} src={track.src} loop preload="none" />
    </div>
  );
};
