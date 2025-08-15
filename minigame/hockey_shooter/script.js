// Rink Putt — Tiny Hockey Minigolf
// - Proper rink lines/crease/trapezoid
// - Skater at the puck with swing animation
// - Goalie patrol + simple tracking, puck collisions
// - Optional PNGs for your art (PLAYER_IMG_URL / GOALIE_IMG_URL)

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const W = canvas.width,
  H = canvas.height;
const WALL = 22;
const PUCK_R = 12;
const FRICTION = 520;
const RESTITUTION_WALL = 0.82;
const RESTITUTION_OBS = 0.6;
const MAX_POWER = 260;
const POWER_SCALE = 5.0;

// --- Use your own art by setting these to URLs or data-URLs
const PLAYER_IMG_URL = "images/starter-skater.png";
const GOALIE_IMG_URL = "images/starter-goalie.png";

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

// Where the image is “held” when rotated: the point that should sit over the puck.
// Tweak anchorX/anchorY if the blade doesn't line up perfectly in your PNG.
const SKATER_SPRITE = {
  scale: 0.1, // size on canvas (adjust to taste)
  anchorX: 88, // pixels from the image's left to the blade/impact point
  anchorY: 54, // pixels from the image's top to the blade/impact point
  baseRotation: 0, // radians. If your PNG faces up, use -Math.PI/2; if left, use Math.PI
};
// Goalie PNG render settings (center-anchored)
const GOALIE_SPRITE = {
  scale: 0.12, // size on canvas — tweak to fit your rink
  anchorFx: 0.5, // 0..1: horizontal anchor (0.5 = image center)
  anchorFy: 0.5, // 0..1: vertical anchor (0.5 = image center)
  baseRotation: Math.PI, // make the goalie face LEFT toward the shooter
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
    goal: { x: W - WALL - 30, y: H * 0.45 - 50, w: 30, h: 100 },
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
    goal: { x: W - WALL - 30, y: H * 0.5 - 55, w: 30, h: 110 },
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
    goal: { x: W - WALL - 30, y: H * 0.33 - 45, w: 30, h: 90 },
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
const LEVELS = [level1(), level2(), level3()];
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
  puck: { x: 0, y: 0, vx: 0, vy: 0 },
  aiming: false,
  canShoot: true,
  swing: { t: 0, angle: 0 },
  lastShotAngle: 0,
  phase: "play", // "play" | "scored"
};

