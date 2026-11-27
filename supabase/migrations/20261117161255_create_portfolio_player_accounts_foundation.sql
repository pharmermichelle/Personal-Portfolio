
-- Portfolio-wide player accounts, cloud saves, achievements, and scores.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_key text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username ~ '^[A-Za-z0-9_]{3,24}$'),
  constraint profiles_avatar_length check (avatar_key is null or length(avatar_key) <= 120)
);
create unique index profiles_username_ci_unique on public.profiles (lower(username)) where username is not null;

create table public.game_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  save_data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id),
  constraint game_saves_game_id_length check (length(game_id) between 1 and 80),
  constraint game_saves_object_check check (jsonb_typeof(save_data) = 'object')
);

create table public.badge_catalog (
  badge_id text primary key,
  game_id text,
  title text not null,
  description text not null default '',
  icon_key text,
  xp_reward integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint badge_catalog_xp_nonnegative check (xp_reward >= 0),
  constraint badge_catalog_id_length check (length(badge_id) between 1 and 100)
);

create table public.earned_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id text not null references public.badge_catalog(badge_id) on delete restrict,
  earned_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (user_id, badge_id),
  constraint earned_badges_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create table public.game_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  score bigint not null,
  is_verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint game_scores_nonnegative check (score >= 0),
  constraint game_scores_id_length check (length(game_id) between 1 and 80),
  constraint game_scores_metadata_object check (jsonb_typeof(metadata) = 'object')
);
create index game_scores_owner_game_idx on public.game_scores (user_id, game_id, score desc);

alter table public.profiles enable row level security;
alter table public.game_saves enable row level security;
alter table public.badge_catalog enable row level security;
alter table public.earned_badges enable row level security;
alter table public.game_scores enable row level security;

-- A profile is private unless we intentionally add a public-profile endpoint later.
create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy game_saves_select_own on public.game_saves for select to authenticated
  using ((select auth.uid()) = user_id);
create policy game_saves_insert_own on public.game_saves for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy game_saves_update_own on public.game_saves for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy game_saves_delete_own on public.game_saves for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Badge definitions can be shown publicly, but only trusted backend code can award them.
create policy badge_catalog_read_active on public.badge_catalog for select to anon, authenticated
  using (is_active);
create policy earned_badges_select_own on public.earned_badges for select to authenticated
  using ((select auth.uid()) = user_id);

-- User-submitted scores are *unverified* and must never appear on competitive leaderboards.
create policy game_scores_select_own on public.game_scores for select to authenticated
  using ((select auth.uid()) = user_id);
create policy game_scores_insert_unverified_own on public.game_scores for insert to authenticated
  with check ((select auth.uid()) = user_id and is_verified = false);

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.game_saves to authenticated;
grant select on public.badge_catalog to anon, authenticated;
grant select on public.earned_badges to authenticated;
grant select, insert on public.game_scores to authenticated;
grant all on public.profiles, public.game_saves, public.badge_catalog, public.earned_badges, public.game_scores to service_role;

-- Keep auth-user triggers in a non-exposed schema; no browser execute privileges.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create function private.create_player_profile()
returns trigger language plpgsql security definer set search_path = ''
as $body$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$body$;
revoke all on function private.create_player_profile() from public, anon, authenticated;
create trigger portfolio_player_profile_on_signup
after insert on auth.users
for each row execute function private.create_player_profile();

-- Existing registered accounts receive a corresponding (private) profile.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;
