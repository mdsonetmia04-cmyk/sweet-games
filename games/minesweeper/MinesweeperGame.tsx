"use client";

import { useEffect, useRef, useState } from "react";
import { Bomb, Flag, RotateCcw, Timer } from "lucide-react";
import { sfx } from "@/lib/sound";
import {
  DIFFICULTIES,
  checkWin,
  countFlags,
  emptyGrid,
  generateBoard,
  revealAllMines,
  revealCell,
  type DifficultyKey,
  type MineCell,
} from "./logic";

type Status = "idle" | "playing" | "won" | "lost";

const NUMBER_COLORS = [
  "",
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-red-600 dark:text-red-400",
  "text-indigo-700 dark:text-indigo-400",
  "text-amber-700 dark:text-amber-400",
  "text-cyan-700 dark:text-cyan-400",
  "text-zinc-800 dark:text-zinc-200",
  "text-zinc-500 dark:text-zinc-400",
];

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<DifficultyKey>("easy");
  const cfg = DIFFICULTIES[difficulty];
  const [grid, setGrid] = useState<MineCell[][]>(() =>
    emptyGrid(cfg.rows, cfg.cols),
  );
  const [status, setStatus] = useState<Status>("idle");
  const [seconds, setSeconds] = useState(0);
  const [flagMode, setFlagMode] = useState(false);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressedRef = useRef(false);

  const flagsUsed = countFlags(grid);
  const minesLeft = cfg.mines - flagsUsed;

  // Timer
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const changeDifficulty = (d: DifficultyKey) => {
    const next = DIFFICULTIES[d];
    setDifficulty(d);
    setGrid(emptyGrid(next.rows, next.cols));
    setStatus("idle");
    setSeconds(0);
    sfx.click();
  };

  const restart = () => {
    setGrid(emptyGrid(cfg.rows, cfg.cols));
    setStatus("idle");
    setSeconds(0);
    sfx.click();
  };

  const toggleFlag = (r: number, c: number) => {
    if (status === "won" || status === "lost") return;
    const cell = grid[r][c];
    if (cell.revealed) return;
    const next = grid.map((row) => row.map((cell2) => ({ ...cell2 })));
    next[r][c].flagged = !next[r][c].flagged;
    setGrid(next);
    sfx.click();
  };

  const reveal = (r: number, c: number) => {
    if (status === "won" || status === "lost") return;
    const cell = grid[r][c];
    if (cell.revealed || cell.flagged) return;

    let working = grid;
    let currentStatus = status;
    if (status === "idle") {
      working = generateBoard(cfg.rows, cfg.cols, cfg.mines, r, c);
      currentStatus = "playing";
      setStatus("playing");
      setSeconds(0);
    }
    const res = revealCell(working, r, c);
    if (res.hitMine) {
      setGrid(revealAllMines(res.grid));
      setStatus("lost");
      sfx.lose();
      return;
    }
    if (checkWin(res.grid, cfg.mines)) {
      setGrid(res.grid);
      setStatus("won");
      sfx.win();
      return;
    }
    setGrid(res.grid);
    if (currentStatus === "playing" && status === "idle") setStatus("playing");
    sfx.move();
  };

  const onCellClick = (r: number, c: number) => {
    if (longPressedRef.current) {
      longPressedRef.current = false;
      return;
    }
    if (flagMode) toggleFlag(r, c);
    else reveal(r, c);
  };

  const onTouchStart = (r: number, c: number) => {
    longPressedRef.current = false;
    longPressRef.current = setTimeout(() => {
      longPressedRef.current = true;
      toggleFlag(r, c);
      if (navigator.vibrate) navigator.vibrate(20);
    }, 450);
  };
  const onTouchEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div
          className="flex rounded-lg border border-zinc-200 dark:border-line"
          role="group"
          aria-label="Difficulty"
        >
          {(Object.keys(DIFFICULTIES) as DifficultyKey[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => changeDifficulty(d)}
              aria-pressed={difficulty === d}
              className={`px-3 py-2 text-sm font-medium first:rounded-l-lg last:rounded-r-lg ${
                difficulty === d
                  ? "bg-zinc-900 text-white dark:bg-mint dark:text-ink"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {DIFFICULTIES[d].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <Bomb className="h-4 w-4" aria-hidden />
            {minesLeft} mines
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Timer className="h-4 w-4" aria-hidden />
            {mm}:{ss}
          </span>
          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Restart
          </button>
        </div>
      </div>

      <div className="mt-3 flex w-full items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setFlagMode((f) => !f)}
          aria-pressed={flagMode}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
            flagMode
              ? "border-mint bg-mint-soft text-mint-dark dark:bg-mint/20 dark:text-mint"
              : "border-zinc-200 text-zinc-600 dark:border-line dark:text-zinc-300"
          }`}
        >
          <Flag className="h-4 w-4" aria-hidden />
          Flag mode {flagMode ? "on" : "off"}
        </button>
        <p className="text-xs text-zinc-500 dark:text-zinc-400" aria-live="polite">
          {status === "won"
            ? `You win! Cleared in ${mm}:${ss}.`
            : status === "lost"
              ? "Boom! You hit a mine."
              : status === "idle"
                ? "Click any cell to start — your first click is always safe."
                : "Right-click or long-press to flag a suspected mine."}
        </p>
      </div>

      <div
        className="mt-4 w-full overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-900/5 p-2 dark:border-line dark:bg-white/5"
        role="grid"
        aria-label={`Minesweeper board, ${cfg.label}`}
      >
        <div
          className="mx-auto grid w-max gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))` }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                role="gridcell"
                aria-label={
                  cell.revealed
                    ? cell.mine
                      ? "Mine"
                      : cell.adjacent > 0
                        ? `${cell.adjacent} neighbouring mines`
                        : "Empty cell"
                    : cell.flagged
                      ? "Flagged cell"
                      : `Hidden cell row ${r + 1} column ${c + 1}`
                }
                onClick={() => onCellClick(r, c)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(r, c);
                }}
                onTouchStart={() => onTouchStart(r, c)}
                onTouchEnd={onTouchEnd}
                onTouchMove={onTouchEnd}
                className={`flex h-7 w-7 items-center justify-center rounded-[4px] text-[13px] font-bold sm:h-8 sm:w-8 ${
                  cell.revealed
                    ? cell.mine
                      ? "bg-red-500 text-white"
                      : "bg-paper-panel dark:bg-panel-2 " +
                        NUMBER_COLORS[cell.adjacent]
                    : "bg-zinc-300 hover:bg-zinc-200 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                }`}
              >
                {cell.revealed ? (
                  cell.mine ? (
                    <Bomb className="h-4 w-4" aria-hidden />
                  ) : cell.adjacent > 0 ? (
                    cell.adjacent
                  ) : (
                    ""
                  )
                ) : cell.flagged ? (
                  <Flag className="h-3.5 w-3.5 text-rose-500" aria-hidden />
                ) : (
                  ""
                )}
              </button>
            )),
          )}
        </div>
      </div>

      {(status === "won" || status === "lost") && (
        <div className="mt-4 w-full rounded-xl border border-zinc-200 bg-paper-panel p-4 text-center dark:border-line dark:bg-panel">
          <p className="font-bold text-zinc-900 dark:text-white">
            {status === "won"
              ? `You cleared the field in ${mm}:${ss}!`
              : "Game over — you hit a mine."}
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
    </div>
  );
}
