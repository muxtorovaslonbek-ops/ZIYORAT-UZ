// Voice helpers — male Uzbek-leaning TTS using browser SpeechSynthesis.
// No API key required.

let cachedVoices: SpeechSynthesisVoice[] | null = null;

const loadVoices = (): Promise<SpeechSynthesisVoice[]> =>
  new Promise((resolve) => {
    if (!('speechSynthesis' in window)) return resolve([]);
    const v = window.speechSynthesis.getVoices();
    if (v && v.length) {
      cachedVoices = v;
      return resolve(v);
    }
    const handler = () => {
      const vs = window.speechSynthesis.getVoices();
      cachedVoices = vs;
      window.speechSynthesis.onvoiceschanged = null;
      resolve(vs);
    };
    window.speechSynthesis.onvoiceschanged = handler;
    setTimeout(() => resolve(window.speechSynthesis.getVoices() || []), 1500);
  });

// Heuristic: detect male voices by common name tokens
const MALE_HINTS = [
  'male', 'man', 'erkak',
  'david', 'mark', 'george', 'daniel', 'alex', 'fred', 'tom',
  'paul', 'james', 'james', 'arthur', 'oliver', 'ryan',
  'pavel', 'yuri', 'dmitri', 'maxim',
  'ahmad', 'omar', 'hamed', 'majed',
  'erkin', 'bobur', 'azim',
];
const FEMALE_HINTS = ['female', 'woman', 'ayol', 'samantha', 'victoria', 'karen', 'tessa', 'fiona', 'anna', 'olga', 'maria', 'zira', 'hazel', 'serena'];

const isMale = (v: SpeechSynthesisVoice) => {
  const n = (v.name + ' ' + (v as any).voiceURI || '').toLowerCase();
  if (FEMALE_HINTS.some((h) => n.includes(h))) return false;
  if (MALE_HINTS.some((h) => n.includes(h))) return true;
  return null as unknown as boolean; // unknown
};

const detectLang = (text: string): string => {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar-SA';
  if (/[\u0400-\u04FF]/.test(text)) return 'ru-RU';
  if (/\b(the|and|is|of|you|are)\b/i.test(text)) return 'en-US';
  // default: Uzbek (Latin)
  return 'uz-UZ';
};

const pickVoice = (voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null => {
  if (!voices.length) return null;
  const base = lang.split('-')[0];

  // 1) Exact lang + explicitly male
  const exactMale = voices.filter((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase()) && isMale(v) === true);
  if (exactMale.length) return exactMale[0];

  // 2) Same base lang + male
  const baseMale = voices.filter((v) => v.lang.toLowerCase().startsWith(base) && isMale(v) === true);
  if (baseMale.length) return baseMale[0];

  // 3) Same base lang, not female
  const baseNotFemale = voices.filter((v) => v.lang.toLowerCase().startsWith(base) && isMale(v) !== false);
  if (baseNotFemale.length) return baseNotFemale[0];

  // 4) For Uzbek: fallback to Turkish/Russian male (closer phonetics than English)
  if (base === 'uz') {
    const tr = voices.filter((v) => v.lang.toLowerCase().startsWith('tr') && isMale(v) !== false);
    if (tr.length) return tr[0];
    const ru = voices.filter((v) => v.lang.toLowerCase().startsWith('ru') && isMale(v) !== false);
    if (ru.length) return ru[0];
  }

  // 5) Any male voice
  const anyMale = voices.filter((v) => isMale(v) === true);
  if (anyMale.length) return anyMale[0];

  // 6) First voice
  return voices[0];
};

// Stable hash → for assigning a deterministic voice/pitch per scholar
const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

export const speakMale = async (
  text: string,
  opts?: { onStart?: () => void; onEnd?: () => void; forceUzbek?: boolean; voiceSeed?: string }
) => {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const voices = cachedVoices ?? (await loadVoices());
  const lang = opts?.forceUzbek ? 'uz-UZ' : detectLang(text);
  const u = new SpeechSynthesisUtterance(text);

  // If seed provided, pick a STRICTLY male voice for that seed
  let v: SpeechSynthesisVoice | null = null;
  if (opts?.voiceSeed) {
    const base = lang.split('-')[0];
    // Strict: only explicitly-male voices
    let pool = voices.filter((vv) => vv.lang.toLowerCase().startsWith(base) && isMale(vv) === true);
    if (!pool.length) pool = voices.filter((vv) => isMale(vv) === true); // any explicit male
    if (!pool.length) pool = voices.filter((vv) => vv.lang.toLowerCase().startsWith(base) && isMale(vv) !== false);
    if (!pool.length) pool = voices.filter((vv) => isMale(vv) !== false);
    if (pool.length) v = pool[hash(opts.voiceSeed) % pool.length];
  }
  if (!v) v = pickVoice(voices, lang);

  if (v) { u.voice = v; u.lang = v.lang; } else { u.lang = lang; }

  // Always low/masculine pitch (0.5 - 0.7) — guarantees male tone even if voice gender unknown
  const seedPitch = opts?.voiceSeed ? 0.5 + ((hash(opts.voiceSeed) % 20) / 100) : 0.6;
  u.pitch = seedPitch;
  u.rate = 0.95;
  u.volume = 1;
  u.onstart = () => opts?.onStart?.();
  u.onend = () => opts?.onEnd?.();
  u.onerror = () => opts?.onEnd?.();
  window.speechSynthesis.speak(u);
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

// Preload voices on import
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
}
