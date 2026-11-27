# UI, accessibility, performance, and monetization

## Implemented in source

- [Hub](../../retro-game-hub.html) includes search, genre and device filters, responsive styles, reduced-motion styles, a live results count, and account controls. Game tiles open a new tab with an accessible “Play” label. The shared [player header](../../retro-arcade-header.js) connects player navigation, account state and activity on game pages.
- Hockey Gear Rush has a named, replayable dialog with focus handling. Backyard Cornhole, Claws vs. Paws and Revive Nature have their own onboarding. The [game matrix](game-matrix.md) records where these patterns have been located.
- The hub and standalone games include existing AdSense placements. The hub's labeled, reserved-space placement follows the main content. Actual fill, viewability, consent behavior, and revenue were not measured.
- [Rewarded inventory configuration](../../retro-monetization-config.js) contains a Google Ad Manager path for Acorn Ascent and empty entries for Claws vs. Paws and Cut the Cheese. [The GPT adapter](../../retro-rewarded-ads.js) resolves a grant only after the matching slot emits `rewardedSlotGranted`. The checked-in inventory path establishes configuration. Publisher approval, delivery and consent remain unverified. See [Rewarded Hints Setup](../REWARDED_HINTS_SETUP.md) for the original handoff.

## Acceptance standards

- Keep text legible and the next action obvious. At 320, 390 and 768 CSS px and at 200% zoom, check the hub, shared header, modals, results and controls for horizontal overflow, overlap, and clipped text. Also check desktop keyboard play and narrow landscape.
- Use labeled controls and visible focus. Provide equivalent keyboard and touch controls where the game declares both devices. Aim for 44 CSS px touch controls where practical. Avoid conveying state only with color, icons or sound. Respect reduced motion and use text status for significant events rather than announcing every animation frame.
- Dialogs need a programmatic name, keyboard dismissal where appropriate, focus containment and focus restoration. Tutorials should explain one useful action at a time, allow skipping and replay, and stay outside active gameplay timers.
- Reserve space for imagery and ads. Keep game controls stable when ad scripts load, fail or return no fill. For canvas games test resize, touch input, device pixel ratio, page visibility, and time or pause behavior.
- Baseline the hub and representative lightweight, canvas and asset-heavy games with ad requests intercepted. Track transferred bytes, long tasks, LCP, CLS, INP and time to playable on a throttled mobile profile. Compare before and after on the same profile. Production performance remains unmeasured in this audit.
- Profile assets before changing them. `minigame/` occupies about 99 MiB in this checkout, including 33 MiB for Coastline Cruiser and 15 MiB for Hockey Gear Rush. Large tracked examples include `minigame/images/scribe-golem.png` (3.3 MiB), Coastline Cruiser's `speaker.png` (3.1 MiB), and Cut the Cheese's `parm-wheel.png` (2.9 MiB). Confirm references and visual quality before any resizing or alternate format rollout. Keep source artwork and leave unrelated portfolios out of scope.

## Monetization strategy

1. Preserve existing AdSense integration and instrument page performance before changing placements. Keep ads labeled, outside game controls and close actions, with clear space against accidental taps.
2. Keep rewarded actions opt-in. Offer a meaningful optional convenience, such as a hint after the free hint. Base gameplay, completion XP and competitive standing should remain available without watching. Use separate approved GAM rewarded inventory per game.
3. In automated tests intercept publisher and analytics requests and use fake GPT events. Exercise grant, early close, duplicate events, no fill, unsupported devices, blocked scripts and timeout. Check that the matching grant delivers one in-game reward and the controls recover after all terminal states.
4. Measure real aggregate retention, opt-in rate, fill, viewability and revenue per session only through approved publisher and analytics setup. Establish a baseline before changing display density or opening new inventory. Keep monetization experiments off production pending operational approval.
