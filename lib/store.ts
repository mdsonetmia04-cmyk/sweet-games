import { create } from "zustand";
import { safeGet, safeSet } from "./storage";

export type Theme = "dark" | "light";

const THEME_KEY = "sg-theme";
const SOUND_KEY = "sg-sound";
const FAVORITES_KEY = "sg-favorites";
const RECENT_KEY = "sg-recently-played";
const SCORES_KEY = "sg-high-scores";

const MAX_RECENT = 12;

interface PrefsState {
  theme: Theme;
  soundOn: boolean;
  favorites: string[];
  recentlyPlayed: string[];
  highScores: Record<string, number>;
  toggleTheme: () => void;
  setSound: (on: boolean) => void;
  toggleFavorite: (slug: string) => void;
  recordPlayed: (slug: string) => void;
  setHighScore: (slug: string, score: number) => void;
  clearRecentlyPlayed: () => void;
}

export const usePrefs = create<PrefsState>()((set, get) => ({
  theme: safeGet<Theme>(THEME_KEY, "dark"),
  soundOn: safeGet<boolean>(SOUND_KEY, true),
  favorites: safeGet<string[]>(FAVORITES_KEY, []),
  recentlyPlayed: safeGet<string[]>(RECENT_KEY, []),
  highScores: safeGet<Record<string, number>>(SCORES_KEY, {}),

  toggleTheme: () => {
    const next: Theme = get().theme === "dark" ? "light" : "dark";
    safeSet(THEME_KEY, next);
    set({ theme: next });
  },
  setSound: (on) => {
    safeSet(SOUND_KEY, on);
    set({ soundOn: on });
  },
  toggleFavorite: (slug) => {
    const favs = get().favorites;
    const next = favs.includes(slug)
      ? favs.filter((f) => f !== slug)
      : [...favs, slug];
    safeSet(FAVORITES_KEY, next);
    set({ favorites: next });
  },
  recordPlayed: (slug) => {
    const rest = get().recentlyPlayed.filter((s) => s !== slug);
    const next = [slug, ...rest].slice(0, MAX_RECENT);
    safeSet(RECENT_KEY, next);
    set({ recentlyPlayed: next });
  },
  setHighScore: (slug, score) => {
    const current = get().highScores[slug] ?? 0;
    if (score > current) {
      const next = { ...get().highScores, [slug]: score };
      safeSet(SCORES_KEY, next);
      set({ highScores: next });
    }
  },
  clearRecentlyPlayed: () => {
    safeSet(RECENT_KEY, []);
    set({ recentlyPlayed: [] });
  },
}));
