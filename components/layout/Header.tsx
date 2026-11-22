"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Gamepad2, Heart, Menu, Moon, Sun, X } from "lucide-react";
import { usePrefs } from "@/lib/store";
import { sfx } from "@/lib/sound";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/games", label: "All Games" },
  { href: "/#categories", label: "Categories" },
  { href: "/favorites", label: "Favorites" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const theme = usePrefs((s) => s.theme);
  const toggleTheme = usePrefs((s) => s.toggleTheme);
  const favCount = usePrefs((s) => s.favorites.length);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-paper/90 backdrop-blur dark:border-line dark:bg-ink/90">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Sweet Games — home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint text-ink">
            <Gamepad2 className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-wide text-zinc-900 dark:text-white">
              SWEET GAMES
            </span>
            <span className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Play More. Enjoy More.
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href.split("#")[0]);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-900/5 text-zinc-900 dark:bg-white/10 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                }`}
              >
                {item.label === "Favorites" && (
                  <Heart className="h-4 w-4" aria-hidden />
                )}
                {item.label}
                {item.label === "Favorites" && favCount > 0 && (
                  <span className="rounded-full bg-mint px-1.5 py-0.5 text-[10px] font-bold text-ink">
                    {favCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              toggleTheme();
              sfx.click();
            }}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" aria-hidden />
            ) : (
              <Moon className="h-5 w-5" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-900/5 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white md:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-zinc-200 px-4 py-2 dark:border-line md:hidden"
          aria-label="Mobile navigation"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200"
            >
              {item.label}
              {item.label === "Favorites" && favCount > 0 && (
                <span className="rounded-full bg-mint px-2 py-0.5 text-[11px] font-bold text-ink">
                  {favCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
