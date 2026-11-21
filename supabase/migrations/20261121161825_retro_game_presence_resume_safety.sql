-- Deployed migration 20261121161825: retro_game_presence_resume_safety
-- Signed-in, account-private page-visibility estimates only. NOT trusted active-play XP.
-- This supersedes the unsafe resume timing behavior of record_game_heartbeat
-- for newly deployed clients while preserving compatibility for older versions.
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
    'choose-adventure','ferret-life','inbox-hero','community-garden'
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
REVOKE ALL ON FUNCTION public.record_game_presence(text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_game_presence(text,text) TO authenticated;
COMMENT ON FUNCTION public.record_game_presence(text,text) IS
  'User-scoped, unverified game page activity estimates. Start/resume resets cursor to prevent background time; never awards XP.';
