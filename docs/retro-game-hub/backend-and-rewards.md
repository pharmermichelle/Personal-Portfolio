# Backend, XP, and security

Baseline reviewed: `main` at `f804a0a6` (November 26, 2026). Status here is based on repository source and migration history. The November 22 [RLS audit](SPRINT_A_RLS_AUDIT_2026-11-22.md) and November 23 [release notes](RELEASE_2026-11-23_MOBILE_WARDROBE_THANKSGIVING_LEADERBOARDS.md) record earlier live checks. Treat those as dated evidence. Current live schema, account behavior, data, and deployment were outside this audit.

## Account data and feature status

| Area | Repository evidence | Status and next verification |
| --- | --- | --- |
| Authentication | The hub, game header, and profile use Supabase Auth. The GH-7 commits `98a6357a`, `7dec0275`, and `cf9b25e9` add persistent browser sessions and restoration handling. | Implemented. Test refresh, navigation, expired tokens, sign-out and account switching with disposable users. Provider flags, email delivery, and mobile OAuth redirects require environment-specific testing. |
| Profiles and account stats | Profile reads owner-filtered activity, saves, ledger XP, and verified score rows. It discards stale stats requests and renders partial results on query errors. | Partial. Score and rank coverage are incomplete. Browser-side ledger sums use unpaginated selects, which can undercount at the configured API row cap. Move aggregation behind an owner-scoped endpoint after verifying the backend baseline. |
| Game saves | [Save service](../../retro-save-service.js) has versioned payloads, separate guest and account storage, a pending offline copy, revision-conditional updates, and explicit import/conflict choices. Adapters are checked in for Acorn Ascent, Cut the Cheese, Claws vs. Paws, Neon Pong, and Brick Blitz. Cornhole has a separate guest save and account replay via `cornhole_resume`. | Partial. Test reload, offline recovery, cloud restore on another device, and account isolation. Review save operations that continue after a fetch for an earlier account. A failed cloud read during conflict recovery currently falls back to the same value as an absent row. Preserve both versions until a successful read confirms the cloud state. |
| Time and visits | Shared game header sends focus/visibility-aware presence. The latest checked-in presence migration bounds heartbeat credit and resets the cursor on resume. Its 20-game allowlist predates the 14 Classic IDs now in the client allowlist. | Estimated focused-page time. Classics presence has a source/schema mismatch. Verify the current RPC before relying on Classic time or enabling related standings. |
| Leaderboards | [Leaderboard UI](../../retro-leaderboards.js) reads the opt-in preferences and calls `arcade_leaderboard`. Checked-in SQL returns an alias and bounded metrics for overall/per-game XP and time, per-game eligible level, and Snake survival. It labels timing-based proof. | Partial. Treat standings as metric-specific. Full verified score competition and game-specific coverage are unverified. Test opt-out and anonymous visibility, and check the query plan on representative staging data. |
| Avatars and cosmetics | Avatar UI, inventory and equipped cosmetics, owner-scoped equip policies, and server-triggered wardrobe grants are checked in. | Implemented for listed rewards. Test ownership, slot compatibility, reload, and rendering on another device. |

The checked-in migrations are incremental and reference existing tables such as `profiles`, `game_saves`, and `earned_badges` without a reproducible base schema. The Classic reward RPCs also lack checked-in definitions. The archived Cut the Cheese and catalog claim migrations omit a statement terminator before their privilege statements. Validate migration replay on a disposable database once the baseline is recovered. Recover the authoritative schema and function definitions into a reviewed, sanitized development baseline before running local integration tests or proposing reward migrations.

The onboarding branch adds account-epoch guards to the five pilot games and makes Sync Options preserve pending saves when the cloud read fails. Local regression checks cover those cases. Cross-device staging checks remain pending.

## XP and reward rules

The server ledger is the source for account XP. Client storage, cloud-save payloads, elapsed browser time, and displayed scores grant no account XP. The checked-in ledger enforces positive bounded amounts and uniqueness on `(user_id, source_key, source_ref)`. Existing claim SQL locks attempt or record rows where appropriate and uses conflict-safe ledger inserts. Preserve source identifiers and rule versions when fixing old grants or adding new game modes.

