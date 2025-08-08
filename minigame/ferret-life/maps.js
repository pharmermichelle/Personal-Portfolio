// maps.js
export const TILE_SIZE = 64;

export const TILE = {
  FLOOR: 0,
  WALL: 1,
  CAGE: 2,
};

// Very small living room sample (12 x 8 tiles)
export const livingRoom = {
  name: "living",
  width: 12,
  height: 8,
  tiles: [
    // 0=floor, 1=wall, 2=cage
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],

  // Precompute a pixel-based cage rect to make it easy to test overlap
  cageRect: {
    x: 10 * TILE_SIZE,
    y: 1 * TILE_SIZE,
    w: 1 * TILE_SIZE,
    h: 6 * TILE_SIZE,
  },
  decorations: [
    { x: 2, y: 1, sprite: "plant" },
    { x: 3, y: 1, sprite: "plant2" },
    { x: 5, y: 2, sprite: "loveseat" },
    { x: 6, y: 3, sprite: "table" },
    { x: 4, y: 4, sprite: "chair" },
    { x: 7, y: 2, sprite: "sofa" },
    { x: 9, y: 4, sprite: "sofachair" },
  ],
};
export const diningRoom = {
  name: "dining",
  width: 12,
  height: 8,
  tiles: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  cageRect: {
    x: 10 * 64,
    y: 1 * 64,
    w: 1 * 64,
    h: 6 * 64,
  },
  decorations: [
    { x: 3, y: 2, sprite: "table" },
    { x: 5, y: 2, sprite: "chair" },
    { x: 7, y: 2, sprite: "chair" },
  ],
};
