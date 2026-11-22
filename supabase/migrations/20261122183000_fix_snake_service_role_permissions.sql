-- Applied to production on 2026-11-22. Snake start returned 503 because
-- service_role lacked SELECT on snake_run_records. Preserve account-only read
-- policy for authenticated clients; grant privileged Edge reward service only.
GRANT SELECT, INSERT, UPDATE ON TABLE public.snake_run_records TO service_role;
