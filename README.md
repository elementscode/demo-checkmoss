![Online chess with live, rated games, built by Claude Code on Elements: ada and chen mid-game in a 10+0 Sicilian, with both clocks, the last move highlighted and the full move list.](https://elements.dev/demos/01a0f3d6-1303-72d6-9e79-fd8db076ab1d/poster?v=02dd212a0960)

# Online chess with live, rated games, built by Claude Code on Elements

> Checkmoss is a full-stack app built with Claude Code on Elements.

Open challenges at 3+2, 5+0 and 10+0, live games with clocks and legal moves, spectators, ratings and replays.

[Run this app on your machine](https://elements.dev/demos/01a0f3d6-1303-72d6-9e79-fd8db076ab1d). Use this demo as inspiration, or as the starting point for your own app. Your agent creates a new app with this one as the scaffold, and you prompt it to add whatever features you want.

## How it's built

Checkmoss needed accounts, a lobby that shows who is online, moves and clocks pushed to players and spectators, and scheduled flag checks. Each of those is a part of Elements, so the agent spent its 17 minutes on chess itself.

- **Live games.** Every move, draw offer and resignation publishes the game's full state on a channel. Both players and every spectator listen for that game, so the board, clocks and move list stay in step on every screen.

- **Who is online.** A page's live connection marks its player online and offline, and the lobby's channel pushes that list along with open challenges and games in progress.

- **Moves as function calls.** The board calls `@rpc` functions to move, offer a draw or resign. The server checks the move is legal, runs the clock and records it in one locked transaction, and a checkmate moves both players' ratings in that same transaction.

- **Flag falls on a schedule.** A one-line cron schedule runs a job every minute that ends games whose clock ran out with nobody watching. Open pages report a flag fall themselves, and the server decides.

- **Sessions.** Players sign up with a username and sign in with either the username or the email.

- **Data from SQL files.** Migrations define the schema and seed four rated players, twelve finished games, one game in progress and an open challenge. The project server applied each one as soon as it was saved.

## Why Elements

Elements is an integrated full-stack app framework and a project server. The project server checks the agent's work as it builds: it type-checks the server and browser code, analyzes the program, applies migrations and runs the tests, then reports the results to the agent. A security mistake, such as calling a server-only function from the browser, is a compile error. The agent reads the report and fixes its own mistakes before it tells you a feature is done. The same checks run on every feature you ask for next.
