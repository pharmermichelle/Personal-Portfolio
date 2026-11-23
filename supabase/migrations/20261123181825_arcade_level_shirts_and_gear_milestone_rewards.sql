-- Arcade cosmetic progression. Previously earned items remain untouched.
-- Gear Rush grants only at Rooms 5, 10 and 15. XP remains available all 15.
UPDATE public.cosmetic_catalog SET is_active = (cosmetic_id IN
 ('gear-rush-l05','gear-rush-l10','gear-rush-l15'))
WHERE game_id='hockey-gear-rush';

UPDATE public.cosmetic_catalog SET title=CASE cosmetic_id
 WHEN 'gear-rush-l05' THEN 'Captain’s Hockey Helmet'
 WHEN 'gear-rush-l10' THEN 'Frozen Rink Hoodie'
 WHEN 'gear-rush-l15' THEN 'Final Buzzer Pants'
 ELSE title END,
 unlock_rule=CASE cosmetic_id
 WHEN 'gear-rush-l05' THEN 'First signed-in, unassisted Rush clear of Room 5'
 WHEN 'gear-rush-l10' THEN 'First signed-in, unassisted Rush clear of Room 10'
 WHEN 'gear-rush-l15' THEN 'First signed-in, unassisted Rush clear of Room 15'
 ELSE unlock_rule END
WHERE cosmetic_id IN ('gear-rush-l05','gear-rush-l10','gear-rush-l15');

CREATE OR REPLACE FUNCTION public.grant_gear_rush_wearable_from_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public AS $$
DECLARE reward_id text;
BEGIN
 IF NEW.game_id='hockey-gear-rush' AND NEW.source_key='level-clear:hockey-gear-rush'
   AND NEW.source_ref IN ('level-005','level-010','level-015') THEN
   reward_id:='gear-rush-l'||lpad(substring(NEW.source_ref from 7 for 3)::integer::text,2,'0');
   INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
   SELECT NEW.user_id,c.cosmetic_id,NEW.source_key||':'||NEW.source_ref
   FROM public.cosmetic_catalog c
   WHERE c.cosmetic_id=reward_id AND c.is_active AND c.game_id='hockey-gear-rush'
   ON CONFLICT(user_id,cosmetic_id) DO NOTHING;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.grant_gear_rush_wearable_from_xp() FROM PUBLIC, anon, authenticated;

