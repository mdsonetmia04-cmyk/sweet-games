"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Dices, Play, RotateCcw, Trophy, User } from "lucide-react";
import { sfx } from "@/lib/sound";
import {
  COLOR_HEX,
  COLOR_LABEL,
  COLORS,
  SAFE_CELLS,
  START_INDEX,
  applyMove,
  applyRoll,
  createGame,
  currentPlayer,
  movableTokens,
  passTurn,
  rollDice,
  trackIndex,
  type LudoColor,
  type LudoState,
  type PlayerConfig,
} from "./logic";

/** Shared 52-cell track: [row, col] for path index 0..51. */
const PATH: [number, number][] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6],
  [1, 6], [0, 6], [0, 7], [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8],
  [12, 8], [13, 8], [14, 8], [14, 7], [14, 6], [13, 6], [12, 6], [11, 6],
  [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0],
  [6, 0],
];

const HOME_CELLS: Record<LudoColor, [number, number][]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
};

const YARD_ORIGIN: Record<LudoColor, [number, number]> = {
  red: [0, 0],
  green: [0, 9],
  yellow: [9, 9],
  blue: [9, 0],
};

const YARD_SLOTS: [number, number][] = [
  [1, 1],
  [1, 4],
  [4, 1],
  [4, 4],
];

const DICE_PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiceFace({ value }: { value: number | null }) {
  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-xl border border-zinc-300 bg-white shadow-sm dark:border-zinc-600 dark:bg-zinc-100"
      aria-label={value ? `Dice showing ${value}` : "Dice not rolled yet"}
      role="img"
    >
      {value ? (
        <div className="grid h-10 w-10 grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} className="flex items-center justify-center">
              {DICE_PIPS[value].includes(i) && (
                <span className="block h-2.5 w-2.5 rounded-full bg-zinc-900" />
              )}
            </span>
          ))}
        </div>
      ) : (
        <Dices className="h-7 w-7 text-zinc-400" aria-hidden />
      )}
    </div>
  );
}

