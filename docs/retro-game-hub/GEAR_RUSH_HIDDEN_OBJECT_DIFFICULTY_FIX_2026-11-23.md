# Hockey Gear Rush — Hidden-object difficulty and item appearance

**Date:** 2026-11-23, EST. **Status:** VERIFIED REPO and mocked gameplay; device/player QA pending.

## Owner-reported issues
- Targets and clutter appear in neat grid positions, making scanning too easy.
- The background colors of target and clutter tiles differ, telegraphing solutions.
- The net art looks transparent/inconsistent against other objects.

## Released
- Replaced rigid cell placement with a per-round scattered layout, random horizontal/vertical coordinates, restrained per-item rotation, and controlled mild overlaps. Items stay within the board; placement attempts maximize separation while using available area.
- Equipment and clutter tiles share one opaque red color, border, shape and shadow, with all hockey PNGs (including the net) displayed on the same opaque light backing. Required gear and non-target hockey gear use the identical HTML class and style.
- Added up to three extra hockey gear decoys in early rooms, fewer later where target counts increase. Decoys do not count against the required checklist; tapping one gives a gentle message rather than a penalty.
- The Spotlight assist only highlights a remaining *required* piece, never a decoy.
- Updated first-visit tutorial and board hint to explain checking the images on the Equipment Checklist rather than selecting every hockey item.
- Kept the existing Rush/Relaxed/Cleanup game loop, progress key, session controls, XP backend, AdSense slot and mobile red rink theme.

## Files
- `minigame/hockey-gear-rush/gear-rush.js`
- `minigame/hockey-gear-rush/gear-rush.css`
- `minigame/hockey-gear-rush/index.html` (tutorial copy plus CSS/JS cache version update)

## Evidence
- Read live GitHub main SHA, edited exact files and confirmed JavaScript parses using V8.
- Simulated normal first-room play on 320×275px and 430×330px boards. Both layouts had 4 required hockey items, 3 extra hockey decoys and 9 clutter pieces. All 16 pieces had distinct x coordinates (not columns); none was outside either board.
- Mocked a decoy tap: no required-item progress, appropriate feedback. Then collected the four actual target pieces: one room unlock recorded and the existing level XP begin/complete hooks invoked once for a valid 6.24-second timed run.
- The CSS uses a uniform solid tile background, identical gear/decoy classes and opaque backing under all sprites, including `net.png`.
- **Not verified:** actual mobile webview rendering, all 15 stages, realistic hand-tap overlap behavior across devices, ads and actual backend XP awards.

## QA next
1. Reload or reopen the Gear Rush page (fresh cache query values). Confirm the gear and clutter tiles have identical red backgrounds, with a pale opaque backing behind equipment art including the net.
2. Confirm targets are scattered and not aligned in a grid. Tap an extra hockey item not on the checklist; it should not count. Find all required items and finish the room.
3. Test phone widths ~320/360/390/430px; no target should end outside the rink. Drag objects to reveal those close together. Test Spotlight against a remaining required target.
4. Confirm the tutorial correctly describes decoys and no account XP behavior changed.

## Rollback
The pre-change GitHub blobs were JS `a23a3dc428e5655c04ebc1b311dd6bab1368f6a5`, CSS `b9c5142bba52258b1d1f89cc6def4102a72451c5` and HTML `35a88176da713de425e87d12cc2bdef6fa3b102b`. Restore individually via new atomic GitHub commits, not force-push. No Supabase migrations or XP ledger updates occurred.
