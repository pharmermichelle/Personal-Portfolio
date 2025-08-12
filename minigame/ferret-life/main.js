// main.js
import { TILE_SIZE, TILE } from "./maps.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const goal = { apple: 10, yarn: 5, coin: 5 };
const nextBtn = document.getElementById("moveToNextLevelBtn");
const goalDiv = document.getElementById("levelGoal");

function updateLevelSummary() {
  if (!goalDiv || !nextBtn) return;

  goalDiv.innerHTML = `
    Collect 10 🍎, 5 🧶, and 5 🪙<br/>
    <strong>Now:</strong>
    🍎 ${globalStash.apple}/${goal.apple} ·
    🧶 ${globalStash.yarn}/${goal.yarn} ·
    🪙 ${globalStash.coin}/${goal.coin}<br/>
    <button id="moveToNextLevelBtn" ${
      globalStash.apple >= goal.apple &&
      globalStash.yarn >= goal.yarn &&
      globalStash.coin >= goal.coin
        ? ""
        : "disabled"
    }>Move to Next Room</button>
  `;

  // Re-bind the button after innerHTML update
  const btn = goalDiv.querySelector("#moveToNextLevelBtn");
  if (btn)
    btn.addEventListener("click", () => {
      if (currentLevelIndex < LEVELS.length - 1) {
        gotoLevel(currentLevelIndex + 1);
        showActionMessage("➡️ Moved to next room!");
      }
    });
}

let levelName;

// Import levels
import { LEVELS } from "./levels.js";
let currentLevelIndex = 0;
let currentRoom = LEVELS[currentLevelIndex].room;
let solidRects = [];
function rebuildSolids() {
  solidRects = [];

  // Walls
  for (let y = 0; y < currentRoom.height; y++) {
    for (let x = 0; x < currentRoom.width; x++) {
      if (currentRoom.tiles[y][x] === TILE.WALL) {
        solidRects.push({
          x: x * TILE_SIZE,
          y: y * TILE_SIZE,
          w: TILE_SIZE,
          h: TILE_SIZE,
        });
      }
    }
  }

  // Decorations block movement too
  (currentRoom.decorations || []).forEach((d) => {
    solidRects.push({
      x: d.x * TILE_SIZE,
      y: d.y * TILE_SIZE,
      w: TILE_SIZE,
      h: TILE_SIZE,
    });
  });
}
rebuildSolids();

let justPressedEnter = false;
let itemTimer = 0;
const ITEM_SPAWN_INTERVAL = 750;
const MAX_ITEMS = 10;

// Load all three ferret sprites
const ferretSprites = {
  bandit: new Image(),
  sticky: new Image(),
  thief: new Image(),
};

ferretSprites.bandit.src = "./assets/bandit.png";
ferretSprites.sticky.src = "./assets/sticky.png";
ferretSprites.thief.src = "./assets/thief.png";

let selectedFerret = "thief"; // or "bandit", or "sticky"

function logAction(msg) {
  showActionMessage(msg);
}

let wasInCage = false;

function updateInventoryDisplay() {
  const display = document.getElementById("inventoryDisplay");
  display.innerHTML =
    "<div class='backpack-title'>🎒 Backpack</div>" +
    (player.inventory.length
      ? player.inventory
          .map(
            (item) =>
              `<span class="backpack-icon">${itemTypes[item].label}</span>`
          )
          .join("")
      : "<div class='backpack-empty'>Empty</div>");
}

// Load decor
const decorSprites = {
  chair: new Image(),
  loveseat: new Image(),
  plant: new Image(),
  plant2: new Image(),
  sofa: new Image(),
  sofachair: new Image(),
  table: new Image(),
};

decorSprites.chair.src = "./assets/decor-chair.png";
decorSprites.loveseat.src = "./assets/decor-loveseat.png";
decorSprites.plant.src = "./assets/decor-plant.png";
decorSprites.plant2.src = "./assets/decor-plant2.png";
decorSprites.sofa.src = "./assets/decor-sofa.png";
decorSprites.sofachair.src = "./assets/decor-sofachair.png";
decorSprites.table.src = "./assets/decor-table.png";

// --- Basic State ---

