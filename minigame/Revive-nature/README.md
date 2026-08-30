# Revive Nature

A lightweight retro-style restoration/farming game prototype built with plain HTML, CSS, JavaScript, and JSON.

## Files

- `index.html` — page structure and game UI
- `style.css` — all visual styling
- `game.js` — game logic, dragging, economy, saves, interactions
- `biomes.json` — biome settings and randomized 5×5 starting layouts
- `plants.json` — crop definitions, costs, minimum needs, and sell values

## Important: run from a local server

Because the game loads the JSON files with `fetch()`, many browsers will block the JSON if you double-click `index.html`.

From this folder, run one of these:

### Python

```bash
python -m http.server 8000
```

Then open:

`http://localhost:8000`

### VS Code

You can also use a simple local-server extension such as Live Server.

## Core prototype rules

- Start with $750.
- The chosen first property is purchased immediately.
- Every biome contains a 5×5 grid (25 plots).
- Every original plot begins with a damaged crop at 0–3 health.
- Water or fertilizer normally adds 1 health.
- A crop must receive at least 3 water and 3 fertilizer treatments before reaching full maturity.
- A plant at health 9 cannot hit health 10 until both minimum needs are satisfied.
- Mature plants can be harvested/sold.
- Harvesting an original damaged crop permanently restores that square.
- Restored land can be replanted or converted to hydroponics.
- Hydroponics has a build cost and reduces final sale value by a daily operating cost.
- Progress and world state save in `localStorage`.

## Editing content

Most balancing can be changed without touching game logic.

### Add or adjust crops

Edit `plants.json`.

### Change prices / biome perks

Edit `biomes.json`.

### Add alternate starting arrangements

Add more 25-entry arrays under a biome's `layouts`.

Each array position corresponds to a tile in this order:

```
 0  1  2  3  4
 5  6  7  8  9
10 11 12 13 14
15 16 17 18 19
20 21 22 23 24
```

The game randomly chooses one layout the first time a biome is purchased, then saves the personalized state locally.
