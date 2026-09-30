import { test, equal } from "@elements/app";
import { ratingDelta } from "#app/shared/services/rating";

test("rating", () => {
  test("equal players move 16 points on a decisive game", () => {
    equal(ratingDelta(1500, 1500, 1), 16);
    equal(ratingDelta(1500, 1500, 0), -16);
  });

  test("a draw between equals moves nothing", () => {
    equal(ratingDelta(1500, 1500, 0.5), 0);
  });

  test("beating a much stronger player pays more than beating a weaker one", () => {
    equal(ratingDelta(1400, 1800, 1), 29);
    equal(ratingDelta(1800, 1400, 1), 3);
  });
});