| Game or group | Current rule visible in source | Evidence |
| --- | --- | --- |
| Acorn Ascent | First clear of levels 1–10 grants twice the level number. All ten unlock the completion badge and shirt. | Edge Function replay verifier and dedicated claim SQL. |
| Cut the Cheese | First clear grants `min(25, 4 + 2 × level)` after a 3-second server gate. | Dedicated claim SQL. |
| Fallen Grid | First clear through level 30. Starts at 4 XP, increases by 1 per level, caps at 18 XP, with an 8-second minimum. | Catalog and timed claim SQL. |
| Rink Putt | First clear through level 10. Starts at 5 XP, increases by 1 per level, caps at 15 XP, with a 6-second minimum. | Catalog and timed claim SQL. |
| Hockey Gear Rush | First clear through room 15. Starts at 5 XP, increases by 2 per room, caps at 15 XP, with a 6-second minimum. Cosmetics are gated to rooms 5, 10, and 15. | Catalog migrations and wardrobe trigger. |
| Brick Blitz | First clear through level 12. Starts at 3 XP, increases by 1 per level, caps at 12 XP, with a 12-second minimum. | Catalog and timed claim SQL. |
| Grass Snake | First attempt can earn milestones from 10 seconds. Later attempts must reach at least 60 seconds and exceed the account best in 10-second steps. Each new eligible step grants 1 XP. | Checkpoint SQL, row locks, unique lifetime milestones. This rule uses the lifetime record. |
| Neon Pong | Completed matches grant +1 at three points, +1 at five points, +3 for a win, and +1 for improving the lifetime rally best. One grant per eligible event per attempt. | Match claim SQL (timed). |
| Heads or Tails | Client promises 2 XP for the first complete 10-flip game per UTC day and 1 XP per point above the daily best on later games. Account flips and completion go through `retro_coin_daily_xp`. | Client contract only. Server sequencing, day rollover, reward persistence, and concurrent claims require verification. |
| Backyard Cornhole | Client uses server-reported point and placement XP, match eligibility for the UTC day, and wearable unlocks. | Client contract only. Recover the Cornhole start/throw/resume RPC definitions to verify stage dedupe, replays, resume, and exact amounts. |
| Other 12 Classics | Client promises 2 XP for the first completion each UTC day after the minimum play time. Score does not change the completion payout. | Client contract only for `retro_classic_daily_xp`. |
| Remaining catalog games | Disabled or pending verifier in checked-in catalog. | No active reward verifier established by this audit. |

Overall account level is `floor(sqrt(total_xp / 50)) + 1`. Inventory shirts are granted from ledger-derived levels 2–50. The seasonal presence path has its own event rules and should remain independent of XP.

For daily personal-best rewards, compute the award in a transaction from the server-attested result and the previously rewarded milestone for the authenticated player, game, and server-defined UTC day. Use a locked daily record (or an equivalent atomic operation) and stable unique ledger keys. Update the recorded milestone and ledger together. A tied or lower result awards zero improvement XP. A separate first-completion grant applies only where the game already defines it. Stage tests should cover first, tied, lower, and higher results, duplicate submissions, simultaneous completions in either order, retry after a lost response, refresh, wrong account, and midnight rollover.

## Security standards and release checks

- Use a publishable or legacy anonymous key in the browser, and keep privileged keys only in managed server secrets. Never log tokens, credentials, or personal data.
- Enforce ownership with RLS and explicit role grants on every private browser-facing table. Verify anonymous access and two-account isolation on a disposable backend. Include both read checks and mutation checks.
- Derive identity server-side from authenticated context. Keep reward writes in narrow server-controlled operations. Review RPC privileges, fixed search paths, input bounds, and transaction behavior. Use explicitly scoped caller permissions and minimal output for public metrics.
- Preserve player data, ledger entries, saves, and existing configuration. Test additive schema changes against representative sanitized staging data. Production data changes and migrations require explicit owner approval.
- Recover the missing baseline first. Then verify auth redirects and recovery, save revision conflicts, reward dedupe, public opt-in behavior, and query plans. Use [historical cloud-save QA notes](SPRINT_B_CLOUD_SAVES_SHARING_2026-11-22.md) for the original pilot scenarios.
