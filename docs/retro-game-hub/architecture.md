# Architecture and implementation audit

## Runtime

The arcade is a collection of static browser pages served from the portfolio repository. [The hub](../../retro-game-hub.html) links to independent games under [minigame](../../minigame), including multiple games served from [Retro Classics](../../minigame/retro-classics/index.html). The root [CNAME](../../CNAME), [.nojekyll](../../.nojekyll) and [_config.yml](../../_config.yml) are part of the existing hosting configuration. The arcade does not depend on a portfolio-wide build. Keep relative paths and versioned script URLs working on nested game routes.

| Area | Code evidence | Assessment |
| --- | --- | --- |
| Authentication | Hub, [shared header](../../retro-arcade-header.js), and [profile](../../retro-player-profile.js) specify the same SDK storage key and enable session persistence and token refresh. | Implemented in source. Real refresh, account switching, OAuth, email confirmation and cross-tab logout need staging/browser verification. |
| Progression | [Client rewards](../../retro-rewards.js), [Edge Function](../../supabase/functions/retro-rewards/index.ts), game entry points and [migrations](../../supabase/migrations). | Multiple implemented paths. Checked-in SQL is incomplete, including for some newer daily rules. Individual reward verification remains game-specific. |
| Saves and play time | [Save service](../../retro-save-service.js), game adapters, and presence migrations. | Cloud saves are a pilot. Guest/local behavior differs by game. Multi-device conflicts, presence after tab backgrounding and staging policies require tests. |
| Profile and leaderboards | [Profile JS](../../retro-player-profile.js), [leaderboard JS](../../retro-leaderboards.js), and consent-first migrations. | UI and database call sites exist. Live opt-in, public column exposure, and consistency with the XP ledger require staging checks. |
| Avatars and wearables | [Avatar catalog](../../retro-hub-avatars.js), [equipment catalog](../../retro-gear-wearables.js), and [avatar renderer](../../retro-player-avatar.js). | Existing equip and milestone paths. Availability and persistence vary by reward source. |
| Navigation and feedback | Shared header, hub and [feedback form](../../retro-arcade-feedback.html). | Feedback form is implemented. Compact mobile action layout remains open in [GH-4](https://michellew-team.atlassian.net/browse/GH-4). |
| Arcade hangout | [Arcade floor](../../arcade-floor.html) and [arcade floor logic](../../arcade-floor.js). | Existing hangout surface. Multiplayer and social direction remain separate work. |
| Ads | [Monetization config](../../retro-monetization-config.js), [rewarded wrapper](../../retro-rewarded-ads.js), and page-level placements. | Delivery, consent and revenue are unverified. See [monetization standards](ui-and-monetization.md). |

The [game matrix](game-matrix.md) records game-specific coverage, tutorials and gaps. The [backend audit](backend-and-rewards.md) records trust boundaries and progression rules.

## First development work package

The shared save service now invalidates stale asynchronous operations when the auth identity changes and preserves a pending copy when conflict recovery cannot read the cloud row. The five pilot games use a versioned reference to the updated service. This work covers the local auth-to-save boundary. Real session restoration and provider behavior remain separate [GH-7](https://michellew-team.atlassian.net/browse/GH-7) verification.

## Release and performance evidence

- Recent history documents shared session hardening (`98a6357a`, `7dec0275`, `cf9b25e9`), a Cornhole eligibility update (`5c7d44e8`), and Heads or Tails daily-best client integration (`f804a0a6`). Source changes alone do not establish deployment status.
- Of 36,949 tracked files, 36,547 sit under nested `node_modules` directories. The largest tracked blob is a 32.5 MiB development cache under `apps/`. Cleanup needs a separate repository-owner work package because these directories belong to other projects.
- Arcade asset candidates include `minigame/images/scribe-golem.png` (3.3 MiB), `minigame/coastline-cruiser/assets/speaker.png` (3.1 MiB) and `minigame/Cut-the-Cheese/assets/cheese/parm-wheel.png` (2.9 MiB). Measure actual request timing and visual impact before changing assets.
- Production load times and ad-induced layout shifts remain unverified. Capture cold and repeat navigation on a representative phone profile with ad traffic disabled and record the release and test conditions.
