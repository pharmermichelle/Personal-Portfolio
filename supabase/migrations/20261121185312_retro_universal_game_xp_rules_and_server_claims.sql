-- Supabase migration 202611211845xx: retro_universal_game_xp_rules_and_server_claims
-- Actual deployed catalog & claim; archived for source-controlled replay.
-- Claims are server-timed and idempotent, NOT game-physics/replay-verified.
CREATE TABLE IF NOT EXISTS public.game_xp_rules (
 game_id text PRIMARY KEY,
 display_name text NOT NULL,
 reward_type text NOT NULL CHECK (reward_type IN ('level','wave','ending','round','milestone','run','other')),
 max_level integer NOT NULL DEFAULT 0 CHECK (max_level BETWEEN 0 AND 500),
 base_xp integer NOT NULL DEFAULT 0 CHECK (base_xp BETWEEN 0 AND 50),
 step_xp integer NOT NULL DEFAULT 0 CHECK (step_xp BETWEEN 0 AND 10),
 cap_xp integer NOT NULL DEFAULT 0 CHECK (cap_xp BETWEEN 0 AND 50),
 min_seconds integer NOT NULL DEFAULT 0 CHECK (min_seconds BETWEEN 0 AND 600),
 enabled boolean NOT NULL DEFAULT false,
 verification_tier text NOT NULL DEFAULT 'pending_verifier',
 notes text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.game_xp_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS game_xp_rules_public_read ON public.game_xp_rules;
CREATE POLICY game_xp_rules_public_read ON public.game_xp_rules
 FOR SELECT TO anon,authenticated USING (true);
REVOKE ALL ON public.game_xp_rules FROM PUBLIC,anon,authenticated;
GRANT SELECT ON public.game_xp_rules TO anon,authenticated;
INSERT INTO public.game_xp_rules (game_id,display_name,reward_type,max_level,base_xp,step_xp,cap_xp,min_seconds,enabled,verification_tier,notes)
VALUES
('acorn-ascent','Acorn Ascent','level',10,2,2,20,1,false,'replay_verified_existing','Existing dedicated verified Acorn verifier; do not double award via catalog'),
('bugged-out','Bugged Out!','wave',0,0,0,0,0,false,'pending_verifier','Spawn timers permit premature wave-complete detection; repair before XP'),
('choose-adventure','Choose Your Adventure','ending',0,0,0,0,0,false,'pending_verifier','Reward unique endings using canonical ending id'),
('claws-vs-paws','Claws vs. Paws','level',0,0,0,0,0,false,'pending_verifier','Cats-versus-dogs victories/bosses; needs authenticated battle replay/state checks'),
('coastline-cruiser','Coastline Cruiser','run',0,0,0,0,0,false,'pending_verifier','Endurance milestones; needs server-validated run'),
('community-garden','Community Garden','milestone',0,0,0,0,0,false,'pending_verifier','Grow/harvest milestones with abuse limits'),
('cut-the-cheese','Cut the Cheese','level',200,4,2,25,3,false,'server_timed_existing','Existing dedicated guarded level path; do not double award via catalog'),
('fallen-grid','Fallen Grid','level',30,4,1,18,8,true,'server_timed','Thirty falling-grid sectors; script emits level-clear only after required cleared lines; client completion is not replay validated'),
('ferret-life','Ferret Life','level',2,0,0,0,0,false,'pending_verifier','WIP 2 rooms; require proof of stash goals and progress save'),
('hockey-gear-rush','Hockey Gear Rush','level',5,5,2,15,6,true,'server_timed','Only successful timed target finds count; cleanup recovery does not grant XP; five defined levels'),
('inbox-hero','Inbox Hero','ending',0,0,0,0,0,false,'pending_verifier','Milestones/ending outcomes'),
('lemon-pound-cake','Lemon Pound Cake','ending',0,0,0,0,0,false,'pending_verifier','Single 100% victory; repeatable upgrades not levels'),
('revive-nature','Revive Nature','milestone',0,0,0,0,0,false,'pending_verifier','Restoration and land milestone proofs needed; no discrete numbered levels'),
('rink-putt','Rink Putt','level',10,5,1,15,6,true,'server_timed','Ten goal levels; award at actual goal event, not keyboard next-level cheat; client completion not physics-replay validated'),
('survive-2026','Survive 2026','run',0,0,0,0,0,false,'pending_verifier','Survival milestones; separate assisted runs'),
('whack-a-bug','Whack-a-Bug','round',0,0,0,0,0,false,'pending_verifier','Bound round achievements, avoid raw tap XP'),
('wizards-mana','Wizard’s Mana Forge','milestone',0,0,0,0,0,false,'pending_verifier','Earn mana milestones with integrity checks')
ON CONFLICT (game_id) DO UPDATE SET
display_name=EXCLUDED.display_name,reward_type=EXCLUDED.reward_type,
max_level=EXCLUDED.max_level,base_xp=EXCLUDED.base_xp,step_xp=EXCLUDED.step_xp,
cap_xp=EXCLUDED.cap_xp,min_seconds=EXCLUDED.min_seconds,
enabled=EXCLUDED.enabled,verification_tier=EXCLUDED.verification_tier,
notes=EXCLUDED.notes;
CREATE OR REPLACE FUNCTION public.claim_catalog_level(p_user uuid, p_attempt uuid, p_game text, p_level integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE a public.reward_attempts%ROWTYPE;
 r public.game_xp_rules%ROWTYPE;
 gained integer:=0;
 total bigint;
 game_total bigint;
BEGIN
 IF p_user IS NULL OR p_attempt IS NULL OR p_game IS NULL OR p_level IS NULL THEN
  RAISE EXCEPTION 'Invalid award request';
 END IF;
 SELECT * INTO r FROM public.game_xp_rules
 WHERE game_id=p_game AND enabled=true AND reward_type='level' AND verification_tier='server_timed';
 IF NOT FOUND OR p_level<1 OR p_level>r.max_level THEN
  RAISE EXCEPTION 'Unsupported award';
 END IF;
 SELECT * INTO a FROM public.reward_attempts
 WHERE id=p_attempt AND user_id=p_user AND game_id=p_game
 AND level_number=p_level AND game_version='v1' FOR UPDATE;
 IF NOT FOUND OR a.redeemed_at IS NOT NULL OR a.expires_at<=clock_timestamp()
 OR a.created_at>clock_timestamp()-make_interval(secs=>r.min_seconds) THEN
   RAISE EXCEPTION 'Challenge unavailable';
 END IF;
 UPDATE public.reward_attempts SET redeemed_at=clock_timestamp() WHERE id=p_attempt;
 INSERT INTO public.xp_ledger(user_id,game_id,source_key,source_ref,amount,rule_version)
 VALUES(p_user,p_game,'level-clear:'||p_game,'level-'||lpad(p_level::text,3,'0'),
 least(r.cap_xp,r.base_xp+(p_level-1)*r.step_xp),1)
 ON CONFLICT(user_id,source_key,source_ref) DO NOTHING
 RETURNING amount INTO gained;
 gained:=coalesce(gained,0);
 SELECT coalesce(sum(amount),0) INTO game_total FROM public.xp_ledger WHERE user_id=p_user AND game_id=p_game;
 SELECT coalesce(sum(amount),0) INTO total FROM public.xp_ledger WHERE user_id=p_user;
 RETURN jsonb_build_object('awarded_xp',gained,'game_xp_total',game_total,
  'overall_xp_total',total,'level',p_level,'verification','server-timed-not-replay-verified');
END
$function$

REVOKE ALL ON FUNCTION public.claim_catalog_level(uuid,uuid,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_catalog_level(uuid,uuid,text,integer) TO service_role;
