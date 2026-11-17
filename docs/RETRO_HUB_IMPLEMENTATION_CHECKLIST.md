# Retro Games Hub — Active Engineering Checklist

Updated: 2026-11-17. Owner-approved development. Feature branch: `feature/retro-hub-phase1-accounts-20261117`.

## Status definitions
- VERIFIED: confirmed against GitHub or connected Supabase; not a full browser E2E.
- IMPLEMENTED: code committed or migration applied.
- TESTED: specific executed test and result recorded.
- BLOCKED: owner/dashboard/extra environment action is necessary.
- PLANNED: not implemented.

## Production baseline verified
- Hosting: GitHub Pages, `michellew.io/retro-game-hub.html`.
- Repository: `pharmermichelle/Personal-Portfolio` on `main`; original Hub blob `93e1463f6e9291e57899e18af7fba539266ed121`.
- Supabase project ref: `dxemotgroklcjsbunspg`; display name `Shark Tooth DB`; status active/healthy.
- Five existing RLS-protected tables: `profiles`, `game_saves`, `badge_catalog`, `earned_badges`, `game_scores`.
- Two preexisting foundation migrations: `20261117161255`, `20261117161311`; one existing profile row. Never delete existing player data.
- Auth user insert trigger: `private.create_player_profile()`; profile user name is case-insensitive unique; `is_public` defaults false.
- Supabase Edge Functions: 0.
- Security Advisor warning: leaked-password protection disabled.
- Existing Hub: 13 games; portfolio has 4 additional confirmed paths. Original sign-up used `data.user` instead of an actual session.

## Phase 0 — safety & audit
- [x] VERIFIED: uploaded handoff extracted; master prompt, baseline, architecture, auth/saves, security, plan, SQL notes and game registry reviewed; proposed migrations identified as NOT applied.
- [x] VERIFIED: repo permissions, existing Hub code, four project links, Supabase tables, policies, triggers, migrations, grants, keys, advisor and functions checked.
- [x] IMPLEMENTED: isolated GitHub preview branch; no push/merge to `main`.
- [x] VERIFIED: no new Supabase project, no account deletions, no cloud-save writes.
- [ ] BLOCKED: GitHub Pages is built from `main`; branch needs an isolated preview deployment or local browser test environment before release.
- [ ] BLOCKED: verify Supabase Auth Site URL/redirect allowlist, confirmations, auth mail templates, sender limits, SMTP/CAPTCHA, leaked-password protection via dashboard.
- [ ] PLANNED: age/privacy/terms/marketing policy and production data-retention decisions.

## Phase 1 — account and player profile
- [x] IMPLEMENTED: `retro-hub-platform.js`: shared, browser-compatible Supabase v2 client, persistent session, publishable key only (no server keys).
- [x] IMPLEMENTED: `retro-hub-account.js` and CSS: accessible, responsive modal, signup, login, password visibility, email confirmation state, resend, reset link, password update and log-out.
- [x] IMPLEMENTED: session-authoritative signup state; signing up without a confirmed session no longer falsely says logged in.
- [x] IMPLEMENTED: private player profile editing; case-insensitive uniqueness enforced in DB; four starter avatar keys; own-record JSON export.
- [x] IMPLEMENTED: Hub links to 17 entries, including four verified missing games. Original gallery filters, CSS background, ad unit, URLs and games unchanged.
- [x] TESTED: JavaScript parse checks: platform and account files PASS; Hub inline scripts PASS.
- [x] TESTED: static HTML/account control ID matching PASS; expected 17 game cards; all four new destination files verified in GitHub.
- [ ] BLOCKED: full sign-up, email delivery, password recovery, two-account RLS with real sessions, Android and desktop browser E2E. Do NOT mark launch-ready before testing.
- [ ] PLANNED: profile settings for public visibility (keep private until leaderboard privacy model exists), account deletion verified request workflow, complete data export, shared auth navigation in each individual game, cloud-save adapter with explicit guest/import conflict UI.
- [ ] PLANNED: terms/privacy agreement and age gate before opening general public registration.

## Security milestone (production database)
- [x] IMPLEMENTED: additive, non-destructive hardening migration `20261117183623_retro_hub_phase1_client_privilege_hardening` applied to existing Supabase DB; exact SQL recorded under `supabase/migrations/`.
- [x] TESTED: re-query of client role privileges confirms no TRUNCATE/TRIGGER/REFERENCES grants on the five existing tables.
- [x] TESTED: simulated authenticated role without JWT cannot read `profiles` (0 visible rows); anonymous role cannot SELECT profiles (permission denied, expected).
- [x] TESTED: Security Advisor rerun, no new findings; remaining leaked-password-protection warning still present.
- [ ] PLANNED: two real JWT cross-account tests; auth, RLS, performance and data-deletion adversarial QA.

## Phase 2 — trusted gameplay backend
- [ ] PLANNED: review and adapt proposed SQL 01–03 in isolated test environment; no blind production application.
- [ ] PLANNED: trusted session start/heartbeat/complete, event idempotency, server XP ledger and badges.
- [ ] PLANNED: active playtime checks, hide/idle exclusions, rate limits, replay protection.

## Phase 3 — pilot game adapters
- [ ] PLANNED: Claws vs. Paws, Acorn Ascent, Revive Nature; guest import, cloud conflict UI, verified milestone rules.

## Phase 4 — collection, social, rankings
- [ ] PLANNED: cosmetic entitlements, earned/referral avatar, friends, opt-in sanitized leaderboards, score proof and moderation.

## Phase 5 — admin CRM and email
- [ ] PLANNED: privileged admin console; separate transactional/marketing consent, queued sending, unsubscribe, suppressions, bounce processing, operator audit. No campaigns to be sent without owner approval.

## Phase 6 — launch readiness
- [ ] PLANNED: integrate all game adapters; test 320/360px mobile layouts, accessibility, ad slots, performance, privacy/terms, backup/rollback, incident response and release feature flags.

## Known limitations and decisions
- Client-side localStorage saves are not cloud-synced by this Phase 1 work. None were read, renamed or cleared. Browser scores are unverified.
- Starter avatars only; this is not yet a secure cosmetics inventory.
- The download button exports four user-owned public tables, not Auth internals or future CRM data. Do not represent it as a complete legal data export.
- Sign-up redirects to the current Hub URL; that URL must be allowlisted in Supabase Auth before confirmation/reset email links are expected to work.
- No live player communications, changes to ads, server-based rewards or public rankings have been enabled.
- The migration affects current production client privileges, but existing application read/write operations remain granted.

## Rollback and release steps
1. Never delete or overwrite existing saves or accounts to roll back frontend.
2. Branch preview: compare feature branch with `main`, run browser E2E, check Supabase Auth redirect and advisor.
3. Any broken UI: revert the frontend merge/commit; preserve database.
4. Migration change is a privilege reduction; leave safe reduction in place unless a narrowly justified and reviewed application need arises.
5. Only after tests: merge approved PR to `main` and verify production HTTP, sign-up and gameplay.
