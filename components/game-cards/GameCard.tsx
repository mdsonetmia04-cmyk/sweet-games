"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Play, Trophy, Users } from "lucide-react";
import type { GameMeta } from "@/types/game";
import { usePrefs } from "@/lib/store";
import { sfx } from "@/lib/sound";

export default function GameCard({ game }: { game: GameMeta }) {
  const isFav = usePrefs((s) => s.favorites.includes(game.slug));
  const toggleFavorite = usePrefs((s) => s.toggleFavorite);
  const best = usePrefs((s) => s.highScores[game.slug]);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-paper-panel transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-line dark:bg-panel dark:hover:border-zinc-600 dark:hover:shadow-black/30">
      <Link
        href={`/games/${game.slug}`}
        className="relative block aspect-[16/9] overflow-hidden"
        aria-label={`Play ${game.name}`}
        tabIndex={-1}
      >
        <div
          className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          style={{ backgroundColor: game.color }}
        >
          <Image
            src={game.thumbnail}
            alt={`${game.name} thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        </div>
        <span className="absolute bottom-2 left-3 rounded-full bg-black/25 px-2 py-0.5 text-[11px] font-semibold text-white">
          {game.category} Games
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
            <Link href={`/games/${game.slug}`} className="hover:underline">
              {game.name}
            </Link>
          </h3>
          <button
            type="button"
            onClick={() => {
              toggleFavorite(game.slug);
              sfx.click();
            }}
            aria-label={
              isFav
                ? `Remove ${game.name} from favorites`
                : `Add ${game.name} to favorites`
            }
            aria-pressed={isFav}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-900/5 hover:text-rose-500 dark:hover:bg-white/10"
          >
            <Heart
              className={`h-4.5 w-4.5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`}
              aria-hidden
            />
          </button>
        </div>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {game.tagline}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden />
            {game.players}
          </span>
          {typeof best === "number" && (
            <span className="inline-flex items-center gap-1 font-medium text-mint-dark dark:text-mint">
              <Trophy className="h-3.5 w-3.5" aria-hidden />
              Best: {best.toLocaleString()}
            </span>
          )}
        </div>
        <Link
          href={`/games/${game.slug}`}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint dark:bg-mint dark:text-ink dark:hover:bg-mint-dark dark:hover:text-white"
        >
          <Play className="h-4 w-4 fill-current" aria-hidden />
          Play Now
        </Link>
      </div>
    </article>
  );
}
