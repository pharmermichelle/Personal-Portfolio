import React, { useEffect, useRef, useState } from "react";

// Arcade Lobby Starter (React + Canvas)
// -----------------------------------------------------------------------------
// FIXES in this revision:
// - Hardened profile initialization (SSR-safe + always returns valid defaults).
// - Avoid null deref on profile.* in JSX and draw loop (safe fallbacks).
// - Prevent build errors when localStorage/window are unavailable (SSR).
// - Guard canvas context acquisition and clean up rAF properly.
// - Only update React state when near-machine actually changes (less re-render).
// - Added lightweight self-tests for helper functions (run once in dev).
// -----------------------------------------------------------------------------

// --- Quick Start ---
// 1) Drop <ArcadeLobby onPlay={(game) => console.log('play', game)} /> into any page.
// 2) Edit the MACHINES array below to point each cabinet to your game routes/URLs.
// 3) Optional: Wire up real auth; guest profiles persist via localStorage.

// Tile + Room sizing
const TILE = 48; // px
const ROOM_W = 24; // tiles
const ROOM_H = 14; // tiles
const CANVAS_W = TILE * ROOM_W; // 1152
const CANVAS_H = TILE * ROOM_H; // 672

// Player config
const BASE_SPEED = 220; // px/sec
const PLAYER_R = 16; // circle radius

// Default profile (used as fallback everywhere)
const DEFAULT_PROFILE = Object.freeze({
  name: "Guest" + Math.floor(Math.random() * 1000),
  color: "#4f46e5",
  isGuest: true,
});

// Simple data model for machines (cabinets)
const MACHINES = [
  {
    id: "paclike",
    name: "Maze Chomp!",
    x: TILE * 3,
    y: TILE * 2,
    w: TILE * 2.5,
    h: TILE * 2,
    color: "#222",
    screen: "#00e0ff",
    route: "/games/maze-chomp",
    blurb: "Classic maze runner. Gobble dots, dodge ghosts.",
  },
  {
    id: "space",
    name: "Star Blaster",
    x: TILE * 7,
    y: TILE * 2,
    w: TILE * 2.5,
    h: TILE * 2,
    color: "#222",
    screen: "#7c3aed",
    route: "/games/star-blaster",
    blurb: "Arcade shoot-'em-up. Pew pew!",
  },
  {
    id: "blocks",
    name: "Block Dropper",
    x: TILE * 11,
    y: TILE * 2,
    w: TILE * 2.5,
    h: TILE * 2,
    color: "#222",
    screen: "#22c55e",
    route: "/games/block-dropper",
    blurb: "Stack and clear rows for big scores.",
  },
  {
    id: "racer",
    name: "Coastline Cruiser",
    x: TILE * 15,
    y: TILE * 2,
    w: TILE * 2.5,
    h: TILE * 2,
    color: "#222",
    screen: "#f59e0b",
    route: "/games/coastline-cruiser",
    blurb: "Side-view endless runner on a boardwalk.",
  },
  {
    id: "puzzle",
    name: "Acorn Ascent",
    x: TILE * 19,
    y: TILE * 2,
    w: TILE * 2.5,
    h: TILE * 2,
    color: "#222",
    screen: "#ef4444",
    route: "/games/acorn-ascent",
    blurb: "Climb fast, think faster!",
  },
  {
    id: "ferret",
    name: "Ferret Life",
    x: TILE * 11,
    y: TILE * 8,
    w: TILE * 2.5,
    h: TILE * 2,
    color: "#222",
    screen: "#eab308",
    route: "/games/ferret-life",
    blurb: "Tycoon coziness. Stash shiny loot!",
  },
];

// Static walls (outer border + sample islands)
const WALLS = [
  // Outer border (top, bottom, left, right)
  { x: 0, y: 0, w: CANVAS_W, h: TILE * 0.66 },
  { x: 0, y: CANVAS_H - TILE * 0.66, w: CANVAS_W, h: TILE * 0.66 },
  { x: 0, y: 0, w: TILE * 0.66, h: CANVAS_H },
  { x: CANVAS_W - TILE * 0.66, y: 0, w: TILE * 0.66, h: CANVAS_H },

  // Decorative planter in bottom-left
  { x: TILE * 2, y: TILE * 9.5, w: TILE * 3.5, h: TILE * 1 },
];

