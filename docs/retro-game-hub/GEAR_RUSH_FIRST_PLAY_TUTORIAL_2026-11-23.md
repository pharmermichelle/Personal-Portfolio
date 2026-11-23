# Hockey Gear Rush — First-play onboarding tutorial

**Date:** 2026-11-23. **Project:** `pharmermichelle/Personal-Portfolio` (`main`).

## Feature delivered — VERIFIED REPO / MOCKED INTERACTION, not PLAYER TESTED

A four-step, red/white hockey-themed walkthrough opens automatically on the first visit and can be reopened using the prominent **? How to Play** button near the game modes.

1. **Mission:** Find all required hockey equipment to finish the room and unlock the next.
2. **Checklist:** The equipment names and pictures are shown below the rink on a phone, alongside it on desktop. Collected items gain a checkmark.
3. **Collection:** Find matching gear on the rink board and tap to collect it; move or clear clutter as needed.
4. **Progression:** Rush stars/time, Relaxed and Cleanup, pause, Spotlight and assisted XP eligibility.

The tutorial has Back, Next, Skip, and final **Got it — Play!** controls, progress dots and a visible step counter. It is not an advertisement or reward gate.

### State and accessibility

- Completion/skip saves `retro:gear-rush:tutorial:v1=seen` in browser localStorage; first-visit auto-show is local to that browser. Existing game progress is not touched.
- The first-time final action begins the configured room; skipping leaves the existing start screen in place.
- Reopening the guide during active gameplay pauses the round first. The underlying game is made inert while tutorial is open; keyboard focus enters the guide, Tab is contained, and Escape closes it. Returning players do not see automatic tutorial.
- Self-contained fixed dialog with max-height scroll, high-contrast text, 44–48px touch targets and 320px viewport styling. No required page-horizontal scroll or external media downloads; demonstration uses existing hockey gear PNG assets.
- The timer, difficulty, ad placement, account XP, reward rules, cloud save setup and player inventory were not modified.

## Affected files

- `minigame/hockey-gear-rush/index.html`: tutorial markup and **How to Play** button, fresh CSS/JS asset versions, game-root marker.
- `minigame/hockey-gear-rush/gear-rush.css`: responsive tutorial overlay and hockey-styled example diagrams.
- `minigame/hockey-gear-rush/gear-rush.js`: tutorial state, first-time persistence, navigation, focus and start/skip logic.

### Evidence
- Checked every JS-referenced DOM ID exists in HTML, all four tutorial panels are present, stylesheet braces balance and JS compiles with V8 `new Function`.
- Mocked first-visit DOM test: tutorial opens, steps change and back navigation works, final action closes the guide and calls the existing game-start XP begin path once.
- Mocked return-visit test: no automatic modal, Help reopens and Skip closes it without starting a new round.
- **Not yet tested:** real mobile browser presentation, screen reader, browser back gestures, actual focus behavior on a device, persistence after reload, social/AdSense interactions.

## QA for owner
1. On a browser that has not seen this version, open [Gear Rush](https://michellew.io/minigame/hockey-gear-rush/index.html). The four-step tutorial should open immediately.
2. Read through Next and Back; final **Got it — Play!** should start Room 1. Skip should return to the start screen.
3. On later page loads the tutorial should not auto-open. Use **? How to Play** to reopen.
4. From a running round, open Help. Round should pause and remain paused after closing Help.
5. Check 320–430px screens and that no ad blocks the tutorial.

## Rollback
Restore the pre-tutorial blobs for game HTML (`6cc31f1b2675fc0cc3645cffd81fafe6be8e4b80`), JS (`25c995be7afc4b2007399ca5d137a6ad32740c06`) and CSS (`5059dcee895796c73e6819bdc4df8352babcc908`) using new targeted commits. Do not force-push. Existing progress and XP require no restoration.
