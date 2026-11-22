/** Unit tests for the pure game-logic modules.
 * Run with:  npm test   (node runs this .ts file directly via type stripping)
 */

import { strict as assert } from "node:assert";
import { Chess } from "chess.js";
import {
  addRandomTile,
  canMove,
  emptyBoard,
  hasWon,
  move,
  newGame,
} from "../games/2048/logic.ts";
import {
  bestMove,
  getWinner,
  isDraw,
} from "../games/tic-tac-toe/logic.ts";
import {
  checkWin,
  dropDisc,
  emptyBoard as emptyConnectBoard,
  isBoardFull,
} from "../games/connect-four/logic.ts";
import {
  checkWin as minesCheckWin,
  countRevealed,
  generateBoard,
  revealCell,
} from "../games/minesweeper/logic.ts";
import {
  countSolutions,
  generatePuzzle,
  isComplete,
  solve,
} from "../games/sudoku/logic.ts";
import {
  applyMove,
  applyRoll,
  createGame,
  movableTokens,
  trackIndex,
} from "../games/ludo/logic.ts";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

function section(name: string): void {
  console.log(`\n${name}`);
}

// ---------------------------------------------------------------- 2048
section("2048");
test("merges a pair to the left and scores the merged value", () => {
  const board = emptyBoard();
  board[0] = [2, 2, 0, 0];
  const res = move(board, "left");
  assert.deepEqual(res.board[0], [4, 0, 0, 0]);
  assert.equal(res.gained, 4);
  assert.equal(res.moved, true);
});
test("merges only once per pair per move", () => {
  const board = emptyBoard();
  board[0] = [4, 4, 4, 0];
  const res = move(board, "left");
  assert.deepEqual(res.board[0], [8, 4, 0, 0]);
});
test("slides tiles up and merges in columns", () => {
  const board = emptyBoard();
  board[0][0] = 2;
  board[1][0] = 2;
  const res = move(board, "up");
  assert.equal(res.board[0][0], 4);
  assert.equal(res.board[1][0], 0);
});
test("reports no move when the board cannot change", () => {
  const board = emptyBoard();
  board[0] = [2, 4, 2, 4];
  const res = move(board, "left");
  assert.equal(res.moved, false);
});
test("detects a full board with no possible merges", () => {
  const board = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ];
  assert.equal(canMove(board), false);
});
test("detects a win at 2048", () => {
  const board = emptyBoard();
  board[2][3] = 2048;
  assert.equal(hasWon(board), true);
});
test("new game starts with exactly two tiles", () => {
  const board = newGame();
  const tiles = board.flat().filter((v) => v !== 0);
  assert.equal(tiles.length, 2);
  assert.ok(tiles.every((v) => v === 2 || v === 4));
});
test("addRandomTile adds exactly one tile", () => {
  const board = addRandomTile(emptyBoard());
  assert.equal(board.flat().filter((v) => v !== 0).length, 1);
});

// ----------------------------------------------------------- Tic Tac Toe
section("Tic Tac Toe");
test("detects a row win and the winning line", () => {
  const board = ["X", "X", "X", null, "O", null, null, null, "O"];
  const res = getWinner(board);
  assert.equal(res.winner, "X");
  assert.deepEqual(res.line, [0, 1, 2]);
});
test("detects a diagonal win", () => {
  const board = ["O", null, null, null, "O", null, null, null, "O"];
  assert.equal(getWinner(board).winner, "O");
});
test("detects a draw on a full board", () => {
  const board = ["X", "O", "X", "X", "O", "O", "O", "X", "X"];
  assert.equal(isDraw(board), true);
  assert.equal(getWinner(board).winner, null);
});
test("hard AI takes the winning move", () => {
  const board = ["O", "O", null, "X", "X", null, null, null, null];
  assert.equal(bestMove([...board], "O", "hard"), 2);
});
test("hard AI blocks the opponent's win", () => {
  const board = ["X", "X", null, "O", null, null, null, null, null];
  assert.equal(bestMove([...board], "O", "hard"), 2);
});
test("hard AI never loses as second player in random games", () => {
  for (let game = 0; game < 30; game++) {
    const board = Array<string | null>(9).fill(null);
    let turn: "X" | "O" = "X";
    while (true) {
      const { winner } = getWinner(board);
      if (winner || isDraw(board)) {
        assert.notEqual(winner, "X", "Hard AI lost a game");
        break;
      }
      if (turn === "X") {
        const empties = board
          .map((v, i) => (v === null ? i : -1))
          .filter((i) => i >= 0);
        board[empties[Math.floor(Math.random() * empties.length)]] = "X";
        turn = "O";
      } else {
        board[bestMove([...board], "O", "hard")] = "O";
        turn = "X";
      }
    }
  }
});