const itemTypes = {
  apple: { color: "#e74c3c", label: "🍎" },
  yarn: { color: "#9b59b6", label: "🧶" },
  coin: { color: "#f1c40f", label: "🪙" },
};

// Sample items placed in the room
let collectibles = [
  { x: TILE_SIZE * 4, y: TILE_SIZE * 2, type: "apple" },
  { x: TILE_SIZE * 6, y: TILE_SIZE * 4, type: "yarn" },
  { x: TILE_SIZE * 8, y: TILE_SIZE * 3, type: "coin" },
];

const player = {
  x: TILE_SIZE * 2,
  y: TILE_SIZE * 2,
  w: 48,
  h: 48,
  speed: 1,
  color: "#8B4513",
  inventory: [],
  capacity: 1,
  angle: 0,
};

const globalStash = {
  apple: 0,
  yarn: 0,
  coin: 0,
};

const upgradeState = {
  speed: 0,
  capacity: 1,
};

const keys = {};
// run once during init
function setupControls() {
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();

    // Open/close with E or U
    if (k === "e" || k === "u") {
      // optional gating by cage:
      // if (!isInCage(player)) return;
      depositInventory();
      toggleUpgradePanel();
    }

    // Space = close if open, or open-if-in-cage
    if (e.key === " ") {
      e.preventDefault();
      if (upgradePanelOpen) {
        closeUpgradePanel();
      } else if (isInCage(player)) {
        depositInventory();
        openUpgradePanel();
      }
    }

    // movement flags
    if (!keys[e.key]) keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    delete keys[e.key];
    if (e.key === " ") justPressedEnter = false;
  });

  // Click to open (add this ONCE, not after space)
  const topBar = document.getElementById("upgradeTopBar");
  if (topBar) {
    topBar.style.cursor = "pointer";
    topBar.title = "Click to open upgrades (E)";
    topBar.addEventListener("click", () => {
      // optional cage gate:
      // if (!isInCage(player)) return;
      depositInventory();
      toggleUpgradePanel();
    });
  }
}

// --- Utility ---
function rectsOverlap(a, b) {
  return !(
    a.x + a.w <= b.x ||
    a.x >= b.x + b.w ||
    a.y + a.h <= b.y ||
    a.y >= b.y + b.h
  );
}

function getTileAtPixel(px, py) {
  const tx = Math.floor(px / TILE_SIZE);
  const ty = Math.floor(py / TILE_SIZE);
  if (tx < 0 || ty < 0 || tx >= currentRoom.width || ty >= currentRoom.height)
    return TILE.WALL; // treat out-of-bounds as wall
  return currentRoom.tiles[ty][tx];
}

function willCollide(nx, ny, w, h) {
  // Out of bounds = solid
  if (
    nx < 0 ||
    ny < 0 ||
    nx + w > currentRoom.width * TILE_SIZE ||
    ny + h > currentRoom.height * TILE_SIZE
  )
    return true;

  const rect = { x: nx, y: ny, w, h };
  for (const s of solidRects) {
    if (rectsOverlap(rect, s)) return true;
  }
  return false;
}

// --- Action Pop ---
export function showActionMessage(text) {
  const message = document.createElement("div");
  message.className = "action-popup";
  message.textContent = text;

  const feed = document.getElementById("actionFeed");
  feed.appendChild(message);

  // remove after CSS animation ends (fallback timeout just in case)
  const cleanup = () => message.remove();
  message.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 5000);
}

function gotoLevel(idx) {
  currentLevelIndex = idx;
  currentRoom = LEVELS[currentLevelIndex].room;

  // Reset player position; keep your stash so progress carries over
  player.x = TILE_SIZE * 2;
  player.y = TILE_SIZE * 2;

  // Clear world items and rebuild solids for the new room
  collectibles = [];
  rebuildSolids();

  // Make sure UI reflects the new room
  drawHUD();
  updateLevelSummary();
}

// --- Upgrade Panel ---
let upgradePanelOpen = false;

function openUpgradePanel() {
  upgradePanelOpen = true;
  const panel = document.getElementById("upgradePanel");
  panel.style.display = "grid";
  renderUpgradeOptions();
  drawHUD();
}

