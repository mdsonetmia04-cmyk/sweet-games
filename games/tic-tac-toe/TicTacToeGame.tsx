"use client";

import { useEffect, useState } from "react";
import { Bot, RotateCcw, Users } from "lucide-react";
import { sfx } from "@/lib/sound";
import {
  bestMove,
  getWinner,
  isDraw,
  type Board,
  type Difficulty,
  type Mark,
} from "./logic";

type Mode = "pvp" | "ai";

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [turn, setTurn] = useState<Mark>("X");
  const [mode, setMode] = useState<Mode>("ai");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const { winner, line } = getWinner(board);
  const draw = !winner && isDraw(board);
  const gameDone = Boolean(winner) || draw;

  const place = (i: number) => {
    if (board[i] !== null || gameDone) return;
    if (mode === "ai" && turn === "O") return; // computer's turn
    const next = [...board];
    next[i] = turn;
    setBoard(next);
    setTurn(turn === "X" ? "O" : "X");
    sfx.move();
  };

  // Record the result once when the game ends.
  useEffect(() => {
    if (winner) {
      setScores((s) => ({ ...s, [winner]: s[winner] + 1 }));
      sfx.win();
    } else if (draw) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
      sfx.click();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winner, draw]);

  // Computer move
  useEffect(() => {
    if (mode !== "ai" || turn !== "O" || gameDone) return;
    const id = setTimeout(() => {
      const idx = bestMove([...board], "O", difficulty);
      if (idx >= 0) {
        const next = [...board];
        next[idx] = "O";
        setBoard(next);
        setTurn("X");
        sfx.move();
      }
    }, 450);
    return () => clearTimeout(id);
  }, [mode, turn, board, difficulty, gameDone]);

  const restart = (resetScores = false) => {
    setBoard(Array(9).fill(null));
    setTurn("X");
    if (resetScores) setScores({ X: 0, O: 0, draws: 0 });
    sfx.click();
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setBoard(Array(9).fill(null));
    setTurn("X");
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center">
      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <div
          className="flex rounded-lg border border-zinc-200 dark:border-line"
          role="group"
          aria-label="Game mode"
        >
          <button
            type="button"
            onClick={() => switchMode("ai")}
            aria-pressed={mode === "ai"}
            className={`inline-flex items-center gap-1.5 rounded-l-lg px-3 py-2 text-sm font-medium ${
              mode === "ai"
                ? "bg-zinc-900 text-white dark:bg-mint dark:text-ink"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <Bot className="h-4 w-4" aria-hidden /> vs Computer
          </button>
          <button
            type="button"
            onClick={() => switchMode("pvp")}
            aria-pressed={mode === "pvp"}
            className={`inline-flex items-center gap-1.5 rounded-r-lg px-3 py-2 text-sm font-medium ${
              mode === "pvp"
                ? "bg-zinc-900 text-white dark:bg-mint dark:text-ink"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <Users className="h-4 w-4" aria-hidden /> 2 Players
          </button>
        </div>
        {mode === "ai" && (
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Difficulty
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as Difficulty);
                restart();
              }}
              className="h-9 rounded-lg border border-zinc-200 bg-paper-panel px-2 text-sm dark:border-line dark:bg-panel"
              aria-label="AI difficulty"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
        )}
      </div>

      <div
        className="mt-5 grid w-full max-w-[360px] grid-cols-3 gap-2"
        role="grid"
        aria-label="Tic Tac Toe board"
      >
        {board.map((cell, i) => {
          const inWin = line?.includes(i);
          return (
            <button
              key={i}
              type="button"
              role="gridcell"
              onClick={() => place(i)}
              disabled={cell !== null || gameDone}
              aria-label={
                cell ? `Cell ${i + 1}: ${cell}` : `Empty cell ${i + 1}`
              }
              className={`flex aspect-square items-center justify-center rounded-xl border text-4xl font-bold transition-colors sm:text-5xl ${
                inWin
                  ? "border-mint bg-mint-soft text-mint-dark dark:bg-mint/20 dark:text-mint"
                  : "border-zinc-200 bg-paper-panel text-zinc-900 hover:bg-zinc-100 dark:border-line dark:bg-panel dark:text-white dark:hover:bg-panel-2"
              }`}
            >
              {cell === "X" ? (
                <span className="text-zinc-900 dark:text-white">✕</span>
              ) : cell === "O" ? (
                <span className="text-mint-dark dark:text-mint">○</span>
              ) : (
                ""
              )}
            </button>
          );
        })}
      </div>

      <div
        className="mt-5 w-full rounded-xl border border-zinc-200 bg-paper-panel p-4 text-center dark:border-line dark:bg-panel"
        aria-live="polite"
      >
        {winner ? (
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {winner === "X" ? "X" : "O"} wins!
            {mode === "ai" && (winner === "O" ? " The computer wins this round." : " You win!")}
          </p>
        ) : draw ? (
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            It&apos;s a draw!
          </p>
        ) : (
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {mode === "ai" && turn === "O"
              ? "Computer is thinking…"
              : `Player ${turn}'s turn${mode === "ai" && turn === "X" ? " (you)" : ""}`}
          </p>
        )}
        <div className="mt-3 flex items-center justify-center gap-6 text-sm">
          <span>
            <span className="font-bold text-zinc-900 dark:text-white">X</span>
            <span className="text-zinc-500"> · {scores.X} wins</span>
          </span>
          <span>
            <span className="font-bold text-zinc-900 dark:text-white">Draws</span>
            <span className="text-zinc-500"> · {scores.draws}</span>
          </span>
          <span>
            <span className="font-bold text-zinc-900 dark:text-white">O</span>
            <span className="text-zinc-500"> · {scores.O} wins</span>
          </span>
        </div>
        <button
          type="button"
          onClick={() => restart()}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Restart round
        </button>
      </div>
    </div>
  );
}
