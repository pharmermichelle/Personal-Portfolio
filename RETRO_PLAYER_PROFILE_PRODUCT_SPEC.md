# Michelle's Retro Game Hub — Player Identity & Rewards Product Specification (Option A)
**Status:** first frontend release committed 2026-11-18; backend reward systems are *proposed only*. The interface is intentionally honest about data not yet tracked.

## Product promise
Players create a nonhuman full-body arcade mascot, name their player identity, and eventually earn wearable clothing, badges, XP and rankings through verified activity across the games. Avatars are designed to be reusable later in a walkable online arcade room.

## Visual identity
Original, 1980s-influenced color blocking with deep violet, pink, electric teal, yellow and cobalt. Thick geometric divisions, high contrast, large controls, accessible type and touch navigation. Never reproduce specific classic-game characters, graphics or layouts.

## Starter characters (all fully original)
1. Chrome Byte — silver-friendly robot.
2. Zorp Scout — green, three-eyed antenna alien.
3. Neon Fin — blue cartoon shark adventurer.
4. Mega Moss — purple, original gorilla creature (no Godzilla/King Kong branding).
5. Tape Ghost — spectral cassette-shaped ghost.
6. Disco Orbit — one-eyed cosmic cyclops.
7. Circuit Newt — warm-orange electric salamander.
8. Astro Moth — antennaed star-wing insect.
9. Jelly Jolt — turquoise electric jelly creature.

All share a consistent 180×244 SVG viewport, shoulder/hips/feet anchor region and **yellow short-sleeve starter tee, pink starter shorts and white high-top sneakers**. Their individual face/head art is original. Clothes are temporarily part of preview rendering, not independently equipable catalog entitlements.

## Account and first-time onboarding
1. Players can browse and play as guests.
2. Sign up/login through the existing Hub Supabase auth.
3. Once signed in, open **My Profile**, choose a full-body creature, choose a 3–24-character alphanumeric/underscore username, set profile visibility (default private) and **Save My Character**.
4. Explain upcoming clothing and XP visually on the page.
5. Encourage playing a game after saving. No blocking modal or mandatory promotional opt-in.
6. Future refinement: automatic onboarding redirect upon verified signup/login, account recovery, unique name enforcement, accessibility testing.

## Player profile UX
- Character creator with nine character buttons and large full-body preview.
- Player Card: saved username, active account and avatar, future level/XP progress.
- Arcade Stats: real total verified active game time, aggregate XP rank, awarded badge count and tracked games (currently placeholders).
- Wardrobe: starter look and visible **locked previews** of planned level and per-game rewards.
- Game Record: per-game verified active time, best verified score and current verified rank (currently not available, visibly labeled).
- Badge Cabinet: future officially earned achievements, locked previews and game categories.
- No made-up rank, score or XP numbers.

## XP and progression — proposed rules, pending Option B review
- Base XP: 10 XP per *verified active minute* in a game, subject to policy caps and server-confirmed session heartbeats.
- A hidden tab, paused session, idle browser, duplicate overlapping session or other suspicious client claims grant no XP. Frontend input is never authoritative.
- Proposed starter levels: Level 1 = 0 XP; progressive thresholds to be finalized with gameplay testing.
- Overall XP leaderboard based on authoritative XP ledger, private opt-in for public inclusion.
- Verified active minutes tracked per game and in total. A leaderboard for actual playtime is separate from the XP leaderboard.
- Each game's leaderboard ranks only comparable verified scores with game-specific verification.
- Bonus XP for verified achievement milestones may be added later; no direct browser-side award API.

## Clothing requirements
Slots: top, bottom, shoes (future: head accessory, back, hand-held effects and frame). Outfit layers and anchors must work on every avatar, and eventually in front/side/back walking sprites.
- **Starter:** short-sleeve Arcade Tee, shorts, sneakers, available to all at Level 1.
- **Level-based examples:** color-block windbreaker at Level 5, circuit stripe trousers Level 8, neon varsity jacket Level 12.
- **Game-specific examples:** Fallen Grid glitch tee, Revive Nature bloom shorts, Acorn Ascent trail tee, Claws vs. Paws rival pants. Exact grant requirements to be validated against the actual gameplay code.
- Catalog states: Locked / Earned / Equipped / Unavailable. Only server-side entitlements change Earned status; current frontend deliberately does not claim item rewards.
- Clothes are cosmetic, never pay-to-win. No user-generated uploads in MVP.

## Badges and profile privacy
Badges are granted from trusted game milestones, only once, with a unique ledger and event trail. Profile private by default. Public rankings require *separate explicit opt-in*. Avoid showing account email or other PII on leaderboards. Age eligibility, moderation, data export and deletion to be added before full accounts launch.

## Later social arcade room
Create animation source assets with full-body character silhouettes and matching clothing anchor points; planned future animations: front, back, side, walk/idle. Movement networking, proximity/chat, moderation and public presence are not part of this launch.

## What was implemented in Option A
- `retro-player-profile.html`: retro profile and wardrobe screens.
- `retro-player-profile.css`: original responsive 80s color-block visuals.
- `retro-player-profile.js`: original SVG full-body characters, selection, user-input validation, authenticated Supabase profile fetch/save through existing `profiles` RLS.
- `retro-game-hub.html`: My Profile navigation and corrected sign-up-without-session UI.
- Verified: files committed to GitHub and JS syntax parsed. Not yet verified: live GitHub Pages publication in browser or authenticated end-to-end save on mobile.

## Option B (next, not executed)
Review/add migrations for avatar inventory, clothing catalog, player game stats, sessions, XP ledger and qualified ranking snapshots; migrate with RLS, verified server events, safe testing and no disruption to guest saves. Then wire real profile fields to authoritative database results.

## Option C (later, not executed)
Polish detailed avatar animation layers, user journey illustrations and additional layout mockups after the backend is functional.
