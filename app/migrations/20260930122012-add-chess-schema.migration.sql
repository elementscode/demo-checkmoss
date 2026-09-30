-- add chess schema

-- Auto-update updatedAt on row changes.
create or replace function touchUpdatedAt()
returns trigger
language plpgsql
as $$
begin
  new.updatedAt = now();
  return new;
end;
$$;

create table users (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  handle text not null unique,
  email text not null unique,
  passwordHash text not null,
  rating integer not null default 1500
);

create trigger usersTouchUpdatedAt
  before update on users
  for each row execute function touchUpdatedAt();

-- One open challenge per player: creating a new one replaces the old.
create table challenges (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  creatorId uuid not null unique references users(id) on delete cascade,
  initialMs integer not null,
  incrementMs integer not null
);

create trigger challengesTouchUpdatedAt
  before update on challenges
  for each row execute function touchUpdatedAt();

-- whiteMs and blackMs are each side's time left as of lastMoveAt. A null
-- lastMoveAt means no clock is running yet: a new game waits for white's
-- first move before either clock starts.
create table games (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  whiteId uuid not null references users(id) on delete cascade,
  blackId uuid not null references users(id) on delete cascade,
  initialMs integer not null,
  incrementMs integer not null,
  moves text[] not null default '{}',
  clocks integer[] not null default '{}',
  whiteMs integer not null,
  blackMs integer not null,
  lastMoveAt timestamptz,
  status text not null default 'active' check (status in ('active', 'finished')),
  result text check (result in ('1-0', '0-1', '1/2-1/2')),
  reason text,
  drawOfferBy uuid references users(id) on delete set null,
  whiteRating integer not null,
  blackRating integer not null,
  whiteDelta integer,
  blackDelta integer,
  endedAt timestamptz
);

create index gamesWhiteIdIdx on games (whiteId, createdAt desc);
create index gamesBlackIdIdx on games (blackId, createdAt desc);
create index gamesActiveIdx on games (status) where status = 'active';

create trigger gamesTouchUpdatedAt
  before update on games
  for each row execute function touchUpdatedAt();

-- One row per open page view, keyed by its listener, so a player with two
-- tabs stays online until the last one closes.
create table presence (
  listenerId text primary key,
  createdAt timestamptz not null default now(),
  userId uuid not null references users(id) on delete cascade,
  host text not null
);

create index presenceUserIdIdx on presence (userId);
create index presenceHostIdx on presence (host);
