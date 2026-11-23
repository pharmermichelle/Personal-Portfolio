# Retro Game Hub — Sprint A engineering continuation

**Date:** November 22, 2026 EST (November 23 UTC commit timestamps).  
**Environment:** production `main`, `pharmermichelle/Personal-Portfolio`; existing Supabase project `dxemotgroklcjsbunspg`.  
**Scope:** restricted legacy telemetry RPC, hardened Grass Snake XP accounting, fixed two observable XP-status/start reliability issues.

## Released work and evidence

### SEC-02 — Reduce legacy authenticated RPC exposure — VERIFIED BACKEND
- Audited production function definitions, game header calls, function privileges and RLS. The header uses `public.record_game_presence(game_id, mode)`; no contemporary game code references the old `record_game_heartbeat` RPC.
- Revoked authenticated execution of old `public.record_game_heartbeat(text)`. The active `record_game_presence(text,text)` remains executable for signed-in accounts, with `auth.uid()`, game allowlist and bounded timing. Presence is **not XP**.
- Security advisor went from **two** authenticated-executable SECURITY DEFINER warnings to **one** (intentional active presence). Two RLS private internal tables without client policies are intentionally restricted.
- Owner dashboard task **still open**: leaked-password detection (Supabase Auth settings / plan), OAuth providers and previously exposed Google OAuth secret rotation.

### XP-01 — Grass Snake interrupted-first-run guard — VERIFIED BACKEND, gameplay UNVERIFIED
- Production `claim_snake_checkpoint` previously considered `initial_runs=0` sufficient for introductory 10-second XP on every attempt. After an interrupted first attempt, `completed_runs` can remain zero despite a checkpoint recording a personal best, enabling repeat introductory awards on subsequent runs.
- Changed threshold to `initial_runs=0 AND initial_best=0`. Subsequent attempts after any positive banked personal best require >=60 seconds and new 10-second personal best milestones. The existing `p_final` completed-runs fix remains intact.
- Ledger is append-only/idempotent; no existing player grants were removed. Read-back checked exact production SQL and function privilege changes.
- Source migration file matches the **actual Supabase migration ledger** version: `20261123030613_retire_legacy_presence_and_snake_attempt_threshold.sql` (not a stale guessed timestamp). No replay of any historical SQL.
- Snake frontend now waits up to 2.5 seconds for shared auth initialization on rapid first taps rather than immediately treating a loading auth client as guest-only.

### XP-02 — Brick Blitz XP truthfulness — VERIFIED REPO; gameplay UNVERIFIED
- Clear screen now uses the actual `RetroLevelXP.complete` response rather than unconditionally reporting account XP after any resolved promise. Guest, missing attempt and pending/error states show that XP was **not confirmed**. Accepted backend awards still surface through the existing `retro-level-xp` award event.
- Existing first-clear rules and gameplay physics unchanged.

## Commits and deployment
- `d14405abf24669bf098d72316f369225b1615853`: source-backed SQL hardening migration initially committed.
- `048cd58932b980afd52b15ae2d235fa93c64c8a0`: Brick XP-status correction.
- `cdd97af26e6b2cbb3680c42f2ccf902dff834825`: Snake auth readiness.
- `c92b28c0e3b36acddab04016bec1cc017d304858`: migration source file version aligned with live history.
- `f033a53dc0ec7a1e2b01a8e48d5b2645429d32aa`: obsolete/mismatched migration filename deleted.
- **Production Supabase migration:** `20261123030613_retire_legacy_presence_and_snake_attempt_threshold`. Previous migration count: 13; now 14. **Edge Function:** `retro-rewards` v8 unchanged. **20 games** unchanged.

## Automated read-only checks (not substitute for player testing)
- Live old RPC execution for `authenticated` = **false**; current presence RPC = **true**.
- Live Snake source includes strict first-run condition; current completed runs are still counted only on final.
- XP ledger entries: **21** before/after; game save rows **4**, inventory **1**, game scores **0**. Snake and Brick still have **zero ledger entries**.
- XP rules verified: Snake enabled / server_timed / 10s; Brick enabled / server_timed / 12 levels / 3-12 XP / 12s minimum.
- Fetched both modified HTML files from GitHub after commit. V8 JavaScript `new Function` parsed their inline scripts successfully. Static assertions found the new guards and outcome handling.
- Not a mobile rendering, actual JWT/API, end-to-end XP or ad-placement test.

## Current P0/P1 gates (unverified)
- Owner: Google OAuth secret revocation/rotation; Google/Facebook provider enablement, redirects, fresh email confirmation and password reset; enable leaked-password protection if current Supabase plan supports it.
- Engineer/owner with test accounts: genuine 2-user guest/login/log-out JWT test; token revoke/replay; signed-in Snake 40-second checkpoint => 4 XP and subsequent record; Brick first level => 3 XP once; replay not credited.
- QA 20 games, saves, avatar grants, control fit and ads on actual 320–430px phones and desktop.
- No server-verified scoreboards/chat/friends until proofs and consent/moderation policy exist.

## Rollback
- Frontend: reverse commits `cdd97af2` and `048cd589` individually (or restore prior file blobs from commit `7d35f002798600a4f58f8b2bcedf7d42b2df5606`). Do not force-push.
- Backend: if required, restore `EXECUTE` to `authenticated` for `public.record_game_heartbeat(text)` only after investigating old clients; do not enable anonymous execution. Revert Snake threshold using a **new reviewed migration** that preserves the `p_final` fix and all ledger data. Never roll back production migration history by deleting rows.
- Saved progress, existing avatar entitlements and XP ledger need no restoration; they were not modified.

## User-facing summary
The arcade has stricter behind-the-scenes gameplay tracking, more reliable sign-in detection when starting Snake, and more accurate Brick Blitz XP notices. Existing game progress and player rewards are preserved. Final XP testing on a real signed-in device is still required.
