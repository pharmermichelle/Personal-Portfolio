-- Acorn Ascent pilot: reusable server-owned XP, official badges and cosmetic unlocks.
-- Only the backend service role may modify the reward ledger or wardrobe entitlements.
CREATE TABLE IF NOT EXISTS public.xp_ledger (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 game_id text NOT NULL CHECK(length(game_id) BETWEEN 1 AND 80),
 source_key text NOT NULL,
 source_ref text NOT NULL,
 amount integer NOT NULL CHECK(amount BETWEEN 1 AND 1000),
 rule_version integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,source_key,source_ref)
);
CREATE INDEX IF NOT EXISTS xp_ledger_account_game_idx ON public.xp_ledger(user_id,game_id,created_at DESC);
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.xp_ledger FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.xp_ledger TO authenticated;
GRANT ALL ON public.xp_ledger TO service_role;
DROP POLICY IF EXISTS xp_ledger_read_self ON public.xp_ledger;
CREATE POLICY xp_ledger_read_self ON public.xp_ledger FOR SELECT TO authenticated USING ((select auth.uid())=user_id);

CREATE TABLE IF NOT EXISTS public.reward_attempts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 game_id text NOT NULL CHECK(length(game_id) BETWEEN 1 AND 80),
 level_number integer NOT NULL CHECK(level_number BETWEEN 1 AND 5000),
 game_version text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 expires_at timestamptz NOT NULL DEFAULT (clock_timestamp() + interval '30 minutes'),
 redeemed_at timestamptz,
 CHECK (expires_at > created_at)
);
CREATE INDEX IF NOT EXISTS reward_attempts_account_idx ON public.reward_attempts(user_id,game_id,created_at DESC);
ALTER TABLE public.reward_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.reward_attempts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.reward_attempts TO service_role;

CREATE TABLE IF NOT EXISTS public.cosmetic_catalog (
 cosmetic_id text PRIMARY KEY,
 title text NOT NULL,
 description text NOT NULL DEFAULT '',
 kind text NOT NULL CHECK(kind IN ('avatar','skin','shirt','pants','frame','title','emote')),
 rarity text NOT NULL DEFAULT 'common',
 game_id text,
 asset_key text,
 unlock_rule text,
 is_active boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cosmetic_catalog ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.cosmetic_catalog FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.cosmetic_catalog TO anon, authenticated;
GRANT ALL ON public.cosmetic_catalog TO service_role;
DROP POLICY IF EXISTS cosmetic_catalog_public_active ON public.cosmetic_catalog;
CREATE POLICY cosmetic_catalog_public_active ON public.cosmetic_catalog FOR SELECT TO anon,authenticated USING(is_active);

CREATE TABLE IF NOT EXISTS public.player_inventory (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 cosmetic_id text NOT NULL REFERENCES public.cosmetic_catalog(cosmetic_id),
 source_key text NOT NULL,
 awarded_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,cosmetic_id)
);
ALTER TABLE public.player_inventory ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.player_inventory FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.player_inventory TO authenticated;
GRANT ALL ON public.player_inventory TO service_role;
DROP POLICY IF EXISTS player_inventory_select_self ON public.player_inventory;
CREATE POLICY player_inventory_select_self ON public.player_inventory FOR SELECT TO authenticated USING ((select auth.uid())=user_id);

CREATE TABLE IF NOT EXISTS public.equipped_cosmetics (
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 slot text NOT NULL CHECK(slot IN ('shirt','pants','frame')),
 cosmetic_id text NOT NULL,
 equipped_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,slot),
 FOREIGN KEY(user_id,cosmetic_id) REFERENCES public.player_inventory(user_id,cosmetic_id) ON DELETE CASCADE
);
ALTER TABLE public.equipped_cosmetics ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.equipped_cosmetics FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.equipped_cosmetics TO authenticated;
GRANT ALL ON public.equipped_cosmetics TO service_role;
DROP POLICY IF EXISTS equipped_read_own ON public.equipped_cosmetics;
DROP POLICY IF EXISTS equipped_insert_own ON public.equipped_cosmetics;
DROP POLICY IF EXISTS equipped_update_own ON public.equipped_cosmetics;
DROP POLICY IF EXISTS equipped_delete_own ON public.equipped_cosmetics;
CREATE POLICY equipped_read_own ON public.equipped_cosmetics FOR SELECT TO authenticated USING((select auth.uid())=user_id);
CREATE POLICY equipped_insert_own ON public.equipped_cosmetics FOR INSERT TO authenticated WITH CHECK(
  (select auth.uid())=user_id AND EXISTS(
   SELECT 1 FROM public.player_inventory i JOIN public.cosmetic_catalog c USING(cosmetic_id)
   WHERE i.user_id=(select auth.uid()) AND i.cosmetic_id=equipped_cosmetics.cosmetic_id AND c.kind=equipped_cosmetics.slot AND c.is_active
  )
);
CREATE POLICY equipped_update_own ON public.equipped_cosmetics FOR UPDATE TO authenticated USING((select auth.uid())=user_id)
WITH CHECK(
  (select auth.uid())=user_id AND EXISTS(
   SELECT 1 FROM public.player_inventory i JOIN public.cosmetic_catalog c USING(cosmetic_id)
   WHERE i.user_id=(select auth.uid()) AND i.cosmetic_id=equipped_cosmetics.cosmetic_id AND c.kind=equipped_cosmetics.slot AND c.is_active
  )
);
CREATE POLICY equipped_delete_own ON public.equipped_cosmetics FOR DELETE TO authenticated USING((select auth.uid())=user_id);