-- Level 2 to 50 shirts are progressive cosmetics. Reserve new levels for later.
INSERT INTO public.cosmetic_catalog
(cosmetic_id,title,kind,rarity,game_id,asset_key,unlock_rule,is_active)
VALUES
('level-shirt-02','Arcade Level 2 Shirt','shirt','common',NULL,'level-shirt-02','Reach player level 2 using server-recorded account XP',true),
('level-shirt-03','Arcade Level 3 Shirt','shirt','common',NULL,'level-shirt-03','Reach player level 3 using server-recorded account XP',true),
('level-shirt-04','Arcade Level 4 Shirt','shirt','common',NULL,'level-shirt-04','Reach player level 4 using server-recorded account XP',true),
('level-shirt-05','Arcade Level 5 Shirt','shirt','common',NULL,'level-shirt-05','Reach player level 5 using server-recorded account XP',true),
('level-shirt-06','Arcade Level 6 Shirt','shirt','common',NULL,'level-shirt-06','Reach player level 6 using server-recorded account XP',true),
('level-shirt-07','Arcade Level 7 Shirt','shirt','common',NULL,'level-shirt-07','Reach player level 7 using server-recorded account XP',true),
('level-shirt-08','Arcade Level 8 Shirt','shirt','common',NULL,'level-shirt-08','Reach player level 8 using server-recorded account XP',true),
('level-shirt-09','Arcade Level 9 Shirt','shirt','common',NULL,'level-shirt-09','Reach player level 9 using server-recorded account XP',true),
('level-shirt-10','Arcade Level 10 Shirt','shirt','common',NULL,'level-shirt-10','Reach player level 10 using server-recorded account XP',true),
('level-shirt-11','Arcade Level 11 Shirt','shirt','common',NULL,'level-shirt-11','Reach player level 11 using server-recorded account XP',true),
('level-shirt-12','Arcade Level 12 Shirt','shirt','common',NULL,'level-shirt-12','Reach player level 12 using server-recorded account XP',true),
('level-shirt-13','Arcade Level 13 Shirt','shirt','common',NULL,'level-shirt-13','Reach player level 13 using server-recorded account XP',true),
('level-shirt-14','Arcade Level 14 Shirt','shirt','common',NULL,'level-shirt-14','Reach player level 14 using server-recorded account XP',true),
('level-shirt-15','Arcade Level 15 Shirt','shirt','common',NULL,'level-shirt-15','Reach player level 15 using server-recorded account XP',true),
('level-shirt-16','Arcade Level 16 Shirt','shirt','common',NULL,'level-shirt-16','Reach player level 16 using server-recorded account XP',true),
('level-shirt-17','Arcade Level 17 Shirt','shirt','common',NULL,'level-shirt-17','Reach player level 17 using server-recorded account XP',true),
('level-shirt-18','Arcade Level 18 Shirt','shirt','common',NULL,'level-shirt-18','Reach player level 18 using server-recorded account XP',true),
('level-shirt-19','Arcade Level 19 Shirt','shirt','common',NULL,'level-shirt-19','Reach player level 19 using server-recorded account XP',true),
('level-shirt-20','Arcade Level 20 Shirt','shirt','common',NULL,'level-shirt-20','Reach player level 20 using server-recorded account XP',true),
('level-shirt-21','Arcade Level 21 Shirt','shirt','common',NULL,'level-shirt-21','Reach player level 21 using server-recorded account XP',true),
('level-shirt-22','Arcade Level 22 Shirt','shirt','common',NULL,'level-shirt-22','Reach player level 22 using server-recorded account XP',true),
('level-shirt-23','Arcade Level 23 Shirt','shirt','common',NULL,'level-shirt-23','Reach player level 23 using server-recorded account XP',true),
('level-shirt-24','Arcade Level 24 Shirt','shirt','common',NULL,'level-shirt-24','Reach player level 24 using server-recorded account XP',true),
('level-shirt-25','Arcade Level 25 Shirt','shirt','common',NULL,'level-shirt-25','Reach player level 25 using server-recorded account XP',true),
('level-shirt-26','Arcade Level 26 Shirt','shirt','common',NULL,'level-shirt-26','Reach player level 26 using server-recorded account XP',true),
('level-shirt-27','Arcade Level 27 Shirt','shirt','common',NULL,'level-shirt-27','Reach player level 27 using server-recorded account XP',true),
('level-shirt-28','Arcade Level 28 Shirt','shirt','common',NULL,'level-shirt-28','Reach player level 28 using server-recorded account XP',true),
('level-shirt-29','Arcade Level 29 Shirt','shirt','common',NULL,'level-shirt-29','Reach player level 29 using server-recorded account XP',true),
('level-shirt-30','Arcade Level 30 Shirt','shirt','common',NULL,'level-shirt-30','Reach player level 30 using server-recorded account XP',true),
('level-shirt-31','Arcade Level 31 Shirt','shirt','common',NULL,'level-shirt-31','Reach player level 31 using server-recorded account XP',true),
('level-shirt-32','Arcade Level 32 Shirt','shirt','common',NULL,'level-shirt-32','Reach player level 32 using server-recorded account XP',true),
('level-shirt-33','Arcade Level 33 Shirt','shirt','common',NULL,'level-shirt-33','Reach player level 33 using server-recorded account XP',true),
('level-shirt-34','Arcade Level 34 Shirt','shirt','common',NULL,'level-shirt-34','Reach player level 34 using server-recorded account XP',true),
('level-shirt-35','Arcade Level 35 Shirt','shirt','common',NULL,'level-shirt-35','Reach player level 35 using server-recorded account XP',true),
('level-shirt-36','Arcade Level 36 Shirt','shirt','common',NULL,'level-shirt-36','Reach player level 36 using server-recorded account XP',true),
('level-shirt-37','Arcade Level 37 Shirt','shirt','common',NULL,'level-shirt-37','Reach player level 37 using server-recorded account XP',true),
('level-shirt-38','Arcade Level 38 Shirt','shirt','common',NULL,'level-shirt-38','Reach player level 38 using server-recorded account XP',true),
('level-shirt-39','Arcade Level 39 Shirt','shirt','common',NULL,'level-shirt-39','Reach player level 39 using server-recorded account XP',true),
('level-shirt-40','Arcade Level 40 Shirt','shirt','common',NULL,'level-shirt-40','Reach player level 40 using server-recorded account XP',true),
('level-shirt-41','Arcade Level 41 Shirt','shirt','common',NULL,'level-shirt-41','Reach player level 41 using server-recorded account XP',true),
('level-shirt-42','Arcade Level 42 Shirt','shirt','common',NULL,'level-shirt-42','Reach player level 42 using server-recorded account XP',true),
('level-shirt-43','Arcade Level 43 Shirt','shirt','common',NULL,'level-shirt-43','Reach player level 43 using server-recorded account XP',true),
('level-shirt-44','Arcade Level 44 Shirt','shirt','common',NULL,'level-shirt-44','Reach player level 44 using server-recorded account XP',true),
('level-shirt-45','Arcade Level 45 Shirt','shirt','common',NULL,'level-shirt-45','Reach player level 45 using server-recorded account XP',true),
('level-shirt-46','Arcade Level 46 Shirt','shirt','common',NULL,'level-shirt-46','Reach player level 46 using server-recorded account XP',true),
('level-shirt-47','Arcade Level 47 Shirt','shirt','common',NULL,'level-shirt-47','Reach player level 47 using server-recorded account XP',true),
('level-shirt-48','Arcade Level 48 Shirt','shirt','common',NULL,'level-shirt-48','Reach player level 48 using server-recorded account XP',true),
('level-shirt-49','Arcade Level 49 Shirt','shirt','common',NULL,'level-shirt-49','Reach player level 49 using server-recorded account XP',true),
('level-shirt-50','Arcade Level 50 Shirt','shirt','common',NULL,'level-shirt-50','Reach player level 50 using server-recorded account XP',true)
ON CONFLICT(cosmetic_id) DO UPDATE SET
 title=EXCLUDED.title,kind=EXCLUDED.kind,rarity=EXCLUDED.rarity,
 game_id=EXCLUDED.game_id,asset_key=EXCLUDED.asset_key,
 unlock_rule=EXCLUDED.unlock_rule,is_active=EXCLUDED.is_active;

