import { test, equal, sql } from "@elements/app";
import route from "./index";

test("signin page", () => {
  test("renders for a signed-out visitor", () => {
    sql(`insert into users (handle, email, passwordHash) values ('yuki', 'yuki@checkmoss.dev', 'x')`);

    let page = route({ params: {}, query: {} } as any, {} as any);

    equal(!!page, true);
  });
});
