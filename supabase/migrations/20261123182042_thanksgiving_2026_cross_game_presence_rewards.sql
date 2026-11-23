INSERT INTO public.cosmetic_catalog(cosmetic_id,title,description,kind,rarity,game_id,asset_key,unlock_rule,is_active)
VALUES
('event-thanksgiving-2026-frame','Thanksgiving Player Frame','2026 Thanksgiving participation frame','frame','event',NULL,'thanksgiving-frame','Qualifying signed-in game heartbeat November 26, 2026 Eastern',true),
('event-thanksgiving-2026-hat','Thanksgiving Turkey Hat','Limited turkey hat','hat','event',NULL,'thanksgiving-turkey-hat','1800 seconds bounded signed-in game activity Nov 26 2026 Eastern',true)
ON CONFLICT(cosmetic_id) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,kind=EXCLUDED.kind,rarity=EXCLUDED.rarity,asset_key=EXCLUDED.asset_key,unlock_rule=EXCLUDED.unlock_rule,is_active=EXCLUDED.is_active;

CREATE TABLE IF NOT EXISTS public.thanksgiving_2026_activity(
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 eligible_seconds integer NOT NULL DEFAULT 0 CHECK(eligible_seconds BETWEEN 0 AND 1800),
 first_qualified_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 last_credited_at timestamptz NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT clock_timestamp());
ALTER TABLE public.thanksgiving_2026_activity ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.thanksgiving_2026_activity FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.thanksgiving_2026_activity TO authenticated;
DROP POLICY IF EXISTS thanksgiving_2026_read_self ON public.thanksgiving_2026_activity;
CREATE POLICY thanksgiving_2026_read_self ON public.thanksgiving_2026_activity
 FOR SELECT TO authenticated USING ((SELECT auth.uid())=user_id);

CREATE OR REPLACE FUNCTION public.credit_thanksgiving_2026(
 p_user uuid,p_game_id text,p_previous timestamptz,p_now timestamptz,p_seconds integer
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
DECLARE seconds_total integer;
BEGIN
 IF p_user IS NULL OR p_previous IS NULL OR p_now IS NULL
   OR p_seconds NOT BETWEEN 12 AND 30
   OR p_now<=p_previous OR p_now-p_previous>interval '75 seconds'
   OR (p_previous AT TIME ZONE 'America/New_York')::date<>DATE '2026-11-26'
   OR (p_now AT TIME ZONE 'America/New_York')::date<>DATE '2026-11-26'
 THEN RETURN; END IF;
 INSERT INTO public.thanksgiving_2026_activity(user_id,eligible_seconds,first_qualified_at,last_credited_at,updated_at)
 VALUES(p_user,LEAST(1800,p_seconds),p_now,p_now,p_now)
 ON CONFLICT(user_id) DO UPDATE SET
 eligible_seconds=LEAST(1800,public.thanksgiving_2026_activity.eligible_seconds +
   LEAST(p_seconds,GREATEST(0,FLOOR(EXTRACT(EPOCH FROM (
     p_now-public.thanksgiving_2026_activity.last_credited_at)))::integer))),
 last_credited_at=GREATEST(public.thanksgiving_2026_activity.last_credited_at,p_now),
 updated_at=p_now
 RETURNING eligible_seconds INTO seconds_total;
 INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
 VALUES(p_user,'event-thanksgiving-2026-frame','event:thanksgiving-2026:participation')
 ON CONFLICT(user_id,cosmetic_id) DO NOTHING;
 IF seconds_total>=1800 THEN
 INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
 VALUES(p_user,'event-thanksgiving-2026-hat','event:thanksgiving-2026:1800-eligible-seconds')
 ON CONFLICT(user_id,cosmetic_id) DO NOTHING;
 END IF;
END $$;
REVOKE ALL ON FUNCTION public.credit_thanksgiving_2026(uuid,text,timestamptz,timestamptz,integer) FROM PUBLIC,anon,authenticated;
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
    'choose-adventure','ferret-life','inbox-hero','community-garden','grass-snake','neon-pong','brick-blitz'
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
    PERFORM public.credit_thanksgiving_2026(v_user,p_game_id,v_previous,v_now,
      LEAST(30,FLOOR(v_gap)::integer));
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
$function$;
REVOKE ALL ON FUNCTION public.record_game_presence(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.record_game_presence(text,text) TO authenticated;