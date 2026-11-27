ALTER TABLE public.game_saves ADD COLUMN IF NOT EXISTS revision bigint NOT NULL DEFAULT 0;
CREATE OR REPLACE FUNCTION public.retro_game_saves_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS retro_game_saves_touch_updated_at ON public.game_saves;
CREATE TRIGGER retro_game_saves_touch_updated_at
BEFORE INSERT OR UPDATE ON public.game_saves
FOR EACH ROW EXECUTE FUNCTION public.retro_game_saves_touch_updated_at();
REVOKE ALL ON FUNCTION public.retro_game_saves_touch_updated_at() FROM PUBLIC, anon, authenticated;
COMMENT ON COLUMN public.game_saves.revision IS 'Optimistic concurrency token. Clients must match the last read revision for updates.';
