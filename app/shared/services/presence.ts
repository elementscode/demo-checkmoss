import type { Listener } from "@elements/app";
import { join, leave } from "#app/shared/services/lobby";

/**
 * Registers a page view as online for as long as its listener is attached.
 * The disconnect waits so a reload or a move between pages never drops the
 * player off the list for other viewers. Routes call this; the callbacks run
 * after the route returns, so the user comes from the route, not the session.
 */
export function trackPresence<T>(listener: Listener<T>, userId: string | undefined): Listener<T> {
  if (!userId) {
    return listener;
  }

  return listener
    .on("connect", (l) => join(l.id, userId))
    .on("disconnect", (l) => setTimeout(() => leave(l.id), 3000));
}
