import { Request, Response, redirect, session, sql } from "@elements/app";
import html, { DemoPlayer } from "./template";

export default function route(req: Request, res: Response) {
  if (session.isLoggedIn()) {
    redirect("/");
    return;
  }

  let demo = sql<DemoPlayer>(`
    select id, handle, rating from users
     where email like '%@checkmoss.dev'
     order by handle
  `).all();

  return new html({ demo });
}
