# Retro Game Hub — Sprint B Cloud Saves, Profile Progress & Sharing

**Date:** November 22, 2026 EST (GitHub commit dates may fall on November 23 UTC)  
**Release class:** frontend integration / guarded pilot.  
**Repo:** `pharmermichelle/Personal-Portfolio`, `main`.  
**Existing backend:** Supabase `dxemotgroklcjsbunspg`, **no migration or Edge Function deployment this sprint**.

## What shipped

### SAVE-01 partial — Neon Pong and Brick Blitz cloud save pilots

Both games load the existing `retro-save-service.js` instead of creating new backend logic. New adapters preserve device-only progress for guests and use the existing `game_saves` table, account-scoped RLS, server revisions, pending offline copies, guest import and conflict-selection UI when authenticated. This is **cloud-save code deployed, end-to-end cloud restore not yet player-tested**.

- `minigame/neon-pong/index.html`: persist personal `wins`, `matches`, `bestRally` counts with bounded validation; official Pong XP is separately granted by `retro-rewards`. Live match stops on identity change to avoid mixing records.
- `minigame/brick-blitz/index.html`: persist `unlocked` (1–12) and accumulated `score`; personal score is **not** a verified leaderboard score. Round stops/reset on identity switch. Existing XP first-clear claims remain server-controlled.
- Both show a `Sync Options` control when signed in and a descriptive cloud status. A guest-only device retains its legacy local keys. They do not automatically convert or merge conflicting saves without an explicit choice.
- `retro-player-profile.js`: profile saved-progress column now summarizes Brick unlocked level and Pong local-account wins, matches and best rally as **personal, non-ranked** values.
- Both games deliberately **do not** write to `game_scores` or `xp_ledger`.

### SOCIAL-01 partial — voluntary sharing available through all 20 existing shared game headers

- `retro-arcade-header.js`: `↗ Share` button. Uses platform-native share sheet on supported browsers, otherwise opens a keyboard-accessible explicit-choice panel with Facebook, WhatsApp, Reddit, X, copy link and close.
- Link uses same-origin `location.pathname` only; it strips query and hash to avoid exposing auth or return URLs. No automatic social posting, friend-import permissions, or telemetry XP.
- Mobile navigation arranges 5 controls; 44px minimum share hit area. **Actual 320–430px phone readability remains QA.**
- Source audit found 19 game paths by code search plus `claws-vs-paws` by direct file inspection; 20 current game pages reference the universal header.
- `retro-game-hub.html`: corrected WIP page title, meta description, canonical URL and invalid backslash Open Graph icon URL.
- Added explicit title/description/canonical/Open Graph links for Neon Pong, Grass Snake and Brick Blitz. Uses existing `/images/portfolio-icon.png` as a temporary fallback graphic, not game-specific artwork. **Social scraper preview not tested.**

## Release commits (atomic)

| Commit | File / scope |
|---|---|
| `fb09667061f7741e80e44ac831cfec8becd486eb` | Neon Pong cloud save |
| `98e343a630995a00d94982df210c7327787a1c8c` | Brick Blitz cloud save |
| `c129f9822a3c77f1e180dbb4ab9d7f0a4c93e509` | Profile personal progress descriptions |
| `817c3e67b70b5086d3dbdc3ffc5b2adbae7e54dc` | Universal game header sharing |
| `dee47a63b8a41ba317cc8c6b0e6daa5175c8fe30` | Brick OG/canonical |
| `29f90c581a1d0eed7331b5ae8f00e0fa663fbf0e` | Snake OG/canonical |
| `04175eeebb5cd0100ec3e658c6ff944621eb9ffd` | Pong OG/canonical |
| `13c8cdf0f3fea6493ae36c5a314548053cd7b7bd` | Hub OG/canonical |

## QA evidence / limitations

**VERIFIED REPO:** reread each changed file at latest SHA; all changed inline JavaScript blocks parse via V8 `new Function`. A mocked DOM execution of both games restored sample Pong 3/7 wins and Brick level 5/12 via the new adapters. A mocked click opened the share panel with a clean `https://michellew.io/minigame/brick-blitz/index.html` URL, omitting an injected `?auth=bad` query.

**VERIFIED BACKEND:** Supabase existing 15 public tables, 20 XP rules. Counts unchanged: 21 XP ledger entries, 4 cloud saves, 1 inventory item, 0 game_scores rows. No new database migration; `retro-rewards` v8 unchanged. Existing `game_saves` RLS/read/update/concurrency is relied on, not re-proven in real browsers.

**UNVERIFIED:** Test real login, guest import, correct user isolation, offline retry, simultaneous phone/desktop conflict, fresh page restore, complete match/clear loops, navigation/retry, 320px controls and clickout, social native Share behavior, Facebook/WhatsApp/X/Reddit destinations, SEO scraper OG image and card. The new adapters have **zero known real account save rows** at deployment, so do not label feature fully player tested.

## QA plan

1. Pong guest play 1 match, reload, sign in, choose guest import; confirm `game_saves` record and profile row. Open another device and confirm wins/matches. Change accounts and verify no prior-account scores leak.
2. Brick guest clear L1; reload and sign in, import progress; confirm L2 unlocked/cloud save and profile row. Verify first-clear XP independently from `xp_ledger`. Test restart and second device conflict and offline resume.
3. Share on Android and desktop: native sheet/open fallback, Facebook link, WhatsApp, Reddit, X, copied URL; share while an auth return query exists and ensure URL is stripped. Test keyboard Escape and 320/360/390/430 widths.
4. Meta Sharing Debugger and crawler check: OG image might be too small; replace with professionally designed 1200×630 artwork later. Share page previews are not proven merely by source tags.

## Rollback

Frontend only, no database rollback necessary. Revert individual commits above or restore pre-release SHA `2821f0a981069fd1cddd0309fc1f6d7dcec00ead` for affected files. To isolate a save issue, revert the corresponding game HTML only; its original device key remains intact. To isolate share issues, revert `retro-arcade-header.js` change. No destructive SQL or xp ledger rollback.

## Next task queue

- Finish authenticated cloud save E2E, game XP, screen-reader/mobile QA for Pong, Brick, Snake.
- Add the same save adapter to suitable next games using true per-game persistence (Fallen Grid, Revive Nature, Rink Putt) without inventing progress.
- Confirm shared header mobile fit at narrow viewports; OG cards; add compact hub share/dedicated artwork.
- Continue XP contracts, proof tiers, auth/email provider testing and consent-first social/challenge system.

## Player-facing summary

Neon Pong and Brick Blitz now support optional account cloud backups for personal progress, and their stats can appear on the player profile. Every game has a voluntary Share button, including Facebook and easy copy-link options. Server-issued XP and competitive rankings remain unchanged.
