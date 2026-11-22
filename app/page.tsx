import Link from "next/link";
import { ArrowRight, Clock3, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { CATEGORIES, GAMES } from "@/lib/game-registry";
import GameCard from "@/components/game-cards/GameCard";
import GameIcon from "@/components/shared/GameIcon";
import RecentlyPlayed from "@/components/home/RecentlyPlayed";

export default function HomePage() {
  const featured = GAMES.filter((g) => g.featured);
  const popular = GAMES.filter((g) => g.popular);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-zinc-200 dark:border-line">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-paper-panel px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-line dark:bg-panel dark:text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-mint-dark dark:text-mint" aria-hidden />
            10 free games · No login · No downloads
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Sweet Games
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-xl font-semibold text-mint-dark dark:text-mint">
            Play More. Enjoy More.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Play free online games instantly. No login, no downloads, no
            payments — just pick a game and start playing on any device.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/games"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-mint dark:text-ink dark:hover:bg-mint-dark dark:hover:text-white"
            >
              <Gamepad2 className="h-4.5 w-4.5" aria-hidden />
              Explore Games
            </Link>
            <Link
              href="#featured"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-paper-panel px-6 py-3 text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100 dark:border-line dark:bg-panel dark:text-zinc-100 dark:hover:bg-panel-2"
            >
              Featured Games
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">10</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Free games
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">0</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Logins needed
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">3</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Game categories
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section id="featured" aria-labelledby="featured-heading" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="featured-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Featured games
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Hand-picked favourites to start with.
            </p>
          </div>
          <Link
            href="/games"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-mint-dark hover:underline dark:text-mint sm:inline-flex"
          >
            View all
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" aria-labelledby="categories-heading" className="border-y border-zinc-200 bg-zinc-50 dark:border-line dark:bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
          <h2 id="categories-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Game categories
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Find the kind of game you are in the mood for.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const count = GAMES.filter((g) => g.category === cat.name).length;
              return (
                <Link
                  key={cat.name}
                  href={`/games?category=${cat.name}`}
                  className="group rounded-2xl border border-zinc-200 bg-paper-panel p-5 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5 dark:border-line dark:bg-ink dark:hover:border-zinc-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-soft text-mint-dark dark:bg-mint/15 dark:text-mint">
                      <GameIcon
                        icon={
                          cat.name === "Board"
                            ? "dices"
                            : cat.name === "Puzzle"
                              ? "hash"
                              : "zap"
                        }
                        className="h-5.5 w-5.5"
                      />
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {count} games
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900 group-hover:underline dark:text-white">
                    {cat.name} Games
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {cat.blurb}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* All games */}
      <section aria-labelledby="all-games-heading" className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="all-games-heading" className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              All games
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Every game is free and ready to play right now.
            </p>
          </div>
          <Link
            href="/games"
            className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-mint-dark hover:underline dark:text-mint sm:inline-flex"
          >
            Browse library
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {GAMES.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>

      {/* Popular strip */}
      <section aria-labelledby="popular-heading" className="mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl border border-zinc-200 bg-paper-panel p-5 dark:border-line dark:bg-panel sm:p-6">
          <h2 id="popular-heading" className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
            <Trophy className="h-5 w-5 text-mint-dark dark:text-mint" aria-hidden />
            Most popular
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {popular.map((g) => (
              <Link
                key={g.slug}
                href={`/games/${g.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-mint hover:text-mint-dark dark:border-line dark:text-zinc-200 dark:hover:border-mint dark:hover:text-mint"
              >
                <GameIcon icon={g.icon} className="h-4 w-4" />
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently played */}
      <section aria-labelledby="recent-heading" className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6">
        <h2 id="recent-heading" className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
          <Clock3 className="h-5 w-5 text-mint-dark dark:text-mint" aria-hidden />
          Recently played
        </h2>
        <RecentlyPlayed />
      </section>
    </div>
  );
}
