"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowDownToLine,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Trophy,
} from "lucide-react";
import { usePrefs } from "@/lib/store";
import { sfx } from "@/lib/sound";
import {
  COLS,
  ROWS,
  SHAPES,
  SHAPE_COLORS,
  clearLines,
  collides,
  emptyBoard,
  levelForLines,
  merge,
  rotate,
  scoreForLines,
  shuffledBag,
  speedForLevel,
  type Board,
  type Matrix,
  type ShapeKey,
} from "./logic";

type Status = "idle" | "playing" | "paused" | "over";

interface Piece {
  key: ShapeKey;
  matrix: Matrix;
  x: number;
  y: number;
}

function spawnPiece(key: ShapeKey): Piece {
  const matrix = SHAPES[key];
  return {
    key,
    matrix,
    x: Math.floor((COLS - matrix[0].length) / 2),
    y: 0,
  };
}

export default function BlockDropGame() {
  const [board, setBoard] = useState<Board>(emptyBoard());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [queue, setQueue] = useState<ShapeKey[]>([]);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState<Status>("idle");

  const best = usePrefs((s) => s.highScores["block-drop"] ?? 0);
  const setHighScore = usePrefs((s) => s.setHighScore);

  const boardRef = useRef(board);
  boardRef.current = board;
  const pieceRef = useRef(piece);
  pieceRef.current = piece;
  const queueRef = useRef(queue);
  queueRef.current = queue;
  const statusRef = useRef(status);
  statusRef.current = status;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const linesRef = useRef(lines);
  linesRef.current = lines;

  const drawPiece = useCallback(
    (brd: Board, p: Piece | null): (ShapeKey | 0)[][] => {
      const view = brd.map((row) => [...row]);
      if (p) {
        p.matrix.forEach((row, r) => {
          row.forEach((v, c) => {
            const y = p.y + r;
            const x = p.x + c;
            if (v && y >= 0 && y < ROWS && x >= 0 && x < COLS) {
              view[y][x] = p.key;
            }
          });
        });
      }
      return view;
    },
    [],
  );

  const takeNext = useCallback((): { key: ShapeKey; rest: ShapeKey[] } => {
    let q = queueRef.current;
    if (q.length < 7) q = [...q, ...shuffledBag()];
    const [key, ...rest] = q;
    return { key, rest };
  }, []);

  const lockPiece = useCallback(() => {
    const p = pieceRef.current;
    if (!p) return;
    const merged = merge(boardRef.current, p.matrix, p.x, p.y, p.key);
    const { board: cleared, cleared: clearedCount } = clearLines(merged);
    let newScore = scoreRef.current;
    let newLines = linesRef.current;
    if (clearedCount > 0) {
      const lvl = levelForLines(newLines);
      newScore += scoreForLines(clearedCount, lvl);
      newLines += clearedCount;
      setScore(newScore);
      setLines(newLines);
      setLevel(levelForLines(newLines));
      setHighScore("block-drop", newScore);
      sfx.good();
    } else {
      sfx.move();
    }
    setBoard(cleared);
    const { key, rest } = takeNext();
    setQueue(rest);
    const next = spawnPiece(key);
    if (collides(cleared, next.matrix, next.x, next.y)) {
      setPiece(null);
      setStatus("over");
      setHighScore("block-drop", newScore);
      sfx.lose();
    } else {
      setPiece(next);
    }
  }, [setHighScore, takeNext]);

  const start = useCallback(() => {
    const bag = shuffledBag();
    const [first, ...rest] = bag;
    setBoard(emptyBoard());
    setQueue(rest);
    setPiece(spawnPiece(first));
    setScore(0);
    setLines(0);
    setLevel(1);
    setStatus("playing");
    sfx.good();
  }, []);

  // Gravity loop
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      const p = pieceRef.current;
      if (!p) return;
      if (!collides(boardRef.current, p.matrix, p.x, p.y + 1)) {
        setPiece({ ...p, y: p.y + 1 });
      } else {
        lockPiece();
      }
    }, speedForLevel(level));
    return () => clearInterval(id);
  }, [status, level, lockPiece]);

  const movePiece = useCallback(
    (dx: number) => {
      const p = pieceRef.current;
      if (!p || statusRef.current !== "playing") return;
      if (!collides(boardRef.current, p.matrix, p.x + dx, p.y)) {
        setPiece({ ...p, x: p.x + dx });
        sfx.click();
      }
    },
    [],
  );

  const rotatePiece = useCallback(() => {
    const p = pieceRef.current;
    if (!p || statusRef.current !== "playing") return;
    const rotated = rotate(p.matrix);
    // Simple wall kicks: try the rotated shape at nearby x positions.
    for (const dx of [0, -1, 1, -2, 2]) {
      if (!collides(boardRef.current, rotated, p.x + dx, p.y)) {
        setPiece({ ...p, matrix: rotated, x: p.x + dx });
        sfx.click();
        return;
      }
    }
  }, []);

  const softDrop = useCallback(() => {
    const p = pieceRef.current;
    if (!p || statusRef.current !== "playing") return;
    if (!collides(boardRef.current, p.matrix, p.x, p.y + 1)) {
      setPiece({ ...p, y: p.y + 1 });
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  const hardDrop = useCallback(() => {
    const p = pieceRef.current;
    if (!p || statusRef.current !== "playing") return;
    let y = p.y;
    while (!collides(boardRef.current, p.matrix, p.x, y + 1)) y++;
    setPiece({ ...p, y });
    // Lock on the next tick by forcing a lock now.
    setTimeout(() => {
      const cur = pieceRef.current;
      if (cur && cur.y === y) lockPiece();
    }, 0);
    sfx.pop();
  }, [lockPiece]);

  // Keyboard controls + pause on tab hide
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (statusRef.current === "idle" || statusRef.current === "over") return;
      if (e.key === "p" || e.key === "P") {
        setStatus(statusRef.current === "playing" ? "paused" : "playing");
        return;
      }
      if (statusRef.current !== "playing") return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        movePiece(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        movePiece(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        softDrop();
      } else if (e.key === "ArrowUp" || e.key === "x" || e.key === "X") {
        e.preventDefault();
        rotatePiece();
      } else if (e.key === " ") {
        e.preventDefault();
        hardDrop();
      }
    };
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "playing") {
        setStatus("paused");
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [movePiece, rotatePiece, softDrop, hardDrop]);

  const view = drawPiece(board, piece);
  const nextKey = queue[0];
  const nextMatrix = nextKey ? SHAPES[nextKey] : null;

  const cellBtn =
    "flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-200 bg-paper-panel text-zinc-700 active:bg-zinc-200 dark:border-line dark:bg-panel dark:text-zinc-200 dark:active:bg-panel-2";

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <span>
            Score:{" "}
            <strong className="text-zinc-900 dark:text-white">{score}</strong>
          </span>
          <span>
            Level:{" "}
            <strong className="text-zinc-900 dark:text-white">{level}</strong>
          </span>
          <span>
            Lines:{" "}
            <strong className="text-zinc-900 dark:text-white">{lines}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-mint-dark dark:text-mint" aria-hidden />
            Best: {Math.max(best, score)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {status === "playing" ? (
            <button
              type="button"
              onClick={() => setStatus("paused")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-paper px-3 py-2 text-sm font-medium dark:border-line dark:bg-ink"
              aria-label="Pause game"
            >
              <Pause className="h-4 w-4" aria-hidden /> Pause
            </button>
          ) : status === "paused" ? (
            <button
              type="button"
              onClick={() => setStatus("playing")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-mint px-3 py-2 text-sm font-semibold text-ink"
              aria-label="Resume game"
            >
              <Play className="h-4 w-4" aria-hidden /> Resume
            </button>
          ) : null}
          <button
            type="button"
            onClick={start}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {status === "idle" ? "Start" : "Restart"}
          </button>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
        <div className="relative w-full max-w-[280px]">
          <div
            className="grid grid-cols-10 gap-[2px] rounded-xl border border-zinc-700 bg-[#14171a] p-1.5"
            role="grid"
            aria-label="Block Drop board"
          >
            {view.flat().map((cell, i) => (
              <div
                key={i}
                role="gridcell"
                className="aspect-square rounded-[3px]"
                style={{
                  backgroundColor:
                    cell === 0 ? "rgba(255,255,255,0.05)" : SHAPE_COLORS[cell],
                }}
              />
            ))}
          </div>
          {status !== "playing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/60 p-4 text-center">
              {status === "over" ? (
                <>
                  <p className="text-xl font-bold text-white">Game over</p>
                  <p className="mt-1 text-sm text-zinc-300">
                    Score: {score} · Lines: {lines} · Best: {Math.max(best, score)}
                  </p>
                </>
              ) : status === "paused" ? (
                <p className="text-xl font-bold text-white">Paused</p>
              ) : (
                <>
                  <p className="text-xl font-bold text-white">Block Drop</p>
                  <p className="mt-1 max-w-[240px] text-sm text-zinc-300">
                    Stack the falling blocks and clear complete lines.
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={start}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink"
              >
                <Play className="h-4 w-4" aria-hidden />
                {status === "idle" ? "Start game" : "Play again"}
              </button>
            </div>
          )}
        </div>

        <div className="flex w-full max-w-[280px] flex-col items-center gap-4 sm:w-36">
          <div className="w-full rounded-xl border border-zinc-200 bg-paper-panel p-3 text-center dark:border-line dark:bg-panel">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Next
            </p>
            <div className="mx-auto mt-2 grid w-max grid-cols-4 gap-[2px]">
              {nextMatrix ? (
                nextMatrix.map((row, r) =>
                  row.map((v, c) => (
                    <div
                      key={`${r}-${c}`}
                      className="h-4 w-4 rounded-[2px]"
                      style={{
                        backgroundColor: v
                          ? SHAPE_COLORS[nextKey as ShapeKey]
                          : "transparent",
                      }}
                    />
                  )),
                )
              ) : (
                <span className="text-sm text-zinc-400">—</span>
              )}
            </div>
          </div>
          <div className="grid w-full grid-cols-5 gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => movePiece(-1)} className={cellBtn} aria-label="Move left">
              <ArrowLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={rotatePiece} className={cellBtn} aria-label="Rotate block">
              <RotateCw className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={() => movePiece(1)} className={cellBtn} aria-label="Move right">
              <ArrowRight className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={softDrop} className={cellBtn} aria-label="Soft drop">
              <ArrowDown className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" onClick={hardDrop} className={cellBtn} aria-label="Hard drop">
              <ArrowDownToLine className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <p className="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            ← → move · ↑ rotate · ↓ soft drop · Space hard drop · P pause
          </p>
        </div>
      </div>
    </div>
  );
}
