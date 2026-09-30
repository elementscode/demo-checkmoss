import { test, equal, sql } from "@elements/app";
import route from "./index";

test("signin page", () => {
  test("renders for a signed-out visitor", () => {
    // Handles and emails are unique and other test files insert players too.
    let handle = `yuki_${crypto.randomUUID().slice(0, 8)}`;
    sql(`insert into users (handle, email, passwordHash) values (${handle}, ${handle + "@checkmoss.dev"}, 'x')`);

    let page = route({ params: {}, query: {} } as any, {} as any);

    equal(!!page, true);
  });
});
