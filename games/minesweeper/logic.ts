/** Pure Minesweeper logic — board generation, reveal flood-fill, win check. */

export interface MineCell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
}

export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
}

export const DIFFICULTIES: Record<string, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, label: "Easy" },
  medium: { rows: 16, cols: 16, mines: 40, label: "Medium" },
  hard: { rows: 16, cols: 30, mines: 99, label: "Hard" },
};

export type DifficultyKey = keyof typeof DIFFICULTIES;

export function emptyGrid(rows: number, cols: number): MineCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );
}

function neighbors(rows: number, cols: number, r: number, c: number): [number, number][] {
  const out: [number, number][] = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc]);
    }
  }
  return out;
}

/** Places mines after the first click so the clicked cell is always safe. */
export function generateBoard(
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number,
): MineCell[][] {
  const grid = emptyGrid(rows, cols);
  const forbidden = new Set<number>([safeRow * cols + safeCol]);
  let placed = 0;
  let guard = 0;
  while (placed < mines && guard < 10000) {
    guard++;
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    const key = r * cols + c;
    if (forbidden.has(key) || grid[r][c].mine) continue;
    grid[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c].adjacent = neighbors(rows, cols, r, c).filter(
        ([nr, nc]) => grid[nr][nc].mine,
      ).length;
    }
  }
  return grid;
}

/** Reveals a cell (and flood-fills empty neighbours). Mutates a copied grid
 * and returns it plus whether a mine was hit and how many cells revealed. */
export function revealCell(
  grid: MineCell[][],
  row: number,
  col: number,
): { grid: MineCell[][]; hitMine: boolean; revealedCount: number } {
  const rows = grid.length;
  const cols = grid[0].length;
  const next = grid.map((r) => r.map((cell) => ({ ...cell })));
  const cell = next[row][col];
  if (cell.revealed || cell.flagged) return { grid: next, hitMine: false, revealedCount: 0 };
  if (cell.mine) {
    cell.revealed = true;
    return { grid: next, hitMine: true, revealedCount: 1 };
  }
  let revealedCount = 0;
  const stack: [number, number][] = [[row, col]];
  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const cur = next[r][c];
    if (cur.revealed || cur.flagged || cur.mine) continue;
    cur.revealed = true;
    revealedCount++;
    if (cur.adjacent === 0) {
      for (const [nr, nc] of neighbors(rows, cols, r, c)) {
        if (!next[nr][nc].revealed) stack.push([nr, nc]);
      }
    }
  }
  return { grid: next, hitMine: false, revealedCount };
}

export function countRevealed(grid: MineCell[][]): number {
  return grid.flat().filter((c) => c.revealed).length;
}

export function countFlags(grid: MineCell[][]): number {
  return grid.flat().filter((c) => c.flagged).length;
}

export function checkWin(grid: MineCell[][], totalMines: number): boolean {
  const total = grid.length * grid[0].length;
  return countRevealed(grid) === total - totalMines;
}

/** Reveals every mine (used on game over). */
export function revealAllMines(grid: MineCell[][]): MineCell[][] {
  return grid.map((row) =>
    row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell)),
  );
}
