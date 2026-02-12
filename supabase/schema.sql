-- morethanone.io schema - sprint 1
-- Run this in Supabase SQL editor

-- rounds table
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  join_code text not null unique,
  prompt text not null,
  description text,
  options jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{"allowTies": false, "anonymousResults": false, "host_as_participant": false, "show_processing": false}'::jsonb,
  status text not null default 'setup' check (status in ('setup', 'ranking', 'processing', 'closed', 'revealed')),
  host_token uuid not null,
  current_processing_round integer not null default 0,
  reveal_view_state jsonb,
  ranking_started_at timestamptz,
  previous_round_id uuid references rounds(id) on delete set null,
  next_round_id uuid references rounds(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rounds_join_code on rounds (join_code);
create index if not exists idx_rounds_status on rounds (status);

-- participants table
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds (id) on delete cascade,
  display_name text not null,
  removed boolean not null default false,
  joined_at timestamptz not null default now()
);

create index if not exists idx_participants_round_id on participants (round_id);

-- rankings table
create table if not exists rankings (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds (id) on delete cascade,
  participant_id uuid not null references participants (id) on delete cascade,
  ranking jsonb not null default '[]'::jsonb,
  submitted_at timestamptz not null default now(),
  unique (round_id, participant_id)
);

create index if not exists idx_rankings_round_id on rankings (round_id);

-- results table
create table if not exists results (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null unique references rounds (id) on delete cascade,
  winner text not null,
  majority_threshold integer not null,
  total_active integer not null,
  rounds_data jsonb not null default '[]'::jsonb,
  processing_data jsonb not null default '[]'::jsonb,
  tie_break_info text,
  summary jsonb not null default '{}'::jsonb,
  computed_at timestamptz not null default now()
);

-- events table (analytics)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  round_id uuid references rounds(id) on delete set null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_events_event_name on events (event_name);
create index if not exists idx_events_round_id on events (round_id);
create index if not exists idx_events_created_at on events (created_at);

-- enable realtime (prep for sprint 2)
alter publication supabase_realtime add table rounds;
alter publication supabase_realtime add table participants;
alter publication supabase_realtime add table rankings;
alter publication supabase_realtime add table results;
