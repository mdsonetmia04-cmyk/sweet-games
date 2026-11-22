/** Tiny WebAudio sound effects. No audio files, no network. Respects the
 * user's sound preference from the store. All failures are swallowed. */

import { usePrefs } from "./store";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

export function playTone(
  freq = 440,
  duration = 0.08,
  type: OscillatorType = "sine",
  volume = 0.04,
): void {
  try {
    if (!usePrefs.getState().soundOn) return;
    const audio = getCtx();
    if (!audio) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + duration);
  } catch {
    /* ignore */
  }
}

export const sfx = {
  click: () => playTone(620, 0.05, "sine", 0.03),
  move: () => playTone(440, 0.06, "triangle", 0.04),
  pop: () => playTone(880, 0.07, "sine", 0.04),
  good: () => {
    playTone(523, 0.09, "sine", 0.04);
    setTimeout(() => playTone(784, 0.12, "sine", 0.04), 90);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.14, "sine", 0.05), i * 110),
    );
  },
  lose: () => {
    [392, 330, 262].forEach((f, i) =>
      setTimeout(() => playTone(f, 0.16, "triangle", 0.04), i * 130),
    );
  },
  dice: () => playTone(300, 0.05, "square", 0.02),
};
