// Rink Putt — Tiny Hockey Minigolf
// - Proper rink lines/crease/trapezoid
// - Skater at the puck with swing animation
// - Goalie patrol + simple tracking, puck collisions
// - Optional PNGs for your art (PLAYER_IMG_URL / GOALIE_IMG_URL)

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const DEBUG_GOAL = false;
const W = canvas.width,
  H = canvas.height;
const WALL = 22;
const PUCK_R = 12;
const NET_STYLE = {
  post: "#c43131", // red posts/crossbar
  postWidth: 5, // thickness of posts
  mesh: "#e9f4ff", // netting color
  meshAlpha: 0.55, // transparency of the mesh
  cell: 6, // grid spacing
  backTint: "rgba(240,250,255,0.28)", // subtle white inside
  shadow: "rgba(0,0,0,0.12)", // soft floor shadow
};

const RESTITUTION_WALL = 0.82;
const RESTITUTION_OBS = 0.6;
// Goalie behavior knobs (make shots easier by default)
const GOALIE_TUNING = {
  patrolSpeed: 90, // back-and-forth speed while idle
  trackSpeed: 180, // max chase speed when a shot is coming
  trackStartX: 0.72, // only chase once puck is past 72% of the rink
  endPauseMin: 0.35, // pause at ends to open a lane
  endPauseMax: 0.75,
};
const JUMBOTRON = {
  corner: 14, // rounded corner radius
  height: 102, // scoreboard body height
  maxWidth: 620, // cap so it doesn't touch the boards
  marginTop: 10, // distance from canvas top
  bodyTop: "#0f1b32", // gradient top
  bodyBot: "#0a1326", // gradient bottom
  rim: "#2c3e6b", // bezel stroke
  accent: "#6dc1ff", // thin glowing strip
  text: "#eaf3ff", // main text
  subText: "#cfe2ff", // small text
  cable: "rgba(255,255,255,0.18)", // hanger cables
  glass: "rgba(255,255,255,0.06)", // glass sheen
  led: "#98c8ff", // tiny LEDs along the top
};

// Jumbotron behavior (hide only when the PUCK is under it)
// Hysteresis for HUD auto-hide (bigger margin to hide, smaller to show)
const HUD_PROX = {
  hide: 28, // grow the shown HUD rect by this many px when deciding to HIDE
  show: 10, // grow the shown HUD rect by this many px when deciding to SHOW
  bottomExtra: 14, // a little space below the HUD
};

// HUD animation/visibility state
let hudY = JUMBOTRON.marginTop;
let hudTargetY = JUMBOTRON.marginTop;
let hudRevealT = 0; // cooldown timer before we allow showing again
let hudVisible = true; // logical visibility (prevents ping-pong)
const HUD_POS = {
  shownY: JUMBOTRON.marginTop,
  hiddenY: -(JUMBOTRON.height + 14),
};

const HUD_BEHAVIOR = {
  autoHide: true,
  proximityGrow: 24, // grow the HUD rect by this many px for sensitivity
  bottomExtra: 14, // a little extra room below the HUD
  animSpeed: 10,
  showDelay: 0.2,
};

// --- Accuracy helpers (add above SHOTS) ---
const DEG = Math.PI / 180;
function rotate2D(x, y, ang) {
  const c = Math.cos(ang),
    s = Math.sin(ang);
  return { x: x * c - y * s, y: x * s + y * c };
}

// Shot presets: power + max + friction + UI color + cone + needsSkill
// cone = half-angle in radians (±cone around aim direction)
const SHOTS = {
  pass: {
    label: "Pass",
    powerScale: 8.2,
    maxPower: 320,
    friction: 520,
    color: "#6dc1ff",
    cone: 0 * DEG,
    needsSkill: false,
  },
  wrist: {
    label: "Wrist Shot",
    powerScale: 14.8,
    maxPower: 576,
    friction: 936,
    color: "#7cffb2",
    cone: 2 * DEG,
    needsSkill: false,
  }, // fast launch, same range as Pass
  slap: {
    label: "Slapshot",
    powerScale: 10.5,
    maxPower: 470,
    friction: 400,
    color: "#ffc157",
    cone: 12 * DEG,
    needsSkill: true,
  },
  clear: {
    label: "Clear",
    powerScale: 14.7,
    maxPower: 660,
    friction: 440,
    color: "#ff6b6b",
    cone: 16 * DEG,
    needsSkill: true,
  },
};

// --- Shot buttons (clickable UI)
const btnPass = document.getElementById("btnPass");
const btnSlap = document.getElementById("btnSlap");
const btnClear = document.getElementById("btnClear");
[btnPass, btnSlap, btnClear].forEach((b) => {
  if (b) b.style.display = "none";
});

// HUD hit areas populated each frame by drawHUD()
const HUD_HITS = {
  bounds: null,
  pass: null,
  wrist: null,
  slap: null,
  clear: null,
};

function ptInRect(px, py, r) {
  return r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

const GOALIE_GAP = PUCK_R + 2;
function goalieXOnLine(g) {
  // goal-line plane is g.x. Keep goalie center so his RIGHT edge sits just left of that plane.
  return g.x - goalie.w / 2 - GOALIE_GAP;
}

// --- Predict path for the current pull + shot settings (ignores moving obs motion)
function predictShotPath(S) {
  const L = LEVELS[levelIndex];
  const px = state.puck.x,
    py = state.puck.y;

  // Direction from mouse → puck (same as your shot code)
  const dx = px - mouse.x,
    dy = py - mouse.y;
  const len = Math.hypot(dx, dy);
  if (len < 0.001) return null;

  const ux = dx / len,
    uy = dy / len;
  const v0 = Math.min(S.maxPower, S.powerScale * len);

  // Make a throwaway puck we can mutate safely
  const p = { x: px, y: py, vx: ux * v0, vy: uy * v0 };

  const pts = [{ x: px, y: py }];
  const dt = 1 / 120; // sim step
  const maxTime = 3.0; // cap the horizon
  const minPointGap = 12; // thin the polyline
  let t = 0;

  while (t < maxTime) {
    const sp = Math.hypot(p.vx, p.vy);
    if (sp < 0.5) break;

    const dirx = p.vx / sp,
      diry = p.vy / sp;
    const dec = (S.friction || SHOTS.pass.friction) * dt;
    const newSpeed = Math.max(0, sp - dec);
    p.vx = dirx * newSpeed;
    p.vy = diry * newSpeed;

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Collide with boards exactly like the game
    collideBoards(p);

    // Obstacles (use current positions; no moving updates here)
    for (const o of L.obstacles) collideCircleRect(p, o, RESTITUTION_OBS);

    // Goalie (use current center-anchored rect)
    collideCircleRect(
      p,
      {
        x: goalie.x - goalie.w / 2,
        y: goalie.y - goalie.h / 2,
        w: goalie.w,
        h: goalie.h,
      },
      0.25
    );

    // Add points every few pixels to keep it light
    const last = pts[pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) > minPointGap) {
      pts.push({ x: p.x, y: p.y });
    }

    // Bail if we wander way off-canvas (e.g., through the goal mouth)
    if (p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) break;

    t += dt;
  }
  return pts;
}

