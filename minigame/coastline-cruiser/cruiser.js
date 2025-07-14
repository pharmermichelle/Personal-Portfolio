const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const lanes = [200, 350, 500];

// Load images
const images = {
  buggy1: new Image(),
  buggy2: new Image(),
  buggy3: new Image(),
  crab: new Image(),
  cat: new Image(),
  croc: new Image(),
  speaker: new Image(),
  tooth: new Image(),
  backgroundBeach: [],
  backgroundVendor: [],
};

const beachAssets = ["palm_tree.png"];
const vendorAssets = ["vendor_1.png"];

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
loadImage(images.tooth, "./assets/shark_tooth_glow.png");

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

const baseSpeed = 1.5;
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

// --- SPAWN / UPDATE DECOR ---
function spawnBackgroundDecor() {
  if (Math.random() < 0.02) {
    beachDecor.push({
      img: randomFrom(images.backgroundBeach),
      x: 130 + Math.random() * 20,
      y: -50,
      speed: 1,
      driftX: -0.9,
    });
  }
  if (Math.random() < 0.02) {
    vendorDecor.push({
      img: randomFrom(images.backgroundVendor),
      x: 650 + Math.random() * 20,
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
    if (checkCollision(car, { x: d.x, y: d.y, width, height })) {
      gameOver = true;
    }
  });

  vendorDecor.forEach((d) => {
    d.y += d.speed;
    d.x += d.driftX * d.speed; // LESS CURVY
    const scale = 1 + (d.y / canvas.height) * 0.5;
    const width = 60 * scale;
    const height = 60 * scale;
    if (checkCollision(car, { x: d.x, y: d.y, width, height })) {
      gameOver = true;
    }
  });

  beachDecor = beachDecor.filter((d) => d.y < canvas.height + 100);
  vendorDecor = vendorDecor.filter((d) => d.y < canvas.height + 100);
}

// --- SPAWN / UPDATE OBSTACLES ---
function spawnObstacle() {
  const lane = Math.floor(Math.random() * lanes.length);
  const type = randomFrom(obstacleTypes);
  let driftX = 0;
  if (lane === 0) driftX = -0.6;
  if (lane === 2) driftX = 0.6;
  obstacles.push({
    x: lanes[lane],
    y: -type.height,
    width: type.width,
    height: type.height,
    img: type.img,
    speed: type.speed,
    driftX: driftX,
  });
}
function updateObstacles() {
  obstacles.forEach((o) => {
    o.y += o.speed;
    o.x += o.driftX * o.speed * (o.y / canvas.height);
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
  const lane = Math.floor(Math.random() * lanes.length);
  let driftX = 0;
  if (lane === 0) driftX = -0.6;
  if (lane === 2) driftX = 0.6;
  powerups.push({
    img: images.tooth,
    width: 30,
    height: 30,
    speed: 2,
    x: lanes[lane],
    y: -40,
    driftX: driftX,
  });
}
function updatePowerups() {
  powerups.forEach((p) => {
    p.y += p.speed;
    p.x += p.driftX * p.speed * (p.y / canvas.height);
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
    toothCount >= 12
      ? images.buggy3
      : toothCount >= 8
      ? images.buggy2
      : images.buggy1;
  ctx.drawImage(img, car.x, car.y, car.width, car.height);
}

function drawPowerupBar() {
  const barX = 20,
    barY = 50,
    toothSize = 20,
    max = 12;
  ctx.fillStyle = "#000";
  ctx.fillText("Teeth:", barX, barY - 5);
  for (let i = 0; i < max; i++) {
    ctx.strokeStyle = "#666";
    ctx.strokeRect(barX + i * (toothSize + 2), barY, toothSize, toothSize);
    if (i < toothCount) {
      ctx.fillStyle = "#fcd12a";
      ctx.fillRect(barX + i * (toothSize + 2), barY, toothSize, toothSize);
    }
  }
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px sans-serif";
  ctx.fillText("Score: " + score, 20, 30);
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
  y: 300,
  width: 60,
  height: 60,
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
  requestAnimationFrame(gameLoop);
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