function closeUpgradePanel() {
  upgradePanelOpen = false;
  document.getElementById("upgradePanel").style.display = "none";
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("upgradePanel").style.display = "none"; // start hidden
  drawHUD();
  gameLoop();
  updateInventoryDisplay();
  renderUpgradeOptions();
});

function toggleUpgradePanel() {
  if (upgradePanelOpen) closeUpgradePanel();
  else openUpgradePanel();
}

function renderUpgradeOptions() {
  const upgradesEl = document.getElementById("upgradesGroup");
  const powerupsEl = document.getElementById("powerupsGroup");
  if (!upgradesEl || !powerupsEl) return;

  // reset column headers
  upgradesEl.innerHTML = `<h3>💡 Upgrades</h3>`;
  powerupsEl.innerHTML = `<h3>🎧 Powerups</h3>`;

  // --- costs & checks
  const speedCost = [3, 6, 10][upgradeState.speed]; // undefined when maxed
  const canUpgradeSpeed =
    Number.isFinite(speedCost) && globalStash.apple >= speedCost;

  const capCost = 2;
  const canUpgradeCap = globalStash.coin >= capCost;

  const magnetCost = { yarn: 10, coin: 5 };
  const canMagnet =
    globalStash.yarn >= magnetCost.yarn && globalStash.coin >= magnetCost.coin;

  // helpers
  const makeDiv = (html) => {
    const d = document.createElement("div");
    d.className = "upgrade-option";
    d.innerHTML = html;
    return d;
  };
  const makeBtn = (label, disabled, onClick) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.disabled = !!disabled;
    if (!disabled) {
      b.classList.add("highlight");
      b.addEventListener("click", onClick);
    }
    return b;
  };

  // --- column 2: Upgrades
  const speedText = Number.isFinite(speedCost)
    ? `⚡ Speed Lv. ${upgradeState.speed} → ${
        upgradeState.speed + 1
      } (Need ${speedCost} 🍎)`
    : `⚡ Speed (Maxed)`;
  const speedDiv = makeDiv(speedText);
  speedDiv.append(
    makeBtn("Upgrade", !canUpgradeSpeed, () => {
      upgradeSpeed();
      renderUpgradeOptions();
      updateLevelSummary();
      drawHUD();
    })
  );

  const capDiv = makeDiv(
    `📦 Capacity: ${player.capacity} → ${
      player.capacity + 1
    } (Need ${capCost} 🪙)`
  );
  capDiv.append(
    makeBtn("Upgrade", !canUpgradeCap, () => {
      upgradeCapacity();
      renderUpgradeOptions();
      updateLevelSummary();
      drawHUD();
    })
  );

  upgradesEl.append(speedDiv, capDiv);

  // --- column 3: Powerups
  const magnetDiv = makeDiv(
    `🧲 Magnet Boost (Pulls items for 30s)<br/>Requires ${magnetCost.yarn} 🧶 and ${magnetCost.coin} 🪙`
  );
  magnetDiv.append(
    makeBtn("Craft & Activate", !canMagnet, () => {
      activateMagnetBoost();
      renderUpgradeOptions();
      updateLevelSummary();
      drawHUD();
    })
  );

  powerupsEl.append(magnetDiv);
}

function upgradeSpeed() {
  const cost = [3, 6, 10][upgradeState.speed];
  if (globalStash.apple >= cost) {
    globalStash.apple -= cost;
    upgradeState.speed++;
    player.speed += 0.5;
    renderUpgradeOptions();
    drawHUD();
  }
}

let magnetBoostActive = false;
let magnetBoostTimer = 0;
let magnetCooldown = 0;

const MAGNET_BOOST_DURATION = 60 * 3; // ~3 seconds at 60fps

function activateMagnetBoost() {
  if (magnetBoostActive || magnetCooldown > 0) return;

  globalStash.yarn -= 10;
  globalStash.coin -= 5;
  magnetBoostActive = true;
  magnetBoostTimer = MAGNET_BOOST_DURATION;
  magnetCooldown = 600; // 10 seconds cooldown
  setTimeout(() => {
    magnetCooldown = 0; // reset cooldown after 10 seconds
  }, 10000);
  console.log("🧲 Magnet Boost activated!");
}

