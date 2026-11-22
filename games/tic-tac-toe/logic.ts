/** Pure Tic Tac Toe logic — winner detection and AI (minimax). */

export type Mark = "X" | "O";
export type Cell = Mark | null;
export type Board = Cell[]; // length 9

export const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function getWinner(board: Board): { winner: Mark | null; line: number[] | null } {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export function isDraw(board: Board): boolean {
  return board.every(Boolean) && getWinner(board).winner === null;
}

export function emptyIndices(board: Board): number[] {
  return board.map((v, i) => (v === null ? i : -1)).filter((i) => i >= 0);
}

function minimax(
  board: Board,
  isMaximizing: boolean,
  ai: Mark,
  human: Mark,
  depth: number,
): number {
  const { winner } = getWinner(board);
  if (winner === ai) return 10 - depth;
  if (winner === human) return depth - 10;
  if (board.every(Boolean)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of emptyIndices(board)) {
      board[i] = ai;
      best = Math.max(best, minimax(board, false, ai, human, depth + 1));
      board[i] = null;
    }
    return best;
  }
  let best = Infinity;
  for (const i of emptyIndices(board)) {
    board[i] = human;
    best = Math.min(best, minimax(board, true, ai, human, depth + 1));
    board[i] = null;
  }
  return best;
}

export type Difficulty = "easy" | "medium" | "hard";

/** Returns the AI's chosen cell index. Easy = random, Medium = win/block
 * or random, Hard = minimax (unbeatable). */
export function bestMove(board: Board, ai: Mark, difficulty: Difficulty): number {
  const empties = emptyIndices(board);
  if (empties.length === 0) return -1;
  const human: Mark = ai === "X" ? "O" : "X";

  if (difficulty === "easy") {
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // Win if possible, block if the human is about to win.
  const winning = (mark: Mark): number => {
    for (const i of empties) {
      board[i] = mark;
      const w = getWinner(board).winner === mark;
      board[i] = null;
      if (w) return i;
    }
    return -1;
  };
  const win = winning(ai);
  if (win >= 0) return win;
  const block = winning(human);
  if (block >= 0) return block;

  if (difficulty === "medium") {
    return empties[Math.floor(Math.random() * empties.length)];
  }

  // Hard: minimax, preferring the centre on ties for a stronger opening.
  let bestScore = -Infinity;
  let bestIdx = empties[0];
  const ordered = [...empties].sort((a, b) => {
    const pref = (i: number) => (i === 4 ? 0 : i % 2 === 0 ? 1 : 2);
    return pref(a) - pref(b);
  });
  for (const i of ordered) {
    board[i] = ai;
    const score = minimax(board, false, ai, human, 0);
    board[i] = null;
    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }
  return bestIdx;
}
