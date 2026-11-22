"use client";

import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import type { Square } from "chess.js";
import { Bot, RotateCcw, Undo2, Users, ArrowLeftRight } from "lucide-react";
import { sfx } from "@/lib/sound";

const PIECE_GLYPHS: Record<string, string> = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};

const VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

function evaluate(game: Chess): number {
  // Material from Black's perspective (the AI plays Black).
  let score = 0;
  for (const row of game.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const v = VALUES[cell.type];
      score += cell.color === "b" ? v : -v;
    }
  }
  return score;
}

function pickAiMove(game: Chess): { from: Square; to: Square; promotion?: string } | null {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;
  let bestScore = -Infinity;
  let best: typeof moves = [];
  for (const m of moves) {
    game.move(m);
    const score = evaluate(game) + Math.random() * 30;
    game.undo();
    if (score > bestScore) {
      bestScore = score;
      best = [m];
    } else if (score === bestScore) {
      best.push(m);
    }
  }
  const pick = best[Math.floor(Math.random() * best.length)];
  return {
    from: pick.from,
    to: pick.to,
    promotion: pick.promotion,
  };
}

type Mode = "pvp" | "ai";

export default function ChessGame() {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(game.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [mode, setMode] = useState<Mode>("ai");
  const [flipped, setFlipped] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);

  const board = useMemo(() => game.board(), [game, fen]);
  const history = useMemo(() => game.history(), [game, fen]);
  const turn = game.turn();
  const inCheck = game.isCheck();
  const isMate = game.isCheckmate();
  const isStalemate = game.isStalemate();
  const isDraw = game.isDraw();
  const gameOver = isMate || isStalemate || isDraw;

  const refresh = () => setFen(game.fen());

  const doMove = (from: Square, to: Square, promotion?: string) => {
    try {
      game.move({ from, to, promotion: promotion as "q" | "r" | "b" | "n" | undefined });
      setSelected(null);
      setLegalTargets([]);
      setPendingPromotion(null);
      refresh();
      sfx.move();
      if (game.isCheckmate() || game.isStalemate() || game.isDraw()) {
        sfx.win();
      }
    } catch {
      /* illegal — ignore */
    }
  };

  const onSquareClick = (square: Square) => {
    if (gameOver || pendingPromotion) return;
    if (mode === "ai" && turn === "b") return; // computer's turn

    const piece = game.get(square);
    if (selected) {
      if (legalTargets.includes(square)) {
        const moving = game.get(selected);
        const isPromotion =
          moving?.type === "p" &&
          ((moving.color === "w" && square[1] === "8") ||
            (moving.color === "b" && square[1] === "1"));
        if (isPromotion) {
          setPendingPromotion({ from: selected, to: square });
        } else {
          doMove(selected, square);
        }
        return;
      }
      if (piece && piece.color === turn) {
        selectSquare(square);
        return;
      }
      setSelected(null);
      setLegalTargets([]);
      return;
    }
    if (piece && piece.color === turn) selectSquare(square);
  };

  const selectSquare = (square: Square) => {
    setSelected(square);
    const moves = game.moves({ square, verbose: true });
    setLegalTargets(moves.map((m) => m.to));
  };

  // Computer move
  useEffect(() => {
    if (mode !== "ai" || turn !== "b" || gameOver) return;
    const id = setTimeout(() => {
      const mv = pickAiMove(game);
      if (mv) doMove(mv.from, mv.to, mv.promotion);
    }, 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, turn, fen, gameOver]);

  const restart = () => {
    game.reset();
    setSelected(null);
    setLegalTargets([]);
    setPendingPromotion(null);
    refresh();
    sfx.click();
  };

  const undo = () => {
    if (mode === "ai") {
      game.undo(); // computer's move
      game.undo(); // player's move
    } else {
      game.undo();
    }
    setSelected(null);
    setLegalTargets([]);
    refresh();
    sfx.click();
  };

  const statusText = isMate
    ? `Checkmate — ${turn === "w" ? "Black" : "White"} wins!`
    : isStalemate
      ? "Stalemate — the game is a draw."
      : isDraw
        ? "Draw."
        : inCheck
          ? `${turn === "w" ? "White" : "Black"} is in check.`
          : `${turn === "w" ? "White" : "Black"} to move${
              mode === "ai" && turn === "b" ? " (computer thinking…)" : ""
            }.`;

  const displayRows = flipped
    ? [...board].reverse().map((row) => [...row].reverse())
    : board;

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center">
      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <div
          className="flex rounded-lg border border-zinc-200 dark:border-line"
          role="group"
          aria-label="Game mode"
        >
          <button
            type="button"
            onClick={() => {
              setMode("ai");
              restart();
            }}
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
            onClick={() => {
              setMode("pvp");
              restart();
            }}
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
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-paper px-3 py-2 text-sm font-medium dark:border-line dark:bg-ink"
          aria-label="Flip board"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden /> Flip
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-paper px-3 py-2 text-sm font-medium disabled:opacity-40 dark:border-line dark:bg-ink"
          aria-label="Undo move"
        >
          <Undo2 className="h-4 w-4" aria-hidden /> Undo
        </button>
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-semibold text-white dark:bg-mint dark:text-ink"
        >
          <RotateCcw className="h-4 w-4" aria-hidden /> Restart
        </button>
      </div>

      <p
        className="mt-4 w-full rounded-lg bg-paper-panel px-4 py-2.5 text-center text-sm font-semibold text-zinc-900 dark:bg-panel dark:text-white"
        aria-live="polite"
      >
        {statusText}
      </p>

      <div className="mt-4 flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-center">
        <div className="relative mx-auto w-full max-w-[480px]">
          <div
            className="grid grid-cols-8 overflow-hidden rounded-xl border border-zinc-800"
            role="grid"
            aria-label="Chess board"
          >
            {displayRows.map((row, r) =>
              row.map((cell, c) => {
                const file = flipped ? 7 - c : c;
                const rank = flipped ? r + 1 : 8 - r;
                const square = `${"abcdefgh"[file]}${rank}` as Square;
                const light = (file + rank) % 2 === 0;
                const isTarget = legalTargets.includes(square);
                const isSelected = selected === square;
                const isKingInCheck =
                  cell?.type === "k" &&
                  cell.color === turn &&
                  inCheck;
                return (
                  <button
                    key={square}
                    type="button"
                    role="gridcell"
                    aria-label={
                      cell
                        ? `${cell.color === "w" ? "White" : "Black"} ${cell.type} on ${square}`
                        : `Empty square ${square}`
                    }
                    onClick={() => onSquareClick(square)}
                    className={`relative flex aspect-square items-center justify-center text-3xl sm:text-4xl ${
                      light ? "bg-[#e8e3d8]" : "bg-[#7a8a6a]"
                    } ${isSelected ? "ring-4 ring-inset ring-mint" : ""} ${
                      isKingInCheck ? "ring-4 ring-inset ring-red-500" : ""
                    }`}
                  >
                    {cell && (
                      <span
                        className={
                          cell.color === "w"
                            ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
                            : "text-zinc-900"
                        }
                        aria-hidden
                      >
                        {PIECE_GLYPHS[`${cell.color}${cell.type}`]}
                      </span>
                    )}
                    {isTarget && (
                      <span
                        className="absolute h-3.5 w-3.5 rounded-full bg-mint/80 ring-2 ring-white/60"
                        aria-hidden
                      />
                    )}
                  </button>
                );
              }),
            )}
          </div>
          {pendingPromotion && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60">
              <div className="rounded-xl bg-paper-panel p-5 text-center dark:bg-panel">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  Choose a promotion piece
                </p>
                <div className="mt-3 flex gap-2">
                  {(["q", "r", "b", "n"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() =>
                        doMove(
                          pendingPromotion.from,
                          pendingPromotion.to,
                          p,
                        )
                      }
                      aria-label={`Promote to ${p === "q" ? "queen" : p === "r" ? "rook" : p === "b" ? "bishop" : "knight"}`}
                      className="flex h-14 w-14 items-center justify-center rounded-lg border border-zinc-200 text-4xl hover:bg-zinc-100 dark:border-line dark:hover:bg-panel-2"
                    >
                      {PIECE_GLYPHS[`${turn}${p}`]}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setPendingPromotion(null)}
                  className="mt-3 text-sm font-medium text-zinc-500 underline"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-full rounded-xl border border-zinc-200 bg-paper-panel p-4 sm:w-52 sm:shrink-0 dark:border-line dark:bg-panel">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Move history
          </h2>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              No moves yet. White moves first.
            </p>
          ) : (
            <ol className="scroll-thin mt-2 max-h-64 space-y-1 overflow-y-auto text-sm">
              {history.map((san, i) => (
                <li key={i} className="flex gap-2 text-zinc-600 dark:text-zinc-300">
                  <span className="w-6 shrink-0 font-medium text-zinc-400">
                    {i % 2 === 0 ? `${i / 2 + 1}.` : ""}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {san}
                  </span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 border-t border-zinc-200 pt-3 text-xs leading-relaxed text-zinc-500 dark:border-line dark:text-zinc-400">
            Tap a piece to see its legal moves. Castling, en passant and
            promotion are all supported.
          </p>
        </div>
      </div>
    </div>
  );
}
