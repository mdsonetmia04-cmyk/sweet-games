"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock3, Flame, Search, SearchX } from "lucide-react";
import { CATEGORIES, GAMES } from "@/lib/game-registry";
import type { GameCategory } from "@/types/game";
import GameCard from "@/components/game-cards/GameCard";

type SortMode = "popular" | "recent" | "name";

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as GameCategory | null;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GameCategory | "All">(
    initialCategory && CATEGORIES.some((c) => c.name === initialCategory)
      ? initialCategory
      : "All",
  );
  const [sort, setSort] = useState<SortMode>("popular");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = GAMES.filter(
      (g) =>
        (category === "All" || g.category === category) &&
        (q === "" ||
          g.name.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q)),
    );
    if (sort === "popular") {
      list = [...list].sort(
        (a, b) => Number(b.popular) - Number(a.popular) || Number(b.featured) - Number(a.featured),
      );
    } else if (sort === "recent") {
      list = [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    } else {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [query, category, sort]);

  const tabs: (GameCategory | "All")[] = ["All", ...CATEGORIES.map((c) => c.name)];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
        All Games
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        {GAMES.length} free games. Search, filter by category, and start
        playing instantly.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search games</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by game name…"
            className="h-11 w-full rounded-lg border border-zinc-200 bg-paper-panel pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/40 dark:border-line dark:bg-panel dark:text-white"
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          Sort by
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="h-11 rounded-lg border border-zinc-200 bg-paper-panel px-3 text-sm text-zinc-900 focus:border-mint focus:outline-none dark:border-line dark:bg-panel dark:text-white"
            aria-label="Sort games"
          >
            <option value="popular">Most popular</option>
            <option value="recent">Recently added</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </label>
      </div>

      <div
        className="mt-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter by category"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setCategory(tab)}
            aria-pressed={category === tab}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              category === tab
                ? "bg-zinc-900 text-white dark:bg-mint dark:text-ink"
                : "border border-zinc-200 bg-paper-panel text-zinc-700 hover:bg-zinc-100 dark:border-line dark:bg-panel dark:text-zinc-200 dark:hover:bg-panel-2"
            }`}
          >
            {tab === "All" ? "All Games" : `${tab} Games`}
            {tab !== "All" && (
              <span className="text-xs opacity-70">
                {GAMES.filter((g) => g.category === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-zinc-300 px-4 py-16 text-center dark:border-line">
          <SearchX className="h-10 w-10 text-zinc-400" aria-hidden />
          <p className="mt-4 text-base font-semibold text-zinc-900 dark:text-white">
            No games found
          </p>
          <p className="mt-1 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            Try a different search or category. All {GAMES.length} games are
            listed on this page.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-5 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            Clear search and filters
          </button>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
            Showing {filtered.length} game{filtered.length === 1 ? "" : "s"}
            {category !== "All" ? ` in ${category} Games` : ""}
            {query ? ` matching “${query}”` : ""}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((g) => (
              <GameCard key={g.slug} game={g} />
            ))}
          </div>
        </>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-zinc-200 bg-paper-panel p-5 text-sm text-zinc-600 dark:border-line dark:bg-panel dark:text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Flame className="h-4 w-4 text-mint-dark dark:text-mint" aria-hidden />
          Popular games are shown first by default.
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-mint-dark dark:text-mint" aria-hidden />
          Recently added games appear under “Recently added” sorting.
        </span>
      </div>
    </div>
  );
}

export default function GamesLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
          <p className="text-sm text-zinc-500">Loading games…</p>
        </div>
      }
    >
      <LibraryContent />
    </Suspense>
  );
}
