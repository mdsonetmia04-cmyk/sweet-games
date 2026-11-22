"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Pause, Play, RotateCcw, Trophy } from "lucide-react";
import { usePrefs } from "@/lib/store";
import { sfx } from "@/lib/sound";

const W = 480;
const H = 600;
const PADDLE_W = 92;
const PADDLE_H = 12;
const BALL_R = 8;
const BRICK_COLS = 8;
const BRICK_W = 52;
const BRICK_H = 22;
const BRICK_GAP = 6;
const BRICK_TOP = 64;

type Status = "idle" | "playing" | "paused" | "over" | "level-clear";

const BRICK_COLORS = ["#c2414a", "#c97a2e", "#d9a441", "#2f9e6e", "#3e7cb1"];

interface Brick {
  x: number;
  y: number;
  alive: boolean;
  color: string;
}

function buildBricks(level: number): Brick[] {
  const rows = Math.min(4 + level, 8);
  const bricks: Brick[] = [];
  const totalW = BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP;
  const startX = (W - totalW) / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: startX + c * (BRICK_W + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        alive: true,
        color: BRICK_COLORS[r % BRICK_COLORS.length],
      });
    }
  }
  return bricks;
}

export default function BrickBreakerGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paddleRef = useRef({ x: (W - PADDLE_W) / 2 });
  const ballRef = useRef({ x: W / 2, y: H - 60, dx: 3.4, dy: -3.8, stuck: true });
  const bricksRef = useRef<Brick[]>(buildBricks(1));
  const keysRef = useRef<Set<string>>(new Set());

  const [status, setStatus] = useState<Status>("idle");
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);

  const best = usePrefs((s) => s.highScores["brick-breaker"] ?? 0);
  const setHighScore = usePrefs((s) => s.setHighScore);

  const statusRef = useRef(status);
  statusRef.current = status;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const livesRef = useRef(lives);
  livesRef.current = lives;
  const levelRef = useRef(level);
  levelRef.current = level;

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#101214";
    ctx.fillRect(0, 0, W, H);
    for (const b of bricksRef.current) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, BRICK_W, BRICK_H, 4);
      ctx.fill();
    }
    // Paddle
    ctx.fillStyle = "#3ddc97";
    ctx.beginPath();
    ctx.roundRect(paddleRef.current.x, H - 32, PADDLE_W, PADDLE_H, 6);
    ctx.fill();
    // Ball
    const ball = ballRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
  };

  const resetBall = (stuck = true) => {
    const speed = 3.4 + levelRef.current * 0.3;
    ballRef.current = {
      x: paddleRef.current.x + PADDLE_W / 2,
      y: H - 44,
      dx: speed * (Math.random() > 0.5 ? 1 : -1),
      dy: -speed,
      stuck,
    };
  };

  const startGame = () => {
    paddleRef.current = { x: (W - PADDLE_W) / 2 };
    bricksRef.current = buildBricks(1);
    setScore(0);
    setLevel(1);
    setLives(3);
    resetBall(true);
    setStatus("playing");
    sfx.good();
  };

  const nextLevel = () => {
    const nl = levelRef.current + 1;
    setLevel(nl);
    bricksRef.current = buildBricks(nl);
    resetBall(true);
    setStatus("playing");
    sfx.win();
  };

  const loseLife = () => {
    const remaining = livesRef.current - 1;
    setLives(remaining);
    sfx.lose();
    if (remaining <= 0) {
      setStatus("over");
      setHighScore("brick-breaker", scoreRef.current);
    } else {
      resetBall(true);
    }
  };

  // Main loop
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (statusRef.current !== "playing") {
        draw();
        return;
      }
      const paddle = paddleRef.current;
      const ball = ballRef.current;
      const speed = 2.2;
      if (keysRef.current.has("ArrowLeft") || keysRef.current.has("a")) {
        paddle.x = Math.max(0, paddle.x - 6);
      }
      if (keysRef.current.has("ArrowRight") || keysRef.current.has("d")) {
        paddle.x = Math.min(W - PADDLE_W, paddle.x + 6);
      }
      if (ball.stuck) {
        ball.x = paddle.x + PADDLE_W / 2;
        ball.y = H - 44;
        draw();
        return;
      }
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x - BALL_R < 0 || ball.x + BALL_R > W) ball.dx = -ball.dx;
      if (ball.y - BALL_R < 0) ball.dy = -ball.dy;

      // Paddle collision
      if (
        ball.dy > 0 &&
        ball.y + BALL_R >= H - 32 &&
        ball.y + BALL_R <= H - 32 + PADDLE_H + 8 &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + PADDLE_W
      ) {
        const hit = (ball.x - (paddle.x + PADDLE_W / 2)) / (PADDLE_W / 2);
        const speedMag = Math.hypot(ball.dx, ball.dy);
        const angle = hit * (Math.PI / 3);
        ball.dx = speedMag * Math.sin(angle);
        ball.dy = -Math.abs(speedMag * Math.cos(angle));
        ball.y = H - 32 - BALL_R;
        sfx.click();
      }

      // Brick collision
      for (const b of bricksRef.current) {
        if (!b.alive) continue;
        if (
          ball.x + BALL_R > b.x &&
          ball.x - BALL_R < b.x + BRICK_W &&
          ball.y + BALL_R > b.y &&
          ball.y - BALL_R < b.y + BRICK_H
        ) {
          b.alive = false;
          ball.dy = -ball.dy;
          const ns = scoreRef.current + 10;
          setScore(ns);
          setHighScore("brick-breaker", ns);
          sfx.pop();
          break;
        }
      }

      if (ball.y - BALL_R > H) {
        loseLife();
      } else if (bricksRef.current.every((b) => !b.alive)) {
        const bonus = 100 * levelRef.current;
        const ns = scoreRef.current + bonus;
        setScore(ns);
        setHighScore("brick-breaker", ns);
        setStatus("level-clear");
        sfx.win();
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial draw
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard + visibility pause
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
      if (e.key === "p" || e.key === "P") {
        if (statusRef.current === "playing") setStatus("paused");
        else if (statusRef.current === "paused") setStatus("playing");
        return;
      }
      if (e.key === " ") {
        if (ballRef.current.stuck && statusRef.current === "playing") {
          ballRef.current.stuck = false;
        }
      }
      keysRef.current.add(e.key);
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    const onVisibility = () => {
      if (document.hidden && statusRef.current === "playing") setStatus("paused");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const pointerToPaddle = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    paddleRef.current.x = Math.max(
      0,
      Math.min(W - PADDLE_W, x - PADDLE_W / 2),
    );
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerToPaddle(e.clientX);
    if (ballRef.current.stuck && statusRef.current === "playing") {
      ballRef.current.stuck = false;
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons > 0 || e.pointerType === "touch") pointerToPaddle(e.clientX);
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
          <span>
            Score: <strong className="text-zinc-900 dark:text-white">{score}</strong>
          </span>
          <span>
            Level: <strong className="text-zinc-900 dark:text-white">{level}</strong>
          </span>
          <span className="flex items-center gap-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Heart
                key={i}
                className={`h-4 w-4 ${i < lives ? "fill-rose-500 text-rose-500" : "text-zinc-400"}`}
                aria-hidden
              />
            ))}
            <span className="sr-only">{lives} lives left</span>
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
            onClick={startGame}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            {status === "idle" ? "Start" : "Restart"}
          </button>
        </div>
      </div>

      <div className="relative mt-4 w-full max-w-[480px] touch-none select-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="h-auto w-full rounded-xl border border-zinc-700"
          role="img"
          aria-label="Brick Breaker game board"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        />
        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/60 p-4 text-center">
            {status === "over" ? (
              <>
                <p className="text-xl font-bold text-white">Game over</p>
                <p className="mt-1 text-sm text-zinc-300">
                  Score: {score} · Level: {level} · Best: {Math.max(best, score)}
                </p>
              </>
            ) : status === "level-clear" ? (
              <>
                <p className="text-xl font-bold text-white">
                  Level {level} cleared!
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Bonus +{100 * level} points. Ready for level {level + 1}?
                </p>
                <button
                  type="button"
                  onClick={nextLevel}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  <Play className="h-4 w-4" aria-hidden /> Next level
                </button>
              </>
            ) : status === "paused" ? (
              <p className="text-xl font-bold text-white">Paused</p>
            ) : (
              <>
                <p className="text-xl font-bold text-white">Brick Breaker</p>
                <p className="mt-1 max-w-[280px] text-sm text-zinc-300">
                  Move the paddle with your mouse, arrow keys, or touch.
                  Tap the board to launch the ball.
                </p>
                <button
                  type="button"
                  onClick={startGame}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink"
                >
                  <Play className="h-4 w-4" aria-hidden /> Start game
                </button>
              </>
            )}
            {status === "over" && (
              <button
                type="button"
                onClick={startGame}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-mint px-5 py-2.5 text-sm font-semibold text-ink"
              >
                <Play className="h-4 w-4" aria-hidden /> Play again
              </button>
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Mouse / drag / arrow keys to move · Space or tap to launch · P to pause
      </p>
    </div>
  );
}
