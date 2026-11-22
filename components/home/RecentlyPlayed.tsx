"use client";

import { Clock3, Trash2 } from "lucide-react";
import { GAMES } from "@/lib/game-registry";
import { usePrefs } from "@/lib/store";
import GameCard from "@/components/game-cards/GameCard";

export default function RecentlyPlayed() {
  const recentlyPlayed = usePrefs((s) => s.recentlyPlayed);
  const clearRecentlyPlayed = usePrefs((s) => s.clearRecentlyPlayed);
  const games = recentlyPlayed
    .map((slug) => GAMES.find((g) => g.slug === slug))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  if (games.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        You have not played any games yet. Pick a game above and it will show
        up here next time.
      </p>
    );
  }

  return (
    <div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pick up where you left off.
        </p>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm("Clear your recently played games?")
            ) {
              clearRecentlyPlayed();
            }
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-900/5 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          Clear history
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((g) => (
          <GameCard key={g.slug} game={g} />
        ))}
      </div>
    </div>
  );
}
