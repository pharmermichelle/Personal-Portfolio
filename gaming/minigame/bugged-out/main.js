const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const images = {
  bugOrange: new Image(),
  tower1: new Image(),
  tower2: new Image(),
  bugBossMaroon: new Image(),
  tower3: new Image(),
};

images.bugOrange.src = "assets/bug-orange.png";
images.bugBossMaroon.src = "assets/bug-boss-maroon.png";
images.tower1.src = "assets/tower-1-blue.png";
images.tower2.src = "assets/tower-2-teal.png";
images.tower3.src = "assets/tower-3-green.png";

let bugs = [];
let towers = [];
let projectiles = [];
let strawberries = 3;
let wave = 1;
let score = 0;
let upgradeTokens = 0;
let inBuildPhase = true;

// === PATH ===
const path = [
  { x: 50, y: 200 },
  { x: 200, y: 200 },
  { x: 200, y: 350 },
  { x: 600, y: 350 },
  { x: 600, y: 150 },
  { x: 750, y: 150 },
];

// === TOWER SPOTS ===
const towerSpots = [
  { x: 150, y: 100, filled: false, locked: false },
  { x: 300, y: 300, filled: false, locked: false },
  { x: 500, y: 250, filled: false, locked: false },
  { x: 650, y: 100, filled: false, locked: false },

  // New locked spots
  { x: 400, y: 100, filled: false, locked: true },
  { x: 700, y: 300, filled: false, locked: true },
  { x: 250, y: 200, filled: false, locked: true },
];

// === BUG CLASS ===
class Bug {
  constructor() {
    this.x = path[0].x;
    this.y = path[0].y;
    this.hp = 3;
    this.speed = 0.5;
    this.pathIndex = 0;
    this.hitTimer = 0;
  }

  update() {
    const target = path[this.pathIndex + 1];
    if (!target) return;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.speed) {
      this.pathIndex++;
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }

    if (this.pathIndex >= path.length - 1) {
      this.reachedEnd = true;
    }
  }

  draw() {
    let width = 32;
    let height = 32;

    // Apply squish if recently hit
    if (this.hitTimer > 0) {
      width = 28;
      height = 24;
      this.hitTimer--;
    }

    // Draw bug sprite
    ctx.drawImage(images.bugOrange, this.x - 16, this.y - 16, 32, 32);

    // Draw health bar
    ctx.fillStyle = "#ddd";
    ctx.fillRect(this.x - 16, this.y - 24, 32, 4);

    // Draw health bar foreground based on HP
    ctx.fillStyle = "#4ade80"; // green
    const hpPercent = Math.max(this.hp / 3, 0);
    ctx.fillRect(this.x - 16, this.y - 24, hpPercent * 32, 4);
  }
}

class BossBug extends Bug {
  constructor() {
    super();
    this.hp = 10;
    this.speed = 0.3;
  }

  draw() {
    let width = 40;
    let height = 40;

    if (this.hitTimer > 0) {
      width = 36;
      height = 30;
      this.hitTimer--;
    }

    ctx.drawImage(
      images.bugBossMaroon,
      this.x - width / 2,
      this.y - height / 2,
      width,
      height
    );

    // Health bar
    ctx.fillStyle = "#ddd";
    ctx.fillRect(this.x - 20, this.y - 28, 40, 5);

    ctx.fillStyle = "#f87171"; // red bar
    const hpPercent = Math.max(this.hp / 10, 0);
    ctx.fillRect(this.x - 20, this.y - 28, hpPercent * 40, 5);
  }
}

// === TOWER CLASS ===
class Tower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.level = 1;
    this.range = 100;
    this.fireRate = 1000;
    this.lastShot = 0;
  }

  upgrade() {
    if (this.level < 3) {
      this.level++;
      this.range += 20;
      this.fireRate -= 200;
    }
  }

  update(deltaTime) {
    this.lastShot += deltaTime;
    if (this.lastShot >= this.fireRate) {
      for (let bug of bugs) {
        const dx = bug.x - this.x;
        const dy = bug.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.range) {
          projectiles.push(new Projectile(this.x, this.y, bug));
          this.lastShot = 0;
          break;
        }
      }
    }
  }

  draw() {
    const img =
      this.level === 1
        ? images.tower1
        : this.level === 2
        ? images.tower2
        : images.tower3;

    ctx.drawImage(img, this.x - 24, this.y - 24, 48, 48);
  }
}
// === PROJECTILE CLASS ===
class Projectile {
  constructor(x, y, target) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.speed = 4;
    this.radius = 4;
  }
  update() {
    if (!this.target) return;

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.speed || this.target.hp <= 0) {
      this.target.hp--;
      this.target.hitTimer = 5; // frames to squish

      return true; // remove projectile
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
      return false;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = "#93c5fd";
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
// === EVENT: PLACE TOWER ===
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  // Try upgrading a tower if clicked nearby and upgrades available
  for (let tower of towers) {
    const dx = mx - tower.x;
    const dy = my - tower.y;
    if (
      Math.sqrt(dx * dx + dy * dy) < 20 &&
      upgradeTokens > 0 &&
      tower.level < 3
    ) {
      tower.upgrade();
      upgradeTokens--;
      return;
    }
  }

  // Otherwise, try placing a tower
  for (let spot of towerSpots) {
    const dx = mx - spot.x;
    const dy = my - spot.y;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      if (spot.locked && upgradeTokens >= 3) {
        spot.locked = false;
        upgradeTokens -= 3;
        return;
      } else if (!spot.filled && !spot.locked) {
        towers.push(new Tower(spot.x, spot.y));
        spot.filled = true;
        return;
      }
    }
  }
});

