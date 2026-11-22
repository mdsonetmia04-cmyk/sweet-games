/** Pure Block Drop (Tetris-style) logic — shapes, rotation, line clears. */

export type ShapeKey = "I" | "O" | "T" | "S" | "Z" | "J" | "L";
export type Matrix = number[][];
export type Board = (ShapeKey | 0)[][];

export const COLS = 10;
export const ROWS = 20;

export const SHAPES: Record<ShapeKey, Matrix> = {
  I: [[1, 1, 1, 1]],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
  ],
};

export const SHAPE_COLORS: Record<ShapeKey, string> = {
  I: "#2aa5a0",
  O: "#d9a441",
  T: "#8b6fc7",
  S: "#2f9e6e",
  Z: "#c2414a",
  J: "#3e7cb1",
  L: "#c97a2e",
};

export function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<ShapeKey | 0>(COLS).fill(0));
}

export function rotate(matrix: Matrix): Matrix {
  return matrix[0].map((_, c) => matrix.map((row) => row[c]).reverse());
}

export function collides(
  board: Board,
  matrix: Matrix,
  x: number,
  y: number,
): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const bx = x + c;
      const by = y + r;
      if (bx < 0 || bx >= COLS || by >= ROWS) return true;
      if (by >= 0 && board[by][bx] !== 0) return true;
    }
  }
  return false;
}

export function merge(
  board: Board,
  matrix: Matrix,
  x: number,
  y: number,
  key: ShapeKey,
): Board {
  const next = board.map((row) => [...row]);
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const by = y + r;
      if (by >= 0) next[by][x + c] = key;
    }
  }
  return next;
}

/** Removes full lines and returns the new board plus how many were cleared. */
export function clearLines(board: Board): { board: Board; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array<ShapeKey | 0>(COLS).fill(0));
  return { board: kept, cleared };
}

/** 7-bag randomiser — every bag contains each shape exactly once. */
export function shuffledBag(): ShapeKey[] {
  const bag: ShapeKey[] = ["I", "O", "T", "S", "Z", "J", "L"];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function scoreForLines(lines: number, level: number): number {
  const base = [0, 100, 300, 500, 800][lines] ?? 0;
  return base * level;
}

export function levelForLines(totalLines: number): number {
  return Math.floor(totalLines / 10) + 1;
}

export function speedForLevel(level: number): number {
  return Math.max(100, 750 - (level - 1) * 65);
}
