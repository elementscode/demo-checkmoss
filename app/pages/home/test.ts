import { test, equal, sql, session } from "@elements/app";
import { lobbyState, join, leave, createChallenge, cancelChallenge } from "#app/shared/services/lobby";

function user(handle: string): string {
  return sql<{ id: string }>(`
    insert into users (handle, email, passwordHash) values (${handle}, ${handle + "@test.dev"}, 'x') returning id
  `).firstOrThrow().id;
}

test("lobby", () => {
  let ada = user("ada-lobby");

  /** The lobby lists every open challenge; only this player's matter here. */
  function mine() {
    return lobbyState().challenges.filter((c) => c.creatorId === ada);
  }

  test("a player is online while any of their pages is open", () => {
    join("tab-1", ada);
    join("tab-2", ada);
    equal(lobbyState().online.map((p) => p.handle), ["ada-lobby"]);

    leave("tab-1");
    equal(lobbyState().online.length, 1);

    leave("tab-2");
    equal(lobbyState().online.length, 0);
  });

  test("a new challenge replaces the player's open one", () => {
    session.login({ userId: ada, userName: "ada-lobby" });
    createChallenge(180_000, 2_000);
    createChallenge(600_000, 0);

    let open = mine();
    equal(open.length, 1);
    equal(open[0].initialMs, 600_000);

    cancelChallenge();
    equal(mine().length, 0);
  });

  test("only the three time controls can be posted", () => {
    session.login({ userId: ada, userName: "ada-lobby" });

    let refused = false;

    try {
      createChallenge(60_000, 0);
    } catch {
      refused = true;
    }

    equal(refused, true);
  });
});
