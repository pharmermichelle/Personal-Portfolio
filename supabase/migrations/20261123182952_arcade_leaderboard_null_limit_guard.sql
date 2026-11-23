-- Null limits must never bypass the 50-row cap for a public RPC.
CREATE OR REPLACE FUNCTION public.arcade_leaderboard(p_metric text, p_game_id text DEFAULT NULL::text, p_limit integer DEFAULT 20)
 RETURNS TABLE(rank_number bigint, display_name text, metric_value bigint, proof_tier text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
 IF p_metric IS NULL OR p_metric NOT IN ('xp','playtime','level','snake_survival') OR (p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 50)
 THEN RAISE EXCEPTION 'Invalid leaderboard request' USING ERRCODE='22023'; END IF;
 IF p_game_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.game_xp_rules WHERE game_id=p_game_id)
 THEN RAISE EXCEPTION 'Unknown game' USING ERRCODE='22023'; END IF;
 IF p_metric='level' AND (p_game_id IS NULL OR NOT EXISTS(SELECT 1 FROM public.game_xp_rules
   WHERE game_id=p_game_id AND reward_type='level')) THEN
   RAISE EXCEPTION 'Choose a level-based game' USING ERRCODE='22023'; END IF;
 IF p_metric='snake_survival' AND p_game_id IS DISTINCT FROM 'grass-snake' THEN
   RAISE EXCEPTION 'Choose Grass Snake' USING ERRCODE='22023'; END IF;

 RETURN QUERY WITH allowed AS (
  SELECT pref.user_id,COALESCE(NULLIF(pr.username,''),'Arcade Player')::text AS alias
  FROM public.leaderboard_preferences pref
  LEFT JOIN public.profiles pr ON pr.id=pref.user_id
  WHERE pref.opted_in=true
 ), values_by_player AS (
  SELECT a.user_id,a.alias,
  CASE p_metric
  WHEN 'xp' THEN COALESCE((SELECT SUM(x.amount) FROM public.xp_ledger x
    WHERE x.user_id=a.user_id AND (p_game_id IS NULL OR x.game_id=p_game_id)),0)::bigint
  WHEN 'playtime' THEN COALESCE((SELECT SUM(g.active_seconds) FROM public.game_activity g
    WHERE g.user_id=a.user_id AND (p_game_id IS NULL OR g.game_id=p_game_id)),0)::bigint
  WHEN 'level' THEN COALESCE((SELECT MAX(substring(x.source_ref from '^level-([0-9]+)$')::int)
    FROM public.xp_ledger x WHERE x.user_id=a.user_id AND x.game_id=p_game_id
     AND x.source_key='level-clear:'||p_game_id AND x.source_ref ~ '^level-[0-9]+$'),0)::bigint
  WHEN 'snake_survival' THEN COALESCE((SELECT s.best_seconds FROM public.snake_run_records s
    WHERE s.user_id=a.user_id),0)::bigint END AS val
  FROM allowed a
 )
 SELECT row_number() OVER(ORDER BY v.val DESC,v.alias ASC)::bigint,
   v.alias::text,v.val::bigint,
   CASE p_metric
   WHEN 'xp' THEN 'SERVER XP LEDGER (timed/attested)'
   WHEN 'playtime' THEN 'SERVER-ESTIMATED VISIBLE TIME'
   WHEN 'level' THEN 'SERVER-TIMED LEVEL (not replay verified)'
   WHEN 'snake_survival' THEN 'SERVER-TIMED SNAKE RUN'
   END::text
 FROM values_by_player v WHERE v.val>0
 ORDER BY v.val DESC,v.alias ASC LIMIT p_limit;
END $function$;
REVOKE ALL ON FUNCTION public.arcade_leaderboard(text,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.arcade_leaderboard(text,text,integer) TO anon,authenticated;