function updateShotButtons() {
  if (!btnPass || !btnSlap || !btnClear) return; // UI not present

  btnPass.classList.toggle("armed", state.shotMode === "pass");

  btnSlap.disabled = state.slapsLeft <= 0;
  btnSlap.textContent = `Slapshot (${state.slapsLeft})`;
  btnSlap.classList.toggle("armed", state.shotMode === "slap");

  btnClear.disabled = state.clearsLeft <= 0;
  btnClear.textContent = `Clear (${state.clearsLeft})`;
  btnClear.classList.toggle("armed", state.shotMode === "clear");
}
function rand(a, b) {
  return a + Math.random() * (b - a);
}

function armShot(mode) {
  state.shotMode = mode;
  banner.text = `Shot armed: ${SHOTS[mode].label}`;
  banner.t = 0.9;
  updateShotButtons();
}

btnPass?.addEventListener("click", () => armShot("pass"));
btnSlap?.addEventListener("click", () => {
  if (state.slapsLeft > 0) armShot("slap");
});
btnClear?.addEventListener("click", () => {
  if (state.clearsLeft > 0) armShot("clear");
});

// --- Use your own art by setting these to URLs or data-URLs
const PLAYER_IMG_URL = "images/starter-skater.png";
const GOALIE_IMG_URL = "images/starter-goalie.png";
const ICE_BG_URL = "images/rink-bg.png";

const TEAM_STYLE = {
  jersey: "#b23b3b", // primary sweater
  trim: "#ffd166", // stripes/accent
  helmet: "#0b1222",
  gloves: "#7a1e1e",
  pants: "#0f172a",
  stickWood: "#cfa77a",
  blade: "#22252b",
  tape: "#dfe7f3",
};

const ASSETS = { player: null, goalie: null };
if (PLAYER_IMG_URL)
  loadImage(PLAYER_IMG_URL).then((img) => (ASSETS.player = img));
if (GOALIE_IMG_URL)
  loadImage(GOALIE_IMG_URL).then((img) => (ASSETS.goalie = img));
if (ICE_BG_URL) loadImage(ICE_BG_URL).then((img) => (ASSETS.bg = img));

// Tweak anchorX/anchorY if the blade doesn't line up perfectly in your PNG.
const SKATER_SPRITE = {
  scale: 0.1,
  anchorX: 88, // pixels from the image's left to the blade/impact point
  anchorY: 54, // pixels from the image's top to the blade/impact point
  baseRotation: 0,
};
// Goalie PNG render settings (center-anchored)
const GOALIE_SPRITE = {
  scale: 0.1,
  anchorFx: 0.5, // 0..1: horizontal anchor (0.5 = image center)
  anchorFy: 0.5, // 0..1: vertical anchor (0.5 = image center)
  baseRotation: Math.PI,
};

