import { Channel, sql, session, tx, ValidationError, NotFoundError, ForbiddenError } from "@elements/app";
import { Chess } from "chess.js";
import { GameState, Color, replay, sideToMove, hasMatingMaterial } from "#app/shared/chess";
import { ratingDelta } from "#app/shared/services/rating";
import { notifyLobby } from "#app/shared/services/lobby";

interface GameRow {
  id: string;
  whiteId: string;
  blackId: string;
  whiteHandle: string;
  blackHandle: string;
  initialMs: number;
  incrementMs: number;
  moves: string[];
  clocks: number[];
  whiteMs: number;
  blackMs: number;
  lastMoveAt: Date | null;
  status: "active" | "finished";
  result: "1-0" | "0-1" | "1/2-1/2" | null;
  reason: string | null;
  drawOfferBy: string | null;
  whiteRating: number;
  blackRating: number;
  whiteDelta: number | null;
  blackDelta: number | null;
  createdAt: Date;
}

/** Each notification is the whole game, so a watcher never has to fetch after one. */
export const gameChannel = new Channel<GameState>("game");

function loadRow(gameId: string, lock: boolean = false): GameRow {
  let row = lock
    ? sql<GameRow>(`select g.*, '' as whiteHandle, '' as blackHandle from games g where g.id = ${gameId} for update`).first()
    : sql<GameRow>(`
        select g.*, w.handle as whiteHandle, b.handle as blackHandle
          from games g
          join users w on w.id = g.whiteId
          join users b on b.id = g.blackId
         where g.id = ${gameId}
      `).first();

  if (!row) {
    throw new NotFoundError("no such game");
  }

  return row;
}

function toState(g: GameRow): GameState {
  return {
    id: g.id,
    white: { id: g.whiteId, handle: g.whiteHandle, rating: g.whiteRating },
    black: { id: g.blackId, handle: g.blackHandle, rating: g.blackRating },
    initialMs: g.initialMs,
    incrementMs: g.incrementMs,
    moves: g.moves,
    clocks: g.clocks,
    whiteMs: g.whiteMs,
    blackMs: g.blackMs,
    lastMoveAt: g.lastMoveAt ? +g.lastMoveAt : null,
    serverNow: Date.now(),
    status: g.status,
    result: g.result,
    reason: g.reason,
    drawOfferBy: g.drawOfferBy,
    whiteDelta: g.whiteDelta,
    blackDelta: g.blackDelta,
    createdAt: +g.createdAt,
  };
}

export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function gameState(gameId: string): GameState {
  if (!isUuid(gameId)) {
    throw new NotFoundError("no such game");
  }

  return toState(loadRow(gameId));
}

function publish(gameId: string, ended: boolean) {
  gameChannel.notify(gameState(gameId));

  if (ended) {
    notifyLobby();
  }
}

function colorOf(g: GameRow, userId: string): Color {
  if (g.whiteId === userId) {
    return "w";
  }

  if (g.blackId === userId) {
    return "b";
  }

  throw new ForbiddenError("you are not playing in this game");
}

/** Ends a game inside the caller's transaction and moves both ratings. */
function finish(g: GameRow, result: "1-0" | "0-1" | "1/2-1/2", reason: string) {
  let ratings = sql<{ id: string; rating: number }>(`
    select id, rating from users where id in (${g.whiteId}, ${g.blackId}) for update
  `).all();

  let white = ratings.find((r) => r.id === g.whiteId)!.rating;
  let black = ratings.find((r) => r.id === g.blackId)!.rating;
  let score = result === "1-0" ? 1 : result === "0-1" ? 0 : 0.5;
  let delta = ratingDelta(white, black, score);

  sql(`update users set rating = rating + ${delta} where id = ${g.whiteId}`);
  sql(`update users set rating = rating - ${delta} where id = ${g.blackId}`);

  sql(`
    update games
       set status = 'finished',
           result = ${result},
           reason = ${reason},
           drawOfferBy = null,
           whiteMs = ${g.whiteMs},
           blackMs = ${g.blackMs},
           whiteDelta = ${delta},
           blackDelta = ${-delta},
           endedAt = now()
     where id = ${g.id}
  `);
}

/** A flag fall loses, unless the opponent has nothing left to mate with. */
function finishOnTime(g: GameRow, chess: Chess, flagged: Color) {
  if (flagged === "w") {
    g.whiteMs = 0;
  } else {
    g.blackMs = 0;
  }

  let winner: Color = flagged === "w" ? "b" : "w";

  if (!hasMatingMaterial(chess, winner)) {
    finish(g, "1/2-1/2", "timeout vs insufficient material");
    return;
  }

  finish(g, winner === "w" ? "1-0" : "0-1", "timeout");
}

