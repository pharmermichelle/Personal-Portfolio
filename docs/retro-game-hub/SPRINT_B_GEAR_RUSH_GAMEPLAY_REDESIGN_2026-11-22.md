# Sprint B — Hockey Gear Rush gameplay redesign

**Release date:** November 22, 2026 ET (GitHub timestamps may be November 23 UTC)  
**Source:** \`pharmermichelle/Personal-Portfolio\`, \`main\`.  
**Backend:** existing Supabase \`dxemotgroklcjsbunspg\`; NO schema migrations, table writes, Edge Function changes or production XP resets.

## Gameplay changes — VERIFIED REPO, not yet PLAYER TESTED

- Retired the cluttered red-and-white single-file UI and replaced it with a coherent navy/ice locker-room arcade layout using a dedicated stylesheet and gameplay module.
- Reused all 10 existing licensed-in-repository hockey gear sprites without replacing the art pipeline.
- Added three opt-in modes:
  - **Rush:** timed rounds, 1–3 personal stars, first-five-level account XP eligibility if unassisted, first-clear and server-timer requirements pass.
  - **Relaxed:** no deadline or XP; room progress and 1-star personal completion.
  - **Cleanup:** optional tidy-up mini-round; no account XP or competitive benefit.
- Fifteen increasingly intricate rooms in three visual chapters (Rookie Locker, Team Bench, Away Locker), using 4–8 visible gear targets, controlled clutter counts and partitioned cells. Targets have individual nonoverlapping positions; the game never hides an essential item underneath an opaque layer of decoys. Current code's optional dragging makes exploring possible without blocking a basic tap-to-collect control.
- Added locker target checklist, best time per room, personal stars, 10-piece equipment collection, prior unlocked room navigation, and device-local progress (namespaced \`retro:gear-rush:locker-progress:v2\`). This is deliberately not a Supabase cloud save or verified leaderboard.
- Added start / pause / resume / restart / win result screens, optional cleanup after a slow finish, safer visibility/blur pausing, and responsive 44–52px interactive pieces (minimum 44px).
- Added one free Spotlight per round. **Spotlight-assisted Rush never submits XP.** No rewarded ads are configured; no promised ad benefit is displayed.
- AdSense: retained a single existing compact display slot, after game content with a generous gap from rapid tapping controls, never inside or over the board. App-created interstitial or forced ads: **none**.
- Accessibility: semantic game controls, accessible button names, button focus cues, reduced-motion CSS, pause/result dialogs and initial focus, no compulsory scroll between retries. Requires real screen-reader and narrow-device QA.

## Gameplay integrity and XP

The existing server-owned XP rule remains enabled for \`hockey-gear-rush\` with level cap **5**, base **5 XP**, increment **2 XP**, cap **15**, and minimum **6 seconds**. Only the existing \`RetroLevelXP.begin/complete\` interface was reused. The client checks:
- mode is Rush
- Spotlight was not used
- level 1–5
- measured foreground gameplay >=6 seconds
- actual completion occurred

The server still owns identity, timer acceptance, duplicate claims, and actual ledger awards. A passing local timer does **not** prove physical gameplay/score integrity. Game stars, collections and best times are user-local and are not public rankings.

## Changed files

- \`minigame/hockey-gear-rush/index.html\` — responsive semantic game shell, shared header and XP scripts, one ad, metadata.
- \`minigame/hockey-gear-rush/gear-rush.css\` — new cohesive visual design and responsive sizes.
- \`minigame/hockey-gear-rush/gear-rush.js\` — new gameplay state machine, fair board layout, pause/resume, progression, stats, XP opt-in gating and accessibility.

## Engineering checks

- New JS parses with V8 \`new Function\` after each meaningful change.
- Mock DOM flow passed: timed 8s clean clear invokes existing begin/complete; <6s timed clear does not invoke complete; 45s late clear offers bonus cleanup; assisted Rush does not invoke complete; Relaxed/Cleanup do not invoke XP; Cleanup increments device-only cleanups without unlocking a campaign level; overlay remains mounted during object redraw; pause/resume retains state.
- Reread HTML, CSS, JS in GitHub. Every JS-referenced DOM ID exists in HTML. All 10 referenced equipment assets were checked present in repo. Only one AdSense slot. CSS rule braces balanced. Responsive rules for <=760 and <=350 screens.
- No screenshots were compared and no real device/web-browser or real account XP outcome was tested; DO NOT label mobile or full reward behavior as verified.

## Prioritized backlog changes

| Priority | Game | Status | Next release gate |
|---|---|---|---|
| P0 | Hockey Gear Rush gameplay | **VERIFIED REPO**; mobile/player QA pending | Phone 320/360/390/430px, desktop, pointer drag, pause/background, long session |
| P0 | Hockey Gear Rush XP | **VERIFIED REPO integration / VERIFIED BACKEND rules**, not PLAYER TESTED | Signed-in first clear, second clear dedupe, guest no XP, low-6s thresholds |
| P1 | Hockey Gear Rush cloud save | **NOT DONE** | Add adapter after local progress logic proves stable |
| P1 | Hockey Gear Rush rewarded Spotlight | **PROPOSED ONLY** | Confirm Google Ad Manager consent, demand, eligibility, reward verification, opt-in only |
| P1 | Hockey Gear Rush high-retention challenge | **PROPOSED** | Data-backed replay/campaign testing, optional daily seeded board, verified separate leaderboard tier |
| P2 | Hockey avatar wearables | **PROPOSED ONLY** | Trustworthy entitlement workflow + wardrobe design, no XP bought |

## Owner test checklist

1. Open **https://michellew.io/minigame/hockey-gear-rush/index.html** on your phone. Start Rush and tap each item shown in the checklist; check all targets are reachable without frantic scrolling.
2. Drag a clutter object, finish a round, and confirm room results, 1–3 stars, next room unlock and persisted state after reload.
3. Switch to Relaxed, then Cleanup; ensure neither claims account XP. Use Spotlight in Rush, finish, and verify assisted round has no XP.
4. Pause; leave the tab/app; resume and check the game timer was stopped while away.
5. In Rush levels 1–5 with real login, finish unassisted after >6 seconds and check profile XP against the ledger. No claim should be inferred from browser text alone.
6. Verify single unobtrusive ad, navigation header/share, screen-reader labels, and desktop mouse/keyboard.

## Rollback and data recovery

Original one-file game blob: \`9e7e9f9b4a03cda967ea4557aeb9a93432b842c7\` on \`minigame/hockey-gear-rush/index.html\`. Restore this blob via a new targeted commit and remove or leave unused the new \`gear-rush.css\` and \`gear-rush.js\` as needed. Do not force-push or roll back account data. New progress key \`retro:gear-rush:locker-progress:v2\` is namespaced and never deleted by this release. Database migration/history unchanged.

## Player-facing release note

Hockey Gear Rush has a new locker-room look with fifteen rooms, Rush, Relaxed and Cleanup modes, personal stars, collectibles, easy mobile-friendly gear pickup, fair placement and optional hints. Save your personal progress on this device, then come back to beat your best time.
