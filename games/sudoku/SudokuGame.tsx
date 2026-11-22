"use client";

import { useCallback, useEffect, useState } from "react";
import { Eraser, Lightbulb, Pencil, RotateCcw, Timer } from "lucide-react";
import { sfx } from "@/lib/sound";
import {
  generatePuzzle,
  isComplete,
  type Difficulty,
  type Grid,
} from "./logic";

type Status = "playing" | "won" | "lost";

const MAX_MISTAKES = 3;
const HINTS = 3;

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  // One matching puzzle/solution pair, generated once.
  const [pair, setPair] = useState(() => generatePuzzle("easy"));
  const { puzzle, solution } = pair;
  const [grid, setGrid] = useState<Grid>(() => pair.puzzle.map((r) => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [notesMode, setNotesMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [wrongCell, setWrongCell] = useState<string | null>(null);
  const [hintsLeft, setHintsLeft] = useState(HINTS);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState<Status>("playing");

  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const newPuzzle = useCallback((d: Difficulty) => {
    const next = generatePuzzle(d);
    setDifficulty(d);
    setPair(next);
    setGrid(next.puzzle.map((r) => [...r]));
    setSelected(null);
    setNotes({});
    setMistakes(0);
    setWrongCell(null);
    setHintsLeft(HINTS);
    setSeconds(0);
    setStatus("playing");
    sfx.click();
  }, []);

  const reset = useCallback(() => {
    setGrid(puzzle.map((r) => [...r]));
    setNotes({});
    setMistakes(0);
    setWrongCell(null);
    setHintsLeft(HINTS);
    setSeconds(0);
    setStatus("playing");
    sfx.click();
  }, [puzzle]);

  const enterNumber = useCallback(
    (n: number) => {
      if (!selected || status !== "playing") return;
      const [r, c] = selected;
      if (puzzle[r][c] !== 0) return; // given cell

      if (notesMode) {
        const key = `${r},${c}`;
        setNotes((prev) => {
          const cur = prev[key] ?? [];
          const next = cur.includes(n)
            ? cur.filter((x) => x !== n)
            : [...cur, n].sort();
          return { ...prev, [key]: next };
        });
        sfx.click();
        return;
      }

      if (solution[r][c] === n) {
        const next = grid.map((row) => [...row]);
        next[r][c] = n;
        setGrid(next);
        setNotes((prev) => {
          const copy = { ...prev };
          delete copy[`${r},${c}`];
          return copy;
        });
        setWrongCell(null);
        sfx.pop();
        if (isComplete(next, solution)) {
          setStatus("won");
          sfx.win();
        }
      } else {
        const m = mistakes + 1;
        setMistakes(m);
        setWrongCell(`${r},${c}`);
        sfx.lose();
        if (m >= MAX_MISTAKES) setStatus("lost");
      }
    },
    [selected, status, puzzle, notesMode, solution, grid, mistakes],
  );

  const clearCell = useCallback(() => {
    if (!selected || status !== "playing") return;
    const [r, c] = selected;
    if (puzzle[r][c] !== 0) return;
    const next = grid.map((row) => [...row]);
    next[r][c] = 0;
    setGrid(next);
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[`${r},${c}`];
      return copy;
    });
    setWrongCell(null);
    sfx.click();
  }, [selected, status, puzzle, grid]);

  const useHint = useCallback(() => {
    if (status !== "playing" || hintsLeft <= 0) return;
    const target = selected ?? (() => {
      for (let r = 0; r < 9; r++)
        for (let c = 0; c < 9; c++)
          if (grid[r][c] === 0) return [r, c] as [number, number];
      return null;
    })();
    if (!target) return;
    const [r, c] = target;
    if (puzzle[r][c] !== 0) return;
    const next = grid.map((row) => [...row]);
    next[r][c] = solution[r][c];
    setGrid(next);
    setHintsLeft((h) => h - 1);
    setSelected([r, c]);
    sfx.good();
    if (isComplete(next, solution)) {
      setStatus("won");
      sfx.win();
    }
  }, [status, hintsLeft, selected, grid, puzzle, solution]);

  // Keyboard input
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (status !== "playing") return;
      if (/^[1-9]$/.test(e.key)) enterNumber(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        clearCell();
      } else if (e.key === "n" || e.key === "N") {
        setNotesMode((m) => !m);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enterNumber, clearCell, status]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const selectedValue =
    selected && grid[selected[0]][selected[1]] !== 0
      ? grid[selected[0]][selected[1]]
      : null;

  const cellBorder = (r: number, c: number) => {
    const classes: string[] = [];
    if (r % 3 === 0) classes.push("border-t-2");
    if (c % 3 === 0) classes.push("border-l-2");
    if (r === 8) classes.push("border-b-2");
    if (c === 8) classes.push("border-r-2");
    return classes.join(" ");
  };

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div
          className="flex rounded-lg border border-zinc-200 dark:border-line"
          role="group"
          aria-label="Difficulty"
        >
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                if (
                  status === "playing" &&
                  grid.some((row, r) =>
                    row.some((v, c) => v !== puzzle[r][c]),
                  ) &&
                  !window.confirm("Start a new puzzle? Your progress will be lost.")
                ) {
                  return;
                }
                newPuzzle(d);
              }}
              aria-pressed={difficulty === d}
              className={`px-3 py-2 text-sm font-medium capitalize first:rounded-l-lg last:rounded-r-lg ${
                difficulty === d
                  ? "bg-zinc-900 text-white dark:bg-mint dark:text-ink"
                  : "text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <span className="inline-flex items-center gap-1.5">
            <Timer className="h-4 w-4" aria-hidden />
            {mm}:{ss}
          </span>
          <span>
            Mistakes:{" "}
            <strong className="text-zinc-900 dark:text-white">
              {mistakes}/{MAX_MISTAKES}
            </strong>
          </span>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset
          </button>
        </div>
      </div>

      <div
        className="mt-4 w-full max-w-[420px] overflow-hidden rounded-xl border-2 border-zinc-800 dark:border-zinc-200"
        role="grid"
        aria-label="Sudoku board"
      >
        {grid.map((row, r) => (
          <div key={r} className="grid grid-cols-9" role="row">
            {row.map((v, c) => {
              const isGiven = puzzle[r][c] !== 0;
              const isSelected =
                selected && selected[0] === r && selected[1] === c;
              const isSameValue = selectedValue !== null && v === selectedValue;
              const isWrong = wrongCell === `${r},${c}`;
              const noteList = notes[`${r},${c}`] ?? [];
              return (
                <button
                  key={c}
                  type="button"
                  role="gridcell"
                  aria-label={
                    v === 0
                      ? `Empty cell row ${r + 1} column ${c + 1}`
                      : `Cell row ${r + 1} column ${c + 1}: ${v}`
                  }
                  onClick={() => {
                    setSelected([r, c]);
                    sfx.click();
                  }}
                  className={`relative flex aspect-square items-center justify-center border border-zinc-300 text-lg font-semibold transition-colors dark:border-zinc-700 sm:text-xl ${cellBorder(r, c)} ${
                    isSelected
                      ? "bg-mint/30 dark:bg-mint/25"
                      : isSameValue
                        ? "bg-mint-soft dark:bg-mint/10"
                        : "bg-paper-panel dark:bg-panel"
                  } ${
                    isGiven
                      ? "text-zinc-900 dark:text-white"
                      : "text-mint-dark dark:text-mint"
                  } ${isWrong ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" : ""}`}
                >
                  {v !== 0 ? (
                    v
                  ) : noteList.length > 0 ? (
                    <span className="grid grid-cols-3 gap-0 p-0.5 text-[8px] font-medium leading-none text-zinc-500 dark:text-zinc-400 sm:text-[9px]">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <span key={n} className="text-center">
                          {noteList.includes(n) ? n : ""}
                        </span>
                      ))}
                    </span>
                  ) : (
                    ""
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {status !== "playing" && (
        <div
          className="mt-4 w-full rounded-xl border border-zinc-200 bg-paper-panel p-4 text-center dark:border-line dark:bg-panel"
          aria-live="polite"
        >
          <p className="font-bold text-zinc-900 dark:text-white">
            {status === "won"
              ? `Puzzle solved in ${mm}:${ss} — well done!`
              : "Three mistakes — the puzzle is over."}
          </p>
          <button
            type="button"
            onClick={() => newPuzzle(difficulty)}
            className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            New puzzle
          </button>
        </div>
      )}

      <div className="mt-4 flex w-full max-w-[420px] flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setNotesMode((m) => !m)}
          aria-pressed={notesMode}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
            notesMode
              ? "border-mint bg-mint-soft text-mint-dark dark:bg-mint/20 dark:text-mint"
              : "border-zinc-200 text-zinc-600 dark:border-line dark:text-zinc-300"
          }`}
        >
          <Pencil className="h-4 w-4" aria-hidden /> Notes {notesMode ? "on" : "off"}
        </button>
        <button
          type="button"
          onClick={useHint}
          disabled={hintsLeft <= 0 || status !== "playing"}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 disabled:opacity-40 dark:border-line dark:text-zinc-300"
        >
          <Lightbulb className="h-4 w-4" aria-hidden /> Hint ({hintsLeft})
        </button>
        <button
          type="button"
          onClick={clearCell}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 dark:border-line dark:text-zinc-300"
        >
          <Eraser className="h-4 w-4" aria-hidden /> Erase
        </button>
      </div>

      <div className="mt-3 grid w-full max-w-[420px] grid-cols-9 gap-1.5" role="group" aria-label="Number pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => enterNumber(n)}
            aria-label={`Enter ${n}`}
            className="flex aspect-square items-center justify-center rounded-lg border border-zinc-200 bg-paper-panel text-lg font-bold text-zinc-900 transition-colors hover:bg-zinc-100 active:bg-mint-soft dark:border-line dark:bg-panel dark:text-white dark:hover:bg-panel-2"
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Tap a cell, then a number (or keys 1–9) · N toggles notes · 3 mistakes
        ends the game
      </p>
    </div>
  );
}
