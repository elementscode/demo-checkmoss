import { test, equal, sql, NotFoundError } from "@elements/app";
import route from "./index";

test("player page", () => {
  test("an unknown player is a 404", () => {
    let notFound = false;

    try {
      route({ params: { handle: "ghost" }, query: {} } as any, {} as any);
    } catch (err) {
      notFound = err instanceof NotFoundError;
    }

    equal(notFound, true);
  });

  test("a known player renders, whatever case the url uses", () => {
    sql(`insert into users (handle, email, passwordHash) values ('yuki', 'yuki@test.dev', 'x')`);

    let page = route({ params: { handle: "Yuki" }, query: {} } as any, {} as any);

    equal(!!page, true);
  });
});