/** Time the side to move has left right now, or null when its clock is not running. */
function runningLeft(g: GameRow, now: number): number | null {
  if (!g.lastMoveAt) {
    return null;
  }

  let stored = sideToMove(g.moves) === "w" ? g.whiteMs : g.blackMs;

  return stored - (now - +g.lastMoveAt);
}

/** Applies one move for the signed-in player. Returns whether the game ended. */
export function playMove(gameId: string, userId: string, from: string, to: string, promotion?: string): boolean {
  return tx(() => {
    let g = loadRow(gameId, true);

    if (g.status !== "active") {
      throw new ValidationError("the game is over");
    }

    let color = colorOf(g, userId);
    let chess = replay(g.moves);

    if (chess.turn() !== color) {
      throw new ValidationError("it is not your move");
    }

    let now = Date.now();
    let left = runningLeft(g, now) ?? (color === "w" ? g.whiteMs : g.blackMs);

    if (left <= 0) {
      finishOnTime(g, chess, color);
      return true;
    }

    let move;

    try {
      move = chess.move({ from, to, promotion: promotion || "q" });
    } catch {
      throw new ValidationError("illegal move");
    }

    left += g.incrementMs;

    if (color === "w") {
      g.whiteMs = left;
    } else {
      g.blackMs = left;
    }

    sql(`
      update games
         set moves = array_append(moves, ${move.san}),
             clocks = array_append(clocks, ${left}),
             whiteMs = ${g.whiteMs},
             blackMs = ${g.blackMs},
             lastMoveAt = ${new Date(now)},
             drawOfferBy = case when drawOfferBy = ${userId} then drawOfferBy end
       where id = ${gameId}
    `);

    g.moves = [...g.moves, move.san];

    if (chess.isCheckmate()) {
      finish(g, color === "w" ? "1-0" : "0-1", "checkmate");
      return true;
    }

    let draw = chess.isStalemate() ? "stalemate"
      : chess.isInsufficientMaterial() ? "insufficient material"
      : chess.isThreefoldRepetition() ? "repetition"
      : chess.isDrawByFiftyMoves() ? "the fifty-move rule"
      : null;

    if (draw) {
      finish(g, "1/2-1/2", draw);
      return true;
    }

    return false;
  });
}

/** Ends the game on time if the side to move has run out. Returns whether it did. */
export function checkFlag(gameId: string): boolean {
  return tx(() => {
    let g = loadRow(gameId, true);

    if (g.status !== "active") {
      return false;
    }

    let left = runningLeft(g, Date.now());

    if (left === null || left > 0) {
      return false;
    }

    finishOnTime(g, replay(g.moves), sideToMove(g.moves));

    return true;
  });
}

/** Catches flag falls in games nobody is watching. */
export function sweepFlags() {
  let due = sql<{ id: string }>(`
    select id from games
     where status = 'active'
       and lastMoveAt is not null
       and (case when cardinality(moves) % 2 = 0 then whiteMs else blackMs end)
           <= extract(epoch from now() - lastMoveAt) * 1000
  `).all();

  for (let d of due) {
    if (checkFlag(d.id)) {
      publish(d.id, true);
    }
  }
}

/** @rpc */
export function move(gameId: string, from: string, to: string, promotion?: string) {
  let userId = session.getOrThrow("userId");
  let ended = playMove(gameId, userId, from, to, promotion);

  publish(gameId, ended);
}

/** Anyone watching may call this when a clock reaches zero; the server decides. @rpc */
export function flag(gameId: string) {
  if (checkFlag(gameId)) {
    publish(gameId, true);
  }
}

/** @rpc */
export function resign(gameId: string) {
  let userId = session.getOrThrow("userId");

  tx(() => {
    let g = loadRow(gameId, true);

    if (g.status !== "active") {
      throw new ValidationError("the game is over");
    }

    finish(g, colorOf(g, userId) === "w" ? "0-1" : "1-0", "resignation");
  });

  publish(gameId, true);
}

/** Offering when the opponent already has an offer open accepts it. @rpc */
export function offerDraw(gameId: string) {
  let userId = session.getOrThrow("userId");

  let ended = tx(() => {
    let g = loadRow(gameId, true);

    if (g.status !== "active") {
      throw new ValidationError("the game is over");
    }

    colorOf(g, userId);

    if (g.drawOfferBy && g.drawOfferBy !== userId) {
      finish(g, "1/2-1/2", "agreement");
      return true;
    }

    sql(`update games set drawOfferBy = ${userId} where id = ${gameId}`);

    return false;
  });

  publish(gameId, ended);
}

/** @rpc */
export function declineDraw(gameId: string) {
  let userId = session.getOrThrow("userId");

  tx(() => {
    let g = loadRow(gameId, true);
    colorOf(g, userId);

    sql(`update games set drawOfferBy = null where id = ${gameId} and drawOfferBy <> ${userId}`);
  });

  publish(gameId, false);
}

/** @rpc */
export function loadGame(gameId: string): GameState {
  return gameState(gameId);
}