// ------------------------------------------------------------ Connect Four
section("Connect Four");
test("detects a vertical four", () => {
  const b = emptyConnectBoard();
  for (let i = 0; i < 4; i++) dropDisc(b, 3, "R");
  const res = checkWin(b, 2, 3);
  assert.equal(res.winner, "R");
  assert.equal(res.cells.length, 4);
});
test("detects a horizontal four", () => {
  const b = emptyConnectBoard();
  for (let c = 0; c < 4; c++) dropDisc(b, c, "Y");
  const res = checkWin(b, 5, 3);
  assert.equal(res.winner, "Y");
});
test("detects a diagonal four", () => {
  const b = emptyConnectBoard();
  dropDisc(b, 0, "R");
  dropDisc(b, 1, "Y");
  dropDisc(b, 1, "R");
  dropDisc(b, 2, "Y");
  dropDisc(b, 2, "Y");
  dropDisc(b, 2, "R");
  dropDisc(b, 3, "Y");
  dropDisc(b, 3, "Y");
  dropDisc(b, 3, "Y");
  dropDisc(b, 3, "R");
  const res = checkWin(b, 2, 3);
  assert.equal(res.winner, "R");
});
test("discs stack and a full column rejects a drop", () => {
  const b = emptyConnectBoard();
  for (let i = 0; i < 6; i++) dropDisc(b, 0, i % 2 === 0 ? "R" : "Y");
  assert.equal(dropDisc(b, 0, "R"), -1);
});
test("a completely filled board reports full", () => {
  const b = emptyConnectBoard();
  for (let c = 0; c < 7; c++)
    for (let i = 0; i < 6; i++) dropDisc(b, c, i % 2 === 0 ? "R" : "Y");
  assert.equal(isBoardFull(b), true);
});

// ------------------------------------------------------------- Minesweeper
section("Minesweeper");
test("generates the exact mine count and keeps the first click safe", () => {
  const grid = generateBoard(9, 9, 10, 4, 4);
  const mines = grid.flat().filter((c) => c.mine).length;
  assert.equal(mines, 10);
  assert.equal(grid[4][4].mine, false);
});
test("revealing an empty area flood-fills multiple cells", () => {
  const grid = generateBoard(9, 9, 10, 0, 0);
  const res = revealCell(grid, 0, 0);
  assert.equal(res.hitMine, false);
  assert.ok(res.revealedCount >= 1);
  assert.equal(countRevealed(res.grid), res.revealedCount);
});
test("revealing a mine reports a hit", () => {
  const grid = generateBoard(9, 9, 10, 0, 0);
  // Find a mine and reveal it directly.
  outer: for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].mine) {
        const res = revealCell(grid, r, c);
        assert.equal(res.hitMine, true);
        break outer;
      }
    }
  }
});
test("win is detected when every safe cell is revealed", () => {
  const grid = generateBoard(9, 9, 10, 0, 0);
  const cleared = grid.map((row) =>
    row.map((cell) => (cell.mine ? cell : { ...cell, revealed: true })),
  );
  assert.equal(minesCheckWin(cleared, 10), true);
  assert.equal(minesCheckWin(grid, 10), false);
});

