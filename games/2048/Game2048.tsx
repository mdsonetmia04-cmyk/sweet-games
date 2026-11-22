"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trophy, Undo2 } from "lucide-react";
import { usePrefs } from "@/lib/store";
import { sfx } from "@/lib/sound";
import {
  addRandomTile,
  canMove,
  hasWon,
  move,
  newGame,
  type Board,
  type Direction,
} from "./logic";

const TILE_STYLES: Record<number, string> = {
  2: "bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100",
  4: "bg-mint-soft text-zinc-800 dark:bg-mint/25 dark:text-mint",
  8: "bg-[#f2b26b] text-white",
  16: "bg-[#ef9a4d] text-white",
  32: "bg-[#ef7f4d] text-white",
  64: "bg-[#e85d3d] text-white",
  128: "bg-[#f0d060] text-zinc-900",
  256: "bg-[#f0cd4e] text-zinc-900",
  512: "bg-[#eec22e] text-zinc-900",
  1024: "bg-[#e6b800] text-white",
  2048: "bg-mint text-ink",
};

function tileClass(v: number): string {
  if (v === 0) return "bg-zinc-900/5 dark:bg-white/5";
  return TILE_STYLES[v] ?? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900";
}

type Status = "playing" | "won" | "over";

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() => newGame());
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [wonShown, setWonShown] = useState(false);
  const [history, setHistory] = useState<{ board: Board; score: number }[]>([]);
  const touchRef = useRef<{ x: number; y: number } | null>(null);

  const best = usePrefs((s) => s.highScores["2048"] ?? 0);
  const setHighScore = usePrefs((s) => s.setHighScore);

  const doMove = useCallback(
    (dir: Direction) => {
      if (status === "over") return;
      setBoard((prev) => {
        const res = move(prev, dir);
        if (!res.moved) return prev;
        setHistory((h) => [...h.slice(-9), { board: prev, score }]);
        const next = addRandomTile(res.board);
        const newScore = score + res.gained;
        setScore(newScore);
        setHighScore("2048", newScore);
        if (res.gained > 0) sfx.pop();
        if (hasWon(next) && !wonShown) {
          setStatus("won");
          setWonShown(true);
          sfx.win();
        } else if (!canMove(next)) {
          setStatus("over");
          sfx.lose();
        }
        return next;
      });
    },
    [score, status, wonShown, setHighScore],
  );

  const restart = () => {
    setBoard(newGame());
    setScore(0);
    setStatus("playing");
    setWonShown(false);
    setHistory([]);
    sfx.click();
  };

  const undo = () => {
    setHistory((h) => {
      const last = h[h.length - 1];
      if (!last) return h;
      setBoard(last.board);
      setScore(last.score);
      setStatus("playing");
      sfx.click();
      return h.slice(0, -1);
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
        W: "up",
        S: "down",
        A: "left",
        D: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        doMove(dir);
      } else if (e.key === "u" || e.key === "U") {
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doMove]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    const dir: Direction =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    doMove(dir);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Score:{" "}
            <span className="text-lg font-bold text-zinc-900 dark:text-white">
              {score}
            </span>
          </p>
          <p className="flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            <Trophy className="h-4 w-4 text-mint-dark dark:text-mint" aria-hidden />
            Best: {Math.max(best, score)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-paper px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-line dark:bg-ink"
            aria-label="Undo last move"
          >
            <Undo2 className="h-4 w-4" aria-hidden /> Undo
          </button>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> New game
          </button>
        </div>
      </div>

      <div
        className="mt-4 w-full touch-none select-none rounded-xl border border-zinc-200 bg-zinc-900/5 p-2.5 dark:border-line dark:bg-white/5 sm:p-3"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="grid"
        aria-label="2048 board"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {board.flat().map((v, i) => (
            <div
              key={i}
              role="gridcell"
              aria-label={v === 0 ? "Empty tile" : `Tile ${v}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-xl font-bold transition-colors sm:text-2xl ${tileClass(v)}`}
            >
              {v === 0 ? "" : v.toLocaleString()}
            </div>
          ))}
        </div>
      </div>

      {status === "won" && (
        <div className="mt-4 w-full rounded-xl border border-mint/50 bg-mint-soft p-4 text-center dark:bg-mint/10">
          <p className="font-bold text-zinc-900 dark:text-white">
            You reached 2048 — you win!
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Keep playing to chase a higher score, or start a new game.
          </p>
          <button
            type="button"
            onClick={() => setStatus("playing")}
            className="mt-3 rounded-lg bg-mint px-4 py-2 text-sm font-semibold text-ink"
          >
            Keep playing
          </button>
        </div>
      )}
      {status === "over" && (
        <div className="mt-4 w-full rounded-xl border border-zinc-200 bg-paper-panel p-4 text-center dark:border-line dark:bg-panel">
          <p className="font-bold text-zinc-900 dark:text-white">
            Game over — no moves left
          </p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Final score: {score} · Best: {Math.max(best, score)}
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            Play again
          </button>
        </div>
      )}
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Arrow keys / WASD or swipe to slide · U to undo · Merge tiles to reach
        2048
      </p>
    </div>
  );
}