function upgradeCapacity() {
  const cost = 2;
  if (globalStash.coin >= cost) {
    globalStash.coin -= cost;
    upgradeState.capacity++;
    player.capacity++;
    renderUpgradeOptions();
    drawHUD();
  }
}

// ---- expose upgrade handlers for inline onclicks (module scope fix) ----
window.upgradeSpeed = upgradeSpeed;
window.upgradeCapacity = upgradeCapacity;
window.activateMagnetBoost = activateMagnetBoost;
window.closeUpgradePanel = closeUpgradePanel;

// --- Cage logic ---
function isInCage(p) {
  const cage = currentRoom.cageRect;
  const playerRect = { x: p.x, y: p.y, w: p.w, h: p.h };
  return rectsOverlap(playerRect, cage);
}

function depositInventory() {
  if (player.inventory.length > 0) {
    for (const item of player.inventory) {
      if (globalStash[item] !== undefined) {
        globalStash[item]++;
      }
    }
    console.log("Deposited:", player.inventory);
    logAction(`Deposited: ${player.inventory.join(", ")}`);
    updateInventoryDisplay();
    updateLevelSummary();
    renderUpgradeOptions();
    drawHUD();
    player.inventory = [];
  } else {
    console.log("Backpack empty.");
  }
}

// --- Update / Draw ---
function spawnRandomItem() {
  const types = ["apple", "yarn", "coin"];
  const type = types[Math.floor(Math.random() * types.length)];

  let valid = false;
  let x, y;
  let attempts = 0;

  while (!valid && attempts < 50) {
    x = Math.floor(Math.random() * currentRoom.width) * TILE_SIZE;
    y = Math.floor(Math.random() * currentRoom.height) * TILE_SIZE;

    const tile = getTileAtPixel(x + TILE_SIZE / 2, y + TILE_SIZE / 2);
    const cage = currentRoom.cageRect;

    const notInCage =
      x < cage.x - TILE_SIZE ||
      x > cage.x + cage.w ||
      y < cage.y - TILE_SIZE ||
      y > cage.y + cage.h;

    if (tile === TILE.FLOOR && notInCage) {
      valid = true;
    }

    attempts++;
  }

  if (valid) {
    collectibles.push({ x, y, type });
  }
}

function update() {
  let vx = 0,
    vy = 0;
  if (keys["ArrowUp"] || keys["w"]) vy = -player.speed;
  if (keys["ArrowDown"] || keys["s"]) vy = player.speed;
  if (keys["ArrowLeft"] || keys["a"]) vx = -player.speed;
  if (keys["ArrowRight"] || keys["d"]) vx = player.speed;

  const nx = player.x + vx;
  const ny = player.y + vy;

  if (vx !== 0 || vy !== 0) {
    player.angle = Math.atan2(vy, vx); // -PI..PI
  }

  if (!willCollide(nx, ny, player.w, player.h)) {
    player.x = nx;
    player.y = ny;
  } else {
    // simple axis separation
    if (!willCollide(player.x + vx, player.y, player.w, player.h))
      player.x += vx;
    if (!willCollide(player.x, player.y + vy, player.w, player.h))
      player.y += vy;
  }

  if (magnetBoostActive && magnetBoostTimer > 0) {
    magnetBoostTimer--;

    collectibles.forEach((item) => {
      const dx = player.x - item.x;
      const dy = player.y - item.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 150 && player.inventory.length < player.capacity) {
        // Normalize vector
        const pullSpeed = 2;
        const nx = dx / dist;
        const ny = dy / dist;

        item.x += nx * pullSpeed;
        item.y += ny * pullSpeed;
      }
    });
    if (magnetCooldown > 0) {
      magnetCooldown--;
    }

    if (magnetBoostTimer <= 0) {
      magnetBoostActive = false;
      console.log("🧲 Magnet Boost ended.");
    }
  }

  // Check for nearby items
  collectibles = collectibles.filter((item) => {
    const dist = Math.hypot(player.x - item.x, player.y - item.y);
    if (dist < 32 && player.inventory.length < player.capacity) {
      player.inventory.push(item.type);
      logAction(`Picked up: ${item.type}`);
      updateInventoryDisplay();

      return false; // remove from world
    }
    return true; // keep in world
  });
  itemTimer++;
  if (itemTimer >= ITEM_SPAWN_INTERVAL && collectibles.length < MAX_ITEMS) {
    itemTimer = 0;
    spawnRandomItem();
  }
  // --- Auto deposit when entering cage ---
  const nowInCage = isInCage(player);
  if (nowInCage && !wasInCage) {
    depositInventory();
  }
  // Update wasInCage state
  wasInCage = nowInCage;
}