INSERT INTO public.badge_catalog (badge_id,game_id,title,description,icon_key,xp_reward,is_active)
VALUES ('acorn-complete','acorn-ascent','Oakward Bound','Finish all ten Acorn Ascent branches with authenticated, server-validated puzzle clears.','badge-acorn-win',0,true)
ON CONFLICT (badge_id) DO UPDATE SET title=excluded.title,description=excluded.description,icon_key=excluded.icon_key,xp_reward=excluded.xp_reward,is_active=excluded.is_active;

INSERT INTO public.cosmetic_catalog(cosmetic_id,title,description,kind,rarity,game_id,asset_key,unlock_rule,is_active)
VALUES ('shirt-acorn-ascent','Squirrel Summit Tee','Olive green squirrel-climbing-tree shirt earned by mastering all ten Acorn Ascent branches.','shirt','rare','acorn-ascent','images/rewards/acorn-ascent-squirrel-tee.webp','acorn-complete',true)
ON CONFLICT (cosmetic_id) DO UPDATE SET title=excluded.title,description=excluded.description,kind=excluded.kind,
rarity=excluded.rarity,game_id=excluded.game_id,asset_key=excluded.asset_key,unlock_rule=excluded.unlock_rule,is_active=excluded.is_active;

-- Service-only atomic award transaction. NEVER expose EXECUTE to browser roles.
CREATE OR REPLACE FUNCTION public.claim_verified_level(
 p_user uuid, p_attempt uuid, p_game text, p_level integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public
AS $$
DECLARE r_attempt public.reward_attempts%ROWTYPE;
 v_amount integer:=0;
 v_count integer;
 v_badge boolean:=false;
 v_shirt boolean:=false;
 v_total bigint;
BEGIN
 SELECT * INTO r_attempt FROM public.reward_attempts
  WHERE id=p_attempt AND user_id=p_user AND game_id=p_game AND level_number=p_level FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Unknown reward attempt'; END IF;
 IF r_attempt.redeemed_at IS NOT NULL THEN RAISE EXCEPTION 'Reward attempt already redeemed'; END IF;
 IF r_attempt.expires_at<=clock_timestamp() OR r_attempt.created_at>clock_timestamp() THEN
   RAISE EXCEPTION 'Reward attempt expired';
 END IF;
 IF p_game<>'acorn-ascent' OR p_level NOT BETWEEN 1 AND 10 OR r_attempt.game_version<>'v2' THEN
   RAISE EXCEPTION 'Unsupported verified level';
 END IF;
 IF r_attempt.created_at>clock_timestamp()-interval '1 second' THEN
   RAISE EXCEPTION 'Finish the level before claiming';
 END IF;
 UPDATE public.reward_attempts SET redeemed_at=clock_timestamp() WHERE id=p_attempt;
 INSERT INTO public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
 VALUES(p_user,p_game,'level-clear:'||p_game,'level-'||lpad(p_level::text,2,'0'),p_level*2,1)
 ON CONFLICT(user_id,source_key,source_ref) DO NOTHING
 RETURNING amount INTO v_amount;
 v_amount:=coalesce(v_amount,0);
 SELECT count(*) INTO v_count FROM public.xp_ledger
  WHERE user_id=p_user AND source_key='level-clear:acorn-ascent' AND source_ref IN
   ('level-01','level-02','level-03','level-04','level-05','level-06','level-07','level-08','level-09','level-10');
 IF v_count=10 THEN
   WITH b AS (
    INSERT INTO public.earned_badges(user_id,badge_id,metadata)
    VALUES(p_user,'acorn-complete','{"game_id":"acorn-ascent","rule_version":1}'::jsonb)
    ON CONFLICT(user_id,badge_id) DO NOTHING RETURNING badge_id
   ) SELECT EXISTS(SELECT 1 FROM b) INTO v_badge;
   WITH g AS (
    INSERT INTO public.player_inventory(user_id,cosmetic_id,source_key)
    VALUES(p_user,'shirt-acorn-ascent','badge:acorn-complete')
    ON CONFLICT(user_id,cosmetic_id) DO NOTHING RETURNING cosmetic_id
   ) SELECT EXISTS(SELECT 1 FROM g) INTO v_shirt;
 END IF;
 SELECT coalesce(sum(amount),0) INTO v_total FROM public.xp_ledger WHERE user_id=p_user;
 RETURN jsonb_build_object('awarded_xp',v_amount,'game_xp_total',(
   SELECT coalesce(sum(amount),0) FROM public.xp_ledger WHERE user_id=p_user AND game_id=p_game),
  'overall_xp_total',v_total,'levels_earned',v_count,'badge_earned',v_badge,'shirt_unlocked',v_shirt,
  'badge_id',case when v_count=10 then 'acorn-complete' else null end);
END; $$;
REVOKE ALL ON FUNCTION public.claim_verified_level(uuid,uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_verified_level(uuid,uuid,text,integer) TO service_role;
