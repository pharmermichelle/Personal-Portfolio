const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const lanes = [100, 350, 625];
const spawnLanes = [225, 350, 450];

const baseSpeed = 1.0;

// Load images
const images = {
  buggy1: new Image(),
  buggy2: new Image(),
  buggy3: new Image(),
  crab: new Image(),
  cat: new Image(),
  croc: new Image(),
  speaker: new Image(),
  guy: new Image(),
  trash: new Image(),
  tooth: new Image(),
  backgroundBeach: [],
  backgroundVendor: [],
};

const beachAssets = ["palm_tree.png"];
const vendorAssets = ["vendor_1.png"];

const highScoresKey = "coastlineHighScores";
let highScores = JSON.parse(localStorage.getItem(highScoresKey)) || [];
updateScoreDropdown();

let loadedImages = 0;
let totalImages = 8 + beachAssets.length + vendorAssets.length;

function tryStartGame() {
  loadedImages++;
  if (loadedImages === totalImages) {
    requestAnimationFrame(gameLoop);
  }
}

function loadImage(img, src, targetArray = null) {
  img.src = src;
  img.onload = tryStartGame;
  if (targetArray) {
    targetArray.push(img);
  }
}

let resetBtn = {
  x: canvas.width / 2 - 75,
  y: canvas.height / 2 + 40,
  width: 150,
  height: 40,
  visible: false,
};

// Load buggy images
loadImage(images.buggy1, "./assets/buggy.png");
loadImage(images.buggy2, "./assets/buggy2.png");
loadImage(images.buggy3, "./assets/buggy3.png");

// Load other object images
loadImage(images.crab, "./assets/crab.png");
loadImage(images.cat, "./assets/cat.png");
loadImage(images.croc, "./assets/croc.png");
loadImage(images.speaker, "./assets/speaker.png");
loadImage(images.trash, "./assets/trash.png");
loadImage(images.guy, "./assets/guy.png");
loadImage(images.tooth, "./assets/shark_tooth_glow.png");

const obstacleTypesLevel1 = [
  { name: "crab", img: images.crab, width: 40, height: 40, speed: baseSpeed },
  {
    name: "cat",
    img: images.cat,
    width: 50,
    height: 45,
    speed: baseSpeed + 0.5,
  },
  { name: "croc", img: images.croc, width: 60, height: 40, speed: baseSpeed },
  {
    name: "speaker",
    img: images.speaker,
    width: 50,
    height: 50,
    speed: baseSpeed,
  },
];

const obstacleTypesLevel2 = [
  { name: "crab", img: images.crab, width: 40, height: 40, speed: baseSpeed },
  {
    name: "speaker",
    img: images.speaker,
    width: 50,
    height: 50,
    speed: baseSpeed,
  },
  {
    name: "cat",
    img: images.cat,
    width: 50,
    height: 45,
    speed: baseSpeed + 0.5,
  },
  {
    name: "croc",
    img: images.croc,
    width: 60,
    height: 40,
    speed: baseSpeed + 0.2,
  },
  {
    name: "trash",
    img: images.trash,
    width: 60,
    height: 60,
    speed: baseSpeed - 0.2,
  },
  {
    name: "guy",
    img: images.guy,
    width: 80,
    height: 90,
    speed: baseSpeed - 0.2,
  },
];

// Load background assets
beachAssets.forEach((src) => {
  const img = new Image();
  loadImage(img, `./assets/${src}`, images.backgroundBeach);
});
vendorAssets.forEach((src) => {
  const img = new Image();
  loadImage(img, `./assets/${src}`, images.backgroundVendor);
});

// --- GAME STATE ---
let beachDecor = [];
let vendorDecor = [];
let obstacles = [];
let powerups = [];
let spawnTimer = 0;
let toothTimer = 0;
let score = 0;
let gameOver = false;
let toothCount = 0;

const obstacleTypes = [
  { name: "crab", img: images.crab, width: 40, height: 40, speed: baseSpeed },
  { name: "cat", img: images.cat, width: 50, height: 45, speed: baseSpeed + 1 },
  { name: "croc", img: images.croc, width: 60, height: 40, speed: baseSpeed },
  {
    name: "speaker",
    img: images.speaker,
    width: 50,
    height: 50,
    speed: baseSpeed,
  },
  {
    name: "trash",
    img: images.trash,
    width: 60,
    height: 60,
    speed: baseSpeed - 0.2,
  },
  {
    name: "guy",
    img: images.guy,
    width: 80,
    height: 90,
    speed: baseSpeed - 0.2,
  },
];

// --- UTILITIES ---
function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// LEVEL DESIGN
let level = 1;

function updateLevel() {
  if (toothCount >= 9) level = 3;
  else if (toothCount >= 5) level = 2;
  else level = 1;
}

