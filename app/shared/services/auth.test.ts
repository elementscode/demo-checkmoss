import { test, assert, equal, session, sql, AuthError } from "@elements/app";
import { signup, signin } from "#app/shared/services/auth";

function rejected(login: string, password: string): boolean {
  try {
    signin(login, password);
    return false;
  } catch (err) {
    return err instanceof AuthError;
  }
}

test("auth", () => {
  signup({ handle: "Magnus_C", email: "Magnus@Example.com", password: "correct horse", error: "" });
  equal(session.get("userName"), "magnus_c", "signup signs in");

  test("signup stores a lowercase username", () => {
    let row = sql<{ handle: string; rating: number }>(`select handle, rating from users where email = 'magnus@example.com'`).firstOrThrow();

    equal(row.handle, "magnus_c");
    equal(row.rating, 1500);
  });

  test("signin takes the username or the email", () => {
    signin("MAGNUS_C", "correct horse");
    equal(session.get("userName"), "magnus_c");

    signin("magnus@example.com", "correct horse");
    equal(session.get("userName"), "magnus_c");
  });

  test("a wrong password or unknown user is refused", () => {
    assert(rejected("magnus_c", "wrong password"));
    assert(rejected("nobody", "correct horse"));
  });

  test("a taken or malformed username is refused", () => {
    let taken = false;

    try {
      signup({ handle: "magnus_c", email: "other@example.com", password: "long enough", error: "" });
    } catch (err) {
      taken = err instanceof AuthError;
    }

    assert(taken, "taken username");

    let malformed = false;

    try {
      signup({ handle: "a b", email: "ab@example.com", password: "long enough", error: "" });
    } catch (err) {
      malformed = err instanceof AuthError;
    }

    assert(malformed, "space in username");
  });
});
