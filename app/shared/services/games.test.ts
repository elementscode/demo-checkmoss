import { test, assert, equal, errorf, sql, session, ValidationError } from "@elements/app";
import { playMove, checkFlag, gameState, resign, offerDraw, declineDraw } from "#app/shared/services/games";
import { createChallenge, startGame, lobbyState } from "#app/shared/services/lobby";

function user(handle: string, rating: number = 1500): string {
  return sql<{ id: string }>(`
    insert into users (handle, email, passwordHash, rating)
         values (${handle}, ${handle + "@test.dev"}, 'x', ${rating})
      returning id
  `).firstOrThrow().id;
}

/** A 5+0 game with `white` as white, started from a real challenge. */
function newGame(white: string, black: string): string {
  session.login({ userId: black, userName: "black" });
  createChallenge(300_000, 0);

  let challenge = sql<{ id: string }>(`select id from challenges where creatorId = ${black}`).firstOrThrow();

  return startGame(challenge.id, white, true).gameId;
}

function refused(gameId: string, userId: string, from: string, to: string): boolean {
  try {
    playMove(gameId, userId, from, to);
    return false;
  } catch (err) {
    return err instanceof ValidationError;
  }
}

test("games", () => {
  let w = user("wanda");
  let b = user("bert");

  test("accepting a challenge starts a game and clears the challenge", () => {
    let id = newGame(w, b);
    let g = gameState(id);

    equal(g.white.id, w);
    equal(g.black.id, b);
    equal(g.whiteMs, 300_000);
    equal(g.lastMoveAt, null);

    let lobby = lobbyState();
    equal(lobby.challenges.filter((c) => c.creatorId === b).length, 0);
    equal(lobby.games.filter((x) => x.id === id).length, 1);
  });

  test("a challenge can only be accepted once", () => {
    session.login({ userId: b, userName: "bert" });
    createChallenge(180_000, 2_000);

    let c = sql<{ id: string }>(`select id from challenges where creatorId = ${b}`).firstOrThrow();
    startGame(c.id, w, true);

    let threw = false;

    try {
      startGame(c.id, w, true);
    } catch {
      threw = true;
    }

    assert(threw, "second accept should fail");
  });

  test("fool's mate ends the game and moves both ratings", () => {
    let id = newGame(b, w);

    playMove(id, b, "f2", "f3");
    playMove(id, w, "e7", "e5");
    playMove(id, b, "g2", "g4");

    let ended = playMove(id, w, "d8", "h4");
    let g = gameState(id);

    assert(ended);
    equal(g.status, "finished");
    equal(g.result, "0-1");
    equal(g.reason, "checkmate");
    equal(g.moves, ["f3", "e5", "g4", "Qh4#"]);
    equal(g.blackDelta, 16);
    equal(g.whiteDelta, -16);

    let ratings = sql<{ handle: string; rating: number }>(`select handle, rating from users where id in (${w}, ${b}) order by handle`).all();
    equal(ratings.map((r) => r.rating), [1484, 1516]);
  });

  test("the clock starts on white's first move", () => {
    let id = newGame(w, b);

    playMove(id, w, "e2", "e4");

    let g = gameState(id);
    equal(g.whiteMs, 300_000);
    assert(g.lastMoveAt !== null);
  });

  test("illegal and out-of-turn moves are refused", () => {
    let id = newGame(w, b);

    assert(refused(id, w, "e2", "e5"), "e2-e5 is illegal");
    assert(refused(id, b, "e7", "e5"), "black cannot move first");

    playMove(id, w, "e2", "e4");
    equal(gameState(id).moves, ["e4"]);
  });

  test("a flag fall loses on time", () => {
    let id = newGame(w, b);

    playMove(id, w, "e2", "e4");
    equal(checkFlag(id), false);

    sql(`update games set blackMs = 1000, lastMoveAt = now() - interval '5 seconds' where id = ${id}`);

    equal(checkFlag(id), true);

    let g = gameState(id);
    equal(g.result, "1-0");
    equal(g.reason, "timeout");
    equal(g.blackMs, 0);
  });

  test("resigning loses", () => {
    let id = newGame(w, b);

    session.login({ userId: w, userName: "wanda" });
    resign(id);

    equal(gameState(id).result, "0-1");
    equal(gameState(id).reason, "resignation");
  });

  test("a draw offer can be declined, then accepted", () => {
    let id = newGame(w, b);

    session.login({ userId: w, userName: "wanda" });
    offerDraw(id);
    equal(gameState(id).drawOfferBy, w);

    session.login({ userId: b, userName: "bert" });
    declineDraw(id);
    equal(gameState(id).drawOfferBy, null);

    session.login({ userId: w, userName: "wanda" });
    offerDraw(id);

    session.login({ userId: b, userName: "bert" });
    offerDraw(id);

    let g = gameState(id);
    equal(g.result, "1/2-1/2");
    equal(g.reason, "agreement");
    equal(g.whiteDelta, 0);
  });

  test("a spectator cannot move", () => {
    let id = newGame(w, b);
    let s = user("sam");
    let threw = false;

    try {
      playMove(id, s, "e2", "e4");
    } catch {
      threw = true;
    }

    assert(threw);

    if (gameState(id).moves.length !== 0) {
      errorf("spectator move was stored: %v", gameState(id).moves);
    }
  });
});
