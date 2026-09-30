import { Request, Response, session } from "@elements/app";
import html from "./template";
import { gameChannel, gameState } from "#app/shared/services/games";
import { trackPresence } from "#app/shared/services/presence";

export default function route(req: Request, res: Response) {
  let id = req.params.id;
  let userId = session.get("userId");

  // Listen before reading, so a move made in between still reaches the page.
  let listener = trackPresence(gameChannel.listen({ filter: (g) => g.id === id }), userId);

  let initial = gameState(id);
  let ply = req.query.ply === undefined ? null : Math.max(0, Math.min(Number(req.query.ply) || 0, initial.moves.length));

  return new html({ listener, initial, myId: userId ?? "", startPly: ply === initial.moves.length ? null : ply });
}
