/** Pure Sudoku logic — solver, unique-solution generator, validation. */

export type Grid = number[][];

export type Difficulty = "easy" | "medium" | "hard";

const REMOVALS: Record<Difficulty, number> = {
  easy: 36,
  medium: 46,
  hard: 54,
};

export function emptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array<number>(9).fill(0));
}

function shuffled(nums: number[]): number[] {
  const arr = [...nums];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isPlacementValid(
  grid: Grid,
  row: number,
  col: number,
  value: number,
): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === value) return false;
    if (grid[i][col] === value) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++) if (grid[r][c] === value) return false;
  return true;
}

function findEmpty(grid: Grid): [number, number] | null {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) if (grid[r][c] === 0) return [r, c];
  return null;
}

/** Solves the grid in place. Returns true when a solution exists. */
export function solve(grid: Grid): boolean {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [r, c] = empty;
  for (const v of shuffled([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (isPlacementValid(grid, r, c, v)) {
      grid[r][c] = v;
      if (solve(grid)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

/** Counts solutions up to `limit` (stops early). Used to prove uniqueness. */
export function countSolutions(grid: Grid, limit = 2): number {
  const work = grid.map((row) => [...row]);
  let count = 0;
  const search = (): void => {
    if (count >= limit) return;
    const empty = findEmpty(work);
    if (!empty) {
      count++;
      return;
    }
    const [r, c] = empty;
    for (let v = 1; v <= 9; v++) {
      if (isPlacementValid(work, r, c, v)) {
        work[r][c] = v;
        search();
        work[r][c] = 0;
        if (count >= limit) return;
      }
    }
  };
  search();
  return count;
}

export function generateFull(): Grid {
  const grid = emptyGrid();
  solve(grid);
  return grid;
}

/** Generates a puzzle with exactly one solution. */
export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Grid;
  solution: Grid;
} {
  const solution = generateFull();
  const puzzle = solution.map((row) => [...row]);
  const cells = shuffled(
    Array.from({ length: 81 }, (_, i) => i),
  );
  let removed = 0;
  const target = REMOVALS[difficulty];
  for (const idx of cells) {
    if (removed >= target) break;
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[r][c] = backup; // removal broke uniqueness — restore
    } else {
      removed++;
    }
  }
  return { puzzle, solution };
}

export function isComplete(grid: Grid, solution: Grid): boolean {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) if (grid[r][c] !== solution[r][c]) return false;
  return true;
}