// ----------------------------- Utils -----------------------------------------
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function circleRectCollides(cx, cy, r, rx, ry, rw, rh) {
  // closest point on rect to circle center
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

function anyCollision(x, y) {
  // collide with walls and solid parts of machines
  for (const w of WALLS) {
    if (circleRectCollides(x, y, PLAYER_R, w.x, w.y, w.w, w.h)) return true;
  }
  for (const m of MACHINES) {
    if (circleRectCollides(x, y, PLAYER_R, m.x, m.y, m.w, m.h)) return true;
  }
  return false;
}

function safeWindow() {
  return typeof window !== "undefined" ? window : undefined;
}

function safeLocalStorage() {
  const w = safeWindow();
  return w && w.localStorage ? w.localStorage : undefined;
}

function sanitizeProfile(p) {
  if (!p || typeof p !== "object") return { ...DEFAULT_PROFILE };
  const name = typeof p.name === "string" && p.name.trim() ? p.name.slice(0, 20) : DEFAULT_PROFILE.name;
  const color = typeof p.color === "string" && /^#?[0-9a-fA-F]{3,8}$/.test(p.color) ? (p.color.startsWith('#') ? p.color : `#${p.color}`) : DEFAULT_PROFILE.color;
  const isGuest = typeof p.isGuest === "boolean" ? p.isGuest : !!(!p.email);
  const email = typeof p.email === "string" && p.email.trim() ? p.email.trim() : undefined;
  return { name, color, isGuest, ...(email ? { email } : {}) };
}

function getInitialProfile() {
  try {
    const ls = safeLocalStorage();
    if (ls) {
      const raw = ls.getItem("arcade_profile_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        return sanitizeProfile(parsed);
      }
    }
  } catch (_) {
    // ignore and fall back to default
  }
  // Default guest every time if nothing stored / during SSR
  return { ...DEFAULT_PROFILE };
}

function saveProfile(p) {
  try {
    const ls = safeLocalStorage();
    if (ls) ls.setItem("arcade_profile_v1", JSON.stringify(sanitizeProfile(p)));
  } catch (_) {
    // ignore in environments without storage
  }
}

// --------------------------- Component ---------------------------------------
export default function ArcadeLobby({ onPlay }) {
  const canvasRef = useRef(null);
  const keys = useKeys();
  const [profile, setProfile] = useState(() => getInitialProfile());
  // Start with no modal; we can enable an onboarding modal later if desired.
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [nearMachine, setNearMachine] = useState(null);
  const [openMachine, setOpenMachine] = useState(null);
  const [speed, setSpeed] = useState(BASE_SPEED);

  // Player state
  const playerRef = useRef({
    x: CANVAS_W * 0.5,
    y: CANVAS_H * 0.75,
    r: PLAYER_R,
    angle: 0,
  });

  // Keep a ref to nearMachine id to avoid spamming React state
  const nearIdRef = useRef(null);

  // E to interact
  useEffect(() => {
    const handler = (e) => {
      if (e.key && e.key.toLowerCase() === "e" && nearMachine) {
        setOpenMachine(nearMachine);
      }
    };
    const w = safeWindow();
    if (!w) return;
    w.addEventListener("keydown", handler);
    return () => w.removeEventListener("keydown", handler);
  }, [nearMachine]);

  // Main loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // not mounted yet
    const ctx = canvas.getContext && canvas.getContext("2d");
    if (!ctx) return; // context unavailable

    let running = true;
    let raf = 0;
    let last = (safeWindow()?.performance || { now: () => Date.now() }).now();

    const loop = (t) => {
      if (!running) return;
      const dt = Math.max(0, (t - last) / 1000);
      last = t;

      // Update
      const p = playerRef.current;
      let vx = 0, vy = 0;
      if (keys["w"] || keys["arrowup"]) vy -= 1;
      if (keys["s"] || keys["arrowdown"]) vy += 1;
      if (keys["a"] || keys["arrowleft"]) vx -= 1;
      if (keys["d"] || keys["arrowright"]) vx += 1;

      if (vx !== 0 || vy !== 0) {
        const len = Math.hypot(vx, vy) || 1;
        vx = (vx / len) * speed;
        vy = (vy / len) * speed;

        // try move x then y with collision
        const nx = p.x + vx * dt;
        if (!anyCollision(nx, p.y)) p.x = nx;
        const ny = p.y + vy * dt;
        if (!anyCollision(p.x, ny)) p.y = ny;

        p.angle = Math.atan2(vy, vx);
      }

      // Proximity check for machines
      let closest = null;
      let closestDist = Infinity;
      for (const m of MACHINES) {
        const cx = clamp(p.x, m.x, m.x + m.w);
        const cy = clamp(p.y, m.y, m.y + m.h);
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d < 56 && d < closestDist) {
          closest = m;
          closestDist = d;
        }
      }
      const newId = closest ? closest.id : null;
      if (newId !== nearIdRef.current) {
        nearIdRef.current = newId;
        setNearMachine(closest);
      }

      // Draw
      const DPR = Math.max(1, Math.floor((safeWindow()?.devicePixelRatio || 1)));
      if (canvas.width !== CANVAS_W * DPR || canvas.height !== CANVAS_H * DPR) {
        canvas.width = CANVAS_W * DPR;
        canvas.height = CANVAS_H * DPR;
        canvas.style.width = CANVAS_W + "px";
        canvas.style.height = CANVAS_H + "px";
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      }

      // Background floor
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      grad.addColorStop(0, "#0b1020");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Subtle grid
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_W; x += TILE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 0; y <= CANVAS_H; y += TILE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Walls
      ctx.fillStyle = "#1f2937";
      for (const w of WALLS) ctx.fillRect(w.x, w.y, w.w, w.h);

      // Machines
      for (const m of MACHINES) {
        // base cabinet
        ctx.fillStyle = m.color;
        ctx.fillRect(m.x, m.y, m.w, m.h);
        // screen
        ctx.fillStyle = m.screen;
        ctx.fillRect(m.x + 8, m.y + 8, m.w - 16, m.h * 0.55);
        // marquee
        ctx.fillStyle = "#111827";
        ctx.fillRect(m.x, m.y - 14, m.w, 14);
        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "center";
        ctx.fillText(m.name, m.x + m.w / 2, m.y - 3);
        // glow if near
        if (nearIdRef.current && nearIdRef.current === m.id) {
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = m.screen;
          ctx.globalAlpha = 0.6;
          ctx.fillStyle = m.screen;
          ctx.fillRect(m.x + 8, m.y + 8, m.w - 16, m.h * 0.55);
          ctx.restore();
        }
      }

      // Player (simple circle avatar)
      ctx.save();
      ctx.translate(p.x, p.y);
      // feet shadow
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#000";
      ctx.beginPath();
      ctx.ellipse(0, PLAYER_R, PLAYER_R * 0.8, PLAYER_R * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // body (safe fallback color)
      const bodyColor = (profile && typeof profile.color === 'string' && profile.color) || DEFAULT_PROFILE.color;
      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2);
      ctx.fill();

      // face dot
      ctx.rotate(p.angle);
      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.arc(PLAYER_R * 0.5, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      raf = (safeWindow()?.requestAnimationFrame || function (fn) { return setTimeout(() => fn(performance.now()), 16); })(loop);
    };

    raf = (safeWindow()?.requestAnimationFrame || function (fn) { return setTimeout(() => fn(performance.now()), 16); })(loop);
    return () => {
      running = false;
      const w = safeWindow();
      if (w && typeof w.cancelAnimationFrame === "function") w.cancelAnimationFrame(raf);
    };
  }, [keys, speed, profile]);

  const handleSaveProfile = (data) => {
    const merged = sanitizeProfile({ ...profile, ...data, isGuest: !data?.email });
    setProfile(merged);
    saveProfile(merged);
    setShowProfileModal(false);
  };

  const displayName = (profile && profile.name) || DEFAULT_PROFILE.name;
  const avatarColor = (profile && profile.color) || DEFAULT_PROFILE.color;

  return (
    <div className="w-full min-h-[90vh] grid grid-cols-12 gap-4 p-4 bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className="col-span-12 md:col-span-3 space-y-4">
        <div className="rounded-2xl p-4 bg-slate-800 shadow">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full"
              style={{ background: avatarColor }}
            />
            <div>
              <div className="text-sm uppercase tracking-wide text-slate-400">Player</div>
              <div className="font-semibold">{displayName}</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold"
              onClick={() => setShowProfileModal(true)}
            >
              {profile && !profile.isGuest ? "Edit Profile" : "Sign in / Edit"}
            </button>
            <button
              className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
              onClick={() => {
                const guest = { ...DEFAULT_PROFILE };
                setProfile(guest);
                saveProfile(guest);
              }}
            >
              Guest Mode
            </button>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Move with WASD / Arrow keys. Press <kbd className="px-1 bg-slate-700 rounded">E</kbd> near a cabinet.
          </div>
          <div className="mt-4">
            <label className="block text-xs text-slate-400 mb-1">Walk speed</label>
            <input
              type="range"
              min={160}
              max={320}
              value={speed}
              onChange={(e) => setSpeed(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-slate-800 shadow">
          <div className="text-sm uppercase tracking-wide text-slate-400 mb-2">
            Cabinets
          </div>
          <div className="grid grid-cols-1 gap-2">
            {MACHINES.map((m) => (
              <button
                key={m.id}
                className="text-left p-3 rounded-xl bg-slate-700 hover:bg-slate-600"
                onClick={() => setOpenMachine(m)}
              >
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-slate-300">{m.blurb}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main stage */}
      <div className="col-span-12 md:col-span-9">
        <div className="relative rounded-2xl overflow-hidden shadow ring-1 ring-slate-700">
          <canvas ref={canvasRef} className="block w-full h-auto" />

          {/* Watermark header */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/40 backdrop-blur text-xs">
            NeoArcade • Online
          </div>
          <div className="absolute top-3 right-3 px-3 py-1 rounded-xl bg-black/40 backdrop-blur text-xs">
            Logged in as <span className="font-semibold">{displayName}</span>
          </div>
        </div>
      </div>

      {/* Profile modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg rounded-2xl bg-slate-800 p-6 shadow-xl">
            <div className="text-lg font-semibold">Choose your avatar</div>
            <div className="text-slate-300 text-sm mb-4">No signup needed — continue as guest or add an email later.</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleSaveProfile({
                  name: (fd.get("name") || "Guest").toString().slice(0, 20) || "Guest",
                  color: (fd.get("color") || "#4f46e5").toString(),
                  email: (fd.get("email") || "").toString().trim() || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs text-slate-400">Display name</span>
                  <input
                    name="name"
                    defaultValue={displayName}
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-700 outline-none ring-1 ring-transparent focus:ring-sky-500"
                    placeholder="PlayerOne"
                    required
                  />
                </label>
                <label className="block">
                  <span className="block text-xs text-slate-400">Avatar color</span>
                  <input
                    name="color"
                    type="color"
                    defaultValue={avatarColor}
                    className="mt-1 w-full h-[42px] rounded-xl bg-slate-700 p-1"
                  />
                </label>
                <label className="block md:col-span-2">
                  <span className="block text-xs text-slate-400">Email (optional)</span>
                  <input
                    name="email"
                    defaultValue={profile?.email || ""}
                    type="email"
                    className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-700 outline-none ring-1 ring-transparent focus:ring-sky-500"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600"
                  onClick={() => setShowProfileModal(false)}
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Machine modal */}
      {openMachine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="w-3 h-10 rounded bg-sky-400" />
              <div>
                <div className="text-xl font-semibold">{openMachine.name}</div>
                <div className="text-slate-300 text-sm">{openMachine.blurb}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                className="px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-900 font-semibold"
                onClick={() => {
                  if (onPlay) onPlay(openMachine);
                  // Default behavior: navigate or open new tab
                  if (openMachine.route) {
                    const isExternal = openMachine.route.startsWith("http");
                    if (isExternal) window.open(openMachine.route, "_blank");
                    else window.location.href = openMachine.route;
                  }
                }}
              >
                Play
              </button>
              <button
                className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600"
                onClick={() => setOpenMachine(null)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------------- Hooks -------------------------------------------
function useKeys() {
  const [keys, setKeys] = useState({});
  useEffect(() => {
    const down = (e) => setKeys((k) => ({ ...k, [e.key?.toLowerCase?.() || ""]: true }));
    const up = (e) => setKeys((k) => ({ ...k, [e.key?.toLowerCase?.() || ""]: false }));
    const w = safeWindow();
    if (!w) return;
    w.addEventListener("keydown", down);
    w.addEventListener("keyup", up);
    return () => {
      w.removeEventListener("keydown", down);
      w.removeEventListener("keyup", up);
    };
  }, []);
  return keys;
}

// ---------------------------- Self-tests -------------------------------------
// Minimal, non-blocking tests that run once in dev to validate core helpers.
(function runSelfTestsOnce() {
  const w = safeWindow();
  const isDev = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') || (w && w.location && /localhost|127\.0\.0\.1/.test(w.location.host));
  if (!isDev || (w && w.__ARCADE_SELF_TESTS_RAN__)) return;
  if (w) w.__ARCADE_SELF_TESTS_RAN__ = true;

  const tests = [];

  // clamp tests
  tests.push({ name: 'clamp low', pass: clamp(-5, 0, 10) === 0 });
  tests.push({ name: 'clamp mid', pass: clamp(5, 0, 10) === 5 });
  tests.push({ name: 'clamp high', pass: clamp(15, 0, 10) === 10 });

  // circle-rect collision tests
  tests.push({ name: 'circle-rect collide', pass: circleRectCollides(5, 5, 5, 0, 0, 10, 2) === true });
  tests.push({ name: 'circle-rect no-collide', pass: circleRectCollides(50, 50, 5, 0, 0, 10, 10) === false });

  // anyCollision near border
  tests.push({ name: 'anyCollision border', pass: anyCollision(2, 2) === true });
  tests.push({ name: 'anyCollision empty center', pass: anyCollision(CANVAS_W * 0.5, CANVAS_H * 0.5) === false });

  // profile sanitize
  const sp = sanitizeProfile({ name: "  Alice  ", color: "3498db", email: "a@x.com" });
  tests.push({ name: 'sanitizeProfile name', pass: sp.name.trim() === 'Alice' });
  tests.push({ name: 'sanitizeProfile color #', pass: sp.color.startsWith('#') });
  tests.push({ name: 'sanitizeProfile guest flag', pass: sp.isGuest === false });

  const passed = tests.filter(t => t.pass).length;
  // eslint-disable-next-line no-console
  console.log(`[ArcadeLobby self-tests] ${passed}/${tests.length} passed`, tests);
})();
