-- Run this in the Supabase SQL editor

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  timezone text not null default 'America/New_York',
  sms_opt_in boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists series (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id) on delete cascade,
  organizer_name text not null,
  format text not null,
  teams jsonb,
  creator_ids uuid[] not null default '{}',
  type text not null default 'private',
  gloves boolean not null default false,
  lightnings boolean not null default false,
  mist boolean not null default false,
  timers boolean not null default false,
  date text not null,
  time text not null,
  timezone text not null,
  statuses jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists join_requests (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references series(id) on delete cascade,
  requester_id uuid not null references profiles(id) on delete cascade,
  requester_name text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(series_id, requester_id)
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table series enable row level security;
alter table join_requests enable row level security;

-- Profiles: anyone can read, only owner can write
create policy "Public read profiles" on profiles for select using (true);
create policy "Insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Update own profile" on profiles for update using (auth.uid() = id);

-- Series: anyone can read, authenticated users can insert, organizer can update
create policy "Public read series" on series for select using (true);
create policy "Authenticated insert series" on series for insert with check (auth.uid() = organizer_id);
create policy "Organizer or participant update series" on series for update using (auth.uid() = organizer_id or auth.uid() = any(creator_ids));

-- Join requests: authenticated users can insert their own, organizer can read/update
create policy "Insert own join request" on join_requests for insert with check (auth.uid() = requester_id);
create policy "Read own or organizer join requests" on join_requests for select using (
  auth.uid() = requester_id or
  auth.uid() in (select organizer_id from series where id = series_id)
);
create policy "Organizer update join requests" on join_requests for update using (
  auth.uid() in (select organizer_id from series where id = series_id)
);