// Goalie
const goalie = {
  x: 0,
  y: 0,
  w: 26,
  h: 90,
  vy: 0,
  maxSpeed: 260,
  reset() {
    const g = LEVELS[levelIndex].goal;
    this.x = g.x - 12;
    this.y = g.y + g.h / 2;
  },
  update(dt) {
    const g = LEVELS[levelIndex].goal;
    const mouthTop = g.y + 10,
      mouthBot = g.y + g.h - 10;
    const p = state.puck;
    const approaching = p.vx > 60 && p.x > W * 0.55;
    let targetY;
    if (approaching)
      targetY = clamp(p.y, mouthTop + this.h / 2, mouthBot - this.h / 2);
    else {
      const t = performance.now() / 1000;
      targetY = g.y + g.h / 2 + Math.sin(t * 1.3) * (g.h / 2 - this.h / 2 - 12);
      targetY = clamp(targetY, mouthTop + this.h / 2, mouthBot - this.h / 2);
    }
    const dy = targetY - this.y;
    this.vy = clamp(dy * 4, -this.maxSpeed, this.maxSpeed);
    this.y += this.vy * dt;
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
}
resetLevel(0);

// ---- Input ----
let mouse = { x: 0, y: 0, down: false, aiming: false };
canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
  mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
});
canvas.addEventListener("mousedown", (e) => {
  mouse.down = true;
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
      const dirx = dx / len,
        diry = dy / len;
      const v = Math.min(MAX_POWER, POWER_SCALE * len);
      state.puck.vx = dirx * v;
      state.puck.vy = diry * v;
      strokes++;
      state.swing.t = 0.2;
      const uAngle = Math.atan2(dy, dx); // shot direction (mouse -> puck)
      state.swing.angle = uAngle - Math.PI;
      state.lastShotAngle = state.swing.angle;
    }
  }
  mouse.down = false;
  mouse.aiming = false;
  state.aiming = false;
});
addEventListener("keydown", (e) => {
  if (e.key === "r" || e.key === "R") resetLevel();
  if (e.key === "n" || e.key === "N") nextLevel();
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
function inGoal(p) {
  const g = LEVELS[levelIndex].goal;
  return p.x + PUCK_R > g.x && p.y > g.y && p.y < g.y + g.h;
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

function update(dt) {
  const L = LEVELS[levelIndex];

  // Obstacles and swing timer
  for (const o of L.obstacles) if (o.update) o.update(dt);
  if (state.swing.t > 0) state.swing.t -= dt;

  // Puck motion + friction
  const p = state.puck,
    sp = speed(p);
  if (sp > 0.1) {
    const dirx = p.vx / sp,
      diry = p.vy / sp;
    const dec = FRICTION * dt,
      newSpeed = Math.max(0, sp - dec);
    p.vx = dirx * newSpeed;
    p.vy = diry * newSpeed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  } else {
    p.vx = p.vy = 0;
  }

  if (state.phase === "scored") {
    // freeze puck and goalie while banner fades
    state.puck.vx = state.puck.vy = 0;
    return; // skip the rest of update during transition
  }

  // Collisions
  collideBoards(p);
  for (const o of L.obstacles) collideCircleRect(p, o, RESTITUTION_OBS);

  // Goalie update + collision
  goalie.update(dt);
  // Convert center -> top-left for the collider
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

  // Goal check
  if (inGoal(p) && state.phase !== "scored") {
    state.phase = "scored";
    const total = strokes;
    best[levelIndex] = Math.min(best[levelIndex] ?? Infinity, total);
    banner.text = `GOAL! Strokes: ${total}  ${
      total <= L.par ? "⛳ Under Par!" : ""
    }`;
    banner.t = 1.2;

    // place puck safely inside net and stop it
    p.x = LEVELS[levelIndex].goal.x + PUCK_R + 6;
    p.vx = p.vy = 0;

    setTimeout(() => {
      nextLevel();
      state.phase = "play";
    }, 900);
  }
}

function render() {
  const L = LEVELS[levelIndex];
  ctx.clearRect(0, 0, W, H);
  drawRink(L.goal);
  for (const o of L.obstacles) drawObstacle(o);
  drawGoal(L.goal);
  if (mouse.aiming && speed(state.puck) < 3) drawAimGuide();
  drawSkater(state.puck.x, state.puck.y);
  drawPuck(state.puck);
  drawGoalie(goalie);
  drawHUD();
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
function drawRink(goal) {
  // subtle ice lines
  ctx.save();
  ctx.globalAlpha = 0.08;
  for (let y = WALL; y < H - WALL; y += 8) {
    ctx.fillStyle = "#cfe8ff";
    ctx.fillRect(WALL, y, W - 2 * WALL, 1);
  }
  ctx.restore();
  // boards
  ctx.fillStyle = "#1b2a45";
  ctx.fillRect(0, 0, W, WALL);
  ctx.fillRect(0, H - WALL, W, WALL);
  ctx.fillRect(0, 0, WALL, H);
  ctx.fillRect(W - WALL, 0, WALL, goal.y);
  ctx.fillRect(W - WALL, goal.y + goal.h, WALL, H - (goal.y + goal.h));
  // lines
  const red = "#c43131",
    blue = "#1f51a6",
    lineW = 6;
  ctx.fillStyle = red;
  ctx.fillRect(W / 2 - lineW / 2, WALL, lineW, H - 2 * WALL); // center
  ctx.fillStyle = blue;
  ctx.fillRect(W * 0.25 - lineW / 2, WALL, lineW, H - 2 * WALL); // blue
  ctx.fillStyle = blue;
  ctx.fillRect(W * 0.75 - lineW / 2, WALL, lineW, H - 2 * WALL); // blue
  ctx.fillStyle = red;
  ctx.fillRect(W - WALL - 34, WALL, 4, H - 2 * WALL); // goal line
  // circles
  ctx.strokeStyle = blue;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2);
  ctx.stroke();
  drawFaceoffCircle(W * 0.18, H * 0.35, blue, red);
  drawFaceoffCircle(W * 0.18, H * 0.65, blue, red);
  drawFaceoffCircle(W * 0.82, H * 0.35, blue, red);
  drawFaceoffCircle(W * 0.82, H * 0.65, blue, red);
  // trapezoid + crease
  ctx.fillStyle = "#cfe0ff";
  ctx.beginPath();
  const gx = goal.x + goal.w,
    gy = goal.y + goal.h / 2;
  ctx.moveTo(gx, gy - 60);
  ctx.lineTo(gx + 35, gy - 80);
  ctx.lineTo(gx + 35, gy + 80);
  ctx.lineTo(gx, gy + 60);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#59b0ff2e";
  ctx.beginPath();
  ctx.arc(goal.x, gy, 86, -Math.PI / 3, Math.PI / 3, false);
  ctx.lineTo(goal.x, gy);
  ctx.closePath();
  ctx.fill();
}
function drawFaceoffCircle(cx, cy, ring = "#1f51a6", dot = "#c43131") {
  ctx.strokeStyle = ring;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = dot;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
}
function drawObstacle(o) {
  ctx.fillStyle = "#2b426f";
  ctx.strokeStyle = "#8fb1ff";
  ctx.lineWidth = 1.5;
  ctx.fillRect(o.x, o.y, o.w, o.h);
  ctx.strokeRect(o.x, o.y, o.w, o.h);
}
function drawGoal(g) {
  ctx.strokeStyle = "#e1f1ffaa";
  ctx.lineWidth = 2;
  ctx.strokeRect(g.x, g.y, g.w, g.h);
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  for (let y = g.y; y < g.y + g.h; y += 6) {
    ctx.beginPath();
    ctx.moveTo(g.x, y);
    ctx.lineTo(g.x + g.w, y);
    ctx.stroke();
  }
  for (let x = g.x; x < g.x + g.w; x += 6) {
    ctx.beginPath();
    ctx.moveTo(x, g.y);
    ctx.lineTo(x, g.y + g.h);
    ctx.stroke();
  }
  ctx.restore();
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
  const px = state.puck.x,
    py = state.puck.y;
  const dx = px - mouse.x,
    dy = py - mouse.y,
    len = Math.hypot(dx, dy);
  const maxLen = Math.min(len, MAX_POWER / POWER_SCALE);

  if (len < 0.001) return;
  const ax = px + (dx / len) * maxLen;
  const ay = py + (dy / len) * maxLen;

  ctx.strokeStyle = "#9fd4ff";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.lineTo(ax, ay);
  ctx.stroke();
  ctx.setLineDash([]);
  const pwr = Math.min(1, len / (MAX_POWER / POWER_SCALE));
  ctx.fillStyle = "#2a3757";
  ctx.fillRect(px - 40, py - 46, 80, 8);
  ctx.fillStyle = "#6dc1ff";
  ctx.fillRect(px - 40, py - 46, 80 * pwr, 8);
  ctx.strokeStyle = "#8bb9ff";
  ctx.strokeRect(px - 40, py - 46, 80, 8);
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

function roundRect(x, y, w, h, r, fill, stroke) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
function drawHUD() {
  const L = LEVELS[levelIndex];
  ctx.fillStyle = "#0b1426e0";
  ctx.fillRect(WALL + 8, 8, 360, 66);
  ctx.fillStyle = "#dfeaff";
  ctx.font = "600 16px system-ui,Segoe UI,Roboto";
  ctx.fillText(
    `Level ${levelIndex + 1} / ${LEVELS.length}  ·  Par ${L.par}`,
    WALL + 22,
    30
  );
  ctx.fillText(
    `Strokes: ${strokes}${
      best[levelIndex] !== undefined ? `  ·  Best: ${best[levelIndex]}` : ""
    }  ·  Goalie: ON`,
    WALL + 22,
    54
  );
}
