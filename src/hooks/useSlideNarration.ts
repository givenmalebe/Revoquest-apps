import { useCallback, useEffect, useRef, useState } from 'react';

/** Prefer Microsoft Jenny Premium (Edge); then any Jenny + Premium combo. */
function pickFluentEnglishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => /^en(-|$)/i.test(v.lang));
  if (!en.length) return voices[0] ?? null;

  const n = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
  const jennyPremium = en.find((v) => n(v).includes('jenny') && n(v).includes('premium'));
  if (jennyPremium) return jennyPremium;
  const jenny = en.find((v) => n(v).includes('jenny'));
  if (jenny) return jenny;

  const score = (v: SpeechSynthesisVoice): number => {
    const name = n(v);
    let s = 0;
    if (name.includes('jenny')) s += 200;
    if (name.includes('premium')) s += 150;
    if (name.includes('google')) s += 50;
    if (name.includes('natural') || name.includes('neural') || name.includes('premium')) s += 40;
    if (name.includes('microsoft') && name.includes('jenny')) s += 80;
    if (name.includes('en-us') || v.lang.toLowerCase() === 'en-us') s += 15;
    if (name.includes('compact') || name.includes('whisper') || name.includes('zarvox')) s -= 30;
    return s;
  };

  return [...en].sort((a, b) => score(b) - score(a))[0] ?? en[0];
}

/** Split into speakable phrases for natural pacing (not one giant blob). */
function splitForFluentSpeech(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const bySentence = cleaned.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).map((s) => s.trim()).filter((s) => s.length > 1);
  if (bySentence.length >= 2) return bySentence;
  const byComma = cleaned.split(/,\s+/).map((s) => s.trim()).filter((s) => s.length > 8);
  if (byComma.length >= 3) return byComma;
  const chunks: string[] = [];
  let rest = cleaned;
  const max = 160;
  while (rest.length > max) {
    const cut = rest.lastIndexOf(' ', max);
    const idx = cut > 40 ? cut : max;
    chunks.push(rest.slice(0, idx).trim());
    rest = rest.slice(idx).trim();
  }
  if (rest) chunks.push(rest);
  return chunks.length ? chunks : [cleaned];
}

export function useSlideNarration() {
  const [playing, setPlaying] = useState(false);
  const playingRef = useRef(false);
  const autoAdvanceRef = useRef(false);
  const cancelRef = useRef(false);
  const [rate, setRate] = useState(0.94);
  const [pitch, setPitch] = useState(1.02);

  const stop = useCallback(() => {
    cancelRef.current = true;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    playingRef.current = false;
    setPlaying(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    (text: string, onEnded?: () => void) => {
      if (typeof window === 'undefined' || !window.speechSynthesis || !text.trim()) {
        onEnded?.();
        return;
      }
      stop();
      cancelRef.current = false;
      try {
        window.speechSynthesis.resume();
      } catch {
        /* ignore */
      }

      const chunks = splitForFluentSpeech(text);
      const voice = pickFluentEnglishVoice();
      let index = 0;

      const speakNext = () => {
        if (cancelRef.current || index >= chunks.length) {
          playingRef.current = false;
          setPlaying(false);
          if (!cancelRef.current) onEnded?.();
          return;
        }
        const phrase = chunks[index++];
        const u = new SpeechSynthesisUtterance(phrase);
        u.rate = Math.min(1.12, Math.max(0.82, rate));
        u.pitch = Math.min(1.15, Math.max(0.88, pitch));
        u.volume = 1;
        if (voice) u.voice = voice;

        u.onstart = () => {
          playingRef.current = true;
          setPlaying(true);
        };
        u.onend = () => {
          window.setTimeout(speakNext, index < chunks.length ? 85 : 0);
        };
        u.onerror = () => {
          if (!cancelRef.current) window.setTimeout(speakNext, 50);
        };
        window.speechSynthesis.speak(u);
      };

      speakNext();
    },
    [rate, pitch, stop]
  );

  useEffect(() => {
    const load = () => window.speechSynthesis.getVoices();
    load();
    const t = window.setTimeout(load, 400);
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      window.clearTimeout(t);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  return {
    playing,
    playingRef,
    autoAdvanceRef,
    rate,
    setRate,
    pitch,
    setPitch,
    speak,
    stop
  };
}
