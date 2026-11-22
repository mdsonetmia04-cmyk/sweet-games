# Sweet Games

**Play More. Enjoy More.**

A free browser gaming platform. No login, no downloads, no payments — just
pick a game and play instantly, on desktop, tablet or phone.

## Games

| Game | Category | Description |
| --- | --- | --- |
| Ludo Classic | Board | 1–4 players, human or computer, full standard rules |
| Chess Master | Board | Full-rules chess (chess.js) vs a friend or the computer |
| Snake Arena | Arcade | Classic snake with keyboard, WASD and swipe controls |
| 2048 Puzzle | Puzzle | Slide and merge to reach 2048 |
| Tic Tac Toe | Board | vs a friend or the computer (Easy / Medium / Hard) |
| Block Drop | Arcade | Falling-block puzzle with 7 shapes, levels and line clears |
| Connect Four | Board | Two-player, 7×6 grid, four in a row wins |
| Sudoku | Puzzle | Easy / Medium / Hard, every puzzle has one unique solution |
| Mine Sweeper | Puzzle | Easy / Medium / Hard, flags, timer, first click always safe |
| Brick Breaker | Arcade | Paddle, ball physics, multiple levels, 3 lives |

## Features

- 100% free, no accounts, no backend, no database
- Dark theme by default, with a light theme toggle
- Favorites, recently played games and high scores saved in your browser
  (localStorage — nothing leaves your device)
- Individual shareable URL for every game (`/games/<slug>`)
- Responsive design for phones, tablets and desktops
- Fullscreen mode, sound toggle, pause on tab switch
- SEO metadata, sitemap and robots.txt included

## Tech stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · React 19 ·
lucide-react · zustand · chess.js · framer-motion (subtle animations only)

## Getting started

```bash
npm install
npm run dev        # development server at http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm test           # unit tests for game logic (2048, Tic Tac Toe,
                   # Connect Four, Minesweeper, Sudoku, Chess, Ludo)
```

## Deployment

The project is a standard Next.js app with no environment variables or
backend services required.

1. Push the repository to GitHub.
2. Import it in [Vercel](https://vercel.com/new) — the defaults work.
3. Every push to `main` deploys automatically.

## Project structure

```
app/                  Routes: home, /games, /games/[slug], /favorites, /privacy
components/           Header, footer, game cards, game page shell, loader
games/                One folder per game: isolated logic + component
lib/                  Game registry, localStorage store, sound effects
hooks/                useLocalStorage, useTheme
types/                Shared game types
tests/                Unit tests for the pure game-logic modules
```

## License

All games are original implementations. Block Drop is an original
falling-block game inspired by classic block-stacking gameplay.