function loadImage(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

// ---- Levels ----
function level1() {
  return {
    par: 3,
    start: { x: WALL + 100, y: H * 0.7 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      { x: 360, y: 360, w: 120, h: 22 },
      { x: 520, y: 230, w: 120, h: 22 },
    ],
  };
}
function level2() {
  return {
    par: 4,
    start: { x: WALL + 120, y: H * 0.48 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      { x: 380, y: 160, w: 22, h: 150 },
      { x: 380, y: 360, w: 22, h: 150 },
      movingRect({
        x: 560,
        y: 170,
        w: 22,
        h: 180,
        axis: "y",
        min: 140,
        max: 340,
        speed: 120,
      }),
    ],
  };
}
function level3() {
  return {
    par: 5,
    start: { x: WALL + 100, y: H * 0.75 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      { x: 280, y: 120, w: 22, h: 260 },
      { x: 280, y: 120, w: 240, h: 22 },
      { x: 520, y: 120, w: 22, h: 260 },
      { x: 280, y: 358, w: 242, h: 22 },
      { x: 600, y: 150, w: 100, h: 22 },
      { x: 600, y: 330, w: 100, h: 22 },
      movingRect({
        x: 710,
        y: 200,
        w: 22,
        h: 140,
        axis: "y",
        min: 170,
        max: 310,
        speed: 150,
      }),
    ],
  };
}
function level4() {
  // "Window Gate" — weave through a box and time a sweeping crossbar
  return {
    par: 5,
    start: { x: WALL + 110, y: H * 0.66 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      // Box corridor
      { x: 300, y: 140, w: 22, h: 240 },
      { x: 560, y: 160, w: 22, h: 220 },
      { x: 322, y: 120, w: 238, h: 22 },
      { x: 322, y: 380, w: 238, h: 22 },

      // Moving gate inside the box (up/down)
      movingRect({
        x: 360,
        y: 180,
        w: 160,
        h: 22,
        axis: "y",
        min: 160,
        max: 340,
        speed: 160,
      }),

      // Sweeping crossbar before the slot to the goal (left/right)
      movingRect({
        x: 620,
        y: 260,
        w: 180,
        h: 22,
        axis: "x",
        min: 600,
        max: 780,
        speed: 180,
      }),
    ],
  };
}

function level5() {
  // "Twin Posts" — staggered pillars + a narrow goal approach
  return {
    par: 6,
    start: { x: WALL + 110, y: H * 0.42 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      // Staggered statics to force bank shots
      { x: 260, y: 120, w: 22, h: 160 },
      { x: 420, y: 280, w: 22, h: 160 },
      { x: 580, y: 120, w: 22, h: 160 },
      { x: 740, y: 280, w: 22, h: 160 },

      // Two moving vertical posts (up/down) mid-rink
      movingRect({
        x: 500,
        y: 170,
        w: 22,
        h: 180,
        axis: "y",
        min: 140,
        max: 360,
        speed: 130,
      }),
      movingRect({
        x: 620,
        y: 330,
        w: 22,
        h: 180,
        axis: "y",
        min: 160,
        max: 360,
        speed: 170,
      }),

      // Funnel near goal (top & bottom ledges)
      { x: 740, y: 150, w: 130, h: 22 },
      { x: 740, y: 330, w: 130, h: 22 },
    ],
  };
}

function level6() {
  // "Cross Traffic" — two horizontal sweepers crossing lanes
  return {
    par: 6,
    start: { x: WALL + 90, y: H * 0.7 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      // A gentle S-corridor to line you up
      { x: 240, y: 140, w: 260, h: 22 },
      { x: 240, y: 398, w: 260, h: 22 },
      { x: 240, y: 140, w: 22, h: 140 },
      { x: 480, y: 280, w: 22, h: 140 },

      // Two horizontal movers sweeping left/right at different lanes
      movingRect({
        x: 260,
        y: 180,
        w: 200,
        h: 22,
        axis: "x",
        min: 260,
        max: 760,
        speed: 200,
      }),
      movingRect({
        x: 760,
        y: 360,
        w: 180,
        h: 22,
        axis: "x",
        min: 300,
        max: 760,
        speed: 140,
      }),
    ],
  };
}

function level7() {
  // "Screened Goalie" — plinko posts + moving blocker near the mouth
  return {
    par: 7,
    start: { x: WALL + 110, y: H * 0.58 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      // Plinko field (staggered narrow posts)
      { x: 300, y: 150, w: 18, h: 120 },
      { x: 360, y: 290, w: 18, h: 120 },
      { x: 420, y: 150, w: 18, h: 120 },
      { x: 480, y: 290, w: 18, h: 120 },
      { x: 540, y: 150, w: 18, h: 120 },
      { x: 600, y: 290, w: 18, h: 120 },
      { x: 660, y: 150, w: 18, h: 120 },

      // Narrow chute to the goal
      { x: 720, y: 160, w: 100, h: 22 },
      { x: 720, y: 338, w: 100, h: 22 },

      // Mobile screen just before the mouth (up/down)
      movingRect({
        x: 860,
        y: 220,
        w: 22,
        h: 160,
        axis: "y",
        min: 160,
        max: 360,
        speed: 180,
      }),
    ],
  };
}

function level8() {
  // "Double Doors" — two vertically sliding gates you need to desync
  return {
    par: 7,
    start: { x: WALL + 100, y: H * 0.32 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      // Framing corridor
      { x: 260, y: 110, w: 22, h: 260 },
      { x: 520, y: 190, w: 22, h: 260 },
      { x: 282, y: 110, w: 216, h: 22 },
      { x: 282, y: 370, w: 216, h: 22 },

      // Two vertical doors (up/down) offset in timing
      movingRect({
        x: 420,
        y: 160,
        w: 160,
        h: 22,
        axis: "y",
        min: 140,
        max: 300,
        speed: 150,
      }),
      movingRect({
        x: 420,
        y: 300,
        w: 160,
        h: 22,
        axis: "y",
        min: 200,
        max: 360,
        speed: 170,
      }),

      // Final skinny channel before goal
      { x: 700, y: 150, w: 140, h: 22 },
      { x: 700, y: 330, w: 140, h: 22 },
    ],
  };
}

function level9() {
  // "Traffic Jam" — three movers in sequence + tight endgame
  return {
    par: 8,
    start: { x: WALL + 110, y: H * 0.72 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      // Early zig walls
      { x: 240, y: 160, w: 22, h: 160 },
      { x: 240, y: 320, w: 240, h: 22 },
      { x: 480, y: 200, w: 22, h: 160 },

      // Three movers to time
      movingRect({
        x: 300,
        y: 200,
        w: 160,
        h: 22,
        axis: "x",
        min: 260,
        max: 560,
        speed: 190,
      }),
      movingRect({
        x: 560,
        y: 260,
        w: 22,
        h: 180,
        axis: "y",
        min: 160,
        max: 360,
        speed: 160,
      }),
      movingRect({
        x: 640,
        y: 340,
        w: 180,
        h: 22,
        axis: "x",
        min: 520,
        max: 760,
        speed: 180,
      }),

      // Tight choke near goal
      { x: 780, y: 160, w: 100, h: 22 },
      { x: 780, y: 338, w: 100, h: 22 },
    ],
  };
}

function level10() {
  // "Gauntlet" — alternating horizontal/vertical sweepers
  return {
    par: 9,
    start: { x: WALL + 100, y: H * 0.5 },
    goal: { x: W - WALL - 30, y: H * 0.5 - 65, w: 30, h: 130 },
    obstacles: [
      // Entry frame
      { x: 220, y: 120, w: 22, h: 260 },
      { x: 220, y: 380, w: 280, h: 22 },
      { x: 500, y: 120, w: 22, h: 260 },

      // Alternating sweepers
      movingRect({
        x: 260,
        y: 170,
        w: 180,
        h: 22,
        axis: "x",
        min: 260,
        max: 720,
        speed: 200,
      }),
      movingRect({
        x: 420,
        y: 220,
        w: 22,
        h: 160,
        axis: "y",
        min: 160,
        max: 360,
        speed: 170,
      }),
      movingRect({
        x: 520,
        y: 300,
        w: 200,
        h: 22,
        axis: "x",
        min: 420,
        max: 820,
        speed: 210,
      }),
      movingRect({
        x: 760,
        y: 220,
        w: 22,
        h: 160,
        axis: "y",
        min: 160,
        max: 360,
        speed: 190,
      }),

      // Final slot
      { x: 820, y: 160, w: 80, h: 22 },
      { x: 820, y: 338, w: 80, h: 22 },
    ],
  };
}

const LEVELS = [
  level1(),
  level2(),
  level3(),
  level4(),
  level5(),
  level6(),
  level7(),
  level8(),
  level9(),
  level10(),
];

let levelIndex = 0;

// ---- Entities ----
function aimVector() {
  const px = state.puck.x,
    py = state.puck.y;
  const dx = px - mouse.x,
    dy = py - mouse.y;
  const len = Math.hypot(dx, dy) || 0.0001;
  return { ux: dx / len, uy: dy / len, len };
}

function puckOverlapsHud(grow) {
  const w = Math.min(W - WALL * 2 - 24, JUMBOTRON.maxWidth);
  const h = JUMBOTRON.height;
  const x = (W - w) / 2;
  const y = HUD_POS.shownY; // check against the SHOWN position only (static)

  const gx = grow + PUCK_R; // include puck radius
  const withinX = state.puck.x >= x - gx && state.puck.x <= x + w + gx;
  const withinY =
    state.puck.y >= y - gx && state.puck.y <= y + h + gx + HUD_PROX.bottomExtra;
  return withinX && withinY;
}

function movingRect({ x, y, w, h, axis = "x", min, max, speed }) {
  return {
    x,
    y,
    w,
    h,
    axis,
    min,
    max,
    speed,
    dir: 1,
    update(dt) {
      if (axis === "x") {
        this.x += this.dir * this.speed * dt;
        if (this.x < this.min) {
          this.x = this.min;
          this.dir = 1;
        }
        if (this.x > this.max) {
          this.x = this.max;
          this.dir = -1;
        }
      } else {
        this.y += this.dir * this.speed * dt;
        if (this.y < this.min) {
          this.y = this.min;
          this.dir = 1;
        }
        if (this.y > this.max) {
          this.y = this.max;
          this.dir = -1;
        }
      }
    },
  };
}

let strokes = 0;
let best = [];

const state = {
  puck: { x: 0, y: 0, vx: 0, vy: 0, friction: SHOTS.pass.friction },
  aiming: false,
  canShoot: true,
  swing: { t: 0, angle: 0 },
  lastShotAngle: 0,
  phase: "play",
  shotMode: "pass", // "pass" | "wrist" | "slap" | "clear"
  slapsLeft: 1, // once per level
  clearsLeft: 1, // once per level
  hudPinned: false,

  // timing minigame for cone accuracy (used by slap/clear)
  skill: {
    active: false,
    phase: 0, // drives oscillator
    pos: 0, // -1..1 (0 = center/best)
    speed: 6.5, // how fast the marker swings
    pending: null, // {dirx, diry, v, S, mode}
  },
};

// Goalie
const goalie = {
  x: 0,
  y: 0,
  w: 36,
  h: 90,
  dir: 1, // patrol direction: +1 down, -1 up
  pause: 0, // time left to pause at an end
  mode: "patrol",

  reset() {
    const g = LEVELS[levelIndex].goal;
    this.x = goalieXOnLine(g);
    this.y = g.y + g.h / 2;
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.pause = 0;
    this.mode = "patrol";
  },

  update(dt) {
    const g = LEVELS[levelIndex].goal;
    const mouthTop = g.y + 10;
    const mouthBot = g.y + g.h - 10;
    const p = state.puck;

    // Start tracking only when a real shot is coming and it's in the mouth
    const approaching =
      p.vx > 80 &&
      p.x > W * GOALIE_TUNING.trackStartX &&
      p.y > mouthTop &&
      p.y < mouthBot;

    this.mode = approaching ? "track" : "patrol";

    if (this.mode === "track") {
      // Chase puck Y (slower than before so shots can beat him)
      const targetY = clamp(p.y, mouthTop + this.h / 2, mouthBot - this.h / 2);
      const vy = clamp(
        (targetY - this.y) * 6,
        -GOALIE_TUNING.trackSpeed,
        GOALIE_TUNING.trackSpeed
      );
      this.y += vy * dt;
    } else {
      // Patrol up/down with little pauses at each end
      if (this.pause > 0) {
        this.pause -= dt;
      } else {
        this.y += this.dir * GOALIE_TUNING.patrolSpeed * dt;

        if (this.y - this.h / 2 < mouthTop) {
          this.y = mouthTop + this.h / 2;
          this.dir = 1;
          this.pause = rand(
            GOALIE_TUNING.endPauseMin,
            GOALIE_TUNING.endPauseMax
          );
        } else if (this.y + this.h / 2 > mouthBot) {
          this.y = mouthBot - this.h / 2;
          this.dir = -1;
          this.pause = rand(
            GOALIE_TUNING.endPauseMin,
            GOALIE_TUNING.endPauseMax
          );
        }
      }
    }

    // Keep the goalie on the goal line with a small gap to the line
    this.x = goalieXOnLine(g);
  },
};

function resetLevel(idx = levelIndex) {
  const L = LEVELS[idx];
  state.puck.x = L.start.x;
  state.puck.y = L.start.y;
  state.puck.vx = 0;
  state.puck.vy = 0;
  state.aiming = false;
  state.canShoot = true;
  state.swing.t = 0;
  strokes = 0;
  goalie.reset();
  state.slapsLeft = 1;
  state.clearsLeft = 1;
  state.shotMode = "pass";
  state.puck.friction = SHOTS.pass.friction;
  updateShotButtons();
}
resetLevel(0);
// ---- Sounds ----
// --- Puck hit sound ---
const HIT_SOUNDS = {
  pass: "sounds/puck-hit_pass.wav",
  wrist: "sounds/puck-hit_wrist.wav",
  slap: "sounds/puck-hit_slap.wav",
  clear: "sounds/puck-hit_clear.wav",
};

// Preload + allow overlapping plays via clone
const hitPads = {};
for (const k in HIT_SOUNDS) {
  const a = new Audio(HIT_SOUNDS[k]);
  a.volume = 0.85;
  hitPads[k] = a;
}
function playPuckHit(kind) {
  const base = hitPads[kind] || hitPads.wrist;
  const a = base.cloneNode(true);
  a.volume = base.volume;
  a.play().catch(() => {});
}

const HIT_VOL = { pass: 0.55, wrist: 0.6, slap: 0.7, clear: 0.65 };
const HIT_RATE = { pass: 1.0, wrist: 1.05, slap: 0.92, clear: 0.95 };

let puckHitPool = [];
let puckHitIndex = 0;

try {
  if (PUCK_HIT_URL) {
    const N = 5; // small pool so rapid shots don't cut off
    for (let i = 0; i < N; i++) {
      const a = new Audio(PUCK_HIT_URL);
      a.volume = 0.6;
      puckHitPool.push(a);
    }
  }
} catch (e) {}

function playPuckHit(kind = "pass") {
  if (puckHitPool.length) {
    const a = puckHitPool[puckHitIndex++ % puckHitPool.length];
    a.currentTime = 0;
    a.volume = HIT_VOL[kind] ?? 0.6;
    a.playbackRate = HIT_RATE[kind] ?? 1.0;
    a.play().catch(puckHitFallback);
  } else {
    puckHitFallback();
  }
}

// Tiny synthesized fallback if the file can't play (blocked/missing)
function puckHitFallback() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    const g = ac.createGain();
    const o1 = ac.createOscillator();
    const o2 = ac.createOscillator();
    o1.type = "triangle";
    o1.frequency.value = 90; // body thump
    o2.type = "square";
    o2.frequency.value = 180; // stick snap
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.08);
    o1.connect(g);
    o2.connect(g);
    g.connect(ac.destination);
    o1.start();
    o2.start();
    o1.stop(ac.currentTime + 0.09);
    o2.stop(ac.currentTime + 0.09);
  } catch {}
}

