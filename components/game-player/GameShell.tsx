"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Keyboard,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { GameMeta } from "@/types/game";
import { relatedGames } from "@/lib/game-registry";
import { usePrefs } from "@/lib/store";
import { sfx } from "@/lib/sound";
import GameCard from "@/components/game-cards/GameCard";
import GameIcon from "@/components/shared/GameIcon";

export default function GameShell({
  game,
  children,
}: {
  game: GameMeta;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const soundOn = usePrefs((s) => s.soundOn);
  const setSound = usePrefs((s) => s.setSound);
  const recordPlayed = usePrefs((s) => s.recordPlayed);

  useEffect(() => {
    recordPlayed(game.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.slug]);

  useEffect(() => {
    const onChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (containerRef.current) {
        await containerRef.current.requestFullscreen();
      }
    } catch {
      /* Fullscreen may be unavailable — ignore silently */
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      <Link
        href="/games"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to all games
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: game.color }}
          >
            <GameIcon icon={game.icon} className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-white">
              {game.name}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {game.description}
            </p>
            <p className="mt-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-500">
              {game.category} Games · {game.players}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSound(!soundOn);
              sfx.click();
            }}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
            aria-pressed={soundOn}
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-paper-panel px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-line dark:bg-panel dark:text-zinc-200 dark:hover:bg-panel-2"
          >
            {soundOn ? (
              <Volume2 className="h-4 w-4" aria-hidden />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">
              Sound {soundOn ? "On" : "Off"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              toggleFullscreen();
              sfx.click();
            }}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-paper-panel px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-line dark:bg-panel dark:text-zinc-200 dark:hover:bg-panel-2"
          >
            {isFullscreen ? (
              <Minimize className="h-4 w-4" aria-hidden />
            ) : (
              <Maximize className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-paper-panel p-4 dark:border-line dark:bg-panel sm:p-6"
      >
        {children}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section
          aria-labelledby="how-to-play"
          className="rounded-2xl border border-zinc-200 bg-paper-panel p-5 dark:border-line dark:bg-panel"
        >
          <h2
            id="how-to-play"
            className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white"
          >
            <BookOpen className="h-4.5 w-4.5 text-mint-dark dark:text-mint" aria-hidden />
            How to play
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {game.instructions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>
        <section
          aria-labelledby="controls"
          className="rounded-2xl border border-zinc-200 bg-paper-panel p-5 dark:border-line dark:bg-panel"
        >
          <h2
            id="controls"
            className="flex items-center gap-2 text-base font-semibold text-zinc-900 dark:text-white"
          >
            <Keyboard className="h-4.5 w-4.5 text-mint-dark dark:text-mint" aria-hidden />
            Controls
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {game.controls.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden>•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="related-games" className="mt-10">
        <h2
          id="related-games"
          className="text-xl font-bold text-zinc-900 dark:text-white"
        >
          Related games
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedGames(game.slug).map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </div>
      </section>
    </div>
  );
}
