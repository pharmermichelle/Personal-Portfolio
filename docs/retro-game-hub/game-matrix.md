# Arcade catalog and game feature matrix

Source audit of `f804a0a6`. The hub's `GAMES` array advertises 34 titles, including 14 modes of the shared Retro Classics page. All catalog routes exist in the checkout. Device support below records the hub's declared support. Gameplay, live rewards, cloud sync, and device behavior require runtime tests. “—” means a dedicated integration was not identified in this pass. All catalog entries use the shared player header.

## Retro Classics

The route is [minigame/retro-classics/index.html](../../minigame/retro-classics/index.html) with the query parameter shown below. All modes declare desktop and mobile support. The shell renders a rules summary and stores a device best for each mode. “Daily completion” means the normal client requests 2 XP per game for the first completion in each UTC day through `retro_classic_daily_xp`. A higher score does not trigger a second award on those modes.

| Game | `?game=` | Completion or score | Account progression |
| --- | --- | --- | --- |
| Simon Says | `simon` | Repeat growing sequences | Daily completion |
| 2048 | `2048` | Merge tiles | Daily completion |
| Minesweeper | `mines` | Clear safe cells | Daily completion |
| Word Scramble | `scramble` | Unscramble five words | Daily completion |
| Hangman | `hangman` | Guess the hidden word | Daily completion |
| Reaction Time | `reaction` | Five reaction attempts | Daily completion |
| Five Dice Challenge | `dice` | Fill five categories | Daily completion |
| Memory Match | `memory` | Match eight pairs | Daily completion |
| Four in a Row | `four` | Connect four against the computer | Daily completion |
| Heads or Tails | `coin` | Ten server-mediated guesses for signed-in runs | `retro_coin_daily_xp` awards first-completion XP and daily improvement points |
| Higher or Lower | `cards` | Predict the next card | Daily completion |
| Rock Paper Scissors | `rps` | Ten computer matches | Daily completion |
| Tic-Tac-Toe | `ttt` | Five boards against the computer | Daily completion |
| Backyard Cornhole | `cornhole` | Toss, tournament and replay flows | Separate account-backed game state and match XP, with guest recovery and an interactive tutorial |

## Standalone titles

Cloud indicates a game-specific `RetroSaveService` adapter in the normal entry point. Shared account activity and elapsed time through the header do not establish a game-specific completion or reward. The shared leaderboard is a separate integration and its production coverage is still unverified.

| Game | Route under `minigame/` | Devices | XP or rewards | Save or instruction evidence |
| --- | --- | --- | --- | --- |
| Brick Blitz | `brick-blitz/index.html` | Desktop, mobile | First clears via `RetroLevelXP` | Device progress and cloud |
| Neon Pong | `neon-pong/index.html` | Desktop, mobile | Per-match tiered XP via reward function | Device stats and cloud, controls and XP guide |
| Grass Snake | `grass-snake/index.html` | Desktop, mobile | Record and time milestones via reward function | Device records, account run handling |
| Claws vs. Paws | `claws-vs-paws/index.html` | Desktop, mobile | In-game coins and unlocks | Device progress and cloud, replayable tutorial |
| Cut the Cheese | `Cut-the-Cheese/index.html` | Desktop, mobile | Guarded level XP and cosmetic rewards | Device progress, inventory and cloud, first-level tutorial |
| Fallen Grid | `Tide-Tetris/index.html` | Desktop, mobile | First clears via `RetroLevelXP` | Cloud adapter — |
| Revive Nature | `Revive-nature/revive-index.html` | Desktop, mobile | — | Local ecosystem state, first-play tour |
| Rink Putt | `hockey_shooter/index.html` | Desktop, mobile | First clears via `RetroLevelXP` | Cloud adapter — |
| Hockey Gear Rush | `hockey-gear-rush/index.html` | Desktop, mobile | Rush levels 1–15 and wearables | Device progress, four-step first-play and replay tutorial |
| Survive 2026 | `survive-2026/index.html` | Desktop, mobile | — | In-page tutorial panel |
| Acorn Ascent | `acorn-ascent/index.html` | Desktop, mobile | Verified branch clears and completion cosmetic | Device progress and cloud, free and optional rewarded hints |
| Bugged Out! | `bugged-out/index.html` | Desktop | — | — |
| Coastline Cruiser | `coastline-cruiser/cruiser.html` | Desktop, mobile | — | Device high scores |
| Lemon Pound Cake Double Take | `pound_cake/index.html` | Desktop, mobile | — | — |
| Wizard's Mana Forge | `clickgame.html` | Desktop, mobile | — | — |
| Whack-a-Bug | `whackgame.html` | Desktop, mobile | — | Device high score |
| Choose Your Adventure | `game.html` | Desktop, mobile | — | Discovered endings on device |
| Ferret Life (WIP) | `ferret-life/index.html` | Desktop | — | Catalog labels this a work in progress |
| Inbox Hero | `inbox-hero.html` | Desktop, mobile | — | — |
| Community Garden | `community-garden.html` | Desktop, mobile | — | — |

The catalog excludes other checked-in projects. `arcade-floor.html` is a hub destination with the shared player header and a separate `arcade-lobby` activity ID. The literal HTML fallback “17 games” is stale. The rendering code replaces it with the actual count.

Survive 2026 retains a thumbnail path in catalog metadata that has no matching tracked file. The current tile renderer uses icons and does not read thumbnail metadata.
