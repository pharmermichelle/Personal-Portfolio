# Retro Game Hub — Mobile fixes, collection wardrobe, Thanksgiving and consent-first leaderboards
**Date:** November 23, 2026 (America/New_York)  
**Environment:** GitHub `pharmermichelle/Personal-Portfolio`, branch `main`; existing Supabase `dxemotgroklcjsbunspg`.  
**Previous reviewed SHA:** `aacf1aed8a86f6abadbf9f9906f652e1125c49d1`.  
**Status:** VERIFIED REPO / VERIFIED BACKEND; mobile PLAYER TESTED not yet established.

## Shipped work

| Priority | Component | Evidence status | Outcome |
|---|---|---|---|
| P0 | Hockey Gear Rush art | VERIFIED REPO | Removed white opaque CSS behind every hockey sprite; equipment uses a clear image layer over the same red tile shell as junk. |
| P0 | Fallen Grid mobile size | VERIFIED REPO | Increased board to up to 330px wide on portrait phones (306px on narrower widths), retains 1:2 ratio, allows vertical page overflow rather than shrinking game under nav. Refreshed stylesheet cache. |
| P1 | Gear Rush milestone rewards | VERIFIED BACKEND | Just Rooms 5/10/15 active as cosmetic milestones. All 15 existing server-timed XP room rules continue unchanged. Retired other 12 cosmetics from future awards without deleting previously earned items. |
| P1 | Player-level shirts | VERIFIED BACKEND | New Level 2–50 shirts (49 designs). Server-side XP ledger trigger grants eligible account-level entitlements and backfills already reached thresholds. Starter Level 1 remains default; Level 2 shirt is equipable at 50 XP. No client-supplied XP or local level can grant clothing. |
| P1 | Reward categories | VERIFIED REPO | Wardrobe has collapsible Player Levels, Game-Specific, Special Events groups, plus owned/equip states and progressive level shirt browsing. Previously earned Acorn/Cheese rewards remain available. Retired-but-owned Gear Rush legacy cosmetics remain displayed. |
| P1 | Thanksgiving 2026 | VERIFIED BACKEND | Participation frame on first qualifying server heartbeat **Nov 26 ET**. Turkey hat after 1800 seconds of eligible cross-game estimated visible activity that day. Auth required; 12–30-second bounded increments; overlapping tabs globally coalesced; client has no write privileges or direct helper execution. Date/time based on America/New_York. |
| P1 | Leaderboards | VERIFIED BACKEND + REPO | Opt-in public ranking preferences, no default exposure. New page: total/game XP, total/game estimated playtime, highest first-clear level for supported games, longest server-timed Grass Snake run. All ranked values have proof-tier labels. No fake competitive speedruns/client-attested scores. Main Hub and profile link to rankings. |

## Database migrations deployed and source committed
- `20261123181825_arcade_level_shirts_and_gear_milestone_rewards`
- `20261123182042_thanksgiving_2026_cross_game_presence_rewards`
- `20261123182150_consent_first_arcade_leaderboards`
- `20261123182952_arcade_leaderboard_null_limit_guard`

All are migrations in the existing production Supabase project. No new Supabase project, no schema reset, and no manual rewriting of historical migrations. The 12 retired Gear Rush cosmetics were marked inactive (not deleted) to preserve existing inventories. Thanksgiving activity cannot be written by authenticated/anonymous clients; global presence helper is not client-executable.

## Files affected

**Gear Rush / Fallen Grid**
- `minigame/hockey-gear-rush/gear-rush.css`
- `minigame/hockey-gear-rush/index.html`
- `minigame/hockey-gear-rush/gear-rush.js` (accurate 3-milestone messaging)
- `minigame/Tide-Tetris/style.css`
- `minigame/Tide-Tetris/index.html`

**Wardrobe / hub / arcade**
- `retro-gear-wearables.js`
- `retro-player-profile.html`, `retro-player-profile.js`, `retro-player-profile.css`
- `retro-arcade-header.js`, `retro-game-hub.html`, `arcade-floor.html`

**Leaderboards**
- `retro-leaderboards.html`, `retro-leaderboards.css`, `retro-leaderboards.js`
- Four exact SQL source migration files above.

## Verified testing evidence