// === SPAWN BUGS ===
function startNextWave() {
  inBuildPhase = false;

  const numBugs = 5 + wave * 2; // More bugs each wave
  const hpBoost = Math.floor(wave / 3); // Increase HP every 3 waves
  const speedBoost = Math.min(wave * 0.05, 0.5); // Cap speed increase

  for (let i = 0; i < numBugs; i++) {
    setTimeout(() => {
      const bug = new Bug();
      bug.hp += hpBoost;
      bug.speed += speedBoost;
      bugs.push(bug);
    }, i * 600); // faster spawn
  }

  if (wave === 5 || wave % 5 === 0) {
    setTimeout(() => {
      bugs.push(new BossBug());
    }, numBugs * 600 + 1000);
  }

  wave++;
}

// === MAIN GAME LOOP ===
const startWaveBtn = document.getElementById("startWaveBtn");
startWaveBtn.addEventListener("click", () => {
  if (inBuildPhase) {
    startWaveBtn.style.display = "none";
    startNextWave();
  }
});

let lastTime = 0;
function updateGame(timestamp) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw path
  ctx.beginPath();
  ctx.lineWidth = 30;
  ctx.strokeStyle = "#f4c06a";
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();

  // Draw tower spots
  for (let spot of towerSpots) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.arc(spot.x, spot.y, 20, 0, Math.PI * 2);
    ctx.strokeStyle = spot.locked ? "#999" : "#aaa";
    ctx.stroke();

    if (spot.locked) {
      ctx.fillStyle = "#999";
      ctx.font = "12px Arial";
      ctx.fillText("🔒", spot.x - 6, spot.y + 5);
    }
  }

  // Update and draw bugs
  for (let i = bugs.length - 1; i >= 0; i--) {
    bugs[i].update();
    bugs[i].draw();

    if (bugs[i].hp <= 0) {
      bugs.splice(i, 1);
      score += 10;
      upgradeTokens++;
    } else if (bugs[i].reachedEnd) {
      bugs.splice(i, 1);
      strawberries--;
      if (strawberries <= 0) {
        alert("Game Over!");
        return;
      }
    }
  }

  // Update and draw towers
  for (let tower of towers) {
    tower.update(deltaTime);
    tower.draw();
  }

  // Update and draw projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (p.update()) {
      projectiles.splice(i, 1);
    } else {
      p.draw();
    }
    // === HUD / INSTRUCTIONS ===
  }
  ctx.fillStyle = "#2b2b2b";
  ctx.font = "16px Arial";
  ctx.shadowColor = "#fff6e5";
  ctx.shadowBlur = 3;
  ctx.fillText("Upgrades: " + upgradeTokens, 20, 30);

  if (upgradeTokens > 0) {
    ctx.fillStyle = "#2b2b2b";
    ctx.fillText("Upgrade Available!", 600, 30);
  }

  ctx.fillStyle = "#2b2b2b";
  ctx.font = "16px Arial";
  ctx.shadowColor = "#fff6e5";
  ctx.shadowBlur = 3;
  ctx.fillText("Wave: " + (wave - (inBuildPhase ? 1 : 0)), 20, 50);

  ctx.fillStyle = "#2b2b2b";
  ctx.font = "12px Arial";
  ctx.fillText("▶ Click open circles to place a tower", 20, canvas.height - 70);
  ctx.fillText(
    "🔼 Click existing towers to upgrade them (1 token)",
    20,
    canvas.height - 55
  );
  ctx.fillText(
    "🔓 Click locked spots to unlock (3 tokens)",
    20,
    canvas.height - 40
  );
  ctx.fillText(
    "🎯 Towers auto-shoot bugs. Don't let them reach the end!",
    20,
    canvas.height - 25
  );

  // Check if wave is done and no bugs remain
  if (!inBuildPhase && bugs.length === 0) {
    inBuildPhase = true;
    startWaveBtn.style.display = "block";
  }

  requestAnimationFrame(updateGame);
}

// Game starts in build phase — wait for player to click start
startWaveBtn.style.display = "block";
requestAnimationFrame(updateGame);