function drawTiles() {
  for (let y = 0; y < currentRoom.height; y++) {
    for (let x = 0; x < currentRoom.width; x++) {
      const tile = currentRoom.tiles[y][x];

      switch (tile) {
        case TILE.WALL:
          ctx.fillStyle = "#8B5A2B";
          break;
        case TILE.FLOOR:
          ctx.fillStyle = "#bcbbbaff";
          break;
        case TILE.CAGE:
          ctx.fillStyle = "#9ed7fdff"; // highlight cage tiles
          break;
        default:
          ctx.fillStyle = "#ff00ff";
      }

      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw cage outline (nice visual feedback)
  const c = currentRoom.cageRect;
  ctx.strokeStyle = "#0077ff";
  ctx.lineWidth = 3;
  ctx.strokeRect(c.x, c.y, c.w, c.h);
}

function drawDecorations() {
  if (!currentRoom.decorations) return;

  for (const deco of currentRoom.decorations) {
    const img = decorSprites[deco.sprite];
    const px = deco.x * TILE_SIZE;
    const py = deco.y * TILE_SIZE;

    if (img.complete && img.width) {
      ctx.drawImage(img, px, py, TILE_SIZE, TILE_SIZE);
    }
  }
}

function drawItems() {
  for (const item of collectibles) {
    const def = itemTypes[item.type];
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(item.x + 16, item.y + 16, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "14px sans-serif";
    ctx.fillText(def.label, item.x + 6, item.y + 24);
  }
}

function drawPlayer() {
  const img = ferretSprites[selectedFerret];
  const cx = player.x + player.w / 2;
  const cy = player.y + player.h / 2;

  ctx.save();
  ctx.translate(cx, cy);

  // If your sprite’s “default” is facing **up**, use +Math.PI/2 or tweak until it looks right.
  ctx.rotate(player.angle + Math.PI / 2);

  if (img.complete && img.width) {
    ctx.drawImage(img, -player.w / 2, -player.h / 2, player.w, player.h);
  } else {
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
  }

  ctx.restore();
}

function drawHUD() {
  const cage = currentRoom.cageRect;

  // --- draw the mini-HUD INSIDE the cage ---
  ctx.save(); // keep canvas state clean

  // anchor inside the cage, centered
  const lineHeight = 18;
  const startX = Math.floor(cage.x + cage.w / 2); // center of cage
  const startY = Math.floor(cage.y + 8); // a bit down from top

  ctx.fillStyle = "#888";
  ctx.font = "16px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const lines = [
    `🧺 ${player.inventory.length}/${player.capacity}`,
    `🍎 ${globalStash.apple}`,
    `🧶 ${globalStash.yarn}`,
    `🪙 ${globalStash.coin}`,
    `⚡ ${upgradeState.speed}`,
  ];

  lines.forEach((line, i) => {
    ctx.fillText(line, startX, startY + i * lineHeight);
  });

  // bottom hint INSIDE the cage
  if (isInCage(player)) {
    ctx.fillStyle = "#0077ff";
    ctx.font = "bold 12px Segoe UI";
    ctx.fillText("Space to upgrade", startX, cage.y + cage.h - 18);
  }

  ctx.restore(); // <-- restores textAlign/textBaseline/etc.

  // --- DOM HUD bits (unchanged) ---
  const levelName = document.getElementById("levelName");
  if (levelName) {
    levelName.textContent = LEVELS[currentLevelIndex].name;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTiles();
  drawDecorations();
  drawItems(); // add this line
  drawPlayer();
  drawHUD();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("DOMContentLoaded", () => {
  setupControls(); // <-- make sure this runs once
  renderUpgradeOptions(); // build buttons before any clicks
  updateInventoryDisplay();
  updateLevelSummary();
  drawHUD();
  gameLoop();
});
