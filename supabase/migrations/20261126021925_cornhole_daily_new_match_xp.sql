create table retro_classics_private.cornhole_daily_matches(
 user_id uuid not null references auth.users(id) on delete cascade,
 play_day date not null,
 stage integer not null check(stage between 1 and 5),
 run_id uuid not null,
 attempt integer not null check(attempt between 1 and 6),
 primary key(user_id,play_day,stage)
);
alter table retro_classics_private.cornhole_daily_matches enable row level security;
revoke all on retro_classics_private.cornhole_daily_matches from public,anon,authenticated;
insert into retro_classics_private.cornhole_daily_matches(user_id,play_day,stage,run_id,attempt)
select distinct on (l.user_id,(l.created_at at time zone 'UTC')::date,1+coalesce((prev.response->>'wins')::integer,0))
 l.user_id,(l.created_at at time zone 'UTC')::date,1+coalesce((prev.response->>'wins')::integer,0),h.run_id,1+coalesce((prev.response->>'wins')::integer,0)+coalesce((prev.response->>'losses')::integer,0)
from public.xp_ledger l join retro_classics_private.cornhole_throw_history h on h.user_id=l.user_id and h.run_id::text||':'||h.seq::text=l.source_ref
left join retro_classics_private.cornhole_throw_history prev on prev.user_id=h.user_id and prev.run_id=h.run_id and prev.seq=h.seq-1
where l.source_key='cornhole_points_v1' and l.created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC'
order by l.user_id,(l.created_at at time zone 'UTC')::date,1+coalesce((prev.response->>'wins')::integer,0),l.created_at
on conflict do nothing;
CREATE OR REPLACE FUNCTION public.cornhole_xp_throw(p_run_id uuid, p_seq integer, p_angle double precision, p_power double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare u uuid:=auth.uid();r retro_classics_private.cornhole_runs%rowtype;
 x double precision;y double precision;pts integer;cpu integer;roll integer;h integer;b integer;
 delta integer:=0;points integer:=0;bonus integer:=0;place integer:=0; xp_day date; stage_no integer; attempt_no integer; eligible boolean; prior_bonus integer:=0; earned_points integer:=0;response jsonb;match_over boolean:=false; total_holes integer:=0; new_rewards jsonb:='[]'::jsonb; awarded_id text;
begin
 if u is null then raise exception 'Sign in required' using errcode='28000';end if;
 if p_run_id is null or p_seq is null or p_seq<1 or p_angle is null or p_power is null or not(p_angle between -45 and 45) or not(p_power between 0 and 100) then raise exception 'Invalid throw' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(u::text,4131));
 select * into r from retro_classics_private.cornhole_runs where user_id=u and run_id=p_run_id for update;
 if not found then return jsonb_build_object('status','run_missing');end if;
 if p_seq=r.seq and r.last_response is not null then return r.last_response;end if;
 if r.finished or p_seq<>r.seq+1 then return jsonb_build_object('status','invalid_sequence');end if;
 if clock_timestamp()-r.last_at<interval '1 second' then return jsonb_build_object('status','too_soon');end if;
 xp_day:=(clock_timestamp() at time zone 'UTC')::date;
 stage_no:=r.wins+1;attempt_no:=r.wins+r.losses+1;
 insert into retro_classics_private.cornhole_daily_matches(user_id,play_day,stage,run_id,attempt) values(u,xp_day,stage_no,p_run_id,attempt_no) on conflict(user_id,play_day,stage) do nothing;
 select (m.run_id=p_run_id and m.attempt=attempt_no) into eligible from retro_classics_private.cornhole_daily_matches m where m.user_id=u and m.play_day=xp_day and m.stage=stage_no;
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
 if eligible and points>0 then
  insert into public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version) values(u,'backyard-cornhole','cornhole_points_v2',p_run_id::text||':'||p_seq::text,points,2) on conflict(user_id,source_key,source_ref) do nothing returning amount into earned_points;
 end if;
 if bonus>0 then
  select coalesce(max(amount) filter(where source_key='cornhole_placement_v1'),0)+coalesce(sum(amount) filter(where source_key='cornhole_placement_v2'),0) into prior_bonus
  from public.xp_ledger where user_id=u and game_id='backyard-cornhole' and source_key in ('cornhole_placement_v1','cornhole_placement_v2') and created_at>=xp_day::timestamp at time zone 'UTC' and created_at<(xp_day+1)::timestamp at time zone 'UTC';
  bonus:=greatest(bonus-prior_bonus,0);
  if bonus>0 then insert into public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version) values(u,'backyard-cornhole','cornhole_placement_v2',p_run_id::text,bonus,2) on conflict(user_id,source_key,source_ref) do nothing returning amount into bonus;end if;
 end if;
 insert into retro_classics_private.cornhole_achievements(user_id,holes,championships) values(u,case when pts=3 then 1 else 0 end,case when r.finished and r.wins=5 then 1 else 0 end) on conflict(user_id) do update set holes=retro_classics_private.cornhole_achievements.holes+excluded.holes,championships=retro_classics_private.cornhole_achievements.championships+excluded.championships returning holes into total_holes;
 if total_holes>=25 then
 insert into public.player_inventory(user_id,cosmetic_id,source_key) values(u,'cornhole-25-holes-pants','cornhole_25_holes') on conflict(user_id,cosmetic_id) do nothing returning cosmetic_id into awarded_id;
 if awarded_id is not null then new_rewards:=new_rewards||jsonb_build_array(awarded_id);end if;
 end if;
 if r.finished and r.wins=5 then
 awarded_id:=null;
 insert into public.player_inventory(user_id,cosmetic_id,source_key) values(u,'cornhole-champion-shirt','cornhole_champion') on conflict(user_id,cosmetic_id) do nothing returning cosmetic_id into awarded_id;
 if awarded_id is not null then new_rewards:=new_rewards||jsonb_build_array(awarded_id);end if;
 end if;
 response:=jsonb_build_object('lifetime_holes',total_holes,'new_rewards',new_rewards,'status','ok','seq',p_seq,'player_pts',pts,'cpu_pts',cpu,'points_xp',coalesce(earned_points,0),'bonus_xp',coalesce(bonus,0),'xp_eligible',eligible,'xp_stage',stage_no,'xp_day',xp_day,'placement',place,'wins',r.wins,'losses',r.losses,'match_over',match_over,'finished',r.finished);
 update retro_classics_private.cornhole_runs set seq=p_seq,wins=r.wins,losses=r.losses,bags=r.bags,raw_player=r.raw_player,raw_cpu=r.raw_cpu,player_score=r.player_score,cpu_score=r.cpu_score,finished=r.finished,last_at=clock_timestamp(),last_response=response where user_id=u;
 insert into retro_classics_private.cornhole_throw_history(user_id,run_id,seq,angle,power,response) values(u,p_run_id,p_seq,p_angle,p_power,response) on conflict do nothing;
 return response;
end;$function$;
revoke all on function public.cornhole_xp_throw(uuid,integer,double precision,double precision) from public,anon;
grant execute on function public.cornhole_xp_throw(uuid,integer,double precision,double precision) to authenticated;
