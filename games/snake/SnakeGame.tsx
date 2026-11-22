"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Trophy } from "lucide-react";
import { usePrefs } from "@/lib/store";
import { sfx } from "@/lib/sound";

const GRID = 20;
const CELL = 20;
const SIZE = GRID * CELL;

type Point = { x: number; y: number };
type Status = "idle" | "playing" | "paused" | "over";

function randomFood(snake: Point[]): Point {
  for (;;) {
    const p = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
    if (!snake.some((s) => s.x === p.x && s.y === p.y)) return p;
  }
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>([{ x: 10, y: 10 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const pendingRef = useRef<Point | null>(null);
  const foodRef = useRef<Point>(randomFood([{ x: 10, y: 10 }]));
  const touchRef = useRef<Point | null>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(150);
  const best = usePrefs((s) => s.highScores["snake"] ?? 0);
  const setHighScore = usePrefs((s) => s.setHighScore);

  const statusRef = useRef(status);
  statusRef.current = status;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#101214";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(SIZE, i * CELL);
      ctx.stroke();
    }
    const food = foodRef.current;
    ctx.fillStyle = "#e5484d";
    ctx.beginPath();
    ctx.arc(
      food.x * CELL + CELL / 2,
      food.y * CELL + CELL / 2,
      CELL / 2 - 3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#3ddc97" : "#2aa876";
      const pad = 1;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL + pad,
        seg.y * CELL + pad,
        CELL - pad * 2,
        CELL - pad * 2,
        5,
      );
      ctx.fill();
    });
  };

  const reset = () => {
    snakeRef.current = [{ x: 10, y: 10 }];
    dirRef.current = { x: 1, y: 0 };
    pendingRef.current = null;
    foodRef.current = randomFood(snakeRef.current);
    setScore(0);
    setSpeed(150);
    setStatus("idle");
    draw();
  };

  const start = () => {
    reset();
    setStatus("playing");
    sfx.good();
  };

  const gameOver = () => {
    setStatus("over");
    setHighScore("snake", scoreRef.current);
    sfx.lose();
  };

  // Game loop
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      if (pendingRef.current) {
        dirRef.current = pendingRef.current;
        pendingRef.current = null;
      }
      const head = snakeRef.current[0];
      const next = {
        x: head.x + dirRef.current.x,
        y: head.y + dirRef.current.y,
      };
      const hitWall =
        next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID;
      const hitSelf = snakeRef.current.some(
        (s) => s.x === next.x && s.y === next.y,
      );
      if (hitWall || hitSelf) {
        gameOver();
        return;
      }
      snakeRef.current.unshift(next);
      if (next.x === foodRef.current.x && next.y === foodRef.current.y) {
        const newScore = scoreRef.current + 10;
        setScore(newScore);
        sfx.pop();
        setSpeed((s) => Math.max(75, s - 4));
        foodRef.current = randomFood(snakeRef.current);
      } else {
        snakeRef.current.pop();
      }
      draw();
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, speed]);

  // Initial draw
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (statusRef.current !== "playing") return;
      const dir = dirRef.current;
      const set = (d: Point) => {
        if (d.x !== -dir.x || d.y !== -dir.y) pendingRef.current = d;
        e.preventDefault();
      };
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") set({ x: 0, y: -1 });
      else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") set({ x: 0, y: 1 });
      else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") set({ x: -1, y: 0 });
      else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") set({ x: 1, y: 0 });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Pause on P and when the tab is hidden
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (statusRef.current === "playing") {
          setStatus("paused");
          sfx.click();
        } else if (statusRef.current === "paused") {
          setStatus("playing");
          sfx.click();
        }
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
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    if (!start || statusRef.current !== "playing") return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
    const dir = dirRef.current;
    const next =
      Math.abs(dx) > Math.abs(dy)
        ? { x: Math.sign(dx), y: 0 }
        : { x: 0, y: Math.sign(dy) };
    if (next.x !== -dir.x || next.y !== -dir.y) pendingRef.current = next;
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
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

      <div
        className="relative mt-4 w-full max-w-[400px] touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="h-auto w-full rounded-xl border border-zinc-700"
          aria-label="Snake game board"
          role="img"
        />
        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/60 p-4 text-center">
            {status === "over" ? (
              <>
                <p className="text-xl font-bold text-white">Game over</p>
                <p className="mt-1 text-sm text-zinc-300">
                  Score: {score} · Best: {Math.max(best, score)}
                </p>
              </>
            ) : status === "paused" ? (
              <p className="text-xl font-bold text-white">Paused</p>
            ) : (
              <>
                <p className="text-xl font-bold text-white">Snake Arena</p>
                <p className="mt-1 max-w-[260px] text-sm text-zinc-300">
                  Steer with arrow keys, WASD, or swipe. Eat the red food and
                  don&apos;t crash.
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
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Arrow keys / WASD or swipe to steer · P to pause · Speed increases as
        you eat
      </p>
    </div>
  );
}
