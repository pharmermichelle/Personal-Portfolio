-- Sprint A: retire unused legacy presence endpoint and correct the Snake 'first attempt' threshold.
-- Verified against live pg_get_functiondef, not replayed from historical source migrations.
-- The current front-end calls record_game_presence, not record_game_heartbeat.
-- A cached old tab may stop recording *estimated* presence until refreshed; never impacts XP.
REVOKE EXECUTE ON FUNCTION public.record_game_heartbeat(text) FROM authenticated;

-- An interrupted first run with a banked 10-second checkpoint already consumed
-- the introductory first-attempt XP path. Later starts require >=60 seconds
-- AND a new personal-best 10-second milestone, even without a final run claim.
-- All existing XP ledger rows, saves and leaderboard data stay untouched.
CREATE OR REPLACE FUNCTION public.claim_snake_checkpoint(p_user uuid, p_attempt uuid, p_seconds integer, p_bugs integer, p_final boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
 a public.reward_attempts%ROWTYPE;
 snapshot public.snake_run_attempt_state%ROWTYPE;
 oldbest integer;
 oldruns integer;
 threshold integer;
 milestone integer;
 gained integer:=0;
 credited integer;
 game_total bigint;
 all_total bigint;
 actual_duration numeric;
 finalbest integer;
 is_first boolean:=false;
BEGIN
 IF p_user IS NULL OR p_attempt IS NULL OR p_seconds IS NULL OR p_bugs IS NULL OR p_final IS NULL
 OR p_seconds<0 OR p_seconds>18000 OR p_bugs<0 OR p_bugs>576 THEN
  RAISE EXCEPTION 'Invalid Snake checkpoint';
 END IF;
 SELECT * INTO a FROM public.reward_attempts
 WHERE id=p_attempt AND user_id=p_user AND game_id='grass-snake'
 AND game_version='v1' AND level_number=1 FOR UPDATE;
 IF NOT FOUND OR a.redeemed_at IS NOT NULL OR a.expires_at<=clock_timestamp()
 THEN RAISE EXCEPTION 'Snake challenge expired or completed'; END IF;
 actual_duration:=EXTRACT(EPOCH FROM clock_timestamp()-a.created_at);
 IF p_seconds>floor(actual_duration)::integer+2 OR (p_seconds>=10 AND actual_duration<8)
 THEN RAISE EXCEPTION 'Elapsed time could not be validated'; END IF;

 INSERT INTO public.snake_run_records(user_id,best_seconds,completed_runs)
 VALUES(p_user,0,0) ON CONFLICT(user_id) DO NOTHING;
 SELECT best_seconds,completed_runs INTO oldbest,oldruns
 FROM public.snake_run_records WHERE user_id=p_user FOR UPDATE;

 SELECT * INTO snapshot FROM public.snake_run_attempt_state
 WHERE attempt_id=p_attempt FOR UPDATE;
 IF NOT FOUND THEN
   INSERT INTO public.snake_run_attempt_state(attempt_id,user_id,initial_best,initial_runs)
   VALUES(p_attempt,p_user,oldbest,oldruns);
   SELECT * INTO snapshot FROM public.snake_run_attempt_state WHERE attempt_id=p_attempt FOR UPDATE;
   is_first:=true;
 END IF;
 IF snapshot.completed OR snapshot.user_id<>p_user OR p_seconds<snapshot.last_seconds THEN
  RAISE EXCEPTION 'Invalid or reversed checkpoint'; END IF;
 threshold:=CASE WHEN snapshot.initial_runs=0 AND snapshot.initial_best=0 THEN 10
                 ELSE greatest(60,((snapshot.initial_best/10)+1)*10) END;
 FOR milestone IN
   SELECT generate_series(greatest(threshold,((snapshot.last_seconds/10)+1)*10),(p_seconds/10)*10,10)
 LOOP
  INSERT INTO public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
  VALUES(p_user,'grass-snake','grass-snake:survival','second-'||lpad(milestone::text,5,'0'),1,1)
  ON CONFLICT(user_id,source_key,source_ref) DO NOTHING
  RETURNING amount INTO credited;
  gained:=gained+coalesce(credited,0);
 END LOOP;
 finalbest:=greatest(oldbest,p_seconds);
 UPDATE public.snake_run_attempt_state
 SET last_seconds=p_seconds,completed=p_final WHERE attempt_id=p_attempt;
 UPDATE public.snake_run_records
 SET best_seconds=finalbest,
 completed_runs=completed_runs+CASE WHEN p_final THEN 1 ELSE 0 END,
 updated_at=clock_timestamp() WHERE user_id=p_user;
 IF p_final THEN
  UPDATE public.reward_attempts SET redeemed_at=clock_timestamp() WHERE id=p_attempt;
 END IF;
 SELECT coalesce(sum(amount),0) INTO game_total FROM public.xp_ledger WHERE user_id=p_user AND game_id='grass-snake';
 SELECT coalesce(sum(amount),0) INTO all_total FROM public.xp_ledger WHERE user_id=p_user;
 RETURN jsonb_build_object('accepted',true,'awarded_xp',gained,'best_seconds',finalbest,
 'completed_runs',oldruns+CASE WHEN p_final THEN 1 ELSE 0 END,
 'game_xp_total',game_total,'overall_xp_total',all_total,'final',p_final,
 'verification','server-timed-not-physics-verified');
END
$function$
;
