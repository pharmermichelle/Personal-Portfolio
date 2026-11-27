# Local Supabase baseline

On 2026-11-27, read-only queries against the linked project's migration history and PostgreSQL catalogs recovered the original account foundation, save revisions, privilege hardening, and the Retro Classics, Cornhole and Heads or Tails migrations. The recovered files retain their original versions and names. The two existing migration files with missing SQL terminators now use the recorded definitions. Three pre-existing repository migrations are absent from the remote migration-history list and are retained for local replay. Migration-history parity and schema parity are separate checks.

The catalog inspection confirmed RLS on profiles, game saves, activity, scores, earned badges, the XP ledger and the game XP rules. It also confirmed the current public Classics, coin and Cornhole RPC signatures. No production player rows or authentication data were exported. Never apply or repair the migration history on a linked project without explicit approval.

## Repeat the isolated checks

Use the Supabase CLI and Docker from a dedicated checkout without a linked remote or seed data. Initialize a local configuration with `supabase init` if needed. Use the default API port 54321, local email signup with confirmation disabled, and no external OAuth providers. Start the local stack with `supabase start`. Obtain its local anonymous key from `supabase status` without committing or posting it.

```sh
RETRO_LOCAL_SUPABASE_ANON_KEY='<local anon JWT>' node tests/supabase/local-integration.test.cjs
```

The test only accepts `http://127.0.0.1:54321`. It creates two synthetic accounts, signs in twice as one account, verifies token refresh, confirms save ownership and revision conflict behavior, and submits concurrent Classics and Heads or Tails completion requests. Verify ledger row counts and amounts even when an RPC returns the original award on a duplicate request.

The managed environment ran out of disk space while extracting the full Supabase PostgreSQL image. Verification instead used PostgreSQL 17 Alpine, real GoTrue v2.198.0 and PostgREST v16.6 on a private Docker network with a loopback gateway. All 28 checked-in migration files replayed in order. The small stack supplies the platform auth roles and identity function locally. Hosted infrastructure, production OAuth and email delivery need separate verification.