- Live catalog: 3 active Gear Rush cosmetics, 49 level shirts, 2 Thanksgiving cosmetics.
- Production XP ledger count observed at final review: 34; inventory: 3. Counts can increase independently while players play. Existing XP data was **not overwritten** by these migrations.
- Leaderboard defaults: zero opted-in public profiles and an empty public results array. Simulated `anon` role can invoke the opted-in read-only endpoint but cannot create rankings.
- PostgreSQL grants: authenticated users have **no** INSERT on `thanksgiving_2026_activity`, and cannot EXECUTE the Thanksgiving credit helper. User-specific visibility is RLS-protected.
- All edited inline and external JS passed V8 parse tests (13 source pages/scripts). CSS rule braces checked. Profile JS-referenced IDs exist in the updated profile HTML. The wardrobe HTML section passed tag nesting checks.
- Cosmetic module produced 66 items: 15 Gear Rush definitions (3 active), 49 level shirts, 2 events; all supplied SVG apparel art. Mocked layered outfit drawing combines Level 2 shirt, turkey hat, milestone pants and Thanksgiving frame.
- Read-back verified the actual production RPC and the new 50-row leaderboard cap.
- Mocked leaderboard browser initialization: authenticated account begins opt-out, can opt in and render a populated ranking row; user-facing status changes accordingly. Actual browser/API login is still unverified.
- Security advisor flags the intentionally callable, opt-in-only public leaderboard `SECURITY DEFINER` RPC. Its server-side whitelist, row cap and opt-in filter were reviewed; do not broaden returned columns without a new security review. The older, deliberately protected private RLS tables and disabled leaked-password protection remain known warnings.

## IMPORTANT unverified / release gates

- **PLAYER TESTED pending:** Actual 320/360/390/430px mobile screenshots, click/tap, board physical visibility, CSS cache behavior, game ads, level shirt equip/removal, multi-page avatar update, opt-in/out lifecycle with two accounts, actual sign-in recovery.
- Thanksgiving happens in the future: an actual Nov 26 signed-in visible game session, 30-minute cross-game participation, idempotent reward grant and simultaneous-tab caps have not yet been live-tested.
- Gameplay presence is server-timed **estimate**, not proof of physical gameplay; not suitable for cash-equivalent rewards or unassisted competition.
- Per-game speedrun/quickest-time and high-score public rankings remain BLOCKED until trusted proof capture and validation exist. Client-submitted `game_scores` are not treated as verified.
- Email/Google/Facebook OAuth validation, previously disclosed Google secret rotation, and Supabase password security settings remain distinct Sprint A owner-facing gates.

## QA checklist

1. On phone reload Gear Rush: clear image background on all hockey objects including the net, red tiles consistent with junk, no sideways scroll.
2. Fallen Grid: board is visibly wider, controls remain tappable, no horizontal scroll, and vertical scrolling is allowed if required.
3. Profile: expand/collapse all 3 wardrobe sections; as a Level 2 player, Level 2 shirt should appear owned and Wear should swap the default look. Acorn and Cheese preexisting equips must still work.
4. Gear Rush: first eligible Rush clears at Rooms 5/10/15 may award a milestone cosmetic once only. Other rooms still award permitted first-clear XP but do not grant cosmetics.
5. Event Nov 26, ET: sign in, play and observe frame, then continue/switch games to collect an estimated 30 total eligible minutes. No credits from a signed-out tab, hidden page or unattended long gaps.
6. Leaderboards: default opt-out hides name, toggle on lists qualifying records, off hides immediately; try overall vs game-specific XP/time, level and Snake; test guest read and small-screen tables.
7. Check server RLS isolation under two real test accounts and no client access to cosmetic grants.

## Rollback

For frontend problems, revert the specific commits or restore pre-change blobs of affected page/script/style via a **new atomic commit**; no force push. For backend problems, use a **new reviewed reversible migration** to disable any affected trigger/function or make catalog records inactive; do not delete historical migration rows, truncate XP, or wipe earned inventory. A Thanksgiving safety stop can revoke use of the helper inside `record_game_presence` while leaving normal account time tracking working. Public leaderboard can be made unavailable by revoking `EXECUTE` on `arcade_leaderboard` temporarily without changing XP data. Preserve all player saves and account history.

## Player-facing summary

Gear Rush's gear artwork now blends into the messy locker-room tiles, and Fallen Grid's board is larger on phones. The wardrobe has three tidy collections: new shirts at each player level, three Gear Rush milestone prizes and limited Thanksgiving cosmetics. An optional leaderboard lets players compare earned XP, estimated game time and supported milestones without exposing accounts by default.
