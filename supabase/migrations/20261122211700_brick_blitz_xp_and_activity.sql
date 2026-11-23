-- Already applied to production on Nov 22, 2026.
INSERT INTO public.game_xp_rules
(game_id,display_name,reward_type,max_level,base_xp,step_xp,cap_xp,min_seconds,enabled,verification_tier,notes)
VALUES ('brick-blitz','Brick Blitz','level',12,3,1,12,12,true,'server_timed','First clear of each of 12 levels earns 3-12 XP. Server-timed, idempotent, not physics verified.')
ON CONFLICT(game_id) DO UPDATE SET
display_name=excluded.display_name,reward_type=excluded.reward_type,max_level=excluded.max_level,base_xp=excluded.base_xp,step_xp=excluded.step_xp,cap_xp=excluded.cap_xp,min_seconds=excluded.min_seconds,enabled=excluded.enabled,verification_tier=excluded.verification_tier,notes=excluded.notes;
ALTER TABLE public.game_activity DROP CONSTRAINT IF EXISTS game_activity_game_id_check;
ALTER TABLE public.game_activity ADD CONSTRAINT game_activity_game_id_check CHECK (game_id IN ('claws-vs-paws','cut-the-cheese','fallen-grid','revive-nature','rink-putt','hockey-gear-rush','survive-2026','acorn-ascent','bugged-out','coastline-cruiser','lemon-pound-cake','wizards-mana','whack-a-bug','choose-adventure','ferret-life','inbox-hero','community-garden','grass-snake','neon-pong','brick-blitz'));
DO $body$
DECLARE source text;
BEGIN
 SELECT pg_get_functiondef('public.record_game_presence(text,text)'::regprocedure) INTO source;
 IF position('''brick-blitz''' IN source)=0 THEN
  IF position('''neon-pong''' IN source)=0 THEN RAISE EXCEPTION 'Unexpected activity allowlist'; END IF;
  source:=replace(source,'''neon-pong''','''neon-pong'',''brick-blitz''');
  EXECUTE source;
 END IF;
END;$body$;