const GOAL_HORN_URL = "sounds/goal-horn.wav";
let goalHorn = null;
try {
  if (GOAL_HORN_URL) {
    goalHorn = new Audio(GOAL_HORN_URL);
    goalHorn.volume = 0.55;
  }
} catch (e) {}

const goalFX = { t: 0, dur: 1.6, hornPlayed: false, sweep: 0 };
function beepHornFallback() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    const ac = new AC();
    const o1 = ac.createOscillator();
    const o2 = ac.createOscillator();
    const g = ac.createGain();
    o1.type = "square";
    o1.frequency.value = 130;
    o2.type = "sawtooth";
    o2.frequency.value = 98;
    g.gain.setValueAtTime(0.0001, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.2);
    o1.connect(g);
    o2.connect(g);
    g.connect(ac.destination);
    o1.start();
    o2.start();
    o1.stop(ac.currentTime + 1.25);
    o2.stop(ac.currentTime + 1.25);
  } catch {}
}

const horn = new Audio(GOAL_HORN_URL);

function playGoalHorn() {
  horn.currentTime = 0;
  horn.volume = 0.85; // tweak to taste
  horn.play().catch(() => {}); // ignore autoplay block
}

function startGoalFX() {
  goalFX.t = goalFX.dur;
  goalFX.hornPlayed = false;
  goalFX.sweep = 0;
  // Try real horn, fall back to synth if blocked/missing
  if (goalHorn) {
    try {
      goalHorn.currentTime = 0;
      goalHorn.play().catch(beepHornFallback);
    } catch {
      beepHornFallback();
    }
  } else {
    beepHornFallback();
  }
}

