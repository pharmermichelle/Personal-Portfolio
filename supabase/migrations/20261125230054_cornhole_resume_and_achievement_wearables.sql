create table retro_classics_private.cornhole_achievements(user_id uuid primary key references auth.users(id) on delete cascade,holes integer not null default 0,championships integer not null default 0);
create table retro_classics_private.cornhole_throw_history(user_id uuid not null references auth.users(id) on delete cascade,run_id uuid not null,seq integer not null,angle double precision not null,power double precision not null,response jsonb not null,primary key(user_id,run_id,seq));
alter table retro_classics_private.cornhole_achievements enable row level security;
alter table retro_classics_private.cornhole_throw_history enable row level security;
revoke all on retro_classics_private.cornhole_achievements,retro_classics_private.cornhole_throw_history from public,anon,authenticated;
insert into public.cosmetic_catalog(cosmetic_id,title,description,kind,rarity,game_id,asset_key,unlock_rule,is_active) values
('cornhole-25-holes-pants','Bullseye Shorts','Land 25 bags in the hole across signed-in tournaments.','pants','rare','backyard-cornhole','cornhole-25-holes-pants','25 lifetime Cornhole holes',true),
('cornhole-champion-shirt','Backyard Champion Tee','Win the full Cornhole tournament.','shirt','epic','backyard-cornhole','cornhole-champion-shirt','Win all five Cornhole matches',true)
on conflict(cosmetic_id) do nothing;
CREATE OR REPLACE FUNCTION public.cornhole_xp_throw(p_run_id uuid, p_seq integer, p_angle double precision, p_power double precision)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare u uuid:=auth.uid();r retro_classics_private.cornhole_runs%rowtype;
 x double precision;y double precision;pts integer;cpu integer;roll integer;h integer;b integer;
 delta integer:=0;points integer:=0;bonus integer:=0;place integer:=0;response jsonb;match_over boolean:=false; total_holes integer:=0; new_rewards jsonb:='[]'::jsonb; awarded_id text;
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
 response:=jsonb_build_object('lifetime_holes',total_holes,'new_rewards',new_rewards,'status','ok','seq',p_seq,'player_pts',pts,'cpu_pts',cpu,'points_xp',points,'bonus_xp',bonus,'placement',place,'wins',r.wins,'losses',r.losses,'match_over',match_over,'finished',r.finished);
 update retro_classics_private.cornhole_runs set seq=p_seq,wins=r.wins,losses=r.losses,bags=r.bags,raw_player=r.raw_player,raw_cpu=r.raw_cpu,player_score=r.player_score,cpu_score=r.cpu_score,finished=r.finished,last_at=clock_timestamp(),last_response=response where user_id=u;
 insert into retro_classics_private.cornhole_throw_history(user_id,run_id,seq,angle,power,response) values(u,p_run_id,p_seq,p_angle,p_power,response) on conflict do nothing;
 return response;
end;$function$
;
create or replace function public.cornhole_resume() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();r retro_classics_private.cornhole_runs%rowtype;h integer;hist jsonb; n integer;
begin
 if u is null then raise exception 'Sign in required' using errcode='28000';end if;
 select coalesce(holes,0) into h from retro_classics_private.cornhole_achievements where user_id=u;
 select * into r from retro_classics_private.cornhole_runs where user_id=u;
 if not found then return jsonb_build_object('status','none','lifetime_holes',coalesce(h,0));end if;
 select count(*),coalesce(jsonb_agg(jsonb_build_object('seq',seq,'angle',angle,'power',power,'result',response) order by seq),'[]'::jsonb) into n,hist from retro_classics_private.cornhole_throw_history where user_id=u and run_id=r.run_id;
 if n<>r.seq then return jsonb_build_object('status','legacy','lifetime_holes',coalesce(h,0));end if;
 return jsonb_build_object('status','ok','run_id',r.run_id,'seq',r.seq,'finished',r.finished,'history',hist,'lifetime_holes',coalesce(h,0));
end;$$;
revoke all on function public.cornhole_resume() from public,anon,authenticated;grant execute on function public.cornhole_resume() to authenticated;
