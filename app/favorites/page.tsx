"use client";

import Link from "next/link";
import { Heart, HeartCrack } from "lucide-react";
import { GAMES } from "@/lib/game-registry";
import { usePrefs } from "@/lib/store";
import GameCard from "@/components/game-cards/GameCard";

export default function FavoritesPage() {
  const favorites = usePrefs((s) => s.favorites);
  const games = favorites
    .map((slug) => GAMES.find((g) => g.slug === slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        <Heart className="h-7 w-7 fill-rose-500 text-rose-500" aria-hidden />
        Favorites
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Your favourite games, saved in this browser. Tap the heart on any game
        card to add or remove it.
      </p>

      {games.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-4 py-16 text-center dark:border-line">
          <HeartCrack className="h-10 w-10 text-zinc-400" aria-hidden />
          <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
            No favorites yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            Browse the game library and tap the heart on any game you love —
            it will be saved here.
          </p>
          <Link
            href="/games"
            className="mt-5 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            Browse all games
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      )}
    </div>
  );
}
