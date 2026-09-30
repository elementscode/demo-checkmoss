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
