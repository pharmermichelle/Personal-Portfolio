-- Phase 1 privilege hardening (non-destructive).
-- Row Level Security controls SELECT/INSERT/UPDATE/DELETE rows,
-- but does NOT protect TRUNCATE. Browser roles should never have it.
-- No game saves, accounts, scores, or other data are modified.
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE
  public.profiles,
  public.game_saves,
  public.badge_catalog,
  public.earned_badges,
  public.game_scores
FROM anon, authenticated;