// --- SPAWN / UPDATE DECOR ---
function spawnBackgroundDecor() {
  if (Math.random() < 0.02) {
    beachDecor.push({
      img: randomFrom(images.backgroundBeach),
      x: lanes[0] + Math.random() * 30, // beach
      y: -50,
      speed: 1,
      driftX: -0.9,
    });
  }
  if (Math.random() < 0.02) {
    vendorDecor.push({
      img: randomFrom(images.backgroundVendor),
      x: lanes[2] + Math.random() * 30, // vendor
      y: -50,
      speed: 1,
      driftX: 0.9,
    });
  }
}
function updateBackgroundDecor() {
  beachDecor.forEach((d) => {
    d.y += d.speed;
    d.x += d.driftX * d.speed; // LESS CURVY
    const scale = 1 + (d.y / canvas.height) * 0.5;
    const width = 40 * scale;
    const height = 40 * scale;
    const padding = 15;
    if (
      checkCollision(car, {
        x: d.x - padding,
        y: d.y - padding,
        width: width + padding * 2,
        height: height + padding * 2,
      })
    ) {
      gameOver = true;
    }
  });

  vendorDecor.forEach((d) => {
    d.y += d.speed;
    d.x += d.driftX * d.speed; // LESS CURVY
    const scale = 1 + (d.y / canvas.height) * 0.5;
    const width = 60 * scale;
    const height = 60 * scale;
    const padding = 15;
    if (
      checkCollision(car, {
        x: d.x - padding,
        y: d.y - padding,
        width: width + padding * 2,
        height: height + padding * 2,
      })
    ) {
      gameOver = true;
    }
  });

  beachDecor = beachDecor.filter((d) => d.y < canvas.height + 100);
  vendorDecor = vendorDecor.filter((d) => d.y < canvas.height + 100);
}

// --- SPAWN / UPDATE OBSTACLES ---
function spawnObstacle() {
  const lane = Math.floor(Math.random() * spawnLanes.length);
  const types = level >= 2 ? obstacleTypesLevel2 : obstacleTypesLevel1;
  const type = randomFrom(obstacleTypes);

  let driftX = 0;
  if (lane === 0) driftX = -0.5;
  if (lane === 2) driftX = 0.5;

  // Modify speed by level
  const speedMultiplier = level === 3 ? 1.5 : level === 2 ? 1.2 : 1;

  const laneCenter = spawnLanes[lane] + car.width / 2 - type.width / 2;

  obstacles.push({
    x: laneCenter,
    y: -type.height,
    width: type.width,
    height: type.height,
    img: type.img,
    speed: type.speed * speedMultiplier,
    driftX: driftX,
  });
}

function updateObstacles() {
  obstacles.forEach((o) => {
    o.y += o.speed;
    o.x += o.driftX * o.speed;
  });
  obstacles = obstacles.filter((o) => {
    if (o.y > canvas.height) {
      score++;
      return false;
    }
    return true;
  });
}

// --- SPAWN / UPDATE POWERUPS ---
function spawnTooth() {
  const lane = Math.floor(Math.random() * spawnLanes.length);

  let driftX = 0;
  if (lane === 0) driftX = -0.6;
  if (lane === 2) driftX = 0.6;

  const laneCenter = spawnLanes[lane] + car.width / 2 - 15;

  powerups.push({
    img: images.tooth,
    width: 30,
    height: 30,
    speed: 2,
    x: laneCenter,
    y: -40,
    driftX: driftX,
  });
}

function updatePowerups() {
  powerups.forEach((p) => {
    p.y += p.speed;
    p.x += p.driftX * p.speed;
  });
  powerups = powerups.filter((p) => {
    if (p.y > canvas.height) return false;
    if (checkCollision(car, p)) {
      toothCount++;
      score += 10;
      return false;
    }
    return true;
  });
}

// --- DRAW FUNCTIONS ---
function drawBackgroundDecor() {
  beachDecor.forEach((d) => {
    const scale = 1 + (d.y / canvas.height) * 0.5;
    ctx.drawImage(d.img, d.x, d.y, 40 * scale, 40 * scale);
  });
  vendorDecor.forEach((d) => {
    const scale = 1 + (d.y / canvas.height) * 0.5;
    ctx.drawImage(d.img, d.x, d.y, 60 * scale, 60 * scale);
  });
}

function drawObstacles() {
  obstacles.forEach((o) => {
    const scale = 1 + (o.y / canvas.height) * 0.5;
    ctx.drawImage(o.img, o.x, o.y, o.width * scale, o.height * scale);
  });
}

function drawPowerups() {
  powerups.forEach((p) => {
    const scale = 1 + (p.y / canvas.height) * 0.5;
    ctx.drawImage(p.img, p.x, p.y, p.width * scale, p.height * scale);
  });
}

function drawCar() {
  const img =
    toothCount >= 9
      ? images.buggy3
      : toothCount >= 4
      ? images.buggy2
      : images.buggy1;
  ctx.drawImage(img, car.x, car.y, car.width, car.height);
}

