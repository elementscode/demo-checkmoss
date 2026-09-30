import { test, equal, sql, NotFoundError } from "@elements/app";
import { gameState, isUuid } from "#app/shared/services/games";

test("game page", () => {
  test("an unknown or malformed game id is a 404", () => {
    for (let id of ["nope", "01a0f3c3-0000-7000-8000-000000000000"]) {
      let notFound = false;

      try {
        gameState(id);
      } catch (err) {
        notFound = err instanceof NotFoundError;
      }

      equal(notFound, true, id);
    }
  });

  test("the state carries both players and the server clock", () => {
    let ids = sql<{ id: string }>(`
      insert into users (handle, email, passwordHash)
           values ('w', 'w@test.dev', 'x'), ('b', 'b@test.dev', 'x')
        returning id
    `).all().map((r) => r.id);

    let game = sql<{ id: string }>(`
      insert into games (whiteId, blackId, initialMs, incrementMs, whiteMs, blackMs, whiteRating, blackRating)
           values (${ids[0]}, ${ids[1]}, 180000, 2000, 180000, 180000, 1500, 1500)
        returning id
    `).firstOrThrow();

    let g = gameState(game.id);

    equal(isUuid(g.id), true);
    equal([g.white.handle, g.black.handle], ["w", "b"]);
    equal(g.status, "active");
    equal(Math.abs(g.serverNow - Date.now()) < 5_000, true);
  });
});