CREATE OR REPLACE FUNCTION public.grant_player_level_shirts_after_xp()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public AS $$
DECLARE earned_xp bigint; current_level integer;
BEGIN
 -- XP ledger grants only; browser levels, guest saves and claimed scores don't qualify.
 SELECT COALESCE(SUM(amount),0) INTO earned_xp
 FROM public.xp_ledger WHERE user_id=NEW.user_id;
 current_level:=LEAST(50,FLOOR(SQRT(earned_xp::numeric / 50))::integer+1);
 INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
 SELECT NEW.user_id,c.cosmetic_id,'account-level:'||s.level::text
 FROM generate_series(2,current_level) AS s(level)
 JOIN public.cosmetic_catalog c
   ON c.cosmetic_id='level-shirt-'||lpad(s.level::text,2,'0')
 WHERE c.is_active
 ON CONFLICT(user_id,cosmetic_id) DO NOTHING;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.grant_player_level_shirts_after_xp() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS arcade_level_shirts_after_xp ON public.xp_ledger;
CREATE TRIGGER arcade_level_shirts_after_xp AFTER INSERT ON public.xp_ledger
FOR EACH ROW EXECUTE FUNCTION public.grant_player_level_shirts_after_xp();

-- Existing earned levels receive their shirts, without any XP changes.
WITH total AS (
 SELECT user_id,LEAST(50,FLOOR(SQRT(SUM(amount)::numeric/50))::integer+1) AS lvl
 FROM public.xp_ledger GROUP BY user_id
)
INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
SELECT total.user_id,c.cosmetic_id,'account-level:'||gs.level::text
FROM total CROSS JOIN LATERAL generate_series(2,total.lvl) gs(level)
JOIN public.cosmetic_catalog c
 ON c.cosmetic_id='level-shirt-'||lpad(gs.level::text,2,'0')
WHERE c.is_active
ON CONFLICT(user_id,cosmetic_id) DO NOTHING;
