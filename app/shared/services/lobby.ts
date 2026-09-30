import { Channel, sql, session, tx, ValidationError, NotFoundError } from "@elements/app";
import { hostname } from "node:os";
import { isTimeControl } from "#app/shared/chess";

export interface LobbyChallenge {
  id: string;
  creatorId: string;
  handle: string;
  rating: number;
  initialMs: number;
  incrementMs: number;
}

export interface LobbyGame {
  id: string;
  whiteHandle: string;
  whiteRating: number;
  blackHandle: string;
  blackRating: number;
  initialMs: number;
  incrementMs: number;
}

export interface LobbyPlayer {
  id: string;
  handle: string;
  rating: number;
  playing: boolean;
}

export interface LobbyState {
  challenges: LobbyChallenge[];
  games: LobbyGame[];
  online: LobbyPlayer[];
  started: { gameId: string; userIds: string[] } | null;
}

/**
 * Every lobby receives the whole lobby in each notification, so a change is
 * one query on the server rather than one per open lobby. The limits keep a
 * notification under the 8000-byte NOTIFY cap.
 */
export const lobby = new Channel<LobbyState>("lobby");

export function lobbyState(started: LobbyState["started"] = null): LobbyState {
  let challenges = sql<LobbyChallenge>(`
    select c.id, c.creatorId, u.handle, u.rating, c.initialMs, c.incrementMs
      from challenges c
      join users u on u.id = c.creatorId
     order by c.createdAt desc
     limit 12
  `).all();

  let games = sql<LobbyGame>(`
    select g.id, w.handle as whiteHandle, g.whiteRating, b.handle as blackHandle,
           g.blackRating, g.initialMs, g.incrementMs
      from games g
      join users w on w.id = g.whiteId
      join users b on b.id = g.blackId
     where g.status = 'active'
     order by g.createdAt desc
     limit 10
  `).all();

  let online = sql<LobbyPlayer>(`
    select u.id, u.handle, u.rating,
           exists (
             select 1 from games g
              where g.status = 'active' and (g.whiteId = u.id or g.blackId = u.id)
           ) as playing
      from users u
     where exists (select 1 from presence p where p.userId = u.id)
     order by u.rating desc
     limit 24
  `).all();

  return { challenges, games, online, started };
}

export function notifyLobby(started: LobbyState["started"] = null) {
  lobby.notify(lobbyState(started));
}

export function join(listenerId: string, userId: string) {
  sql(`
    insert into presence (listenerId, userId, host)
         values (${listenerId}, ${userId}, ${hostname()})
    on conflict do nothing
  `);

  notifyLobby();
}

export function leave(listenerId: string) {
  sql(`delete from presence where listenerId = ${listenerId}`);
  notifyLobby();
}

/** Rows this host left behind when it last stopped, before its disconnects ran. */
export function clearThisHost() {
  sql(`delete from presence where host = ${hostname()}`);
}

/** @rpc */
export function createChallenge(initialMs: number, incrementMs: number) {
  let userId = session.getOrThrow("userId");

  if (!isTimeControl(initialMs, incrementMs)) {
    throw new ValidationError("pick 3+2, 5+0 or 10+0");
  }

  sql(`
    insert into challenges (creatorId, initialMs, incrementMs)
         values (${userId}, ${initialMs}, ${incrementMs})
    on conflict (creatorId) do update
       set initialMs = excluded.initialMs,
           incrementMs = excluded.incrementMs,
           createdAt = now()
  `);

  notifyLobby();
}

/** @rpc */
export function cancelChallenge() {
  let userId = session.getOrThrow("userId");

  sql(`delete from challenges where creatorId = ${userId}`);
  notifyLobby();
}

/**
 * Accepting deletes the challenge and starts the game in one transaction, so
 * two players accepting at once cannot both get a game from it.
 */
export function startGame(challengeId: string, userId: string, white: boolean): { gameId: string; creatorId: string } {
  return tx(() => {
    let c = sql<{ creatorId: string; initialMs: number; incrementMs: number }>(`
      delete from challenges where id = ${challengeId}
      returning creatorId, initialMs, incrementMs
    `).first();

    if (!c) {
      throw new NotFoundError("that challenge was taken or withdrawn");
    }

    if (c.creatorId === userId) {
      throw new ValidationError("you cannot accept your own challenge");
    }

    let whiteId = white ? userId : c.creatorId;
    let blackId = white ? c.creatorId : userId;

    let game = sql<{ id: string }>(`
      insert into games (whiteId, blackId, initialMs, incrementMs, whiteMs, blackMs, whiteRating, blackRating)
           select ${whiteId}, ${blackId}, ${c.initialMs}, ${c.incrementMs}, ${c.initialMs}, ${c.initialMs},
                  (select rating from users where id = ${whiteId}),
                  (select rating from users where id = ${blackId})
      returning id
    `).firstOrThrow("insert returned no row");

    sql(`delete from challenges where creatorId in (${userId}, ${c.creatorId})`);

    return { gameId: game.id, creatorId: c.creatorId };
  });
}

/** @rpc */
export function acceptChallenge(challengeId: string): string {
  let userId = session.getOrThrow("userId");
  let { gameId, creatorId } = startGame(challengeId, userId, Math.random() < 0.5);

  notifyLobby({ gameId, userIds: [userId, creatorId] });

  return gameId;
}
