import type { GameCategory, GameMeta } from "@/types/game";

export const CATEGORIES: { name: GameCategory; blurb: string }[] = [
  {
    name: "Board",
    blurb: "Classic board games to play with friends or against the computer.",
  },
  {
    name: "Puzzle",
    blurb: "Brain teasers and logic puzzles that reward patience and focus.",
  },
  {
    name: "Arcade",
    blurb: "Fast, fun arcade action — quick to learn, hard to master.",
  },
];

export const GAMES: GameMeta[] = [
  {
    slug: "ludo",
    thumbnail: "/games/thumbnails/ludo.jpg",
    name: "Ludo Classic",
    tagline: "Race all four tokens home first.",
    description:
      "The classic board game for 1–4 players. Roll the dice, bring your tokens out with a six, capture rivals, and race around the board to bring all four tokens home.",
    instructions: [
      "Roll the dice to start your turn. You need a six to bring a token out of the yard.",
      "Tap one of your highlighted tokens to move it by the dice value.",
      "Landing on an opponent's token sends it back to its yard — unless the cell is a safe star cell.",
      "Rolling a six, capturing a token, or bringing a token home earns an extra turn.",
      "You need an exact roll to enter the home triangle. First player to bring all four tokens home wins.",
    ],
    controls: [
      "Mouse / touch: tap the dice, then tap a highlighted token",
      "Computer players move automatically",
    ],
    category: "Board",
    players: "1–4 players",
    featured: true,
    popular: true,
    addedAt: "2026-11-22",
    color: "#c2414a",
    icon: "dices",
  },
  {
    slug: "chess",
    thumbnail: "/games/thumbnails/chess.jpg",
    name: "Chess Master",
    tagline: "The royal game, with a friendly AI.",
    description:
      "Full-rules chess against a friend on the same device or against the computer. Castling, en passant, promotion, check, checkmate and stalemate are all handled correctly.",
    instructions: [
      "Tap a piece to see its legal moves, then tap a highlighted square to move.",
      "When a pawn reaches the last rank, choose a promotion piece.",
      "Play White against a friend, or switch on the computer opponent.",
      "Use Undo to take back a move and Restart to begin a fresh game.",
    ],
    controls: [
      "Mouse / touch: tap a piece, then tap a destination square",
      "U: undo move",
    ],
    category: "Board",
    players: "1–2 players",
    featured: true,
    popular: true,
    addedAt: "2026-11-22",
    color: "#4a5d7e",
    icon: "crown",
  },
  {
    slug: "snake",
    thumbnail: "/games/thumbnails/snake.jpg",
    name: "Snake Arena",
    tagline: "Eat, grow, don't crash.",
    description:
      "The timeless arcade classic. Guide the snake to eat food, grow longer, and chase your high score — without hitting the walls or yourself. Speed rises as you eat.",
    instructions: [
      "Steer the snake with the arrow keys, WASD, or swipe on the board.",
      "Eat the food to grow and score points. Each food makes the snake faster.",
      "Hitting a wall or your own body ends the game.",
      "Press P or the pause button to pause at any time.",
    ],
    controls: [
      "Arrow keys / WASD to steer",
      "Swipe on the board on touch devices",
      "P: pause / resume",
    ],
    category: "Arcade",
    players: "1 player",
    featured: true,
    popular: true,
    addedAt: "2026-11-22",
    color: "#2f9e6e",
    icon: "worm",
  },
  {
    slug: "2048",
    thumbnail: "/games/thumbnails/2048.jpg",
    name: "2048 Puzzle",
    tagline: "Slide, merge, reach 2048.",
    description:
      "Slide the tiles and merge matching numbers. Every move adds a new tile — plan ahead, keep the board clear, and reach the 2048 tile to win.",
    instructions: [
      "Use the arrow keys or swipe to slide all tiles in a direction.",
      "Tiles with the same number merge into one when they collide.",
      "A new tile (2 or 4) appears after every move.",
      "Reach the 2048 tile to win. The game ends when the board is full and no moves remain.",
    ],
    controls: [
      "Arrow keys / WASD to slide",
      "Swipe on the board on touch devices",
      "U: undo move",
    ],
    category: "Puzzle",
    players: "1 player",
    featured: true,
    popular: true,
    addedAt: "2026-11-22",
    color: "#c08a3e",
    icon: "layout-grid",
  },
  {
    slug: "tic-tac-toe",
    thumbnail: "/games/thumbnails/tic-tac-toe.jpg",
    name: "Tic Tac Toe",
    tagline: "Three in a row wins.",
    description:
      "The quick classic. Play X and O against a friend or challenge the computer on Easy, Medium or Hard — Hard is unbeatable.",
    instructions: [
      "Tap an empty square to place your mark.",
      "Get three of your marks in a row, column or diagonal to win.",
      "Choose Human vs Human or Human vs Computer, and pick the AI difficulty.",
      "The scoreboard keeps track of wins and draws across rounds.",
    ],
    controls: ["Mouse / touch: tap a square"],
    category: "Board",
    players: "1–2 players",
    featured: false,
    popular: false,
    addedAt: "2026-11-22",
    color: "#7e6bb5",
    icon: "x",
  },
  {
    slug: "block-drop",
    thumbnail: "/games/thumbnails/block-drop.jpg",
    name: "Block Drop",
    tagline: "Stack the falling blocks.",
    description:
      "Seven classic block shapes fall one by one. Rotate them, slide them into place, and clear complete lines before the stack reaches the top.",
    instructions: [
      "Move the falling block with the arrow keys and rotate it to fit.",
      "Complete a horizontal line to clear it and score points.",
      "Clearing several lines at once scores more. Every 10 lines the level — and speed — rises.",
      "Space drops the block instantly. P pauses the game.",
    ],
    controls: [
      "Left / Right: move",
      "Up / X: rotate",
      "Down: soft drop",
      "Space: hard drop",
      "P: pause / resume",
    ],
    category: "Arcade",
    players: "1 player",
    featured: false,
    popular: true,
    addedAt: "2026-11-22",
    color: "#2a9d8f",
    icon: "blocks",
  },
  {
    slug: "connect-four",
    thumbnail: "/games/thumbnails/connect-four.jpg",
    name: "Connect Four",
    tagline: "Drop in. Line up four.",
    description:
      "Two players take turns dropping discs into a seven-column grid. The first to line up four discs in a row — across, down, or diagonally — wins.",
    instructions: [
      "Tap a column to drop your disc into it.",
      "Players alternate turns: red first, then yellow.",
      "Connect four of your discs horizontally, vertically, or diagonally to win.",
      "If the board fills up with no winner, the game is a draw.",
    ],
    controls: ["Mouse / touch: tap a column to drop a disc"],
    category: "Board",
    players: "2 players",
    featured: false,
    popular: false,
    addedAt: "2026-11-22",
    color: "#b3543f",
    icon: "circle-dot",
  },
  {
    slug: "sudoku",
    thumbnail: "/games/thumbnails/sudoku.jpg",
    name: "Sudoku",
    tagline: "Every row, column and box.",
    description:
      "The classic number puzzle. Fill the 9×9 grid so every row, column and 3×3 box contains the digits 1–9 exactly once. Every puzzle is generated with one unique solution.",
    instructions: [
      "Tap a cell, then tap a number (or use keys 1–9) to enter it.",
      "Turn on Notes to pencil in candidates for a cell.",
      "Use Hint to fill one correct cell. Mistakes are highlighted — three mistakes end the game.",
      "Pick Easy, Medium or Hard before you start, and use the timer to track your pace.",
    ],
    controls: [
      "Mouse / touch: tap a cell, then tap a number",
      "Keys 1–9: enter a number, 0 / Backspace: clear",
      "N: toggle notes mode",
    ],
    category: "Puzzle",
    players: "1 player",
    featured: true,
    popular: false,
    addedAt: "2026-11-22",
    color: "#3e7cb1",
    icon: "hash",
  },
  {
    slug: "minesweeper",
    thumbnail: "/games/thumbnails/minesweeper.jpg",
    name: "Mine Sweeper",
    tagline: "Clear the field, dodge the mines.",
    description:
      "Reveal every safe cell without hitting a mine. Numbers tell you how many mines touch each cell — use logic, flags, and a steady hand.",
    instructions: [
      "Click a cell to reveal it. Your first click is always safe.",
      "A number shows how many mines are next to that cell.",
      "Right-click (or use Flag mode on touch) to mark a suspected mine.",
      "Reveal all safe cells to win. Revealing a mine ends the game.",
    ],
    controls: [
      "Click / tap: reveal a cell",
      "Right-click: place or remove a flag",
      "Touch: use the Flag toggle, or long-press a cell",
    ],
    category: "Puzzle",
    players: "1 player",
    featured: false,
    popular: false,
    addedAt: "2026-11-22",
    color: "#5b6770",
    icon: "bomb",
  },
  {
    slug: "brick-breaker",
    thumbnail: "/games/thumbnails/brick-breaker.jpg",
    name: "Brick Breaker",
    tagline: "Smash every brick.",
    description:
      "Bounce the ball off your paddle and smash through the brick wall. Clear every level, catch the rhythm, and don't let the ball past your paddle.",
    instructions: [
      "Move the paddle with the mouse, arrow keys, or by dragging on touch.",
      "Bounce the ball to smash bricks. Each brick is worth points.",
      "You have 3 lives. Clear all bricks to advance to the next level.",
      "Press P or the pause button to pause at any time.",
    ],
    controls: [
      "Mouse: move to steer the paddle",
      "Arrow keys / A / D: move the paddle",
      "Touch: drag on the board",
      "P: pause / resume",
    ],
    category: "Arcade",
    players: "1 player",
    featured: true,
    popular: false,
    addedAt: "2026-11-22",
    color: "#b7791f",
    icon: "zap",
  },
];

export function getGame(slug: string): GameMeta | undefined {
  return GAMES.find((g) => g.slug === slug);
}

export function relatedGames(slug: string, count = 4): GameMeta[] {
  const game = getGame(slug);
  if (!game) return GAMES.slice(0, count);
  const sameCategory = GAMES.filter(
    (g) => g.slug !== slug && g.category === game.category,
  );
  const others = GAMES.filter(
    (g) => g.slug !== slug && g.category !== game.category,
  );
  return [...sameCategory, ...others].slice(0, count);
}

export function formatCategory(category: GameCategory): string {
  return `${category} Games`;
}
