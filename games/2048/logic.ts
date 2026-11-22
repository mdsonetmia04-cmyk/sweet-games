/** Pure 2048 logic — no React, fully unit-testable. */

export type Board = number[][];
export type Direction = "up" | "down" | "left" | "right";

export const SIZE = 4;
export const WIN_VALUE = 2048;

export function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
}

function slideRow(row: number[]): { row: number[]; gained: number; moved: boolean } {
  const compact = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let gained = 0;
  for (let i = 0; i < compact.length; i++) {
    if (i + 1 < compact.length && compact[i] === compact[i + 1]) {
      const v = compact[i] * 2;
      merged.push(v);
      gained += v;
      i++;
    } else {
      merged.push(compact[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  const moved = merged.some((v, i) => v !== row[i]);
  return { row: merged, gained, moved };
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map((row) => row[c]));
}

export function move(
  board: Board,
  dir: Direction,
): { board: Board; gained: number; moved: boolean } {
  let working: Board = board.map((r) => [...r]);
  let gained = 0;
  let moved = false;

  const slideLeft = (b: Board): Board => {
    return b.map((row) => {
      const res = slideRow(row);
      gained += res.gained;
      if (res.moved) moved = true;
      return res.row;
    });
  };

  if (dir === "left") {
    working = slideLeft(working);
  } else if (dir === "right") {
    working = slideLeft(working.map((r) => [...r].reverse())).map((r) =>
      [...r].reverse(),
    );
  } else if (dir === "up") {
    working = transpose(slideLeft(transpose(working)));
  } else {
    working = transpose(
      slideLeft(transpose(working).map((r) => [...r].reverse())).map((r) =>
        [...r].reverse(),
      ),
    );
  }
  return { board: working, gained, moved };
}

export function emptyCells(board: Board): { r: number; c: number }[] {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (board[r][c] === 0) cells.push({ r, c });
  return cells;
}

export function addRandomTile(board: Board): Board {
  const cells = emptyCells(board);
  if (cells.length === 0) return board;
  const next = board.map((r) => [...r]);
  const pick = cells[Math.floor(Math.random() * cells.length)];
  next[pick.r][pick.c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

export function canMove(board: Board): boolean {
  if (emptyCells(board).length > 0) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = board[r][c];
      if (c + 1 < SIZE && board[r][c + 1] === v) return true;
      if (r + 1 < SIZE && board[r + 1][c] === v) return true;
    }
  }
  return false;
}

export function hasWon(board: Board): boolean {
  return board.some((row) => row.some((v) => v >= WIN_VALUE));
}

export function newGame(): Board {
  return addRandomTile(addRandomTile(emptyBoard()));
}
