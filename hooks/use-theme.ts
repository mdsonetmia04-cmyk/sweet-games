"use client";

import { usePrefs, type Theme } from "@/lib/store";

/** Theme hook — the single source of truth is the zustand store. */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const theme = usePrefs((s) => s.theme);
  const toggleTheme = usePrefs((s) => s.toggleTheme);
  return { theme, toggleTheme };
}
