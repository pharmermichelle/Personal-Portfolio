-- Applied on Supabase 2026-11-20. Personal game activity is informational,
-- not verified and not eligible for XP, prizes, badges or public leaderboards.
CREATE TABLE IF NOT EXISTS public.game_activity (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id text NOT NULL CHECK (game_id IN ('claws-vs-paws', 'cut-the-cheese', 'fallen-grid', 'revive-nature', 'rink-putt', 'hockey-gear-rush', 'survive-2026', 'acorn-ascent', 'bugged-out', 'coastline-cruiser', 'lemon-pound-cake', 'wizards-mana', 'whack-a-bug', 'choose-adventure', 'ferret-life', 'inbox-hero', 'community-garden')),
  active_seconds bigint NOT NULL DEFAULT 0 CHECK (active_seconds >= 0),
  visits integer NOT NULL DEFAULT 1 CHECK (visits > 0),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);
ALTER TABLE public.game_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.game_activity FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.game_activity TO authenticated;
GRANT ALL ON TABLE public.game_activity TO service_role;
DROP POLICY IF EXISTS game_activity_read_self ON public.game_activity;
CREATE POLICY game_activity_read_self ON public.game_activity
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- A narrow, authenticated, server-timed update intentionally runs as definer.
-- Clients cannot choose a user, timestamp or number of seconds.
CREATE OR REPLACE FUNCTION public.record_game_heartbeat(p_game_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  v_user uuid := auth.uid();
  v_previous timestamptz;
  v_now timestamptz := clock_timestamp();
  v_gap numeric;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE='28000'; END IF;
  IF p_game_id IS NULL OR p_game_id NOT IN ('claws-vs-paws', 'cut-the-cheese', 'fallen-grid', 'revive-nature', 'rink-putt', 'hockey-gear-rush', 'survive-2026', 'acorn-ascent', 'bugged-out', 'coastline-cruiser', 'lemon-pound-cake', 'wizards-mana', 'whack-a-bug', 'choose-adventure', 'ferret-life', 'inbox-hero', 'community-garden') THEN
    RAISE EXCEPTION 'Unknown game identifier' USING ERRCODE='22023';
  END IF;
  SELECT last_seen_at INTO v_previous
    FROM public.game_activity WHERE user_id=v_user AND game_id=p_game_id FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.game_activity(user_id,game_id,active_seconds,visits,last_seen_at)
    VALUES(v_user,p_game_id,0,1,v_now) ON CONFLICT(user_id,game_id) DO NOTHING;
  ELSE
    v_gap := EXTRACT(EPOCH FROM (v_now-v_previous));
    IF v_gap >= 12 AND v_gap <= 75 THEN
      UPDATE public.game_activity
        SET active_seconds = active_seconds + LEAST(30,FLOOR(v_gap)::integer),
            last_seen_at = v_now
        WHERE user_id=v_user AND game_id=p_game_id;
    ELSIF v_gap > 75 THEN
      UPDATE public.game_activity
        SET visits = visits+1,last_seen_at=v_now
        WHERE user_id=v_user AND game_id=p_game_id;
    END IF;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.record_game_heartbeat(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_game_heartbeat(text) TO authenticated;
