/** Pure Connect Four logic — drop a disc, detect four in a row. */

export type Player = "R" | "Y";
export type Cell = Player | null;

export const ROWS = 6;
export const COLS = 7;

export function emptyBoard(): Cell[][] {
  return Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));
}

/** Returns the row the disc lands in, or -1 if the column is full. */
export function dropDisc(board: Cell[][], col: number, player: Player): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      board[r][col] = player;
      return r;
    }
  }
  return -1;
}

export function isColumnFull(board: Cell[][], col: number): boolean {
  return board[0][col] !== null;
}

export function isBoardFull(board: Cell[][]): boolean {
  return board[0].every((c) => c !== null);
}

/** Checks for a four-in-a-row through (row, col). Returns winning cells. */
export function checkWin(
  board: Cell[][],
  row: number,
  col: number,
): { winner: Player | null; cells: [number, number][] } {
  const player = board[row][col];
  if (!player) return { winner: null, cells: [] };
  const directions: [number, number][] = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of directions) {
    const cells: [number, number][] = [[row, col]];
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (
        r >= 0 &&
        r < ROWS &&
        c >= 0 &&
        c < COLS &&
        board[r][c] === player
      ) {
        cells.push([r, c]);
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (cells.length >= 4) return { winner: player, cells: cells.slice(0, 4) };
  }
  return { winner: null, cells: [] };
}
