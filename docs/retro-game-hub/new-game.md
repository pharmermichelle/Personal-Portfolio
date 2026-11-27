# New game template and acceptance checklist

Copy [the template](../../minigame/_template/index.html) to `minigame/<game-id>/`. Replace the practice state machine and the header's `data-game-id`. Keep one canonical ID across the catalog, header, saves, reward RPC and leaderboard filters. The template includes a playable round, shared account navigation, a replayable tutorial, accessible controls, profile and leaderboard links, and a hidden ad slot. Complete the applicable integrations below before registering the game.

## Integrations

| Surface | Implementation |
| --- | --- |
| Authentication and navigation | Use the shared header and its `retro-arcade-auth-ready` event. Play as a guest when services are unavailable. Reset active private state when the authenticated identity changes. |
| Time | Add the canonical ID to the shared header and the server presence allowlist. Preserve visible, focused time accounting and exclude background time. |
| Saves | Load [RetroSaveService](../../retro-save-service.js). Supply a validator, version, empty state, legacy device reader, meaningful-progress check, restore callback and confirmation summary. Save only durable game progress. Exercise failed reads and revision conflicts before release. |
| XP and completion | Select an appropriate existing reward contract or scope a server-validated rule. Call it only at the game’s legitimate completion or milestone. Keep XP writes in the backend, preserve retry keys, and use authoritative totals. |
| Daily bests | Keep the first completion award separate where the game supports it. Use UTC and reward only newly reached server-verified milestones. Test ties, worse scores, improved scores and concurrent requests. |
| Standings | Reuse the opt-in leaderboard. Document the verification tier, metric and game ID before enabling competitive display. |
| Wearables and badges | Add validated catalog entries and server-owned eligibility. Verify each unlock, duplicate claim, equipment slot and account switch. |
| Ads | Reserve space away from controls. Use approved inventory only after review, keep rewarded actions optional, and test with fixtures that block live ads and analytics. |

## Acceptance checklist

- [ ] Guest can learn the controls, start, finish and restart the game.
- [ ] Difficulty and progression match the game design. Tutorial can be skipped and replayed.
- [ ] Keyboard and touch support match the advertised devices. Focus is visible and restored. Narrow screens, landscape, zoom and reduced motion are checked.
- [ ] Login, logout and account switching preserve guest and account boundaries. Existing local data has an explicit migration path.
- [ ] Save reload, second-device restore, offline recovery, and conflict behavior pass where supported.
- [ ] Server reward, daily record, duplicate and concurrent claims pass where supported. Profile totals match committed awards.
- [ ] Standings opt-in, eligible wearables, achievements and badges pass where supported. Inapplicable features have an explicit matrix entry.
- [ ] Preview works with live ads and analytics blocked. Layout stays usable on failed or unavailable services.
- [ ] Catalog, game matrix, test fixtures and relevant Jira acceptance evidence are updated.
