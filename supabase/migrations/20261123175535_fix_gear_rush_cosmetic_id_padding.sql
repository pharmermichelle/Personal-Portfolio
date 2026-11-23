-- Correct two-digit cosmetic IDs from three-digit level ledger references.
-- The initial release accidentally produced 'gear-rush-l001'; catalog IDs are 'gear-rush-l01'.
CREATE OR REPLACE FUNCTION public.grant_gear_rush_wearable_from_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public AS $$
DECLARE reward_id text;
BEGIN
 IF NEW.game_id='hockey-gear-rush' AND NEW.source_key='level-clear:hockey-gear-rush'
  AND NEW.source_ref ~ '^level-(00[1-9]|01[0-5])$' THEN
  reward_id:='gear-rush-l'||lpad(substring(NEW.source_ref from 7 for 3)::integer::text,2,'0');
  INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
  SELECT NEW.user_id,c.cosmetic_id,NEW.source_key||':'||NEW.source_ref
  FROM public.cosmetic_catalog c
  WHERE c.cosmetic_id=reward_id AND c.game_id='hockey-gear-rush' AND c.is_active
  ON CONFLICT (user_id,cosmetic_id) DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.grant_gear_rush_wearable_from_xp() FROM PUBLIC,anon,authenticated;
-- Safe backfill for previously earned level clear XP.
INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
SELECT x.user_id,'gear-rush-l'||lpad(substring(x.source_ref from 7 for 3)::integer::text,2,'0'),
 x.source_key||':'||x.source_ref
FROM public.xp_ledger x
JOIN public.cosmetic_catalog c
 ON c.cosmetic_id='gear-rush-l'||lpad(substring(x.source_ref from 7 for 3)::integer::text,2,'0')
WHERE x.game_id='hockey-gear-rush' AND x.source_key='level-clear:hockey-gear-rush'
 AND x.source_ref ~ '^level-(00[1-9]|01[0-5])$' AND c.is_active
ON CONFLICT(user_id,cosmetic_id) DO NOTHING;