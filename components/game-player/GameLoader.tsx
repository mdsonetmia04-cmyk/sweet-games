"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

function Loading() {
  return (
    <div
      className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400"
      role="status"
      aria-label="Loading game"
    >
      <Loader2 className="h-8 w-8 animate-spin text-mint-dark dark:text-mint" aria-hidden />
      <p className="text-sm font-medium">Loading game…</p>
    </div>
  );
}

const GAME_COMPONENTS: Record<string, ReturnType<typeof dynamic>> = {
  ludo: dynamic(() => import("@/games/ludo/LudoGame"), { loading: Loading }),
  chess: dynamic(() => import("@/games/chess/ChessGame"), { loading: Loading }),
  snake: dynamic(() => import("@/games/snake/SnakeGame"), { loading: Loading }),
  "2048": dynamic(() => import("@/games/2048/Game2048"), { loading: Loading }),
  "tic-tac-toe": dynamic(() => import("@/games/tic-tac-toe/TicTacToeGame"), {
    loading: Loading,
  }),
  "block-drop": dynamic(() => import("@/games/block-drop/BlockDropGame"), {
    loading: Loading,
  }),
  "connect-four": dynamic(() => import("@/games/connect-four/ConnectFourGame"), {
    loading: Loading,
  }),
  sudoku: dynamic(() => import("@/games/sudoku/SudokuGame"), { loading: Loading }),
  minesweeper: dynamic(() => import("@/games/minesweeper/MinesweeperGame"), {
    loading: Loading,
  }),
  "brick-breaker": dynamic(() => import("@/games/brick-breaker/BrickBreakerGame"), {
    loading: Loading,
  }),
};

export default function GameLoader({ slug }: { slug: string }) {
  const Component = GAME_COMPONENTS[slug];
  if (!Component) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-semibold text-zinc-900 dark:text-white">
          Game not found
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This game does not exist yet. Please choose another game.
        </p>
      </div>
    );
  }
  return <Component />;
}
