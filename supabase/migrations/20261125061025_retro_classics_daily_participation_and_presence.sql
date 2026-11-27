CREATE OR REPLACE FUNCTION public.record_game_presence(p_game_id text, p_mode text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_previous timestamptz;
  v_now timestamptz := clock_timestamp();
  v_gap numeric;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE='28000'; END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('start','heartbeat') THEN
    RAISE EXCEPTION 'Invalid presence event' USING ERRCODE='22023';
  END IF;
  IF p_game_id IS NULL OR p_game_id NOT IN (
    'claws-vs-paws','cut-the-cheese','fallen-grid','revive-nature','rink-putt',
    'hockey-gear-rush','survive-2026','acorn-ascent','bugged-out',
    'coastline-cruiser','lemon-pound-cake','wizards-mana','whack-a-bug',
    'choose-adventure','ferret-life','inbox-hero','community-garden','grass-snake','neon-pong','brick-blitz','heads-or-tails','higher-or-lower','rock-paper-scissors','tic-tac-toe','backyard-cornhole','five-dice-challenge','memory-match','four-in-a-row','simon-says','2048','minesweeper','word-scramble','hangman','reaction-time'
  ) THEN
    RAISE EXCEPTION 'Unknown game identifier' USING ERRCODE='22023';
  END IF;

  SELECT last_seen_at INTO v_previous
  FROM public.game_activity
  WHERE user_id = v_user AND game_id = p_game_id FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.game_activity(user_id,game_id,active_seconds,visits,last_seen_at)
      VALUES(v_user,p_game_id,0,1,v_now)
      ON CONFLICT(user_id,game_id) DO NOTHING;
    RETURN;
  END IF;

  v_gap := EXTRACT(EPOCH FROM (v_now - v_previous));

  -- On initial page load or returning from an unfocused/hidden tab, do not
  -- award the time since the previous heartbeat as viewed/active time.
  IF p_mode = 'start' THEN
    UPDATE public.game_activity
    SET last_seen_at = v_now,
        visits = visits + CASE WHEN v_gap > 75 THEN 1 ELSE 0 END
    WHERE user_id = v_user AND game_id = p_game_id;
    RETURN;
  END IF;

  -- Server-timed, bounded estimates only; never grant XP from this table.
  IF v_gap >= 12 AND v_gap <= 75 THEN
    PERFORM public.credit_thanksgiving_2026(v_user,p_game_id,v_previous,v_now,
      LEAST(30,FLOOR(v_gap)::integer));
    UPDATE public.game_activity
    SET active_seconds = active_seconds + LEAST(30,FLOOR(v_gap)::integer),
        last_seen_at = v_now
    WHERE user_id = v_user AND game_id = p_game_id;
  ELSIF v_gap > 75 THEN
    UPDATE public.game_activity
    SET visits = visits + 1, last_seen_at = v_now
    WHERE user_id = v_user AND game_id = p_game_id;
  END IF;
END;
$function$
;
create schema if not exists retro_classics_private;
revoke all on schema retro_classics_private from public,anon,authenticated;
create table if not exists retro_classics_private.daily_runs (
 user_id uuid not null references auth.users(id) on delete cascade,
 game_id text not null, play_day date not null, started_at timestamptz not null default clock_timestamp(),
 primary key(user_id,game_id,play_day)
);
alter table retro_classics_private.daily_runs enable row level security;
revoke all on retro_classics_private.daily_runs from public,anon,authenticated;
create or replace function public.retro_classic_daily_xp(p_game_id text,p_action text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 v_user uuid:=auth.uid(); v_day date:=(clock_timestamp() at time zone 'UTC')::date;
 v_started timestamptz; v_amount integer; v_ref text;
begin
 if v_user is null then raise exception 'Sign in required' using errcode='28000'; end if;
 if p_game_id is null or p_game_id not in ('heads-or-tails','higher-or-lower','rock-paper-scissors','tic-tac-toe','backyard-cornhole','five-dice-challenge','memory-match','four-in-a-row','simon-says','2048','minesweeper','word-scramble','hangman','reaction-time') or p_action is null or p_action not in ('start','complete') then raise exception 'Invalid classic request' using errcode='22023'; end if;
 v_ref:=p_game_id||':'||v_day::text;
 if exists(select 1 from public.xp_ledger where user_id=v_user and source_key='classic_daily_play_v1' and source_ref=v_ref) then
 return jsonb_build_object('status','already_awarded','awarded_xp',0); end if;
 if p_action='start' then
 insert into retro_classics_private.daily_runs(user_id,game_id,play_day) values(v_user,p_game_id,v_day) on conflict do nothing;
 return jsonb_build_object('status','started','awarded_xp',0);
 end if;
 select started_at into v_started from retro_classics_private.daily_runs where user_id=v_user and game_id=p_game_id and play_day=v_day for update;
 if not found then return jsonb_build_object('status','start_required','awarded_xp',0); end if;
 if clock_timestamp()-v_started < interval '10 seconds' then return jsonb_build_object('status','too_soon','awarded_xp',0); end if;
 insert into public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
 values(v_user,p_game_id,'classic_daily_play_v1',v_ref,2,1)
 on conflict(user_id,source_key,source_ref) do nothing returning amount into v_amount;
 return jsonb_build_object('status',case when v_amount is null then 'already_awarded' else 'awarded' end,'awarded_xp',coalesce(v_amount,0));
end; $$;
revoke all on function public.retro_classic_daily_xp(text,text) from public,anon,authenticated;
grant execute on function public.retro_classic_daily_xp(text,text) to authenticated;
