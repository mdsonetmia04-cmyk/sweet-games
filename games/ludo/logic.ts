/** Pure Ludo engine — standard rules, fully unit-testable.
 *
 * A token's `progress` is:
 *  -1  in the yard
 *  0..50  on the shared 52-cell track (progress 0 = the colour's start cell)
 *  51..55  in the colour's home column (5 cells)
 *  56  finished (in the centre)
 * A token needs an exact roll to finish. A six is needed to leave the yard.
 */

export type LudoColor = "red" | "green" | "yellow" | "blue";

export interface PlayerConfig {
  color: LudoColor;
  isComputer: boolean;
}

export interface LudoState {
  players: PlayerConfig[];
  tokens: Record<LudoColor, number[]>;
  turn: number;
  dice: number | null;
  phase: "roll" | "move" | "over";
  consecutiveSixes: number;
  winner: LudoColor | null;
  message: string;
}

export const COLORS: LudoColor[] = ["red", "green", "yellow", "blue"];

export const COLOR_HEX: Record<LudoColor, string> = {
  red: "#d43d3d",
  green: "#2f9e6e",
  yellow: "#d9a441",
  blue: "#3e7cb1",
};

export const COLOR_LABEL: Record<LudoColor, string> = {
  red: "Red",
  green: "Green",
  yellow: "Yellow",
  blue: "Blue",
};

export const START_INDEX: Record<LudoColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const SAFE_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

export function createGame(players: PlayerConfig[]): LudoState {
  const tokens = {} as Record<LudoColor, number[]>;
  for (const p of players) tokens[p.color] = [-1, -1, -1, -1];
  return {
    players,
    tokens,
    turn: 0,
    dice: null,
    phase: "roll",
    consecutiveSixes: 0,
    winner: null,
    message: `${COLOR_LABEL[players[0].color]} starts — roll the dice.`,
  };
}

export function currentPlayer(state: LudoState): PlayerConfig {
  return state.players[state.turn];
}

/** Shared track index for a token on the main track, or null otherwise. */
export function trackIndex(color: LudoColor, progress: number): number | null {
  if (progress < 0 || progress > 50) return null;
  return (START_INDEX[color] + progress) % 52;
}

export function movableTokens(
  state: LudoState,
  color: LudoColor,
  dice: number,
): number[] {
  const tokens = state.tokens[color] ?? [];
  const out: number[] = [];
  tokens.forEach((progress, i) => {
    if (progress === 56) return; // already home
    if (progress === -1) {
      if (dice === 6) out.push(i);
      return;
    }
    if (progress + dice <= 56) out.push(i);
  });
  return out;
}

function clone(state: LudoState): LudoState {
  return {
    ...state,
    tokens: Object.fromEntries(
      Object.entries(state.tokens).map(([k, v]) => [k, [...v]]),
    ) as Record<LudoColor, number[]>,
    players: state.players.map((p) => ({ ...p })),
  };
}

function advanceTurn(state: LudoState): LudoState {
  const next = clone(state);
  next.turn = (state.turn + 1) % state.players.length;
  next.dice = null;
  next.phase = "roll";
  next.consecutiveSixes = 0;
  next.message = `${COLOR_LABEL[next.players[next.turn].color]}'s turn — roll the dice.`;
  return next;
}

export interface MoveResult {
  state: LudoState;
  captured: boolean;
  finished: boolean;
}

/** Applies a token move. Assumes the move is legal (token is movable). */
export function applyMove(
  state: LudoState,
  color: LudoColor,
  tokenIdx: number,
  dice: number,
): MoveResult {
  const next = clone(state);
  const tokens = next.tokens[color];
  const progress = tokens[tokenIdx];
  let captured = false;
  let finished = false;

  if (progress === -1) {
    tokens[tokenIdx] = 0;
    next.message = `${COLOR_LABEL[color]} brings a token out.`;
  } else {
    const target = progress + dice;
    tokens[tokenIdx] = target;
    if (target === 56) {
      finished = true;
      next.message = `${COLOR_LABEL[color]} brings a token home!`;
    } else {
      next.message = `${COLOR_LABEL[color]} moves ${dice}.`;
    }
  }

  // Capture: landing on an opponent's token on a non-safe track cell.
  const landing = trackIndex(color, tokens[tokenIdx]);
  if (landing !== null && !SAFE_CELLS.has(landing)) {
    for (const other of next.players) {
      if (other.color === color) continue;
      const otherTokens = next.tokens[other.color];
      otherTokens.forEach((p, i) => {
        if (trackIndex(other.color, p) === landing) {
          otherTokens[i] = -1;
          captured = true;
        }
      });
    }
    if (captured) {
      next.message = `${COLOR_LABEL[color]} captures an opponent's token!`;
    }
  }

  // Win check
  if (next.tokens[color].every((p) => p === 56)) {
    next.phase = "over";
    next.winner = color;
    next.dice = null;
    next.message = `${COLOR_LABEL[color]} wins the game!`;
    return { state: next, captured, finished };
  }

  // Extra turn on six, capture, or finishing a token.
  if (dice === 6 || captured || finished) {
    next.phase = "roll";
    next.dice = null;
    next.message += " Roll again.";
  } else {
    return { state: advanceTurn(next), captured, finished };
  }
  return { state: next, captured, finished };
}

/** Applies a dice roll. Returns the updated state (and whether the turn was
 * forfeited by rolling a third consecutive six). */
export function applyRoll(
  state: LudoState,
  dice: number,
): { state: LudoState; forfeited: boolean } {
  const next = clone(state);
  if (dice === 6 && state.consecutiveSixes >= 2) {
    const forfeited = advanceTurn(next);
    forfeited.message = `${COLOR_LABEL[state.players[state.turn].color]} rolled three sixes in a row — turn skipped.`;
    return { state: forfeited, forfeited: true };
  }
  next.dice = dice;
  next.phase = "move";
  next.consecutiveSixes = dice === 6 ? state.consecutiveSixes + 1 : 0;
  next.message = `${COLOR_LABEL[state.players[state.turn].color]} rolled a ${dice}.`;
  return { state: next, forfeited: false };
}

/** Passes the turn when the current player has no legal move. */
export function passTurn(state: LudoState): LudoState {
  const next = advanceTurn(state);
  next.message = `${COLOR_LABEL[state.players[state.turn].color]} has no possible move — turn passes.`;
  return next;
}

export function rollDice(): number {
  return 1 + Math.floor(Math.random() * 6);
}
