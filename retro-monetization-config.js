/* Retro Games Hub: explicit rewarded-ad inventory per game.
 * Never reuse an AdSense display slot as a rewarded unit. A new Google Ad Manager
 * web rewarded unit must be created before activating the Claws supply drop.
 */
(function (window) {
  "use strict";
  const gameId = document.currentScript?.dataset.gameId || "acorn-ascent";
  const rewardedUnits = Object.freeze({
    "acorn-ascent": "/23396250060/acorn_rewarded_hints",
    "claws-vs-paws": "", // Requires a real Claws-specific rewarded unit.
    "cut-the-cheese": "" // Requires its own real GAM out-of-page rewarded unit; not an AdSense banner.
  });
  window.RETRO_REWARDED_AD_UNIT_PATH = rewardedUnits[gameId] || "";
})(window);
