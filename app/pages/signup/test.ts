import { test, equal } from "@elements/app";
import { isHandle, normalizeHandle } from "#app/shared/services/auth";

test("signup page", () => {
  test("usernames", () => {
    equal(normalizeHandle("  Ada_L "), "ada_l");
    equal(isHandle("ada"), true);
    equal(isHandle("ab"), false);
    equal(isHandle("has space"), false);
    equal(isHandle("x".repeat(21)), false);
  });
});
