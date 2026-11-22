-- Applied to production on 2026-11-22: Neon Pong activity and correct Snake finish semantics.
-- Server-only Snake permissions were archived separately in 20261122183000.
ALTER TABLE public.game_activity DROP CONSTRAINT IF EXISTS game_activity_game_id_check;
ALTER TABLE public.game_activity ADD CONSTRAINT game_activity_game_id_check
CHECK(game_id IN ('claws-vs-paws','cut-the-cheese','fallen-grid','revive-nature','rink-putt','hockey-gear-rush','survive-2026','acorn-ascent','bugged-out','coastline-cruiser','lemon-pound-cake','wizards-mana','whack-a-bug','choose-adventure','ferret-life','inbox-hero','community-garden','grass-snake','neon-pong'));
DO $repair$
DECLARE presence_source text; snake_source text;
BEGIN
 SELECT pg_get_functiondef('public.record_game_presence(text,text)'::regprocedure)
 INTO presence_source;
 IF position('''neon-pong''' IN presence_source)=0 THEN
  presence_source:=replace(presence_source,'''grass-snake''','''grass-snake'',''neon-pong''');
  EXECUTE presence_source;
 END IF;
 SELECT pg_get_functiondef('public.claim_snake_checkpoint(uuid,uuid,integer,integer,boolean)'::regprocedure)
 INTO snake_source;
 IF position('completed_runs=completed_runs+CASE WHEN is_first THEN 1 ELSE 0 END' IN snake_source)>0 THEN
  snake_source:=replace(snake_source,'completed_runs=completed_runs+CASE WHEN is_first THEN 1 ELSE 0 END','completed_runs=completed_runs+CASE WHEN p_final THEN 1 ELSE 0 END');
  snake_source:=replace(snake_source,'oldruns+CASE WHEN is_first THEN 1 ELSE 0 END','oldruns+CASE WHEN p_final THEN 1 ELSE 0 END');
  EXECUTE snake_source;
 END IF;
END;
$repair$;
