# Gear Rush — Mobile width, hockey theme and top-ad correction

Date: 2026-11-23 ET. Target: `minigame/hockey-gear-rush/index.html`.

## Owner-reported problem
On an Android 720-pixel screenshot of a high-density phone webview, game panels appear horizontally clipped; the equipment checklist can be scrolled sideways; an oversized top ad obscures the game; the blue theme lacks clear hockey identity.

## Shipped (VERIFIED REPO, not yet PLAYER TESTED)
1. **Mobile width:** Set root/body width and max-width to 100%, clip accidental document-level horizontal overflow, set key flex/grid/card children `min-width:0;max-width:100%`, and ensure each mobile panel fits the viewport. Replace the horizontally scrolling target list with a 2-column wrapping grid. Reorder mobile sections to mode selector → primary play board → checklist → collection → instructions. Keep touch hit areas at least 44px and preserve desktop two-column layout.
2. **Hockey styling:** Coordinated scarlet/red, white and burgundy palette inspired by classic Detroit hockey, without official logo/trademark art. New original repeated net-and-crossed-stick line-art background and low-contrast ice rink markings behind objects. Existing gear PNGs, gameplay rules and HUD remain intact.
3. **Ad placement:** The page's single controlled 320×50 display slot remains below gameplay, with generous visual separation. Update the standard AdSense loader to the documented `data-overlays="collapsed-bottom"` option: top anchor ads are disallowed and collapsible anchors replaced with regular bottom-only format on this page. **Google may still insert other Auto ads**; review page/site settings and exclude obstructive regions in AdSense, never hide filled ads with CSS.
4. Cache-bust the stylesheet so the changed CSS is fetched instead of the cached blue one. JS and existing cloud/XP logic untouched.

## Files affected
- `minigame/hockey-gear-rush/index.html` — theme meta, bottom-only non-collapsible AdSense anchor option, fresh CSS version.
- `minigame/hockey-gear-rush/gear-rush.css` — mobile containment, wrapping checklist, panel order and theme.
- `minigame/hockey-gear-rush/locker-hockey-pattern.svg` — new original hockey-stick/net pattern.
- `minigame/hockey-gear-rush/locker-rink-board.svg` — new original hockey rink lines/net art.

## Evidence
GitHub latest source readback verified all four files, the CSS cache version, single direct ad slot, anchor parameter, mobile grid wrapping and ordering, both SVG files and balanced CSS braces. Existing `gear-rush.js` passed V8 syntax parsing. **Not a browser viewport or physical phone test**. No account records, XP, Supabase migrations or rewards were touched.

## Owner QA
- Reload page once, then refresh hard / open in private tab if old CSS persists.
- At narrow viewport (320, 360, 390, 430 CSS px), confirm no horizontal scroll, full board and all buttons visible.
- The game starts before the lower checklist and footer ad, while display ad stays well below tapping areas.
- Verify no top anchor ad and that any bottom ad is non-obstructive. If other Auto ads still intrude: AdSense → Ads → site Edit → Overlay formats → Anchor ads settings (choose bottom only, disable dynamic anchors) or exclude this game's page from Auto ads while retaining the manually placed unit.
- Confirm 15-room progression, modes, gear clicks and pause unaffected.

## Rollback
Revert theme CSS commit `97010b6daa9e87b5128edb029e615e2bc2698d40`, loader commit `3ad6fde1f50af6af84a195fdcffb4776cf7266c2`, and/or remove the two SVG additions through atomic commits. The previous CSS blob was `c858f54089cba9a676039af8aead7561444fb840`; previous game HTML blob was `d540498b5cc4e3204bc6fecd241ebcfc3f22e509`. Do not reset progress or revert migrations.
