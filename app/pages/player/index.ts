import { Request, Response, session, sql, NotFoundError } from "@elements/app";
import html, { Profile, HistoryRow } from "./template";
import { lobby } from "#app/shared/services/lobby";
import { trackPresence } from "#app/shared/services/presence";

export default function route(req: Request, res: Response) {
  let handle = String(req.params.handle).toLowerCase();

  let profile = sql<Profile>(`
    select id, handle, rating, createdAt from users where handle = ${handle}
  `).first();

  if (!profile) {
    throw new NotFoundError(`no player named ${handle}`);
  }

  let games = sql<HistoryRow>(`
    select g.id, g.status, g.result, g.reason, g.initialMs, g.incrementMs,
           cardinality(g.moves) as plies, g.createdAt,
           (g.whiteId = ${profile.id}) as asWhite,
           o.handle as opponent,
           case when g.whiteId = ${profile.id} then g.blackRating else g.whiteRating end as opponentRating,
           case when g.whiteId = ${profile.id} then g.whiteDelta else g.blackDelta end as delta
      from games g
      join users o on o.id = case when g.whiteId = ${profile.id} then g.blackId else g.whiteId end
     where g.whiteId = ${profile.id} or g.blackId = ${profile.id}
     order by g.createdAt desc
     limit 100
  `).all();

  // Keeps the viewer on the lobby's online list while they browse profiles.
  let presence = trackPresence(lobby.listen({ filter: () => false }), session.get("userId"));

  return new html({ profile, games, presence });
}
