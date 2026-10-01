![Checkmoss, an online chess site built with Elements: ada and chen mid-game in a 10+0 Sicilian, with both clocks, the last move highlighted and the full move list.](https://elements.dev/demos/01a0f3d6-1303-72d6-9e79-fd8db076ab1d/poster?v=02dd212a0960)

# Checkmoss

> A demo app built with [Elements](https://elements.dev).

Open challenges at 3+2, 5+0 and 10+0, live games with clocks and legal moves, spectators, ratings and replays.

**Demo:** [Checkmoss](https://elements.dev/demos/01a0f3d6-1303-72d6-9e79-fd8db076ab1d)

## Agent specs

What one run of the prompt below took, from an empty Elements project to this
app.

- **Agent:** Claude Code, Opus 5.5 Medium
- **Time:** 17 min
- **Cost:** $5.44 at API rates, September 2026

## Get started

```bash
elements create checkmoss -scaffold=elementscode/demo-checkmoss
```

## How it's built

Checkmoss needed accounts, a lobby that shows who is online, moves and clocks pushed to players and spectators, and scheduled flag checks. Each of those is a part of Elements, so the agent spent its 17 minutes on chess itself.

### What Elements gave the app

- **Live games from one channel.** `gameChannel` in `app/shared/services/games.ts` carries a game's full state. The game page listens filtered to its own game id, and every move, draw offer and resignation publishes, so both players and any spectators see the same board and clocks.
- **Presence from the listener.** `trackPresence` in `app/shared/services/presence.ts` hooks a page's listener `connect` and `disconnect` events to record who is online. The `lobby` channel in `app/shared/services/lobby.ts` pushes that list with open challenges and games in progress.
- **Server calls as function calls.** The board calls `move`, `offerDraw` and `resign` as `@rpc` functions. `playMove` checks legality, runs the clock and records the move in one locked transaction, and a checkmate moves both ratings in that same transaction.
- **Background work on a schedule.** One line in `index.ts`, `app.cron("every 1m", "sweep flags", ...)`, schedules `SweepFlagsJob` in `app/jobs/sweep-flags.ts` to end games whose clock ran out unwatched. Open pages call the `flag` rpc themselves, and the server decides.
- **Sessions.** `app/shared/services/auth.ts` signs players up with a username and signs them in with either the username or the email.
- **Data from SQL files.** Two migrations define the schema and seed four rated players, twelve finished games, one game in progress and an open challenge. The project server applied each one as soon as it was saved.

### What the project server gave the agent

The project server runs alongside the agent and answers as soon as a file is saved: it type-checks the templates, TypeScript and SQL, applies migrations and reruns the tests, so every question came back right away and the agent kept building.

### What shipped

The app type-checks with zero errors and all 29 tests pass. Every page was checked on desktop and phone before publishing, and two players in separate sessions played a game to checkmate while a spectator watched.

Start in `app/shared/services/games.ts`.

## Demo accounts

The seed creates four players with ratings and twelve finished games between
them, covering checkmate, resignation, timeout, stalemate and agreed draws.
Ada and Chen are mid-game in a 10+0 Sicilian, whose clocks hold until the next
move, and Dara has an open 3+2 challenge in the lobby. Every account's
password is `checkmoss`, and the sign-in page lists them with a one-click
sign in. You can sign in with the username or the email.

| Username | Email               | Rating |
| -------- | ------------------- | ------ |
| ada      | ada@checkmoss.dev   | 1479   |
| boris    | boris@checkmoss.dev | 1460   |
| chen     | chen@checkmoss.dev  | 1560   |
| dara     | dara@checkmoss.dev  | 1501   |

## The prompt

```text
Build an online chess site named checkmoss.

- Sign up, log in, pick a username.
- Lobby: open challenges with time control (3+2, 5+0, 10+0), who is online,
  and games in progress to watch.
- Create a challenge or accept one.
- Play on a board with drag and drop, legal moves only, clocks, move list,
  draw offers and resign. Check, checkmate, stalemate and flag fall end the
  game.
- A rating per player that moves after each game.
- Profile with rating and game history, and replay a past game move by move.

Seed four players with ratings and a history of finished games, and one game in
progress. Show the seeded logins on the sign-in page.

Moves, clocks, the lobby and spectators update in real time.
```

## License

MIT. See [LICENSE](LICENSE).
