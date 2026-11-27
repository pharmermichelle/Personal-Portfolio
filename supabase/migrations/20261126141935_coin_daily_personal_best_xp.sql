create table retro_classics_private.coin_runs (
 user_id uuid not null references auth.users(id) on delete cascade,
 run_id uuid not null, play_day date not null, started_at timestamptz not null default clock_timestamp(),
 guesses integer[] not null default '{}', outcomes integer[] not null default '{}',
 score integer not null default 0 check(score between 0 and 10),
 completed boolean not null default false, awarded_xp integer not null default 0,
 primary key(user_id,run_id)
);
alter table retro_classics_private.coin_runs enable row level security;
revoke all on retro_classics_private.coin_runs from public, anon, authenticated;
create index coin_runs_daily_idx on retro_classics_private.coin_runs(user_id,play_day) where completed;
create or replace function public.retro_coin_daily_xp(p_run_id uuid,p_action text,p_seq integer default null,p_guess integer default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
 u uuid:=auth.uid(); d date:=(clock_timestamp() at time zone 'UTC')::date;
 r retro_classics_private.coin_runs%rowtype; prior integer; hit integer; n integer; award integer:=0; base integer; ref text;
begin
 if u is null then raise exception 'Sign in required' using errcode='28000'; end if;
 if p_run_id is null or p_action is null or p_action not in ('start','flip','complete') then raise exception 'Invalid coin request' using errcode='22023'; end if;
 ref:='heads-or-tails:'||d::text;
 if p_action='start' then
  insert into retro_classics_private.coin_runs(user_id,run_id,play_day) values(u,p_run_id,d) on conflict do nothing;
 end if;
 select * into r from retro_classics_private.coin_runs where user_id=u and run_id=p_run_id for update;
 if not found then return jsonb_build_object('status','start_required'); end if;
 if r.play_day<>d then return jsonb_build_object('status','day_changed'); end if;
 select max(score) into prior from retro_classics_private.coin_runs where user_id=u and play_day=d and completed;
 if p_action='start' then
  return jsonb_build_object('status','started','daily_best',prior,'base_earned',exists(select 1 from public.xp_ledger where user_id=u and source_key='classic_daily_play_v1' and source_ref=ref));
 end if;
 n:=cardinality(r.guesses);
 if p_action='flip' then
  if p_seq is null or p_seq not between 1 and 10 or p_guess is null or p_guess not in (0,1) then raise exception 'Invalid flip' using errcode='22023'; end if;
  if p_seq<=n then
   if r.guesses[p_seq]<>p_guess then return jsonb_build_object('status','guess_mismatch'); end if;
   return jsonb_build_object('status','ok','hit',r.outcomes[p_seq]);
  end if;
  if r.completed or p_seq<>n+1 then return jsonb_build_object('status','sequence_error'); end if;
  hit:=floor(random()*2)::integer;
  update retro_classics_private.coin_runs set guesses=array_append(guesses,p_guess),outcomes=array_append(outcomes,hit),score=score+case when hit=p_guess then 1 else 0 end where user_id=u and run_id=p_run_id;
  return jsonb_build_object('status','ok','hit',hit);
 end if;
 if r.completed then return jsonb_build_object('status','complete','awarded_xp',r.awarded_xp,'daily_best',prior); end if;
 if n<>10 then return jsonb_build_object('status','incomplete'); end if;
 if clock_timestamp()-r.started_at<interval '10 seconds' then return jsonb_build_object('status','too_soon'); end if;
 insert into retro_classics_private.daily_runs(user_id,game_id,play_day) values(u,'heads-or-tails',d) on conflict do nothing;
 perform 1 from retro_classics_private.daily_runs where user_id=u and game_id='heads-or-tails' and play_day=d for update;
 select max(score) into prior from retro_classics_private.coin_runs where user_id=u and play_day=d and completed;
 insert into public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version) values(u,'heads-or-tails','classic_daily_play_v1',ref,2,1) on conflict(user_id,source_key,source_ref) do nothing returning amount into base;
 award:=coalesce(base,0);
 if prior is not null and r.score>prior then
  insert into public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version) values(u,'heads-or-tails','coin_daily_best_v1',ref||':'||r.score::text,r.score-prior,1) on conflict(user_id,source_key,source_ref) do nothing returning amount into base;
  award:=award+coalesce(base,0);
 end if;
 update retro_classics_private.coin_runs set completed=true,awarded_xp=award where user_id=u and run_id=p_run_id;
 return jsonb_build_object('status','complete','awarded_xp',award,'daily_best',greatest(prior,r.score));
end; $$;
revoke all on function public.retro_coin_daily_xp(uuid,text,integer,integer) from public,anon,authenticated;
grant execute on function public.retro_coin_daily_xp(uuid,text,integer,integer) to authenticated;
