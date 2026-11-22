"use client";

import { useEffect } from "react";
import { usePrefs } from "@/lib/store";

/** Keeps the `dark` class on <html> in sync with the stored theme. */
export default function ThemeEffect() {
  const theme = usePrefs((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}
