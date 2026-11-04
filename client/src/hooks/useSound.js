import { useCallback, useEffect, useRef, useState } from "react";

const NOTES = [392, 440, 494, 587, 659, 784];

export const useSound = () => {
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("melajah-muted") === "1";
    } catch {
      return false;
    }
  });
  const contextRef = useRef(null);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!contextRef.current) {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (!AudioContext) return null;
      contextRef.current = new AudioContext();
    }
    if (contextRef.current.state === "suspended") {
      contextRef.current.resume().catch(() => {});
    }
    return contextRef.current;
  }, []);

  const tone = useCallback(
    (frequency, start = 0, duration = 0.18, type = "sine", volume = 0.07) => {
      if (muted) return;
      const ctx = getContext();
      if (!ctx) return;
      try {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        const now = ctx.currentTime + start;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        oscillator.connect(gain).connect(ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
      } catch {
        // audio tidak tersedia — permainan tetap berjalan
      }
    },
    [getContext, muted],
  );

  const play = useCallback(
    (name) => {
      if (muted) return;
      switch (name) {
        case "roll":
          [0, 0.09, 0.18, 0.27].forEach((delay, index) => {
            tone(NOTES[(index + 2) % NOTES.length], delay, 0.12, "triangle", 0.05);
          });
          break;
        case "step":
          tone(523, 0, 0.09, "sine", 0.035);
          break;
        case "question":
          tone(659, 0, 0.14, "triangle", 0.06);
          tone(784, 0.1, 0.22, "triangle", 0.05);
          break;
        case "correct":
          [523, 659, 784, 1046].forEach((note, index) =>
            tone(note, index * 0.08, 0.3, "triangle", 0.06),
          );
          break;
        case "near":
          [523, 587, 659].forEach((note, index) =>
            tone(note, index * 0.09, 0.25, "sine", 0.055),
          );
          break;
        case "wrong":
          tone(330, 0, 0.22, "sine", 0.05);
          tone(262, 0.14, 0.3, "sine", 0.045);
          break;
        case "ladder":
          [392, 494, 587, 784].forEach((note, index) =>
            tone(note, index * 0.07, 0.28, "triangle", 0.05),
          );
          break;
        case "snake":
          [440, 392, 349, 294].forEach((note, index) =>
            tone(note, index * 0.08, 0.3, "sine", 0.05),
          );
          break;
        case "win":
          [523, 659, 784, 1046, 1318].forEach((note, index) =>
            tone(note, index * 0.11, 0.5, "triangle", 0.07),
          );
          break;
        default:
          tone(440, 0, 0.1, "sine", 0.03);
      }
    },
    [muted, tone],
  );

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      try {
        localStorage.setItem("melajah-muted", next ? "1" : "0");
      } catch {
        // abaikan
      }
      return next;
    });
  }, []);

  useEffect(
    () => () => {
      contextRef.current?.close?.().catch?.(() => {});
    },
    [],
  );

  return { muted, toggleMuted, play };
};
