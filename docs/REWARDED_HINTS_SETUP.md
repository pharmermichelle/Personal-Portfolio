# Retro Games Hub — Optional Rewarded Hints

## Current release — Acorn Ascent
- First hint per branch is free and stays used if the player restarts that branch or refreshes the page on the same device. Starting a new 10-branch run clears the free-hint history.
- After using the free hint, the game shows a separate, large "Watch Ad for Another Hint" action on supported screens.
- A new hint is revealed **only** after the Google Publisher Tag `rewardedSlotGranted` callback for that exact rewarded slot.
- Skipped ads, no fill, blocked ads, loading errors and unsupported devices do not award a hint.
- The player can always solve the full puzzle without ads. Game completion, XP and the badge do not depend on ad viewing.
- Until a real ad unit is configured the button explicitly says "Extra Hints (Ads Coming Soon)" and cannot launch a fake rewarded ad. The existing AdSense banner remains unchanged.

## Activate actual monetization
1. Check that the site and account can use **Google Ad Manager rewarded ads for web**. An ordinary AdSense banner unit or AdSense publisher ID cannot be used as a rewarded unit.
2. In Google Ad Manager, create a valid web rewarded inventory/ad unit and ensure demand, policy compliance, consent and test delivery are configured. Record the **real** rewarded ad unit path.
3. Set `rewardedAdUnitPath` in root `retro-monetization-config.js` to the approved path (e.g. `/NETWORK_ID/REWARDED_UNIT_NAME`; this is a format sample, not a live unit).
4. Load `retro-monetization-config.js` followed by `retro-rewarded-ads.js` on games with optional rewarded experiences. Acorn Ascent is already connected.
5. Test on an actual mobile browser with a registered test advertiser/ad unit, consent state and real publisher delivery. A confirmed Google `rewardedSlotGranted` event must unlock exactly one extra hint.
6. Verify no reward on skipped/closed-before-grant ads, unsupported browsers, no fill, network failures, tab switching and rapid double taps.
7. Check accessibility at 320 CSS px, 200% zoom, keyboard focus, and readable ad labels before promoting the feature.

## Shared contract for new games
```js
// Check that the publisher is actually configured:
window.RetroRewardedAds.isConfigured(); // boolean
// Invoke in a genuine user click (explicit opt-in):
const result = await window.RetroRewardedAds.watch({
  onStatus: (message) => showStatus(message)
});
if (result.granted) gameAwardOneOptionalHint();
```

Never directly set `result.granted=true` in game code, never replace this with clicking a display banner, and do not claim live ad revenue or delivery until Ad Manager is configured and tested.

Google docs:
- https://developers.google.com/publisher-tag/samples/display-rewarded-ad
- https://support.google.com/admanager/answer/9116812