export default function LudoGame() {
  const [game, setGame] = useState<LudoState | null>(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [computerFlags, setComputerFlags] = useState<boolean[]>([
    false,
    true,
    true,
    true,
  ]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startGame = () => {
    const players: PlayerConfig[] = COLORS.slice(0, playerCount).map(
      (color, i) => ({
        color,
        isComputer: i === 0 ? false : computerFlags[i],
      }),
    );
    setGame(createGame(players));
    sfx.good();
  };

  const newGame = () => {
    setGame(null);
    sfx.click();
  };

  const roll = useCallback(() => {
    setGame((g) => {
      if (!g || g.phase !== "roll") return g;
      const d = rollDice();
      sfx.dice();
      const res = applyRoll(g, d);
      return res.state;
    });
  }, []);

  const moveToken = useCallback((tokenIdx: number) => {
    setGame((g) => {
      if (!g || g.phase !== "move" || g.dice === null) return g;
      const player = currentPlayer(g);
      if (!movableTokens(g, player.color, g.dice).includes(tokenIdx)) return g;
      const res = applyMove(g, player.color, tokenIdx, g.dice);
      if (res.captured || res.finished) sfx.good();
      else sfx.move();
      if (res.state.phase === "over") sfx.win();
      return res.state;
    });
  }, []);

  // Auto-pass when the current player has no legal move.
  useEffect(() => {
    if (!game || game.phase !== "move" || game.dice === null) return;
    const player = currentPlayer(game);
    if (movableTokens(game, player.color, game.dice).length > 0) return;
    const id = setTimeout(() => {
      setGame((g) => (g && g.phase === "move" ? passTurn(g) : g));
    }, 1100);
    return () => clearTimeout(id);
  }, [game]);

  // Computer players act automatically.
  useEffect(() => {
    if (!game || game.phase === "over") return;
    const player = currentPlayer(game);
    if (!player.isComputer) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (game.phase === "roll") {
      timerRef.current = setTimeout(roll, 900);
    } else if (game.phase === "move" && game.dice !== null) {
      timerRef.current = setTimeout(() => {
        setGame((g) => {
          if (!g || g.phase !== "move" || g.dice === null) return g;
          const p = currentPlayer(g);
          const movable = movableTokens(g, p.color, g.dice);
          if (movable.length === 0) return g;
          // Simple AI: prefer captures, then finishing, then leaving the yard.
          let bestIdx = movable[0];
          let bestScore = -Infinity;
          for (const idx of movable) {
            const res = applyMove(g, p.color, idx, g.dice);
            let score = res.state.tokens[p.color][idx];
            if (res.captured) score += 100;
            if (res.finished) score += 50;
            if (g.tokens[p.color][idx] === -1) score += 20;
            if (score > bestScore) {
              bestScore = score;
              bestIdx = idx;
            }
          }
          const res = applyMove(g, p.color, bestIdx, g.dice);
          if (res.state.phase === "over") sfx.win();
          else if (res.captured || res.finished) sfx.good();
          else sfx.move();
          return res.state;
        });
      }, 800);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [game, roll]);

  // ---- Board rendering data ----
  const tokensByKey = useMemo(() => {
    const map = new Map<string, { color: LudoColor; idx: number }[]>();
    if (!game) return map;
    const add = (key: string, color: LudoColor, idx: number) => {
      const list = map.get(key) ?? [];
      list.push({ color, idx });
      map.set(key, list);
    };
    for (const p of game.players) {
      game.tokens[p.color].forEach((progress, idx) => {
        if (progress === -1) {
          add(`yard-${p.color}-${idx}`, p.color, idx);
        } else if (progress >= 0 && progress <= 50) {
          const ti = trackIndex(p.color, progress);
          if (ti !== null) add(`path-${ti}`, p.color, idx);
        } else if (progress >= 51 && progress <= 55) {
          add(`home-${p.color}-${progress - 51}`, p.color, idx);
        } else {
          add("center", p.color, idx);
        }
      });
    }
    return map;
  }, [game]);

  const movable =
    game && game.phase === "move" && game.dice !== null
      ? movableTokens(game, currentPlayer(game).color, game.dice)
      : [];
  const isHumanTurn =
    game !== null &&
    game.phase !== "over" &&
    !currentPlayer(game).isComputer;

  if (!game) {
    return (
      <div className="mx-auto max-w-lg">
        <h2 className="text-center text-xl font-bold text-zinc-900 dark:text-white">
          Set up your Ludo game
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Choose how many players, and whether each one is a human or the
          computer. Red always plays first.
        </p>
        <div className="mt-6">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            Number of players
          </p>
          <div className="mt-2 flex gap-2" role="group" aria-label="Number of players">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPlayerCount(n)}
                aria-pressed={playerCount === n}
                className={`h-11 flex-1 rounded-lg border text-sm font-semibold ${
                  playerCount === n
                    ? "border-mint bg-mint-soft text-mint-dark dark:bg-mint/20 dark:text-mint"
                    : "border-zinc-200 text-zinc-600 dark:border-line dark:text-zinc-300"
                }`}
              >
                {n} players
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {COLORS.slice(0, playerCount).map((color, i) => (
            <div
              key={color}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-paper-panel p-3 dark:border-line dark:bg-panel"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                <span
                  className="block h-4 w-4 rounded-full"
                  style={{ backgroundColor: COLOR_HEX[color] }}
                  aria-hidden
                />
                {COLOR_LABEL[color]}
                {i === 0 && " (you)"}
              </span>
              {i === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500">
                  <User className="h-4 w-4" aria-hidden /> Human
                </span>
              ) : (
                <div className="flex rounded-lg border border-zinc-200 dark:border-line" role="group" aria-label={`${COLOR_LABEL[color]} player type`}>
                  <button
                    type="button"
                    onClick={() =>
                      setComputerFlags((f) => {
                        const next = [...f];
                        next[i] = false;
                        return next;
                      })
                    }
                    aria-pressed={!computerFlags[i]}
                    className={`inline-flex items-center gap-1 rounded-l-lg px-2.5 py-1.5 text-xs font-medium ${
                      !computerFlags[i]
                        ? "bg-zinc-900 text-white dark:bg-mint dark:text-ink"
                        : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" aria-hidden /> Human
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setComputerFlags((f) => {
                        const next = [...f];
                        next[i] = true;
                        return next;
                      })
                    }
                    aria-pressed={computerFlags[i]}
                    className={`inline-flex items-center gap-1 rounded-r-lg px-2.5 py-1.5 text-xs font-medium ${
                      computerFlags[i]
                        ? "bg-zinc-900 text-white dark:bg-mint dark:text-ink"
                        : "text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    <Bot className="h-3.5 w-3.5" aria-hidden /> Computer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={startGame}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
        >
          <Play className="h-4 w-4" aria-hidden /> Start game
        </button>
      </div>
    );
  }

  const player = currentPlayer(game);
  const centerTokens = tokensByKey.get("center") ?? [];

  const renderToken = (
    color: LudoColor,
    idx: number,
    small = false,
  ) => {
    const isMovable =
      isHumanTurn &&
      game.phase === "move" &&
      color === player.color &&
      movable.includes(idx);
    return (
      <button
        key={`${color}-${idx}`}
        type="button"
        onClick={() => isMovable && moveToken(idx)}
        disabled={!isMovable}
        aria-label={
          isMovable
            ? `Move ${COLOR_LABEL[color]} token ${idx + 1}`
            : `${COLOR_LABEL[color]} token ${idx + 1}`
        }
        className={`flex items-center justify-center rounded-full border-2 border-white shadow ${
          small ? "h-4 w-4 sm:h-5 sm:w-5" : "h-6 w-6 sm:h-7 sm:w-7"
        } ${isMovable ? "animate-pulse cursor-pointer ring-2 ring-mint" : ""}`}
        style={{ backgroundColor: COLOR_HEX[color] }}
      />
    );
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center">
      {/* Turn + dice bar */}
      <div className="flex w-full flex-wrap items-center justify-between gap-3">
        <div
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-paper-panel px-3 py-2 dark:border-line dark:bg-panel"
          aria-live="polite"
        >
          <span
            className="block h-4 w-4 rounded-full"
            style={{ backgroundColor: COLOR_HEX[player.color] }}
            aria-hidden
          />
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
            {COLOR_LABEL[player.color]}
            {player.isComputer ? " (computer)" : ""}
          </span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {game.phase === "over"
              ? "wins!"
              : game.phase === "roll"
                ? "— roll the dice"
                : game.dice !== null
                  ? movable.length > 0
                    ? "— pick a highlighted token"
                    : "— no possible move"
                  : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <DiceFace value={game.dice} />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={roll}
              disabled={!isHumanTurn || game.phase !== "roll"}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 dark:bg-mint dark:text-ink"
            >
              <Dices className="h-4 w-4" aria-hidden /> Roll dice
            </button>
            <button
              type="button"
              onClick={newGame}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-line dark:text-zinc-300"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden /> New game
            </button>
          </div>
        </div>
      </div>

      <p className="mt-3 w-full text-center text-sm text-zinc-600 dark:text-zinc-400" aria-live="polite">
        {game.message}
      </p>

      {/* Board */}
      <div
        className="mt-3 grid w-full max-w-[520px] grid-cols-[repeat(15,minmax(0,1fr))] overflow-hidden rounded-2xl border-2 border-zinc-800 bg-white dark:border-zinc-600"
        role="grid"
        aria-label="Ludo board"
      >
        {/* Yard areas */}
        {game.players.map((p) => {
          const [or, oc] = YARD_ORIGIN[p.color];
          return (
            <div
              key={`yard-${p.color}`}
              className="relative flex items-center justify-center"
              style={{
                gridColumn: `${oc + 1} / span 6`,
                gridRow: `${or + 1} / span 6`,
                backgroundColor: COLOR_HEX[p.color],
              }}
            >
              <div className="grid h-3/4 w-3/4 grid-cols-2 gap-2 rounded-lg bg-white p-2 dark:bg-zinc-100">
                {YARD_SLOTS.map((_, slot) => {
                  const tokens = tokensByKey.get(`yard-${p.color}-${slot}`) ?? [];
                  return (
                    <div
                      key={slot}
                      className="flex items-center justify-center rounded-full border-2"
                      style={{ borderColor: COLOR_HEX[p.color] }}
                    >
                      {tokens.map((t) => renderToken(t.color, t.idx))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Path cells */}
        {PATH.map(([r, c], i) => {
          const tokens = tokensByKey.get(`path-${i}`) ?? [];
          const startColor = (Object.keys(START_INDEX) as LudoColor[]).find(
            (col) => START_INDEX[col] === i,
          );
          const isSafe = SAFE_CELLS.has(i);
          return (
            <div
              key={`path-${i}`}
              className="relative flex aspect-square items-center justify-center border border-zinc-300"
              style={{
                gridColumn: c + 1,
                gridRow: r + 1,
                backgroundColor: startColor ? COLOR_HEX[startColor] : "#ffffff",
              }}
            >
              {isSafe && !startColor && (
                <span className="text-[10px] leading-none text-zinc-500 sm:text-xs" aria-hidden>
                  ★
                </span>
              )}
              <span className="absolute inset-0 flex flex-wrap items-center justify-center gap-px p-px">
                {tokens.map((t) => renderToken(t.color, t.idx, tokens.length > 1))}
              </span>
            </div>
          );
        })}

        {/* Home columns */}
        {(Object.keys(HOME_CELLS) as LudoColor[]).map((color) =>
          HOME_CELLS[color].map(([r, c], i) => {
            const tokens = tokensByKey.get(`home-${color}-${i}`) ?? [];
            return (
              <div
                key={`home-${color}-${i}`}
                className="relative flex aspect-square items-center justify-center border border-zinc-300"
                style={{
                  gridColumn: c + 1,
                  gridRow: r + 1,
                  backgroundColor: COLOR_HEX[color],
                  opacity: 0.85,
                }}
              >
                <span className="absolute inset-0 flex flex-wrap items-center justify-center gap-px p-px">
                  {tokens.map((t) => renderToken(t.color, t.idx, tokens.length > 1))}
                </span>
              </div>
            );
          }),
        )}

        {/* Centre */}
        <div
          className="relative flex items-center justify-center"
          style={{ gridColumn: "7 / span 3", gridRow: "7 / span 3" }}
        >
          <div className="grid h-full w-full grid-cols-2 grid-rows-2">
            {COLORS.map((color) => (
              <div
                key={color}
                style={{ backgroundColor: COLOR_HEX[color] }}
                className="flex items-center justify-center"
              >
                <span className="flex items-center justify-center gap-0.5">
                  {centerTokens
                    .filter((t) => t.color === color)
                    .map((t) => renderToken(t.color, t.idx, true))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Player summary */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {game.players.map((p, i) => {
          const home = game.tokens[p.color].filter((t) => t === 56).length;
          return (
            <span
              key={p.color}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                i === game.turn
                  ? "border-mint bg-mint-soft text-zinc-900 dark:bg-mint/20 dark:text-white"
                  : "border-zinc-200 text-zinc-600 dark:border-line dark:text-zinc-300"
              }`}
            >
              <span
                className="block h-3 w-3 rounded-full"
                style={{ backgroundColor: COLOR_HEX[p.color] }}
                aria-hidden
              />
              {COLOR_LABEL[p.color]}
              {p.isComputer ? " · CPU" : ""}
              {` · ${home}/4 home`}
            </span>
          );
        })}
      </div>

      {game.phase === "over" && game.winner && (
        <div className="mt-5 w-full rounded-xl border border-mint/50 bg-mint-soft p-5 text-center dark:bg-mint/10">
          <Trophy className="mx-auto h-8 w-8 text-mint-dark dark:text-mint" aria-hidden />
          <p className="mt-2 text-lg font-bold text-zinc-900 dark:text-white">
            {COLOR_LABEL[game.winner]} wins the game!
          </p>
          <button
            type="button"
            onClick={newGame}
            className="mt-3 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
          >
            Play again
          </button>
        </div>
      )}
    </div>
  );
}
