export type GameCategory = "Board" | "Puzzle" | "Arcade";

export interface GameMeta {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  instructions: string[];
  controls: string[];
  category: GameCategory;
  players: string;
  featured: boolean;
  popular: boolean;
  addedAt: string; // ISO date, used for "recently added" sorting
  color: string; // thumbnail tile colour (fallback behind the image)
  thumbnail: string; // 16:9 card thumbnail, e.g. "/games/thumbnails/ludo.jpg"
  icon: string; // key into the icon map in the registry
}

export interface GameScore {
  slug: string;
  score: number;
  date: string;
}