function drawGoalFX() {
  if (goalFX.t <= 0) return;
  const gRect = LEVELS[levelIndex].goal;
  const progress = 1 - goalFX.t / goalFX.dur;

  ctx.save();

  // A) quick white strobe (adds energy)
  const strobe = Math.max(0, Math.sin(progress * Math.PI * 12)) * 0.12;
  if (strobe > 0.002) {
    ctx.fillStyle = `rgba(255,255,255,${strobe})`;
    ctx.fillRect(0, 0, W, H);
  }

  // B) pulsing red lamp glow behind the net
  ctx.globalCompositeOperation = "lighter";
  const cx = gRect.x + gRect.w * 0.5 + 6;
  [gRect.y + 10, gRect.y + gRect.h - 10].forEach((cy, i) => {
    const r = 120 + 50 * Math.sin(progress * 6 + i);
    const a = 0.18 + 0.12 * Math.sin(progress * 10 + i);
    const rad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    rad.addColorStop(0, `rgba(255,56,56,${a})`);
    rad.addColorStop(1, `rgba(255,56,56,0)`);
    ctx.fillStyle = rad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // C) sweeping spotlights from the rafters
  const sweep = progress * Math.PI * 2;
  const origins = [
    { x: W * 0.2, y: -60, phase: 0 },
    { x: W * 0.8, y: -60, phase: Math.PI },
  ];
  origins.forEach((o) => {
    const ang = Math.sin(sweep + o.phase) * 0.6 + Math.PI / 2;
    const len = Math.max(W, H) * 1.2;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(ang);
    const beamW = 220;
    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0.0, "rgba(255,255,255,0.22)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.12)");
    grad.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, -beamW * 0.2);
    ctx.lineTo(len, -beamW * 0.5);
    ctx.lineTo(len, beamW * 0.5);
    ctx.lineTo(0, beamW * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  });

  // D) big GOAL! text with glow/wobble
  ctx.globalCompositeOperation = "source-over";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 92px system-ui, Segoe UI, Roboto`;
  const wob = Math.sin(progress * 10) * 6;
  const ty = H * 0.22 + wob;

  ctx.lineWidth = 24;
  ctx.strokeStyle = "rgba(255,70,70,0.35)";
  ctx.strokeText("GOAL!", W / 2, ty);
  ctx.lineWidth = 14;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.strokeText("GOAL!", W / 2, ty);
  ctx.fillStyle = "#ffefef";
  ctx.fillText("GOAL!", W / 2, ty);

  ctx.restore();
}

// ---- Input ----
let mouse = { x: 0, y: 0, down: false, aiming: false };
canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
  mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
});
canvas.addEventListener("mousedown", (e) => {
  const r = canvas.getBoundingClientRect();
  const mx = (e.clientX - r.left) * (canvas.width / r.width);
  const my = (e.clientY - r.top) * (canvas.height / r.height);

  // If a timing minigame is up, any click locks it in.
  if (state.skill.active) {
    resolveSkill();
    return;
  }

  // 1) Try jumbotron buttons first
  if (HUD_HITS.bounds && ptInRect(mx, my, HUD_HITS.bounds)) {
    if (ptInRect(mx, my, HUD_HITS.pass)) armShot("pass");
    else if (ptInRect(mx, my, HUD_HITS.wrist)) armShot("wrist");
    else if (ptInRect(mx, my, HUD_HITS.slap) && state.slapsLeft > 0)
      armShot("slap");
    else if (ptInRect(mx, my, HUD_HITS.clear) && state.clearsLeft > 0)
      armShot("clear");
    return;
  }

  // 2) Otherwise proceed with aiming logic
  mouse.down = true;
  mouse.x = mx;
  mouse.y = my;
  const d = dist(mouse.x, mouse.y, state.puck.x, state.puck.y);
  if (d <= PUCK_R + 14 && speed(state.puck) < 3) {
    mouse.aiming = true;
    state.aiming = true;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (mouse.aiming) {
    const dx = state.puck.x - mouse.x,
      dy = state.puck.y - mouse.y;
    const len = Math.hypot(dx, dy);
    if (len > 4) {
      const S = SHOTS[state.shotMode];
      const dirx = dx / len,
        diry = dy / len;
      const v = Math.min(S.maxPower, S.powerScale * len);

      if (S.needsSkill) {
        // Defer direction within the cone to the timing minigame.
        startSkillCheck({ dirx, diry, v, S, mode: state.shotMode });
      } else {
        // Immediate shots (Pass, Wrist) — you can still give Wrist a tiny cone (already tiny).
        launchShot(dirx, diry, v, S, state.shotMode);
      }
    }
  }
  mouse.down = false;
  mouse.aiming = false;
  state.aiming = false;
});

addEventListener("keydown", (e) => {
  // Resolve skill check with keyboard too
  if (state.skill.active) {
    if (e.key === " " || e.key === "Enter") {
      resolveSkill();
      return;
    }
    if (e.key === "Escape") {
      // worst case
      const pos = state.skill.pos >= 0 ? 1 : -1;
      resolveSkill(pos);
      return;
    }
  }

  if (e.key === "r" || e.key === "R") resetLevel();
  if (e.key === "n" || e.key === "N") nextLevel();

  if (e.key === "1") {
    state.shotMode = "pass";
    banner.text = "Shot armed: Pass";
    banner.t = 0.8;
    updateShotButtons();
  }
  if (e.key === "2") {
    if (state.slapsLeft > 0) {
      state.shotMode = "slap";
      banner.text = `Shot armed: Slapshot (${state.slapsLeft} left)`;
    } else {
      banner.text = "No slapshots left this level";
    }
    banner.t = 0.9;
    updateShotButtons();
  }
  if (e.key === "3") {
    if (state.clearsLeft > 0) {
      state.shotMode = "clear";
      banner.text = `Shot armed: Clear (${state.clearsLeft} left)`;
    } else {
      banner.text = "No clears left this level";
    }
    banner.t = 0.9;
    updateShotButtons();
  }
  if (e.key === "4") {
    state.shotMode = "wrist";
    banner.text = "Shot armed: Wrist Shot";
    banner.t = 0.8;
    // updateShotButtons() only knows pass/slap/clear; it's fine to leave it.
  }

  if (e.key === "h" || e.key === "H") {
    state.hudPinned = !state.hudPinned;
    banner.text = state.hudPinned ? "HUD pinned" : "HUD auto-hide";
    banner.t = 0.9;
  }
});

// ---- Helpers ----
function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}
function speed(p) {
  return Math.hypot(p.vx, p.vy);
}
function reflectVelocity(vx, vy, nx, ny, e) {
  const dot = vx * nx + vy * ny;
  return { vx: vx - (1 + e) * dot * nx, vy: vy - (1 + e) * dot * ny };
}
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function collideCircleRect(puck, rect, restitution) {
  const cx = puck.x,
    cy = puck.y,
    r = PUCK_R;
  const rx = rect.x,
    ry = rect.y,
    rw = rect.w,
    rh = rect.h;
  const nx = clamp(cx, rx, rx + rw),
    ny = clamp(cy, ry, ry + rh);
  const dx = cx - nx,
    dy = cy - ny,
    d2 = dx * dx + dy * dy;
  if (d2 < r * r) {
    const d = Math.sqrt(d2) || 0.0001,
      nxn = dx / d,
      nyn = dy / d;
    const overlap = r - d;
    puck.x += nxn * overlap;
    puck.y += nyn * overlap;
    const v = reflectVelocity(puck.vx, puck.vy, nxn, nyn, restitution);
    puck.vx = v.vx;
    puck.vy = v.vy;
    return true;
  }
  return false;
}
function collideBoards(p) {
  if (p.y - PUCK_R < WALL) {
    p.y = WALL + PUCK_R;
    p.vy = -p.vy * RESTITUTION_WALL;
  }
  if (p.y + PUCK_R > H - WALL) {
    p.y = H - WALL - PUCK_R;
    p.vy = -p.vy * RESTITUTION_WALL;
  }
  if (p.x - PUCK_R < WALL) {
    p.x = WALL + PUCK_R;
    p.vx = -p.vx * RESTITUTION_WALL;
  }
  const g = LEVELS[levelIndex].goal;
  const puckTop = p.y - PUCK_R,
    puckBot = p.y + PUCK_R;
  const withinGoalMouth = puckBot > g.y && puckTop < g.y + g.h;
  if (!withinGoalMouth && p.x + PUCK_R > W - WALL) {
    p.x = W - WALL - PUCK_R;
    p.vx = -p.vx * RESTITUTION_WALL;
  }
}
function launchShot(dirx, diry, v, S, mode) {
  playPuckHit(mode);
  state.puck.vx = dirx * v;
  state.puck.vy = diry * v;
  state.puck.friction = S.friction;

  strokes++;
  state.swing.t = 0.2;
  const uAngle = Math.atan2(diry, dirx);
  state.swing.angle = uAngle - Math.PI;
  state.lastShotAngle = state.swing.angle;

  // consume one-time shots
  if (mode === "slap") {
    state.slapsLeft--;
    state.shotMode = "pass";
    banner.text = "Slapshot!";
    banner.t = 0.8;
    updateShotButtons();
  } else if (mode === "clear") {
    state.clearsLeft--;
    state.shotMode = "pass";
    banner.text = "Clear!";
    banner.t = 0.8;
    updateShotButtons();
  }
}

function startSkillCheck(pending) {
  state.skill.active = true;
  state.skill.phase = 0;
  state.skill.pos = 0;
  state.skill.pending = pending;
  banner.text = "Timing! Click the center for accuracy";
  banner.t = 0.9;
}

function resolveSkill(posOverride = null) {
  if (!state.skill.active || !state.skill.pending) return;
  const pos = posOverride ?? state.skill.pos; // -1..1
  const err = Math.min(1, Math.abs(pos)); // 0 best … 1 worst
  const sign = pos >= 0 ? 1 : -1; // left/right side
  const { dirx, diry, v, S, mode } = state.skill.pending;

  const delta = (S.cone || 0) * err * sign; // angle offset
  const r = rotate2D(dirx, diry, delta);
  launchShot(r.x, r.y, v, S, mode);

  state.skill.active = false;
  state.skill.pending = null;
}

// Did the puck cross the vertical goal line this frame?
function crossedGoalLine(prevX, prevY, x, y) {
  const g = LEVELS[levelIndex].goal;
  if (x === prevX) return false; // no horizontal movement
  const t = (g.x - prevX) / (x - prevX); // param where path hits x = g.x
  if (t < 0 || t > 1) return false; // didn’t cross between frames
  const yAt = prevY + t * (y - prevY); // y at the crossing
  return yAt + PUCK_R > g.y && yAt - PUCK_R < g.y + g.h; // overlaps goal mouth vertically
}

function inGoal(p) {
  const g = LEVELS[levelIndex].goal;
  const crossedLine = p.x > g.x; // center has passed the goal-line plane
  const overlapsMouthY = p.y + PUCK_R > g.y && p.y - PUCK_R < g.y + g.h;
  return crossedLine && overlapsMouthY;
}

// ---- Loop ----
let last = performance.now();
let banner = { t: 0, text: "" };

function nextLevel() {
  levelIndex = (levelIndex + 1) % LEVELS.length;
  resetLevel(levelIndex);
}
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.033);
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
function onGoalScored() {
  if (state.phase === "scored") return;

  state.phase = "scored";
  const L = LEVELS[levelIndex];
  const total = strokes;
  best[levelIndex] = Math.min(best[levelIndex] ?? Infinity, total);
  banner.text = `GOAL! Strokes: ${total}  ${
    total <= L.par ? "⛳ Under Par!" : ""
  }`;
  banner.t = 1.2;

  // settle puck in mouth
  state.puck.x = L.goal.x + PUCK_R + 6;
  state.puck.vx = state.puck.vy = 0;

  startGoalFX();

  // let the celebration run before advancing
  setTimeout(() => {
    nextLevel();
    state.phase = "play";
  }, goalFX.dur * 1000);
}

function update(dt) {
  const L = LEVELS[levelIndex];

  // Skill check marker oscillation
  if (state.skill.active) {
    state.skill.phase += dt * (state.skill.speed || 6.5);
    state.skill.pos = Math.sin(state.skill.phase); // -1..1
  }

  // Obstacles and swing timer
  for (const o of L.obstacles) if (o.update) o.update(dt);
  if (state.swing.t > 0) state.swing.t -= dt;

  // Puck motion + friction
  const p = state.puck,
    sp = speed(p);
  const prevX = p.x,
    prevY = p.y;
  if (sp > 0.1) {
    const dirx = p.vx / sp,
      diry = p.vy / sp;
    const dec = (state.puck.friction || SHOTS.pass.friction) * dt;
    const newSpeed = Math.max(0, sp - dec);
    p.vx = dirx * newSpeed;
    p.vy = diry * newSpeed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  } else {
    p.vx = p.vy = 0;
  }

  collideBoards(p);

  // ✅ SINGLE goal check — let onGoalScored() handle everything
  if (
    state.phase !== "scored" &&
    (crossedGoalLine(prevX, prevY, p.x, p.y) || inGoal(p))
  ) {
    onGoalScored();
    return; // stop this frame after triggering the celebration
  }

  // --- Jumbotron auto-hide control with hysteresis & cooldown (puck-only)
  if (HUD_BEHAVIOR.autoHide && !state.hudPinned) {
    const needHide = puckOverlapsHud(HUD_PROX.hide);
    const canShow = !puckOverlapsHud(HUD_PROX.show);

    if (hudVisible) {
      if (needHide) {
        hudVisible = false;
        hudTargetY = HUD_POS.hiddenY;
        hudRevealT = HUD_BEHAVIOR.showDelay;
      } else {
        hudTargetY = HUD_POS.shownY;
      }
    } else {
      if (hudRevealT > 0) hudRevealT -= dt;
      if (hudRevealT <= 0 && canShow) {
        hudVisible = true;
        hudTargetY = HUD_POS.shownY;
      } else {
        hudTargetY = HUD_POS.hiddenY;
      }
    }
  } else {
    hudVisible = true;
    hudTargetY = HUD_POS.shownY;
  }

  // Smooth slide
  const k = Math.min(1, dt * (HUD_BEHAVIOR.animSpeed || 10));
  hudY += (hudTargetY - hudY) * k;

  // Collisions
  for (const o of L.obstacles) collideCircleRect(p, o, RESTITUTION_OBS);

  // Goalie update + collision
  goalie.update(dt);
  collideCircleRect(
    p,
    {
      x: goalie.x - goalie.w / 2,
      y: goalie.y - goalie.h / 2,
      w: goalie.w,
      h: goalie.h,
    },
    0.25
  );

  // ❌ Remove the second goal check block entirely (it’s no longer needed)

  // Goal FX timer
  if (goalFX.t > 0) {
    goalFX.t -= dt;
    goalFX.sweep += dt;
  }
}

function render() {
  const L = LEVELS[levelIndex];
  ctx.clearRect(0, 0, W, H);
  drawIceBackground();
  drawVignette();
  drawGoalNet(L.goal);
  drawGoalFX();

  for (const o of L.obstacles) drawObstacle(o);
  if (DEBUG_GOAL) drawGoalDebug(L.goal);

  if (mouse.aiming && speed(state.puck) < 3) drawAimGuide();
  drawSkater(state.puck.x, state.puck.y);
  drawPuck(state.puck);
  drawGoalie(goalie);
  drawHUD();
  drawSkillCheck();
  if (banner.t > 0) {
    banner.t -= 1 / 60;
    ctx.save();
    ctx.globalAlpha = Math.min(1, banner.t);
    ctx.fillStyle = "#0b1222d0";
    ctx.fillRect(W / 2 - 220, 30, 440, 44);
    ctx.fillStyle = "#dff0ff";
    ctx.font = "700 20px system-ui,Segoe UI,Roboto";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(banner.text, W / 2, 52);
    ctx.restore();
  }
}

// ---- Drawing helpers ----
function drawSkillCheck() {
  if (!state.skill.active || !state.skill.pending) return;

  const barW = 260,
    barH = 16;
  const x = W / 2 - barW / 2;
  const y = 80; // below jumbotron

  ctx.save();
  // bezel
  roundRectPath(x - 8, y - 12, barW + 16, barH + 24, 10);
  ctx.fillStyle = "rgba(10,19,38,0.9)";
  ctx.fill();
  ctx.strokeStyle = "#2c3e6b";
  ctx.lineWidth = 2;
  ctx.stroke();

  // bar
  roundRectPath(x, y, barW, barH, barH / 2);
  const g = ctx.createLinearGradient(x, y, x + barW, y);
  g.addColorStop(0, "#0f1b32");
  g.addColorStop(0.5, "#6dc1ff");
  g.addColorStop(1, "#0f1b32");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = "#8fb1ff";
  ctx.stroke();

  // center line
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x + barW / 2, y - 6);
  ctx.lineTo(x + barW / 2, y + barH + 6);
  ctx.stroke();
  ctx.setLineDash([]);

  // slider dot at pos (-1..1)
  const px = x + (state.skill.pos * 0.5 + 0.5) * barW;
  ctx.fillStyle = "#eaf3ff";
  ctx.beginPath();
  ctx.arc(px, y + barH / 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // caption
  ctx.fillStyle = "#cfe2ff";
  ctx.font = "600 13px system-ui, Segoe UI, Roboto";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText(
    "Accuracy – click when the dot hits the center",
    x + barW / 2,
    y - 6
  );

  ctx.restore();
}

function drawGoalNet(g) {
  ctx.save();

  // soft floor shadow (purely cosmetic)
  ctx.fillStyle = NET_STYLE.shadow;
  ctx.beginPath();
  ctx.ellipse(
    g.x + g.w * 0.72,
    g.y + g.h * 0.5,
    g.w * 0.9,
    g.h * 0.55,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  // light tint inside the mouth so the mesh pops
  ctx.fillStyle = NET_STYLE.backTint;
  ctx.fillRect(g.x, g.y, g.w, g.h);

  // mesh that matches the exact goal rect
  ctx.globalAlpha = NET_STYLE.meshAlpha;
  ctx.strokeStyle = NET_STYLE.mesh;
  ctx.lineWidth = 1;
  for (let y = g.y; y <= g.y + g.h; y += NET_STYLE.cell) {
    ctx.beginPath();
    ctx.moveTo(g.x, y);
    ctx.lineTo(g.x + g.w, y);
    ctx.stroke();
  }
  for (let x = g.x; x <= g.x + g.w; x += NET_STYLE.cell) {
    ctx.beginPath();
    ctx.moveTo(x, g.y);
    ctx.lineTo(x, g.y + g.h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // red frame (front post on the goal line, back post, crossbar & base)
  const t = NET_STYLE.postWidth;
  ctx.fillStyle = NET_STYLE.post;

  // front post sits right on the goal line x = g.x
  ctx.fillRect(g.x - t, g.y - t, t, g.h + t * 2);
  // back post at the rear of the mouth
  ctx.fillRect(g.x + g.w, g.y - t, t, g.h + t * 2);
  // crossbar and base
  ctx.fillRect(g.x - t, g.y - t, g.w + t * 2, t);
  ctx.fillRect(g.x - t, g.y + g.h, g.w + t * 2, t);

  ctx.restore();
}

function drawObstacle(o) {
  ctx.fillStyle = "#2b426f";
  ctx.strokeStyle = "#8fb1ff";
  ctx.lineWidth = 1.5;
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.strokeRect(o.x, o.y, o.w, o.h);
}

function drawPuck(p) {
  ctx.fillStyle = "rgba(0,0,0,.25)";
  ctx.beginPath();
  ctx.ellipse(p.x, p.y + 8, PUCK_R * 0.9, PUCK_R * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "#22252b";
  ctx.arc(p.x, p.y, PUCK_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#5a6475";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(p.x, p.y, PUCK_R - 4, 0, Math.PI * 2);
  ctx.stroke();
}
function drawAimGuide() {
  const S = SHOTS[state.shotMode];
  const pts = predictShotPath(S);
  if (!pts || pts.length < 2) return;

  // dashed predicted path
  ctx.strokeStyle = S.color;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.setLineDash([]);

  // power bar
  const px = state.puck.x,
    py = state.puck.y;
  const dx = px - mouse.x,
    dy = py - mouse.y,
    len = Math.hypot(dx, dy);
  const pwr = Math.min(1, len / (S.maxPower / S.powerScale));
  ctx.fillStyle = "#2a3757";
  ctx.fillRect(px - 40, py - 46, 80, 8);
  ctx.fillStyle = S.color;
  ctx.fillRect(px - 40, py - 46, 80 * pwr, 8);
  ctx.strokeStyle = "#8bb9ff";
  ctx.strokeRect(px - 40, py - 46, 80, 8);

  // accuracy cone (if any)
  if (S.cone > 0) {
    const ux = dx / (len || 1),
      uy = dy / (len || 1);
    const L = 160; // triangle length
    const left = rotate2D(ux, uy, -S.cone);
    const right = rotate2D(ux, uy, S.cone);

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = S.color;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + left.x * L, py + left.y * L);
    ctx.lineTo(px + right.x * L, py + right.y * L);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawIceBackground() {
  if (!ASSETS.bg) {
    ctx.fillStyle = "#cfe0ff";
    ctx.fillRect(0, 0, W, H);
    return;
  }
  const img = ASSETS.bg;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;

  // COVER: fill canvas without gutters (may crop a little)
  const s = Math.max(W / iw, H / ih);
  const dw = iw * s,
    dh = ih * s;
  const dx = (W - dw) * 0.5,
    dy = (H - dh) * 0.5;

  // optional: smoother scaling
  // ctx.imageSmoothingEnabled = true;

  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawGoalDebug(g) {
  ctx.save();
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 2;
  ctx.strokeRect(g.x, g.y, g.w, g.h); // goal mouth
  ctx.fillStyle = "rgba(0,255,136,0.4)";
  ctx.fillRect(g.x - 1, WALL, 2, H - 2 * WALL); // goal line x = g.x
  ctx.restore();
}

function drawVignette() {
  ctx.save();
  const g = ctx.createRadialGradient(
    W / 2,
    H / 2,
    Math.min(W, H) * 0.25,
    W / 2,
    H / 2,
    Math.max(W, H) * 0.7
  );
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function drawSkater(x, y) {
  // Pool-style: place skater behind the puck as you aim
  let sx = x,
    sy = y,
    angle = state.lastShotAngle;
  if (mouse.aiming && speed(state.puck) < 3) {
    const { ux, uy } = aimVector();
    const offset = 42; // distance the skater sits behind the puck while aiming
    sx = x - ux * offset;
    sy = y - uy * offset;
    angle = Math.atan2(y - mouse.y, x - mouse.x) - Math.PI; // face shot direction
  }

  // Subtle whole-sprite swing (keep small since it's a single PNG)
  const t = clamp(state.swing.t / 0.2, 0, 1);
  const swing = -0.15 + 0.3 * t;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(angle + swing + SKATER_SPRITE.baseRotation);

  if (ASSETS.player) {
    const img = ASSETS.player;
    const s = SKATER_SPRITE.scale;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const ox = SKATER_SPRITE.anchorX * s; // offset so anchor sits at (0,0)
    const oy = SKATER_SPRITE.anchorY * s;

    // Optional: ensure smooth scaling
    // ctx.imageSmoothingEnabled = true;

    ctx.drawImage(img, -ox, -oy, iw * s, ih * s);
  } else {
    // Fallback if image hasn’t loaded yet (tiny dot)
    ctx.fillStyle = "#b23b3b";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawGoalie(g) {
  ctx.save();
  ctx.translate(g.x, g.y); // our goalie.x/y is the center
  ctx.rotate(GOALIE_SPRITE.baseRotation);

  if (ASSETS.goalie) {
    const img = ASSETS.goalie;
    const s = GOALIE_SPRITE.scale;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const ox = iw * GOALIE_SPRITE.anchorFx * s;
    const oy = ih * GOALIE_SPRITE.anchorFy * s;

    // Render PNG centered on goalie.x/y
    ctx.drawImage(img, -ox, -oy, iw * s, ih * s);
  } else {
    // (Optional) very small fallback so we still see something if image hasn't loaded yet
    ctx.fillStyle = "#83a8ff";
    ctx.fillRect(-g.w / 2, -g.h / 2, g.w, g.h);
  }

  ctx.restore();
}

function drawHUD() {
  const L = LEVELS[levelIndex];

  // --- Layout
  const w = Math.min(W - WALL * 2 - 24, JUMBOTRON.maxWidth);
  const h = JUMBOTRON.height;
  const x = (W - w) / 2;
  const y = hudY;
  // if fully hidden, swallow clicks and bail
  if (y <= -(h - 2)) {
    HUD_HITS.bounds =
      HUD_HITS.pass =
      HUD_HITS.wrist =
      HUD_HITS.slap =
      HUD_HITS.clear =
        null;
    return;
  }

  // record HUD bounds for click swallowing
  HUD_HITS.bounds = { x, y, w, h };

  // --- Hanging cables
  ctx.save();
  ctx.strokeStyle = JUMBOTRON.cable;
  ctx.lineWidth = 3;
  const hook = 14;
  ctx.beginPath();
  ctx.moveTo(x + hook, 0);
  ctx.lineTo(x + hook, y);
  ctx.moveTo(x + w - hook, 0);
  ctx.lineTo(x + w - hook, y);
  ctx.stroke();

  // --- Body (rounded rect with vertical gradient)
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, JUMBOTRON.bodyTop);
  g.addColorStop(1, JUMBOTRON.bodyBot);
  roundRectPath(x, y, w, h, JUMBOTRON.corner);
  ctx.fillStyle = g;
  ctx.fill();

  // Rim / bezel
  ctx.strokeStyle = JUMBOTRON.rim;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Accent strip
  ctx.fillStyle = JUMBOTRON.accent;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(x + 10, y + h - 6, w - 20, 3);
  ctx.globalAlpha = 1;

  // Sheen + LEDs
  ctx.fillStyle = JUMBOTRON.glass;
  roundRectPath(x + 6, y + 6, w - 12, (h - 12) * 0.45, JUMBOTRON.corner * 0.6);
  ctx.fill();
  ctx.fillStyle = JUMBOTRON.led;
  for (let i = x + 16; i < x + w - 16; i += 18) {
    ctx.beginPath();
    ctx.arc(i, y + 8, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Text lines
  ctx.fillStyle = JUMBOTRON.text;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 17px system-ui, Segoe UI, Roboto";
  ctx.fillText(
    `Level ${levelIndex + 1} / ${LEVELS.length}  ·  Par ${L.par}`,
    x + w / 2,
    y + 24
  );

  ctx.font = "600 14px system-ui, Segoe UI, Roboto";
  ctx.fillStyle = JUMBOTRON.subText;
  const bestTxt =
    best[levelIndex] !== undefined ? `Best: ${best[levelIndex]}` : "Best: –";
  ctx.fillText(
    `Strokes: ${strokes}  ·  ${bestTxt}  ·  Goalie: ON`,
    x + w / 2,
    y + 48
  );

  // --- Button row (centered pills)
  const labels = [
    {
      key: "pass",
      text: "Pass",
      color: SHOTS.pass.color,
      disabled: false,
      armed: state.shotMode === "pass",
    },
    {
      key: "wrist",
      text: "Wrist Shot",
      color: SHOTS.wrist.color,
      disabled: false,
      armed: state.shotMode === "wrist",
    },
    {
      key: "slap",
      text: `Slapshot (${state.slapsLeft})`,
      color: SHOTS.slap.color,
      disabled: state.slapsLeft <= 0,
      armed: state.shotMode === "slap",
    },
    {
      key: "clear",
      text: `Clear (${state.clearsLeft})`,
      color: SHOTS.clear.color,
      disabled: state.clearsLeft <= 0,
      armed: state.shotMode === "clear",
    },
  ];

  ctx.font = "600 13px system-ui, Segoe UI, Roboto";
  const padX = 16,
    btnH = 28,
    gap = 10;
  const widths = labels.map(
    (l) => Math.ceil(ctx.measureText(l.text).width) + padX * 2
  );
  const totalW = widths.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
  let bx = x + (w - totalW) / 2;
  const by = y + h - 18 - btnH; // a bit above the accent strip

  // draw & record hit rects
  const hits = {};
  labels.forEach((l, i) => {
    const bw = widths[i];
    drawPill(bx, by, bw, btnH, l.color, l.armed, l.disabled, l.text);
    hits[l.key] = { x: bx, y: by, w: bw, h: btnH };
    bx += bw + gap;
  });
  HUD_HITS.pass = hits.pass;
  HUD_HITS.wrist = hits.wrist;
  HUD_HITS.slap = hits.slap;
  HUD_HITS.clear = hits.clear;

  ctx.restore();
}

// pill helper used by drawHUD()
function drawPill(x, y, w, h, color, armed, disabled, label) {
  ctx.save();
  const r = h / 2;
  roundRectPath(x, y, w, h, r);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, armed ? "#183055" : "#12213c");
  g.addColorStop(1, armed ? "#132746" : "#0b1429");
  ctx.fillStyle = g;
  ctx.fill();

  ctx.lineWidth = armed ? 3 : 2;
  ctx.strokeStyle = color;
  ctx.stroke();

  if (disabled) ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#eaf3ff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 13px system-ui, Segoe UI, Roboto";
  ctx.fillText(label, x + w / 2, y + h / 2 + 0.5);
  ctx.restore();
}

// helper: build a rounded-rect path (used above)
function roundRectPath(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
