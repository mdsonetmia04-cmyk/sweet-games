import Link from "next/link";
import { ArrowRight, Blocks, CircleDot, Clock3, Crown, Dices, Gamepad2, Trophy } from "lucide-react";
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
      <section className="relative overflow-hidden border-b border-zinc-200 dark:border-line">
        {/* Stylish gaming backdrop — faint board grid, soft mint glows and
            corner game pieces. The pattern fades out toward the centre, so
            the headline always sits on a calm, high-contrast area. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-mint/25 blur-3xl dark:bg-mint/10" />
          <div className="absolute -left-24 top-1/3 h-56 w-56 rounded-full bg-mint/20 blur-3xl dark:bg-mint/[0.07]" />
          <div className="absolute -right-24 bottom-0 h-56 w-56 rounded-full bg-mint/20 blur-3xl dark:bg-mint/[0.07]" />
          <div className="absolute inset-0 text-zinc-900 opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_55%_60%_at_50%_45%,transparent_35%,black_78%)] dark:text-white dark:opacity-[0.08]" />
          <Dices className="absolute -left-4 top-12 hidden h-28 w-28 -rotate-12 text-zinc-900/[0.06] dark:text-white/[0.06] lg:block" />
          <Crown className="absolute -right-4 top-12 hidden h-28 w-28 rotate-12 text-zinc-900/[0.06] dark:text-white/[0.06] lg:block" />
          <Blocks className="absolute -left-4 bottom-10 hidden h-28 w-28 rotate-6 text-zinc-900/[0.06] dark:text-white/[0.06] lg:block" />
          <CircleDot className="absolute -right-4 bottom-10 hidden h-28 w-28 -rotate-6 text-zinc-900/[0.06] dark:text-white/[0.06] lg:block" />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="inline-flex items-center rounded-full border border-zinc-200 bg-paper-panel px-3.5 py-1.5 text-xs font-semibold tracking-wide text-zinc-600 dark:border-line dark:bg-panel dark:text-zinc-300">
            10 free games · No login · No downloads
          </span>
          <h1 className="mx-auto mt-7 max-w-3xl font-display text-5xl font-bold leading-[1.04] tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl dark:text-white">
            Sweet Games
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-display text-xl font-semibold tracking-wide text-mint-dark sm:text-2xl dark:text-mint">
            Play More. Enjoy More.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
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
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 divide-x divide-zinc-200 text-center dark:divide-line">
            <div className="px-4">
              <p className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">10</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Free games
              </p>
            </div>
            <div className="px-4">
              <p className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">0</p>
              <p className="mt-0.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Logins needed
              </p>
            </div>
            <div className="px-4">
              <p className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-white">3</p>
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
            <h2 id="featured-heading" className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
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
          <h2 id="categories-heading" className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
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
            <h2 id="all-games-heading" className="font-display text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
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
          <h2 id="popular-heading" className="flex items-center gap-2 font-display text-lg font-bold text-zinc-900 dark:text-white">
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
        <h2 id="recent-heading" className="flex items-center gap-2 font-display text-xl font-bold text-zinc-900 dark:text-white">
          <Clock3 className="h-5 w-5 text-mint-dark dark:text-mint" aria-hidden />
          Recently played
        </h2>
        <RecentlyPlayed />
      </section>
    </div>
  );
}
