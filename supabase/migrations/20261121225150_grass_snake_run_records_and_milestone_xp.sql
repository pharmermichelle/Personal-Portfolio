-- Deployed as migration 20261121225150_grass_snake_run_records_and_milestone_xp
CREATE TABLE IF NOT EXISTS public.snake_run_records (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 best_seconds integer NOT NULL DEFAULT 0 CHECK(best_seconds BETWEEN 0 AND 18000),
 completed_runs integer NOT NULL DEFAULT 0 CHECK(completed_runs BETWEEN 0 AND 10000000),
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.snake_run_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.snake_run_records FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.snake_run_records TO authenticated;
DROP POLICY IF EXISTS snake_run_records_owner_read ON public.snake_run_records;
CREATE POLICY snake_run_records_owner_read ON public.snake_run_records FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);
INSERT INTO public.game_xp_rules(game_id,display_name,reward_type,max_level,base_xp,step_xp,cap_xp,min_seconds,enabled,verification_tier,notes)
VALUES ('grass-snake','Grass Snake: Bug Hunt','run',0,0,0,0,10,true,'server_timed','First attempt: each full 10s. Subsequent attempts: minimum 60s and new personal-best 10s boundaries. Server time guarded; no physics replay validation.')
ON CONFLICT(game_id) DO UPDATE SET display_name=excluded.display_name,reward_type=excluded.reward_type,enabled=excluded.enabled,verification_tier=excluded.verification_tier,notes=excluded.notes;
CREATE OR REPLACE FUNCTION public.claim_snake_run(p_user uuid, p_attempt uuid, p_seconds integer, p_bugs integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
 a public.reward_attempts%ROWTYPE;
 oldbest integer;
 oldruns integer;
 newbest integer;
 threshold integer;
 milestone integer;
 gained integer:=0;
 credited integer;
 total bigint;
 game_total bigint;
 actual_duration numeric;
BEGIN
 IF p_user IS NULL OR p_attempt IS NULL OR p_seconds IS NULL OR p_bugs IS NULL
 OR p_seconds<0 OR p_seconds>18000 OR p_bugs<0 OR p_bugs>576 THEN
  RAISE EXCEPTION 'Invalid snake run';
 END IF;
 SELECT * INTO a FROM public.reward_attempts
 WHERE id=p_attempt AND user_id=p_user AND game_id='grass-snake'
 AND game_version='v1' AND level_number=1 FOR UPDATE;
 IF NOT FOUND OR a.redeemed_at IS NOT NULL OR a.expires_at<=clock_timestamp()
 THEN RAISE EXCEPTION 'Snake attempt expired or unavailable'; END IF;
 actual_duration:=EXTRACT(EPOCH FROM clock_timestamp()-a.created_at);
 IF p_seconds>floor(actual_duration)::integer+2 OR (p_seconds>=10 AND actual_duration<8)
 THEN RAISE EXCEPTION 'Run longer than verified elapsed time'; END IF;
 -- All completions serialize on the player's account record.
 INSERT INTO public.snake_run_records(user_id,best_seconds,completed_runs)
 VALUES(p_user,0,0) ON CONFLICT(user_id) DO NOTHING;
 SELECT best_seconds,completed_runs INTO oldbest,oldruns
 FROM public.snake_run_records WHERE user_id=p_user FOR UPDATE;
 newbest:=greatest(oldbest,p_seconds);
 threshold:=CASE WHEN oldruns=0 THEN 10 ELSE greatest(60,((oldbest/10)+1)*10) END;
 IF p_seconds>=threshold THEN
  FOR milestone IN SELECT generate_series(threshold,(p_seconds/10)*10,10)
  LOOP
   IF milestone<=18000 THEN
    INSERT INTO public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
    VALUES(p_user,'grass-snake','grass-snake:survival','second-'||lpad(milestone::text,5,'0'),1,1)
    ON CONFLICT(user_id,source_key,source_ref) DO NOTHING
    RETURNING amount INTO credited;
    gained:=gained+coalesce(credited,0);
   END IF;
  END LOOP;
 END IF;
 UPDATE public.snake_run_records SET best_seconds=newbest,
 completed_runs=oldruns+1,updated_at=clock_timestamp() WHERE user_id=p_user;
 UPDATE public.reward_attempts SET redeemed_at=clock_timestamp() WHERE id=p_attempt;
 SELECT coalesce(sum(amount),0) INTO game_total FROM public.xp_ledger WHERE user_id=p_user AND game_id='grass-snake';
 SELECT coalesce(sum(amount),0) INTO total FROM public.xp_ledger WHERE user_id=p_user;
 RETURN jsonb_build_object('awarded_xp',gained,'best_seconds',newbest,
 'completed_runs',oldruns+1,'game_xp_total',game_total,'overall_xp_total',total,
 'verification','server-timed-not-physics-verified');
END
$function$
;
REVOKE ALL ON FUNCTION public.claim_snake_run(uuid,uuid,integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_snake_run(uuid,uuid,integer,integer) TO service_role;
