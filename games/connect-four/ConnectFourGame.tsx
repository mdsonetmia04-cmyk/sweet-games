"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { sfx } from "@/lib/sound";
import {
  COLS,
  ROWS,
  checkWin,
  dropDisc,
  emptyBoard,
  isBoardFull,
  isColumnFull,
  type Cell,
  type Player,
} from "./logic";

export default function ConnectFourGame() {
  const [board, setBoard] = useState<Cell[][]>(emptyBoard());
  const [turn, setTurn] = useState<Player>("R");
  const [winner, setWinner] = useState<Player | null>(null);
  const [winCells, setWinCells] = useState<[number, number][]>([]);
  const [draw, setDraw] = useState(false);
  const [hoverCol, setHoverCol] = useState<number | null>(null);
  const [scores, setScores] = useState({ R: 0, Y: 0, draws: 0 });

  const gameDone = Boolean(winner) || draw;

  const playColumn = (col: number) => {
    if (gameDone || isColumnFull(board, col)) return;
    const next = board.map((r) => [...r]);
    const row = dropDisc(next, col, turn);
    if (row < 0) return;
    setBoard(next);
    sfx.move();
    const res = checkWin(next, row, col);
    if (res.winner) {
      setWinner(res.winner);
      setWinCells(res.cells);
      setScores((s) => ({ ...s, [res.winner as Player]: s[res.winner as Player] + 1 }));
      sfx.win();
    } else if (isBoardFull(next)) {
      setDraw(true);
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      sfx.click();
    } else {
      setTurn(turn === "R" ? "Y" : "R");
    }
  };

  const restart = () => {
    setBoard(emptyBoard());
    setTurn("R");
    setWinner(null);
    setWinCells([]);
    setDraw(false);
    sfx.click();
  };

  const isWinCell = (r: number, c: number) =>
    winCells.some(([wr, wc]) => wr === r && wc === c);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center">
      <div
        className="flex w-full items-center justify-between gap-3"
        aria-live="polite"
      >
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
          {winner ? (
            <span className="text-base font-bold text-zinc-900 dark:text-white">
              {winner === "R" ? "Red" : "Yellow"} wins!
            </span>
          ) : draw ? (
            <span className="text-base font-bold text-zinc-900 dark:text-white">
              It&apos;s a draw!
            </span>
          ) : (
            <>
              Turn:{" "}
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full align-middle ${
                  turn === "R" ? "bg-red-500" : "bg-amber-400"
                }`}
                aria-hidden
              />{" "}
              <span className="font-bold text-zinc-900 dark:text-white">
                {turn === "R" ? "Red" : "Yellow"}
              </span>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Restart
        </button>
      </div>

      <div className="mt-4 w-full rounded-2xl border border-zinc-300 bg-[#2f6db3] p-2.5 dark:border-zinc-700 sm:p-3">
        {/* Column buttons */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {Array.from({ length: COLS }, (_, c) => (
            <button
              key={c}
              type="button"
              onClick={() => playColumn(c)}
              onMouseEnter={() => setHoverCol(c)}
              onMouseLeave={() => setHoverCol(null)}
              disabled={gameDone || isColumnFull(board, c)}
              aria-label={`Drop disc in column ${c + 1}`}
              className="flex h-6 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/20 disabled:opacity-30"
            >
              {hoverCol === c && !gameDone ? (
                <span
                  className={`block h-4 w-4 rounded-full ${
                    turn === "R" ? "bg-red-500" : "bg-amber-400"
                  }`}
                  aria-hidden
                />
              ) : (
                <span className="text-xs font-bold" aria-hidden>↓</span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-1.5 grid grid-rows-6 gap-1.5 sm:gap-2" role="grid" aria-label="Connect Four board">
          {board.map((row, r) => (
            <div key={r} className="grid grid-cols-7 gap-1.5 sm:gap-2" role="row">
              {row.map((cell, c) => (
                <div
                  key={c}
                  role="gridcell"
                  aria-label={
                    cell
                      ? `${cell === "R" ? "Red" : "Yellow"} disc`
                      : "Empty slot"
                  }
                  className={`flex aspect-square items-center justify-center rounded-full bg-[#245a94] ${
                    isWinCell(r, c) ? "ring-4 ring-mint" : ""
                  }`}
                >
                  {cell && (
                    <span
                      className={`block h-[86%] w-[86%] rounded-full shadow-inner ${
                        cell === "R" ? "bg-red-500" : "bg-amber-400"
                      }`}
                      aria-hidden
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-300">
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-full bg-red-500 align-middle" aria-hidden />
          Red: <strong className="text-zinc-900 dark:text-white">{scores.R}</strong>
        </span>
        <span>
          Draws: <strong className="text-zinc-900 dark:text-white">{scores.draws}</strong>
        </span>
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-full bg-amber-400 align-middle" aria-hidden />
          Yellow: <strong className="text-zinc-900 dark:text-white">{scores.Y}</strong>
        </span>
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Tap a column to drop your disc · First to connect four wins
      </p>
    </div>
  );
}
