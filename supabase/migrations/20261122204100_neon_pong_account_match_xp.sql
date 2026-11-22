-- Applied to hosted Supabase on 2026-11-22.
-- Neon Pong: server-timed account XP for completed matches.
-- Match score and rally are client-reported and NOT replay/physics verified:
-- do not use these values as competitive leaderboard proofs.
CREATE TABLE IF NOT EXISTS public.pong_player_records (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  best_rally integer NOT NULL DEFAULT 0 CHECK(best_rally BETWEEN 0 AND 2000),
  completed_matches integer NOT NULL DEFAULT 0 CHECK(completed_matches BETWEEN 0 AND 10000000),
  wins integer NOT NULL DEFAULT 0 CHECK(wins BETWEEN 0 AND 10000000),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.pong_player_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.pong_player_records FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.pong_player_records TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.pong_player_records TO service_role;
DROP POLICY IF EXISTS pong_player_records_owner_read ON public.pong_player_records;
CREATE POLICY pong_player_records_owner_read ON public.pong_player_records
FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

INSERT INTO public.game_xp_rules
(game_id,display_name,reward_type,max_level,base_xp,step_xp,cap_xp,min_seconds,enabled,verification_tier,notes)
VALUES ('neon-pong','Neon Pong','round',4,0,0,6,20,true,'server_timed',
 'Completed match: 3 points +1 XP, 5 points +1 XP, victory +3 XP, account-best rally +1 XP. Max 6 per match. Scores are client-reported; server enforces attempt duration, caps, and one-time claims. Not leaderboard verified.')
ON CONFLICT(game_id) DO UPDATE SET
display_name=excluded.display_name,reward_type=excluded.reward_type,max_level=excluded.max_level,
cap_xp=excluded.cap_xp,min_seconds=excluded.min_seconds,enabled=excluded.enabled,
verification_tier=excluded.verification_tier,notes=excluded.notes;

CREATE OR REPLACE FUNCTION public.claim_pong_match(
 p_user uuid, p_attempt uuid, p_you integer, p_cpu integer, p_rally integer, p_level integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'pg_catalog','public'
AS $function$
DECLARE
 a public.reward_attempts%ROWTYPE;
 prior_best integer;
 earned integer := 0;
 credited integer;
 old_best integer;
 real_seconds numeric;
 reward_item record;
 game_total bigint;
 full_total bigint;
BEGIN
 IF p_user IS NULL OR p_attempt IS NULL OR p_you IS NULL OR p_cpu IS NULL
    OR p_rally IS NULL OR p_level IS NULL OR p_you<0 OR p_cpu<0
    OR p_you>7 OR p_cpu>7 OR p_rally<0 OR p_rally>2000
    OR p_level<1 OR p_level>4
    OR NOT ((p_you=7 AND p_cpu<=6) OR (p_cpu=7 AND p_you<=6))
 THEN RAISE EXCEPTION 'Invalid Pong match result'; END IF;
 SELECT * INTO a FROM public.reward_attempts
 WHERE id=p_attempt AND user_id=p_user AND game_id='neon-pong'
 AND game_version='v1' AND level_number=p_level FOR UPDATE;
 IF NOT FOUND OR a.redeemed_at IS NOT NULL OR a.expires_at<=clock_timestamp() THEN
  RAISE EXCEPTION 'Pong reward attempt already claimed or expired'; END IF;
 real_seconds:=EXTRACT(EPOCH FROM clock_timestamp()-a.created_at);
 IF real_seconds<GREATEST(20,(p_you+p_cpu)*2) THEN
   RAISE EXCEPTION 'Pong match too quick for a validated reward'; END IF;

 INSERT INTO public.pong_player_records(user_id) VALUES(p_user)
 ON CONFLICT(user_id) DO NOTHING;
 SELECT best_rally INTO prior_best FROM public.pong_player_records
 WHERE user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Could not lock Pong player record'; END IF;

 FOR reward_item IN
  SELECT * FROM (VALUES
   ('score-3'::text,1, p_you>=3),
   ('score-5'::text,1, p_you>=5),
   ('victory'::text,3, p_you=7),
   ('new-rally'::text,1,p_rally>prior_best AND p_rally>0)
  ) AS events(source,amount,eligible)
 LOOP
  IF reward_item.eligible THEN
   credited:=NULL;
   INSERT INTO public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
   VALUES(p_user,'neon-pong','neon-pong:'||reward_item.source,p_attempt::text,reward_item.amount,1)
   ON CONFLICT(user_id,source_key,source_ref) DO NOTHING
   RETURNING amount INTO credited;
   earned:=earned+coalesce(credited,0);
  END IF;
 END LOOP;

 UPDATE public.pong_player_records
 SET best_rally=GREATEST(best_rally,p_rally),
     completed_matches=completed_matches+1,
     wins=wins+CASE WHEN p_you=7 THEN 1 ELSE 0 END,
     updated_at=clock_timestamp()
 WHERE user_id=p_user;
 UPDATE public.reward_attempts SET redeemed_at=clock_timestamp()
 WHERE id=p_attempt AND user_id=p_user;
 SELECT coalesce(sum(amount),0) INTO game_total FROM public.xp_ledger
 WHERE user_id=p_user AND game_id='neon-pong';
 SELECT coalesce(sum(amount),0) INTO full_total FROM public.xp_ledger
 WHERE user_id=p_user;
 RETURN jsonb_build_object(
 'accepted',true,'awarded_xp',earned,'best_rally',greatest(prior_best,p_rally),
 'new_rally',p_rally>prior_best AND p_rally>0,'game_xp_total',game_total,
 'overall_xp_total',full_total,'verification','server-timed-not-replay-verified');
END;
$function$;
REVOKE ALL ON FUNCTION public.claim_pong_match(uuid,uuid,integer,integer,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_pong_match(uuid,uuid,integer,integer,integer,integer) TO service_role;
