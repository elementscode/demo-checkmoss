import { test, equal } from "@elements/app";
import { Chess } from "chess.js";
import { formatClock, timeLeft, timeControlLabel, isTimeControl, replay, hasMatingMaterial, GameState } from "#app/shared/chess";

function game(over: Partial<GameState>): GameState {
  return {
    id: "g",
    white: { id: "w", handle: "w", rating: 1500 },
    black: { id: "b", handle: "b", rating: 1500 },
    initialMs: 300_000,
    incrementMs: 0,
    moves: [],
    clocks: [],
    whiteMs: 300_000,
    blackMs: 300_000,
    lastMoveAt: null,
    serverNow: 0,
    status: "active",
    result: null,
    reason: null,
    drawOfferBy: null,
    whiteDelta: null,
    blackDelta: null,
    createdAt: 0,
    ...over,
  };
}

test("chess helpers", () => {
  test("clock formatting", () => {
    equal(formatClock(300_000), "5:00");
    equal(formatClock(61_001), "1:02");
    equal(formatClock(9_450), "0:09.4");
    equal(formatClock(-5), "0:00.0");
  });

  test("only the side to move runs, and only once started", () => {
    equal(timeLeft(game({}), "w", 10_000), 300_000);

    let g = game({ moves: ["e4"], lastMoveAt: 1_000 });
    equal(timeLeft(g, "b", 11_000), 290_000);
    equal(timeLeft(g, "w", 11_000), 300_000);
    equal(timeLeft({ ...g, status: "finished" }, "b", 11_000), 300_000);
  });

  test("time controls", () => {
    equal(timeControlLabel(180_000, 2_000), "3+2");
    equal(isTimeControl(600_000, 0), true);
    equal(isTimeControl(60_000, 0), false);
  });

  test("mating material decides a flag fall against a bare king", () => {
    equal(hasMatingMaterial(replay(["e4"]), "w"), true);
    equal(hasMatingMaterial(new Chess("7k/8/8/8/8/8/8/K6Q w - - 0 1"), "w"), true);
    equal(hasMatingMaterial(new Chess("7k/8/8/8/8/8/8/K5N1 w - - 0 1"), "w"), false);
    equal(hasMatingMaterial(new Chess("7k/8/8/8/8/8/8/K4BN1 w - - 0 1"), "w"), true);
    equal(hasMatingMaterial(new Chess("7k/8/8/8/8/8/8/K5N1 w - - 0 1"), "b"), false);
  });
});