function drawPowerupBar() {
  const barX = 20,
    barY = 50,
    toothSize = 25,
    max = 9;

  ctx.fillStyle = "#000";
  ctx.font = "20px sans-serif";
  ctx.fillText("Teeth:", barX, barY - 10);

  for (let i = 0; i < max; i++) {
    const x = barX + i * (toothSize + 4);
    if (i < toothCount) {
      ctx.drawImage(images.tooth, x, barY, toothSize, toothSize);
    } else {
      ctx.strokeStyle = "#999";
      ctx.strokeRect(x, barY, toothSize, toothSize);
    }
  }
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px sans-serif";
  ctx.fillText("Score: " + score, 20, 24);
  ctx.fillText("Level: " + level, 700, 30);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "40px sans-serif";
  ctx.fillText("Game Over!", canvas.width / 2 - 120, canvas.height / 2);

  // Draw Reset Button
  ctx.fillStyle = "#fcd12a";
  ctx.fillRect(resetBtn.x, resetBtn.y, resetBtn.width, resetBtn.height);
  ctx.strokeStyle = "#000";
  ctx.strokeRect(resetBtn.x, resetBtn.y, resetBtn.width, resetBtn.height);
  ctx.fillStyle = "#000";
  ctx.font = "20px sans-serif";
  ctx.fillText("Play Again", resetBtn.x + 30, resetBtn.y + 26);

  resetBtn.visible = true;
}

// --- CAR DEFINITION ---
const car = {
  lane: 1,
  y: 250,
  width: 160,
  height: 160,
  promptedInitials: false,
  get x() {
    return lanes[this.lane];
  },
  moveLeft() {
    if (this.lane > 0) this.lane--;
  },
  moveRight() {
    if (this.lane < lanes.length - 1) this.lane++;
  },
};

// --- ROAD ---
function drawRoad() {
  ctx.fillStyle = "#d6b88f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // vertical tapered planks
  const planks = 20,
    w0 = 40,
    w1 = 10;
  for (let i = 0; i < planks; i++) {
    const xB = i * w0;
    const xT = i * w1 + (canvas.width - planks * w1) / 2;
    ctx.beginPath();
    ctx.moveTo(xT, 0);
    ctx.lineTo(xT + w1, 0);
    ctx.lineTo(xB + w0, canvas.height);
    ctx.lineTo(xB, canvas.height);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? "#cba474" : "#e5c79c";
    ctx.fill();
  }
}

// --- MAIN LOOP ---
function gameLoop(ts) {
  if (gameOver) {
    drawGameOver();
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRoad();
  drawBackgroundDecor();
  drawCar();
  drawObstacles();
  drawPowerups();
  drawScore();
  drawPowerupBar();
  updateLevel();

  if (ts - spawnTimer > 1500) {
    spawnObstacle();
    spawnTimer = ts;
  }
  if (ts - toothTimer > 4000) {
    spawnTooth();
    toothTimer = ts;
  }

  spawnBackgroundDecor();
  updateBackgroundDecor();
  updateObstacles();
  updatePowerups();

  for (const o of obstacles) {
    if (checkCollision(car, o)) {
      gameOver = true;
      if (!car.promptedInitials) {
        setTimeout(() => {
          submitScore();
        }, 100); // Small delay to allow the game over screen to render
        car.promptedInitials = true;
      }
    }
  }
  requestAnimationFrame(gameLoop);
}
function resetGame() {
  obstacles = [];
  powerups = [];
  beachDecor = [];
  vendorDecor = [];
  score = 0;
  toothCount = 0;
  gameOver = false;
  resetBtn.visible = false;
  car.promptedInitials = false;
  requestAnimationFrame(gameLoop);
}

// --- Leaderboard ---
function submitScore() {
  const initials = prompt(
    "You made the high score! Enter your initials (3 letters):"
  );
  if (!initials) return;

  highScores.push({ initials, score });
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 5); // Keep only top 5

  localStorage.setItem(highScoresKey, JSON.stringify(highScores));
  updateScoreDropdown();

  initialsInput.value = "";
}
function updateScoreDropdown() {
  const list = document.getElementById("highScoresList");
  if (!list) return;
  list.innerHTML = "";

  highScores.forEach(({ initials, score }) => {
    const li = document.createElement("li");
    li.textContent = `${initials} - ${score}`;
    list.appendChild(li);
  });
}

// --- INPUT ---
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") car.moveLeft();
  if (e.key === "ArrowRight") car.moveRight();
});
["click", "touchstart"].forEach((evt) => {
  document
    .getElementById("leftBtn")
    .addEventListener(evt, () => car.moveLeft());
  document
    .getElementById("rightBtn")
    .addEventListener(evt, () => car.moveRight());
});

canvas.addEventListener("click", (e) => {
  if (!resetBtn.visible) return;
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  if (
    mx >= resetBtn.x &&
    mx <= resetBtn.x + resetBtn.width &&
    my >= resetBtn.y &&
    my <= resetBtn.y + resetBtn.height
  ) {
    resetGame();
  }
});
function updateScoreDropdown() {
  const list = document.getElementById("highScoresList");
  if (!list) return;

  list.innerHTML = "";
  highScores.forEach(({ initials, score }) => {
    const li = document.createElement("li");
    li.textContent = `${initials} - ${score}`;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateScoreDropdown();
});
