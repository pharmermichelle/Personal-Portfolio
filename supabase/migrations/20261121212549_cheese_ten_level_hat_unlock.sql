
-- Cut the Cheese: ten distinct signed-in level clears unlock an avatar hat.
ALTER TABLE public.cosmetic_catalog DROP CONSTRAINT IF EXISTS cosmetic_catalog_kind_check;
ALTER TABLE public.cosmetic_catalog ADD CONSTRAINT cosmetic_catalog_kind_check
  CHECK (kind = ANY (ARRAY['avatar','skin','shirt','pants','frame','title','emote','hat']::text[]));
ALTER TABLE public.equipped_cosmetics DROP CONSTRAINT IF EXISTS equipped_cosmetics_slot_check;
ALTER TABLE public.equipped_cosmetics ADD CONSTRAINT equipped_cosmetics_slot_check
  CHECK (slot = ANY (ARRAY['shirt','pants','frame','hat']::text[]));

INSERT INTO public.badge_catalog
(badge_id,game_id,title,description,icon_key,xp_reward,is_active)
VALUES ('cheese-ten-levels','cut-the-cheese','Big Cheese',
        'Complete ten distinct Cut the Cheese levels while signed in.','cheese-wedge',0,true)
ON CONFLICT (badge_id) DO UPDATE SET
 title=EXCLUDED.title,description=EXCLUDED.description,icon_key=EXCLUDED.icon_key,is_active=true;

INSERT INTO public.cosmetic_catalog
(cosmetic_id,title,description,kind,rarity,game_id,asset_key,unlock_rule,is_active)
VALUES ('hat-cheese-wedge','Big Cheese Wedge Hat',
        'A golden cheese wedge hat with Swiss-style holes.','hat','rare','cut-the-cheese',
        'cheese-wedge-hat','Complete ten distinct signed-in Cut the Cheese levels',true)
ON CONFLICT (cosmetic_id) DO UPDATE SET
 title=EXCLUDED.title,description=EXCLUDED.description,kind=EXCLUDED.kind,
 game_id=EXCLUDED.game_id,asset_key=EXCLUDED.asset_key,unlock_rule=EXCLUDED.unlock_rule,is_active=true;

CREATE OR REPLACE FUNCTION public.claim_cheese_level(p_user uuid, p_attempt uuid, p_level integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  a public.reward_attempts%ROWTYPE;
  award integer := 0;
  total bigint;
  total_game bigint;
  cleared integer := 0;
  got_badge boolean := false;
  got_hat boolean := false;
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
  IF a.created_at > clock_timestamp()-interval '3 seconds' THEN
    RAISE EXCEPTION 'Challenge completed too quickly' USING ERRCODE='22023';
  END IF;
  UPDATE public.reward_attempts SET redeemed_at=clock_timestamp() WHERE id=p_attempt;
  INSERT INTO public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
  VALUES(p_user,'cut-the-cheese','level-clear:cut-the-cheese',
         'level-'||lpad(p_level::text,3,'0'),least(25,4+p_level*2),1)
  ON CONFLICT (user_id,source_key,source_ref) DO NOTHING
  RETURNING amount INTO award;
  award:=coalesce(award,0);
  SELECT count(DISTINCT source_ref) INTO cleared FROM public.xp_ledger
    WHERE user_id=p_user AND game_id='cut-the-cheese'
      AND source_key='level-clear:cut-the-cheese';
  IF cleared>=10 THEN
    WITH b AS (
      INSERT INTO public.earned_badges(user_id,badge_id,metadata)
      VALUES(p_user,'cheese-ten-levels',
             '{"game_id":"cut-the-cheese","rule_version":1}'::jsonb)
      ON CONFLICT (user_id,badge_id) DO NOTHING RETURNING badge_id
    ) SELECT EXISTS(SELECT 1 FROM b) INTO got_badge;
    WITH h AS (
      INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
      VALUES(p_user,'hat-cheese-wedge','badge:cheese-ten-levels')
      ON CONFLICT (user_id,cosmetic_id) DO NOTHING RETURNING cosmetic_id
    ) SELECT EXISTS(SELECT 1 FROM h) INTO got_hat;
  END IF;
  SELECT coalesce(sum(amount),0) INTO total_game FROM public.xp_ledger
    WHERE user_id=p_user AND game_id='cut-the-cheese';
  SELECT coalesce(sum(amount),0) INTO total FROM public.xp_ledger
    WHERE user_id=p_user;
  RETURN jsonb_build_object('awarded_xp',award,'game_xp_total',total_game,
    'overall_xp_total',total,'level',p_level,'already_earned',award=0,
    'levels_earned',cleared,'badge_earned',got_badge,'hat_unlocked',got_hat,
    'badge_id',CASE WHEN cleared>=10 THEN 'cheese-ten-levels' ELSE null END);
END
$function$;
-- A player cannot invoke the privileged claim function directly from the browser.
REVOKE ALL ON FUNCTION public.claim_cheese_level(uuid,uuid,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_cheese_level(uuid,uuid,integer) TO service_role;

-- Honor any qualifying level clears already present in the signed-in ledger.
INSERT INTO public.earned_badges (user_id,badge_id,metadata)
SELECT user_id,'cheese-ten-levels','{"game_id":"cut-the-cheese","rule_version":1}'::jsonb
FROM public.xp_ledger
WHERE game_id='cut-the-cheese' AND source_key='level-clear:cut-the-cheese'
GROUP BY user_id HAVING count(DISTINCT source_ref)>=10
ON CONFLICT (user_id,badge_id) DO NOTHING;
INSERT INTO public.player_inventory (user_id,cosmetic_id,source_key)
SELECT user_id,'hat-cheese-wedge','badge:cheese-ten-levels'
FROM public.earned_badges WHERE badge_id='cheese-ten-levels'
ON CONFLICT (user_id,cosmetic_id) DO NOTHING;
