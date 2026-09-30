import { Chess } from "chess.js";

export type Color = "w" | "b";

export interface PlayerInfo {
  id: string;
  handle: string;
  rating: number;
}

export interface GameState {
  id: string;
  white: PlayerInfo;
  black: PlayerInfo;
  initialMs: number;
  incrementMs: number;
  moves: string[];
  clocks: number[];
  whiteMs: number;
  blackMs: number;
  lastMoveAt: number | null;
  serverNow: number;
  status: "active" | "finished";
  result: "1-0" | "0-1" | "1/2-1/2" | null;
  reason: string | null;
  drawOfferBy: string | null;
  whiteDelta: number | null;
  blackDelta: number | null;
  createdAt: number;
}

export const TIME_CONTROLS = [
  { initialMs: 180_000, incrementMs: 2_000 },
  { initialMs: 300_000, incrementMs: 0 },
  { initialMs: 600_000, incrementMs: 0 },
];

export function timeControlLabel(initialMs: number, incrementMs: number): string {
  return `${initialMs / 60_000}+${incrementMs / 1000}`;
}

export function isTimeControl(initialMs: number, incrementMs: number): boolean {
  return TIME_CONTROLS.some((t) => t.initialMs === initialMs && t.incrementMs === incrementMs);
}

/** Replays SAN moves from the start, so repetition and the fifty-move count are known. */
export function replay(moves: string[], upTo: number = moves.length): Chess {
  let chess = new Chess();

  for (let i = 0; i < upTo && i < moves.length; i++) {
    chess.move(moves[i]);
  }

  return chess;
}

export function sideToMove(moves: string[]): Color {
  return moves.length % 2 === 0 ? "w" : "b";
}

/**
 * Time left for one side at `now`. Only the side to move is running, and
 * only once lastMoveAt is set.
 */
export function timeLeft(g: GameState, color: Color, now: number): number {
  let stored = color === "w" ? g.whiteMs : g.blackMs;

  if (g.status !== "active" || g.lastMoveAt === null || sideToMove(g.moves) !== color) {
    return stored;
  }

  return Math.max(0, stored - (now - g.lastMoveAt));
}

export function formatClock(ms: number): string {
  let total = Math.max(0, ms);

  if (total < 10_000) {
    let tenths = Math.floor(total / 100);
    return `0:0${Math.floor(tenths / 10)}.${tenths % 10}`;
  }

  let seconds = Math.ceil(total / 1000);
  let m = Math.floor(seconds / 60);
  let s = seconds % 60;

  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export function resultText(g: { result: string | null; reason: string | null }, whiteName: string, blackName: string): string {
  if (!g.result) {
    return "";
  }

  let why = g.reason ? ` by ${g.reason}` : "";

  switch (g.result) {
    case "1-0":
      return `${whiteName} won${why}`;

    case "0-1":
      return `${blackName} won${why}`;

    default:
      return g.reason === "stalemate" ? "Draw by stalemate" : `Draw${why}`;
  }
}

/** Whether a side could still deliver mate, which decides a flag fall against a bare king. */
export function hasMatingMaterial(chess: Chess, color: Color): boolean {
  let minors = 0;

  for (let row of chess.board()) {
    for (let sq of row) {
      if (!sq || sq.color !== color) {
        continue;
      }

      if (sq.type === "p" || sq.type === "r" || sq.type === "q") {
        return true;
      }

      if (sq.type === "b" || sq.type === "n") {
        minors++;
      }
    }
  }

  return minors >= 2;
}