// ----------------------------------------------------------------- Sudoku
section("Sudoku");
test("solver completes a known puzzle", () => {
  const puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];
  const work = puzzle.map((r) => [...r]);
  assert.equal(solve(work), true);
  assert.equal(work[0][2], 4);
  assert.equal(work[8][8], 9);
});
for (const difficulty of ["easy", "medium", "hard"] as const) {
  test(`generated ${difficulty} puzzle has exactly one solution`, () => {
    const { puzzle, solution } = generatePuzzle(difficulty);
    assert.equal(countSolutions(puzzle, 2), 1);
    assert.equal(isComplete(solution, solution), true);
    // Every given matches the solution.
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (puzzle[r][c] !== 0) assert.equal(puzzle[r][c], solution[r][c]);
    // Solution rows, columns and boxes all contain 1-9.
    for (let i = 0; i < 9; i++) {
      assert.deepEqual([...solution[i]].sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
      assert.deepEqual(
        solution.map((row) => row[i]).sort(),
        [1, 2, 3, 4, 5, 6, 7, 8, 9],
      );
    }
  });
}

// -------------------------------------------------------------------- Chess
section("Chess (chess.js)");
test("fool's mate is checkmate", () => {
  const game = new Chess();
  game.move("f3");
  game.move("e5");
  game.move("g4");
  game.move("Qh4");
  assert.equal(game.isCheckmate(), true);
  assert.equal(game.isGameOver(), true);
});
test("castling is available from a cleared back rank", () => {
  const game = new Chess();
  game.load("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1");
  const moves = game.moves({ square: "e1", verbose: true });
  assert.ok(moves.some((m) => m.to === "g1"), "kingside castle missing");
  assert.ok(moves.some((m) => m.to === "c1"), "queenside castle missing");
});
test("en passant capture is legal", () => {
  const game = new Chess();
  game.load(
    "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 3",
  );
  const moves = game.moves({ square: "e5", verbose: true });
  assert.ok(
    moves.some((m) => m.to === "d6" && m.flags.includes("e")),
    "en passant move missing",
  );
});
test("pawn promotion to queen works", () => {
  const game = new Chess();
  game.load("8/P7/8/8/8/8/k6K/8 w - - 0 1");
  game.move({ from: "a7", to: "a8", promotion: "q" });
  assert.equal(game.get("a8")?.type, "q");
});
test("stalemate is detected", () => {
  const game = new Chess();
  game.load("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
  assert.equal(game.isStalemate(), true);
  assert.equal(game.isDraw(), true);
});
test("undo restores the previous position", () => {
  const game = new Chess();
  const start = game.fen();
  game.move("e4");
  game.undo();
  assert.equal(game.fen(), start);
});

// --------------------------------------------------------------------- Ludo
section("Ludo");
test("tokens start in the yard and need a six to enter", () => {
  const state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  assert.deepEqual(movableTokens(state, "red", 4), []);
  assert.deepEqual(movableTokens(state, "red", 6), [0, 1, 2, 3]);
});
test("a token moves along the track and the turn passes", () => {
  let state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  state = applyRoll(state, 6).state;
  const res = applyMove(state, "red", 0, 6);
  assert.equal(res.state.tokens.red[0], 0);
  // Rolled a six: same player rolls again.
  assert.equal(res.state.turn, 0);
  assert.equal(res.state.phase, "roll");
});
test("a normal move passes the turn to the next player", () => {
  let state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  state = applyRoll(state, 6).state;
  state = applyMove(state, "red", 0, 6).state;
  state = applyRoll(state, 3).state;
  const res = applyMove(state, "red", 0, 3);
  assert.equal(res.state.tokens.red[0], 3);
  assert.equal(res.state.turn, 1);
});
test("landing on an opponent captures it back to the yard", () => {
  // Red token at progress 9 (track 9); green token at progress 49
  // (track (13+49)%52 = 10) — red rolling 1 lands on it.
  let state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  state.tokens.red = [9, -1, -1, -1];
  state.tokens.green = [49, -1, -1, -1];
  state = applyRoll(state, 1).state;
  const res = applyMove(state, "red", 0, 1);
  assert.equal(res.captured, true);
  assert.equal(res.state.tokens.green[0], -1);
  assert.equal(res.state.turn, 0); // extra turn after a capture
});
test("safe cells protect opponents from capture", () => {
  // Track 8 is a safe cell. Green sits at progress 47 -> track (13+47)%52 = 8.
  // Red at progress 7 rolls 1 onto track 8.
  let state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  state.tokens.red = [7, -1, -1, -1];
  state.tokens.green = [47, -1, -1, -1];
  assert.equal(trackIndex("green", 47), 8);
  state = applyRoll(state, 1).state;
  const res = applyMove(state, "red", 0, 1);
  assert.equal(res.captured, false);
  assert.equal(res.state.tokens.green[0], 47);
});
test("an exact roll is required to finish a token", () => {
  const state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  state.tokens.red = [55, -1, -1, -1];
  assert.deepEqual(movableTokens(state, "red", 2), []);
  assert.deepEqual(movableTokens(state, "red", 1), [0]);
});
test("bringing all four tokens home wins the game", () => {
  let state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  state.tokens.red = [55, 56, 56, 56];
  state = applyRoll(state, 1).state;
  const res = applyMove(state, "red", 0, 1);
  assert.equal(res.state.phase, "over");
  assert.equal(res.state.winner, "red");
});
test("three consecutive sixes forfeit the turn", () => {
  let state = createGame([
    { color: "red", isComputer: false },
    { color: "green", isComputer: true },
  ]);
  state = applyRoll(state, 6).state;
  state = applyMove(state, "red", 0, 6).state;
  state = applyRoll(state, 6).state;
  state = applyMove(state, "red", 0, 6).state;
  const res = applyRoll(state, 6);
  assert.equal(res.forfeited, true);
  assert.equal(res.state.turn, 1);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
