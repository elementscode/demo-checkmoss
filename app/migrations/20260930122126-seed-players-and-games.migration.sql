-- seed four players, their finished games, and one game in progress
/** @env development */

insert into users (handle, email, passwordHash, rating)
     values
       ('ada', 'ada@checkmoss.dev', crypt('checkmoss', genSalt('bf', 12)), 1500),
       ('boris', 'boris@checkmoss.dev', crypt('checkmoss', genSalt('bf', 12)), 1500),
       ('chen', 'chen@checkmoss.dev', crypt('checkmoss', genSalt('bf', 12)), 1500),
       ('dara', 'dara@checkmoss.dev', crypt('checkmoss', genSalt('bf', 12)), 1500);

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 300000, 0, array['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#']::text[], array[298500, 297800, 288000, 293862, 280313, 282424, 275438]::integer[], 275438, 282424, '2026-09-16T18:01:03.000Z', 'finished', '1-0', 'checkmate', 1500, 1500, 16, -16, '2026-09-16T18:00:00.000Z', '2026-09-16T18:01:03.000Z'
       from users w, users b where w.handle = 'ada' and b.handle = 'boris';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 600000, 0, array['e4', 'e5', 'Nf3', 'd6', 'd4', 'Bg4', 'dxe5', 'Bxf3', 'Qxf3', 'dxe5', 'Bc4', 'Nf6', 'Qb3', 'Qe7', 'Nc3', 'c6', 'Bg5', 'b5', 'Nxb5', 'cxb5', 'Bxb5+', 'Nbd7', 'O-O-O', 'Rd8', 'Rxd7', 'Rxd7', 'Rd1', 'Qe6', 'Bxd7+', 'Nxd7', 'Qb8+', 'Nxb8', 'Rd8#']::text[], array[598500, 597800, 577500, 589925, 562125, 567050, 552375, 549800, 527625, 538175, 508500, 532175, 495000, 511175, 487125, 495800, 464250, 486050, 447000, 461300, 435375, 442175, 429375, 428675, 408375, 420800, 393000, 397925, 383250, 380675, 358500, 369050, 339375]::integer[], 339375, 369050, '2026-09-17T19:04:57.000Z', 'finished', '1-0', 'checkmate', 1500, 1500, 16, -16, '2026-09-17T19:00:00.000Z', '2026-09-17T19:04:57.000Z'
       from users w, users b where w.handle = 'chen' and b.handle = 'dara';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 180000, 2000, array['f3', 'e5', 'g4', 'Qh4#']::text[], array[180500, 179800, 176200, 179437]::integer[], 176200, 179437, '2026-09-18T20:00:36.000Z', 'finished', '0-1', 'checkmate', 1484, 1484, -16, 16, '2026-09-18T20:00:00.000Z', '2026-09-18T20:00:36.000Z'
       from users w, users b where w.handle = 'boris' and b.handle = 'dara';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 300000, 0, array['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7', 'e3', 'O-O', 'Nf3', 'h6', 'Bh4', 'b6']::text[], array[298500, 297800, 288000, 293862, 280313, 282424, 275438, 273799, 263063, 267986, 253500, 264986, 246750, 254486]::integer[], 246750, 254486, '2026-09-19T18:02:06.000Z', 'finished', '1/2-1/2', 'agreement', 1500, 1516, 1, -1, '2026-09-19T18:00:00.000Z', '2026-09-19T18:02:06.000Z'
       from users w, users b where w.handle = 'dara' and b.handle = 'ada';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 180000, 2000, array['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Be7', 'Qd2', 'O-O', 'O-O-O', 'Nbd7', 'g4', 'b5']::text[], array[180500, 179800, 176200, 179437, 173587, 174574, 172662, 171399, 167237, 169911, 163499, 170111, 161449, 165811, 161086, 163198, 156223, 162273, 153048, 156848, 151560, 153110]::integer[], 151560, 0, '2026-09-20T19:03:18.000Z', 'finished', '1-0', 'timeout', 1515, 1516, 16, -16, '2026-09-20T19:00:00.000Z', '2026-09-20T19:03:18.000Z'
       from users w, users b where w.handle = 'ada' and b.handle = 'chen';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 600000, 0, array['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7', 'Re1', 'b5', 'Bb3', 'd6', 'c3', 'O-O', 'h3', 'Nb8', 'd4', 'Nbd7', 'Nbd2', 'Bb7', 'Bc2', 'Re8']::text[], array[598500, 597800, 577500, 589925, 562125, 567050, 552375, 549800, 527625, 538175, 508500, 532175, 495000, 511175, 487125, 495800, 464250, 486050, 447000, 461300, 435375, 442175, 429375, 428675]::integer[], 429375, 428675, '2026-09-21T20:03:36.000Z', 'finished', '0-1', 'resignation', 1468, 1500, -15, 15, '2026-09-21T20:00:00.000Z', '2026-09-21T20:03:36.000Z'
       from users w, users b where w.handle = 'boris' and b.handle = 'chen';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 300000, 0, array['e3', 'a5', 'Qh5', 'Ra6', 'Qxa5', 'h5', 'h4', 'Rah6', 'Qxc7', 'f6', 'Qxd7+', 'Kf7', 'Qxb7', 'Qd3', 'Qxb8', 'Qh7', 'Qxc8', 'Kg6', 'Qe6']::text[], array[298500, 297800, 288000, 293862, 280313, 282424, 275438, 273799, 263063, 267986, 253500, 264986, 246750, 254486, 242812, 246799, 231374, 241924, 222749]::integer[], 222749, 241924, '2026-09-22T18:02:51.000Z', 'finished', '1/2-1/2', 'stalemate', 1501, 1453, -2, 2, '2026-09-22T18:00:00.000Z', '2026-09-22T18:02:51.000Z'
       from users w, users b where w.handle = 'dara' and b.handle = 'boris';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 600000, 0, array['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Nf6', 'Qd3', 'e5', 'dxe5', 'Qa5+', 'Bd2', 'Qxe5', 'O-O-O', 'Nxe4', 'Qd8+', 'Kxd8', 'Bg5+', 'Kc7', 'Bd8#']::text[], array[598500, 597800, 577500, 589925, 562125, 567050, 552375, 549800, 527625, 538175, 508500, 532175, 495000, 511175, 487125, 495800, 464250, 486050, 447000, 461300, 435375]::integer[], 435375, 461300, '2026-09-23T19:03:09.000Z', 'finished', '1-0', 'checkmate', 1515, 1531, 17, -17, '2026-09-23T19:00:00.000Z', '2026-09-23T19:03:09.000Z'
       from users w, users b where w.handle = 'chen' and b.handle = 'ada';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 180000, 2000, array['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Nd4', 'Nxe5', 'Qg5', 'Nxf7', 'Qxg2', 'Rf1', 'Qxe4+', 'Be2', 'Nf3#']::text[], array[180500, 179800, 176200, 179437, 173587, 174574, 172662, 171399, 167237, 169911, 163499, 170111, 161449, 165811]::integer[], 161449, 165811, '2026-09-24T20:02:06.000Z', 'finished', '0-1', 'checkmate', 1514, 1499, -17, 17, '2026-09-24T20:00:00.000Z', '2026-09-24T20:02:06.000Z'
       from users w, users b where w.handle = 'ada' and b.handle = 'dara';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 300000, 0, array['e4', 'e5', 'Nf3', 'd6', 'Bc4', 'Bg4', 'Nc3', 'g6', 'Nxe5', 'Bxd1', 'Bxf7+', 'Ke7', 'Nd5#']::text[], array[298500, 297800, 288000, 293862, 280313, 282424, 275438, 273799, 263063, 267986, 253500, 264986, 246750]::integer[], 246750, 264986, '2026-09-25T18:01:57.000Z', 'finished', '1-0', 'checkmate', 1455, 1497, 18, -18, '2026-09-25T18:00:00.000Z', '2026-09-25T18:01:57.000Z'
       from users w, users b where w.handle = 'boris' and b.handle = 'ada';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 600000, 0, array['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3', 'Nf6', 'd4', 'exd4', 'cxd4', 'Bb4+', 'Bd2', 'Bxd2+', 'Nbxd2', 'd5', 'exd5', 'Nxd5', 'Qb3', 'Nce7', 'O-O', 'O-O', 'Rfe1', 'c6']::text[], array[598500, 597800, 577500, 589925, 562125, 567050, 552375, 549800, 527625, 538175, 508500, 532175, 495000, 511175, 487125, 495800, 464250, 486050, 447000, 461300, 435375, 442175, 429375, 428675]::integer[], 429375, 428675, '2026-09-26T19:03:36.000Z', 'finished', '0-1', 'resignation', 1516, 1532, -15, 15, '2026-09-26T19:00:00.000Z', '2026-09-26T19:03:36.000Z'
       from users w, users b where w.handle = 'dara' and b.handle = 'chen';

insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, result, reason, whiteRating, blackRating, whiteDelta, blackDelta, createdAt, endedAt)
     select w.id, b.id, 180000, 2000, array['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O', 'Be2', 'e5', 'O-O', 'Nc6', 'd5', 'Ne7', 'Ne1', 'Nd7', 'Nd3', 'f5']::text[], array[180500, 179800, 176200, 179437, 173587, 174574, 172662, 171399, 167237, 169911, 163499, 170111, 161449, 165811, 161086, 163198, 156223, 162273, 153048, 156848]::integer[], 153048, 0, '2026-09-27T20:03:00.000Z', 'finished', '1-0', 'timeout', 1547, 1473, 13, -13, '2026-09-27T20:00:00.000Z', '2026-09-27T20:03:00.000Z'
       from users w, users b where w.handle = 'chen' and b.handle = 'boris';

update users set rating = 1479 where handle = 'ada';
update users set rating = 1460 where handle = 'boris';
update users set rating = 1560 where handle = 'chen';
update users set rating = 1501 where handle = 'dara';

-- The game in progress. lastMoveAt stays null, so its clocks hold until the
-- next move instead of running down before anyone opens it.
insert into games (whiteId, blackId, initialMs, incrementMs, moves, clocks, whiteMs, blackMs, lastMoveAt, status, whiteRating, blackRating, createdAt)
     select w.id, b.id, 600000, 0, array['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', 'Bg5', 'e6', 'f4', 'Be7', 'Qf3', 'Qc7', 'O-O-O', 'Nbd7', 'g4', 'b5', 'Bxf6', 'Nxf6', 'g5', 'Nd7']::text[], array[598500, 597800, 577500, 589925, 562125, 567050, 552375, 549800, 527625, 538175, 508500, 532175, 495000, 511175, 487125, 495800, 464250, 486050, 447000, 461300, 435375, 442175, 429375, 428675]::integer[], 429375, 428675, null, 'active', w.rating, b.rating, now() - interval '6 minutes'
       from users w, users b where w.handle = 'ada' and b.handle = 'chen';

insert into challenges (creatorId, initialMs, incrementMs)
     select id, 180000, 2000 from users where handle = 'dara';
