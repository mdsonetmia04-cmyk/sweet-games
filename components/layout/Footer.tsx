import Link from "next/link";
import { Gamepad2, Mail } from "lucide-react";
import { GAMES } from "@/lib/game-registry";
import CopyrightYear from "@/components/layout/CopyrightYear";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-line dark:bg-panel">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint text-ink">
              <Gamepad2 className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-bold tracking-wide text-zinc-900 dark:text-white">
              SWEET GAMES
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Free browser games for everyone. No login, no downloads, no
            payments — just play and enjoy.
          </p>
          <p className="mt-3 text-sm font-medium text-mint-dark dark:text-mint">
            Play More. Enjoy More.
          </p>
        </div>

        <nav aria-label="Footer — games">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Popular Games
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {GAMES.filter((g) => g.popular)
              .slice(0, 5)
              .map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/games/${g.slug}`}
                    className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
          </ul>
        </nav>

        <nav aria-label="Footer — browse">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Browse
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link
                href="/games"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                All Games
              </Link>
            </li>
            <li>
              <Link
                href="/games?category=Board"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Board Games
              </Link>
            </li>
            <li>
              <Link
                href="/games?category=Puzzle"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Puzzle Games
              </Link>
            </li>
            <li>
              <Link
                href="/games?category=Arcade"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Arcade Games
              </Link>
            </li>
            <li>
              <Link
                href="/favorites"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Favorites
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            About
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Sweet Games is a free gaming platform. Your favorites, recent
            games and high scores are stored only in your own browser — we
            collect no personal information.
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link
                href="/privacy"
                className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <a
                href="mailto:hello@sweetgames.app"
                className="inline-flex items-center gap-1.5 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                <Mail className="h-4 w-4" aria-hidden />
                hello@sweetgames.app
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 dark:border-line">
        <p className="mx-auto w-full max-w-7xl px-4 py-5 text-center text-xs text-zinc-500 dark:text-zinc-500 sm:px-6">
          © <CopyrightYear /> Sweet Games. All rights reserved. Free Games. No Login.
          Just Play.
        </p>
      </div>
    </footer>
  );
}
