# Retro Game Hub — Sprint A authorization audit (November 22, 2026 EST)

Status: **VERIFIED BACKEND (read-only simulated role checks); NOT END-TO-END ACCOUNT TESTED**.

- Repository at audit start: `aaf3d740371097d0d9e1d9fd291e5412f09358d0`, branch `main`.
- Existing Supabase project: `dxemotgroklcjsbunspg`, ACTIVE_HEALTHY.
- **No schema changes or player data changes.** Tests used `BEGIN READ ONLY` and `ROLLBACK`; account IDs and other private data are intentionally omitted from this report.

## Checks performed

1. Inspected all `pg_policies`, direct client table grants, and public RPC execute privileges. All 15 public tables have RLS; account-specific policy predicates use `auth.uid()`. The guest role has no SELECT grants on personal profiles, saves, ledger, inventory, or activity. Guest XP rule catalog remains SELECT-readable by design.
2. Read-only simulated `authenticated` role with two **existing** distinct `auth.users` subjects, injecting each subject into the session claims (this is a DB authorization test, *not* possession or verification of those players' actual access tokens):
   - Account context A visible: 1 profile, 3 saves, 11 XP ledger records, 0 inventory items, 5 activity aggregates, 0 badges and 0 scores.
   - Account context B visible: 1 profile, 1 save, 10 XP ledger records, 1 inventory item, 0 activity aggregates, 1 badge and 0 scores.
   - Individual account row counts reconcile to production totals: 2 profiles, 4 saves, 21 ledger grants, 1 inventory item and 5 activity aggregates.
3. Guest simulated `anon` role: `auth.uid()` null, no read privileges to the five private tables above, but 20 XP rules visible. Direct private-profile SELECT correctly failed with PostgreSQL `42501 permission denied`.
4. XP ledger, player inventory, earned badges, and game activity do not have client INSERT/UPDATE privileges. Authenticated players can create only their own *unverified* game score entries via owner-scoped RLS; no verified scoreboard is deployed.
5. `record_game_presence(text,text)` and legacy `record_game_heartbeat(text)` are the only authenticated-executable public SECURITY DEFINER functions. Both enforce `auth.uid()` and game allowlists; only presence supports the newer `start` mode to prevent idle/resume over-counting. **Follow up:** scan old client usage and retire the legacy heartbeat safely when no client calls remain. An advisor warning is therefore not automatically proof of exploitable data exposure.
6. Two private tables (`reward_attempts` and `snake_run_attempt_state`) intentionally have no client-access policies. Keep deny-by-default.
7. Supabase advisor still warns that Auth leaked-password protection is disabled. This is an owner dashboard configuration task; do not pretend it is enabled.
8. Google/Facebook OAuth provider flags, disclosed Google secret revocation, HTTPS redirect and email recovery remain **UNVERIFIED**; they require actual owner/provider dashboard plus fresh mailbox/device checks.

## Not tested / release gate still open

- Real two-browser/two-device JWTs, auth session revocation and refresh, wrong-user mutations, expired-token replay, score attempt spoofing, full browser cache clearing, and account deletion/export.
- Abuse caps for RPC calls and IP-level request limiting. SQL role tests cannot establish real HTTP/JWT gateway configuration.
- External OAuth provider setup and Google secret rotation; do not put credentials in chat/GitHub.
- Snake and Brick Blitz actual XP payout from genuine play.

## Owner-only follow-up

1. Rotate/revoke previously shared Google client secret privately if still pending, then test Google and Facebook in production.
2. In Supabase Auth security settings enable breached-password protection if available on the current plan and appropriate; re-run security advisor.
3. Test actual emails/expired links/redirects, then authorize A/B browser tests with two test accounts.

## Rollback

This audit created a documentation-only file and does not alter Supabase tables, migrations, grants, policies, functions, scores, inventory, saves or XP. Revert only this documentation commit if necessary; do not force-push.

## Sources

- Direct PostgreSQL read-only queries: `pg_policies`, `information_schema.role_table_grants`, `pg_proc`, `has_table_privilege`, and role-scoped SELECT counts.
- Live Supabase security advisor at audit time.
- Historical handoff: `RETRO_GAME_HUB_HANDOFF_2026-11-22.md` and `reference/SPRINT_A_INITIAL_RELEASE_2026-11-22.md` from owner-supplied updated package.
