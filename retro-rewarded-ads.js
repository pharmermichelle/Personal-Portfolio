/* Retro Games Hub rewarded-ad adapter.
 * Requires a real Google Ad Manager web REWARDED ad unit. AdSense banners are not rewards.
 * Games decide what a completed rewarded view unlocks; this module never grants rewards
 * until GPT emits rewardedSlotGranted for the matching slot.
 */
(function (global) {
  "use strict";
  let busy = false;
  let loader = null;
  const adUnit = () => String(global.RETRO_REWARDED_AD_UNIT_PATH || "").trim();
  const isConfigured = () => /^\/\d{3,}\/[A-Za-z0-9_\/.-]+$/.test(adUnit());
  function loadGPT() {
    if (global.googletag && global.googletag.apiReady) return Promise.resolve();
    if (loader) return loader;
    loader = new Promise((resolve, reject) => {
      global.googletag = global.googletag || { cmd: [] };
      const script = document.createElement("script");
      let settled = false;
      // Some mobile browsers/privacy filters silently block scripts without firing onerror.
      // Never leave a player waiting indefinitely on a free-to-play puzzle.
      const timeout = global.setTimeout(() =>
        fail("The ad service did not respond. This may be an ad blocker or a network issue."), 12000);
      function finish() {
        if (settled) return;
        settled = true;
        global.clearTimeout(timeout);
        resolve();
      }
      function fail(message) {
        if (settled) return;
        settled = true;
        global.clearTimeout(timeout);
        script.onload = null;
        script.onerror = null;
        script.remove();
        reject(new Error(message));
      }
      script.async = true;
      script.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
      script.onload = () => {
        // The request is not ready until the GPT command queue can actually execute.
        if (global.googletag && global.googletag.apiReady) finish();
        else global.googletag.cmd.push(finish);
      };
      script.onerror = () => fail("The rewarded ad service was blocked or could not load.");
      document.head.appendChild(script);
    }).catch(error => { loader = null; throw error; });
    return loader;
  }
  function watch({ onStatus } = {}) {
    const status = typeof onStatus === "function" ? onStatus : () => {};
    if (!isConfigured()) return Promise.resolve({
      granted: false, reason: "not_configured",
      message: "Rewarded ads aren't activated yet. Your free hint is still available on each branch."
    });
    if (busy) return Promise.resolve({
      granted: false, reason: "busy", message: "A rewarded ad is already in progress."
    });
    busy = true;
    status("Contacting the rewarded ad service…");
    return loadGPT().then(() => new Promise(resolve => {
      let done = false, granted = false, slot = null, loadTimer = null, closeTimer = null;
      const tag = global.googletag;
      let listeners = [];
      function finish(reason, message) {
        if (done) return;
        done = true;
        global.clearTimeout(loadTimer); global.clearTimeout(closeTimer);
        try {
          if (slot) {
            for (const [name, handler] of listeners) tag.pubads().removeEventListener(name, handler);
            tag.destroySlots([slot]);
          }
        } catch (_) { /* Cleanup must never hide the reward result. */ }
        busy = false;
        resolve({granted, reason, message});
      }
      status("Checking whether a rewarded ad is available…");
      loadTimer = global.setTimeout(() => finish("no_response", "No ad was available to show. Try again later; your puzzle progress is safe."), 18000);
      tag.cmd.push(() => {
        if (done) return;
        try {
          const fmt = tag.enums && tag.enums.OutOfPageFormat && tag.enums.OutOfPageFormat.REWARDED;
          if (!fmt) return finish("unsupported", "Rewarded ads aren't supported on this browser.");
          slot = tag.defineOutOfPageSlot(adUnit(), fmt);
          if (!slot) return finish("unsupported", "Rewarded ads aren't supported on this device.");
          const pub = tag.pubads();
          function listen(name, handler) { pub.addEventListener(name, handler); listeners.push([name, handler]); }
          listen("rewardedSlotReady", event => {
            if (event.slot !== slot || done) return;
            clearTimeout(loadTimer);
            // The explicit player tap on "Watch Ad for Hint" is the opt-in.
            status("Rewarded ad ready. Showing your chosen ad…");
            closeTimer = global.setTimeout(() => finish("timeout", "The rewarded ad did not finish."), 240000);
            if (!event.makeRewardedVisible()) finish("unavailable", "Unable to display this ad.");
          });
          listen("rewardedSlotGranted", event => {
            if (event.slot !== slot || done) return;
            granted = true; status("Ad reward confirmed! Close the ad to use your hint.");
          });
          listen("rewardedSlotClosed", event => {
            if (event.slot !== slot || done) return;
            finish(granted ? "rewarded" : "skipped",
              granted ? "Extra hint unlocked." : "Ad closed before the reward. No hint was used.");
          });
          listen("slotRenderEnded", event => {
            if (event.slot === slot && event.isEmpty && !done)
              finish("no_fill", "No rewarded ad is available right now.");
          });
          slot.addService(pub);
          tag.enableServices();
          tag.display(slot);
        } catch (_) { finish("error", "Rewarded ad couldn't start. Try again later."); }
      });
    })).catch(error => {
      busy = false;
      return {granted:false, reason:"load_failed", message:error && error.message || "Rewarded ads are unavailable right now."};
    });
  }
  global.RetroRewardedAds = Object.freeze({isConfigured,watch});
})(window);
