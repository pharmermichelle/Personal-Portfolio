-- Hockey Gear Rush: one distinct cosmetic for each of fifteen server-timed first clears.
-- This is casual/attested progression, NOT server-verified physical gameplay or ranked competition.
-- Client saves and guest progress never grant cosmetics. XP ledger is append-only.
INSERT INTO public.cosmetic_catalog
  (cosmetic_id,title,kind,rarity,game_id,asset_key,unlock_rule,is_active)
VALUES
  ('gear-rush-l01', 'Rookie Rink Cap', 'hat', 'common', 'hockey-gear-rush', 'gear-rush-01', 'Clear Hockey Gear Rush Room 1 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l02', 'Locker Room Tee', 'shirt', 'common', 'hockey-gear-rush', 'gear-rush-02', 'Clear Hockey Gear Rush Room 2 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l03', 'Tape Stripe Shorts', 'pants', 'common', 'hockey-gear-rush', 'gear-rush-03', 'Clear Hockey Gear Rush Room 3 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l04', 'Faceoff Star Frame', 'frame', 'common', 'hockey-gear-rush', 'gear-rush-04', 'Clear Hockey Gear Rush Room 4 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l05', 'Captain''s Hockey Helmet', 'hat', 'rare', 'hockey-gear-rush', 'gear-rush-05', 'Clear Hockey Gear Rush Room 5 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l06', 'Home Ice Jersey', 'shirt', 'rare', 'hockey-gear-rush', 'gear-rush-06', 'Clear Hockey Gear Rush Room 6 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l07', 'Skater Warmup Pants', 'pants', 'rare', 'hockey-gear-rush', 'gear-rush-07', 'Clear Hockey Gear Rush Room 7 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l08', 'Goal Light Frame', 'frame', 'rare', 'hockey-gear-rush', 'gear-rush-08', 'Clear Hockey Gear Rush Room 8 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l09', 'Away Game Beanie', 'hat', 'rare', 'hockey-gear-rush', 'gear-rush-09', 'Clear Hockey Gear Rush Room 9 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l10', 'Frozen Rink Hoodie', 'shirt', 'rare', 'hockey-gear-rush', 'gear-rush-10', 'Clear Hockey Gear Rush Room 10 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l11', 'Power Play Joggers', 'pants', 'rare', 'hockey-gear-rush', 'gear-rush-11', 'Clear Hockey Gear Rush Room 11 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l12', 'Overtime Spark Frame', 'frame', 'rare', 'hockey-gear-rush', 'gear-rush-12', 'Clear Hockey Gear Rush Room 12 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l13', 'All-Star Visor', 'hat', 'epic', 'hockey-gear-rush', 'gear-rush-13', 'Clear Hockey Gear Rush Room 13 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l14', 'Championship Sweater', 'shirt', 'epic', 'hockey-gear-rush', 'gear-rush-14', 'Clear Hockey Gear Rush Room 14 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true),
  ('gear-rush-l15', 'Final Buzzer Pants', 'pants', 'epic', 'hockey-gear-rush', 'gear-rush-15', 'Clear Hockey Gear Rush Room 15 in a signed-in, unassisted Rush attempt (server-timed; not replay verified)', true)
ON CONFLICT (cosmetic_id) DO UPDATE SET
 title=EXCLUDED.title, kind=EXCLUDED.kind, rarity=EXCLUDED.rarity,
 game_id=EXCLUDED.game_id,asset_key=EXCLUDED.asset_key,
 unlock_rule=EXCLUDED.unlock_rule,is_active=EXCLUDED.is_active;

UPDATE public.game_xp_rules
 SET max_level=15,
 notes=concat_ws(' ', notes,
   'Gear Rush Rooms 1-15 offer server-timed first-clear XP and one cosmetic each; no competitive score verification.')
WHERE game_id='hockey-gear-rush'
  AND max_level=5 AND enabled AND verification_tier='server_timed' AND reward_type='level';

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.game_xp_rules
   WHERE game_id='hockey-gear-rush' AND max_level=15 AND enabled AND verification_tier='server_timed' AND reward_type='level')
 THEN RAISE EXCEPTION 'Gear Rush XP rule precondition failed'; END IF;
END $$;

CREATE OR REPLACE FUNCTION public.grant_gear_rush_wearable_from_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public AS $$
DECLARE reward_id text;
BEGIN
 IF NEW.game_id='hockey-gear-rush'
   AND NEW.source_key='level-clear:hockey-gear-rush'
   AND NEW.source_ref ~ '^level-(00[1-9]|01[0-5])$'
 THEN
   reward_id := 'gear-rush-l'||substring(NEW.source_ref from 7 for 3);
   INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
   SELECT NEW.user_id, c.cosmetic_id, NEW.source_key||':'||NEW.source_ref
   FROM public.cosmetic_catalog c
   WHERE c.cosmetic_id=reward_id AND c.game_id='hockey-gear-rush' AND c.is_active
   ON CONFLICT (user_id,cosmetic_id) DO NOTHING;
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.grant_gear_rush_wearable_from_xp() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS gear_rush_cosmetic_after_xp ON public.xp_ledger;
CREATE TRIGGER gear_rush_cosmetic_after_xp AFTER INSERT ON public.xp_ledger
 FOR EACH ROW EXECUTE FUNCTION public.grant_gear_rush_wearable_from_xp();

-- Backfill if existing historical first-clear XP records are present, without altering XP.
INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
SELECT x.user_id,'gear-rush-l'||substring(x.source_ref from 7 for 3),
       x.source_key||':'||x.source_ref
FROM public.xp_ledger x
JOIN public.cosmetic_catalog c
 ON c.cosmetic_id='gear-rush-l'||substring(x.source_ref from 7 for 3)
WHERE x.game_id='hockey-gear-rush' AND x.source_key='level-clear:hockey-gear-rush'
 AND x.source_ref ~ '^level-(00[1-9]|01[0-5])$'
 AND c.game_id='hockey-gear-rush' AND c.is_active
ON CONFLICT(user_id,cosmetic_id) DO NOTHING;
