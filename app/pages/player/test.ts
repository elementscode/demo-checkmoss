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
    // Handles and emails are unique and other test files insert players too.
    let handle = `yuki_${crypto.randomUUID().slice(0, 8)}`;
    sql(`insert into users (handle, email, passwordHash) values (${handle}, ${handle + "@test.dev"}, 'x')`);

    let page = route({ params: { handle: "Y" + handle.slice(1) }, query: {} } as any, {} as any);

    equal(!!page, true);
  });
});
