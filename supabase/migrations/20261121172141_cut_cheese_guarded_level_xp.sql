
-- Account XP for Cut the Cheese. Fixed, bounded, once-per-level rewards.
-- This is server-gated but NOT a simulation-verified score; don't list as verified leaderboard score.
CREATE OR REPLACE FUNCTION public.claim_cheese_level(p_user uuid,p_attempt uuid,p_level integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog','public'
AS $function$
DECLARE
  a public.reward_attempts%ROWTYPE;
  award integer := 0;
  total bigint;
  total_game bigint;
BEGIN
  IF p_user IS NULL OR p_attempt IS NULL OR p_level NOT BETWEEN 1 AND 200 THEN
    RAISE EXCEPTION 'Invalid reward claim' USING ERRCODE='22023';
  END IF;
  SELECT * INTO a FROM public.reward_attempts
  WHERE id=p_attempt AND user_id=p_user AND game_id='cut-the-cheese'
    AND game_version='v1' AND level_number=p_level FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown challenge' USING ERRCODE='22023'; END IF;
  IF a.redeemed_at IS NOT NULL THEN RAISE EXCEPTION 'Already redeemed' USING ERRCODE='22023'; END IF;
  IF a.expires_at <= clock_timestamp() OR a.created_at > clock_timestamp() THEN
    RAISE EXCEPTION 'Expired challenge' USING ERRCODE='22023';
  END IF;
  -- A minimum elapsed window prevents instantaneous claims; not game-physics verification.
  IF a.created_at > clock_timestamp()-interval '3 seconds' THEN
    RAISE EXCEPTION 'Challenge completed too quickly' USING ERRCODE='22023';
  END IF;
  UPDATE public.reward_attempts SET redeemed_at=clock_timestamp() WHERE id=p_attempt;
  INSERT INTO public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
  VALUES(p_user,'cut-the-cheese','level-clear:cut-the-cheese','level-'||lpad(p_level::text,3,'0'),least(25,4+p_level*2),1)
  ON CONFLICT (user_id,source_key,source_ref) DO NOTHING
  RETURNING amount INTO award;
  award:=coalesce(award,0);
  SELECT coalesce(sum(amount),0) INTO total_game FROM public.xp_ledger
    WHERE user_id=p_user AND game_id='cut-the-cheese';
  SELECT coalesce(sum(amount),0) INTO total FROM public.xp_ledger WHERE user_id=p_user;
  RETURN jsonb_build_object('awarded_xp',award,'game_xp_total',total_game,
    'overall_xp_total',total,'level',p_level,'already_earned',award=0);
END
$function$;
REVOKE ALL ON FUNCTION public.claim_cheese_level(uuid,uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_cheese_level(uuid,uuid,integer) TO service_role;
COMMENT ON FUNCTION public.claim_cheese_level(uuid,uuid,integer) IS
 'Server-gated level XP; once per user/level, server timing validated, no physics replay. Not leaderboard verified.';
