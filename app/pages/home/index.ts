import { Request, Response, redirect, session } from "@elements/app";
import html from "./template";
import { lobby, lobbyState } from "#app/shared/services/lobby";
import { trackPresence } from "#app/shared/services/presence";

export default function route(req: Request, res: Response) {
  if (!session.isLoggedIn()) {
    redirect("/signin");
    return;
  }

  let userId = session.getOrThrow("userId");
  let listener = trackPresence(lobby.listen(), userId);

  return new html({
    listener,
    initial: lobbyState(),
    me: { id: userId, handle: session.getOrThrow("userName") },
  });
}
