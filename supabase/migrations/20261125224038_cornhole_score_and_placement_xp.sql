
create table if not exists retro_classics_private.cornhole_runs (
 user_id uuid primary key references auth.users(id) on delete cascade,
 run_id uuid not null, seq integer not null default 0,
 wins integer not null default 0, losses integer not null default 0,
 bags integer not null default 0, raw_player integer not null default 0,raw_cpu integer not null default 0,
 player_score integer not null default 0,cpu_score integer not null default 0,
 finished boolean not null default false, last_at timestamptz not null default clock_timestamp()-interval '2 seconds',
 last_response jsonb, started_at timestamptz not null default clock_timestamp()
);
alter table retro_classics_private.cornhole_runs enable row level security;
revoke all on retro_classics_private.cornhole_runs from public,anon,authenticated;
create or replace function public.cornhole_xp_start(p_run_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r retro_classics_private.cornhole_runs%rowtype;
begin
 if u is null then raise exception 'Sign in required' using errcode='28000';end if;
 if p_run_id is null then raise exception 'Run ID required' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,4131));
 select * into r from retro_classics_private.cornhole_runs where user_id=u for update;
 if found and r.run_id=p_run_id then return jsonb_build_object('status','started','seq',r.seq);end if;
 insert into retro_classics_private.cornhole_runs(user_id,run_id) values(u,p_run_id)
 on conflict(user_id) do update set run_id=excluded.run_id,seq=0,wins=0,losses=0,bags=0,raw_player=0,raw_cpu=0,player_score=0,cpu_score=0,finished=false,last_response=null,started_at=clock_timestamp();
 return jsonb_build_object('status','started','seq',0);
end;$$;
create or replace function public.cornhole_xp_throw(p_run_id uuid,p_seq integer,p_angle double precision,p_power double precision)
returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();r retro_classics_private.cornhole_runs%rowtype;
 x double precision;y double precision;pts integer;cpu integer;roll integer;h integer;b integer;
 delta integer:=0;points integer:=0;bonus integer:=0;place integer:=0;response jsonb;match_over boolean:=false;
begin
 if u is null then raise exception 'Sign in required' using errcode='28000';end if;
 if p_run_id is null or p_seq is null or p_seq<1 or p_angle is null or p_power is null or not(p_angle between -45 and 45) or not(p_power between 0 and 100) then raise exception 'Invalid throw' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,4131));
 select * into r from retro_classics_private.cornhole_runs where user_id=u and run_id=p_run_id for update;
 if not found then return jsonb_build_object('status','run_missing');end if;
 if p_seq=r.seq and r.last_response is not null then return r.last_response;end if;
 if r.finished or p_seq<>r.seq+1 then return jsonb_build_object('status','invalid_sequence');end if;
 if clock_timestamp()-r.last_at<interval '1 second' then return jsonb_build_object('status','too_soon');end if;
 y:=(p_power-35)/48;x:=p_angle/30*(.85+.15*greatest(0,y));
 pts:=case when (x/.17)^2+((y-.78)/.075)^2<=1 then 3 when abs(x)<=1 and y between 0 and 1 then 1 else 0 end;
 h:=(array[12,20,32,43,55])[r.wins+1];b:=(array[43,48,45,42,37])[r.wins+1];
 loop roll:=get_byte(extensions.gen_random_bytes(1),0);exit when roll<200;end loop;roll:=roll%100;
 cpu:=case when roll<h then 3 when roll<h+b then 1 else 0 end;
 r.bags:=r.bags+1;r.raw_player:=r.raw_player+pts;r.raw_cpu:=r.raw_cpu+cpu;
 if r.bags=4 then
  delta:=r.raw_player-r.raw_cpu;points:=greatest(delta,0);
  r.player_score:=r.player_score+points;r.cpu_score:=r.cpu_score+greatest(-delta,0);
  r.bags:=0;r.raw_player:=0;r.raw_cpu:=0;
  if r.player_score>=21 or r.cpu_score>=21 then
   match_over:=true;
   if r.player_score>=21 then r.wins:=r.wins+1;else r.losses:=r.losses+1;end if;
   r.finished:=r.wins>=5 or r.losses>=2;
   if r.finished then place:=case r.wins when 5 then 1 when 4 then 2 when 3 then 3 else 0 end;bonus:=case place when 1 then 10 when 2 then 6 when 3 then 2 else 0 end;end if;
   r.player_score:=0;r.cpu_score:=0;
  end if;
 end if;
 if points>0 then insert into public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version) values(u,'backyard-cornhole','cornhole_points_v1',p_run_id::text||':'||p_seq::text,points,1) on conflict(user_id,source_key,source_ref) do nothing;end if;
 if bonus>0 then insert into public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version) values(u,'backyard-cornhole','cornhole_placement_v1',p_run_id::text,bonus,1) on conflict(user_id,source_key,source_ref) do nothing;end if;
 response:=jsonb_build_object('status','ok','seq',p_seq,'player_pts',pts,'cpu_pts',cpu,'points_xp',points,'bonus_xp',bonus,'placement',place,'wins',r.wins,'losses',r.losses,'match_over',match_over,'finished',r.finished);
 update retro_classics_private.cornhole_runs set seq=p_seq,wins=r.wins,losses=r.losses,bags=r.bags,raw_player=r.raw_player,raw_cpu=r.raw_cpu,player_score=r.player_score,cpu_score=r.cpu_score,finished=r.finished,last_at=clock_timestamp(),last_response=response where user_id=u;
 return response;
end;$$;
revoke all on function public.cornhole_xp_start(uuid),public.cornhole_xp_throw(uuid,integer,double precision,double precision) from public,anon,authenticated;
grant execute on function public.cornhole_xp_start(uuid),public.cornhole_xp_throw(uuid,integer,double precision,double precision) to authenticated;
CREATE OR REPLACE FUNCTION public.retro_classic_daily_xp(p_game_id text, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_user uuid:=auth.uid(); v_day date:=(clock_timestamp() at time zone 'UTC')::date;
 v_started timestamptz; v_amount integer; v_ref text;
begin
 if v_user is null then raise exception 'Sign in required' using errcode='28000'; end if;
 if p_game_id is null or p_game_id not in ('heads-or-tails','higher-or-lower','rock-paper-scissors','tic-tac-toe','five-dice-challenge','memory-match','four-in-a-row','simon-says','2048','minesweeper','word-scramble','hangman','reaction-time') or p_action is null or p_action not in ('start','complete') then raise exception 'Invalid classic request' using errcode='22023'; end if;
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
end; $function$
;
