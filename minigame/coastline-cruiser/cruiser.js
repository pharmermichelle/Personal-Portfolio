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
  palm: new Image(),
  ball: new Image(),
  toy: new Image(),
  tooth: new Image(),
  croc: new Image(),
  speaker: new Image(),
  backgroundBeach: [],
  backgroundVendor: [],
};

images.buggy1.src = "./assets/buggy.png";
images.buggy2.src = "./assets/buggy2.png";
images.buggy3.src = "./assets/buggy3.png";
images.crab.src = "./assets/crab.png";
images.cat.src = "./assets/cat.png";
images.palm.src = "./assets/palm_tree.png";
images.ball.src = "./assets/beach_ball.png";
images.toy.src = "./assets/shell.png";
images.tooth.src = "./assets/shark_tooth_glow.png";
images.croc.src = "./assets/croc.png";
images.speaker.src = "./assets/speaker.png";

// Background assets
const beachAssets = ["palm_tree.png"];
const vendorAssets = ["vendor_1.png"];

beachAssets.forEach((src) => {
  const img = new Image();
  img.src = `./assets/${src}`;
  images.backgroundBeach.push(img);
});

vendorAssets.forEach((src) => {
  const img = new Image();
  img.src = `./assets/${src}`;
  images.backgroundVendor.push(img);
});

let beachDecor = [];
let vendorDecor = [];

function spawnBackgroundDecor() {
  // Left beach decor (drift left)
  if (Math.random() < 0.02) {
    const xStart = 130 + Math.random() * 20;
    beachDecor.push({
      img: randomFrom(images.backgroundBeach),
      x: xStart,
      y: -50,
      speedY: 1,
      driftX: -0.2, // Outward drift
    });
  }
  // Right vendor decor (drift right)
  if (Math.random() < 0.02) {
    const xStart = 650 + Math.random() * 20;
    vendorDecor.push({
      img: randomFrom(images.backgroundVendor),
      x: xStart,
      y: -50,
      speedY: 1,
      driftX: 0.2, // Outward drift
    });
  }
}

function updateBackgroundDecor() {
  beachDecor.forEach((d) => {
    d.y += d.speedY;
    d.x += d.driftX * d.speedY;
  });
  vendorDecor.forEach((d) => {
    d.y += d.speedY;
    d.x += d.driftX * d.speedY;
  });

  beachDecor = beachDecor.filter((d) => d.y < canvas.height + 100);
  vendorDecor = vendorDecor.filter((d) => d.y < canvas.height + 100);
}

function drawBackgroundDecor() {
  beachDecor.forEach((d) => ctx.drawImage(d.img, d.x, d.y, 40, 40));
  vendorDecor.forEach((d) => ctx.drawImage(d.img, d.x, d.y, 60, 60));
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Car with upgrade logic
const car = {
  lane: 1,
  y: 300,
  width: 60,
  height: 60,
  get x() {
    return lanes[this.lane];
  },
  get img() {
    if (toothCount >= 12) return images.buggy3;
    if (toothCount >= 8) return images.buggy2;
    return images.buggy1;
  },
  moveLeft() {
    if (this.lane > 0) this.lane--;
  },
  moveRight() {
    if (this.lane < lanes.length - 1) this.lane++;
  },
};

let obstacles = [];
let powerups = [];
let spawnTimer = 0;
let toothTimer = 0;
let score = 0;
let gameOver = false;
let toothCount = 0;

const baseSpeed = 2.5;

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

function spawnObstacle() {
  const lane = Math.floor(Math.random() * lanes.length);
  const type = randomFrom(obstacleTypes);
  let driftX = 0;

  // More dramatic outward drift for left/right lanes
  if (lane === 0) driftX = -0.6; // stronger leftward
  else if (lane === 2) driftX = 0.6; // stronger rightward

  obstacles.push({
    ...type,
    x: lanes[lane],
    y: -type.height,
    driftX: driftX,
  });
}

function spawnTooth() {
  const lane = Math.floor(Math.random() * lanes.length);
  powerups.push({
    img: images.tooth,
    width: 30,
    height: 30,
    speed: 2,
    x: lanes[lane],
    y: -40,
  });
}

function updateObstacles() {
  obstacles.forEach((obj) => {
    obj.y += obj.speed;
    obj.x += obj.driftX * obj.speed;
  });

  obstacles = obstacles.filter((obj) => {
    if (obj.y > canvas.height) {
      score += 1;
      return false;
    }
    return true;
  });
}

function updatePowerups() {
  powerups.forEach((p) => (p.y += p.speed));
  powerups = powerups.filter((p) => {
    if (p.y > canvas.height) return false;
    if (checkCollision(car, p)) {
      score += 10;
      toothCount++;
      return false;
    }
    return true;
  });
}

function drawObstacles() {
  obstacles.forEach((obj) =>
    ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height)
  );
}

function drawPowerups() {
  powerups.forEach((p) => ctx.drawImage(p.img, p.x, p.y, p.width, p.height));
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = "40px sans-serif";
  ctx.fillText("Game Over!", canvas.width / 2 - 120, canvas.height / 2);
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "20px sans-serif";
  ctx.fillText("Score: " + score, 20, 30);
}

function drawCar() {
  ctx.drawImage(car.img, car.x, car.y, car.width, car.height);
}

function drawPowerupBar() {
  const barX = 20;
  const barY = 50;
  const maxTeeth = 12;
  const toothSize = 20;
  ctx.fillStyle = "#333";
  ctx.fillText("Teeth:", barX, barY - 5);
  for (let i = 0; i < maxTeeth; i++) {
    ctx.strokeStyle = "#666";
    ctx.strokeRect(barX + i * (toothSize + 2), barY, toothSize, toothSize);
    if (i < toothCount) {
      ctx.fillStyle = "#fcd12a";
      ctx.fillRect(barX + i * (toothSize + 2), barY, toothSize, toothSize);
    }
  }
}

function drawRoad() {
  // Base boardwalk color
  ctx.fillStyle = "#d6b88f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Simulate vertical perspective: planks taper narrower toward the top
  const plankCount = 20;
  const bottomPlankWidth = 40;
  const topPlankWidth = 10;

  for (let i = 0; i < plankCount; i++) {
    const t = i / plankCount;
    const xBottom = i * bottomPlankWidth;
    const xTop =
      i * topPlankWidth + (canvas.width - topPlankWidth * plankCount) / 2;

    ctx.beginPath();
    ctx.moveTo(xTop, 0);
    ctx.lineTo(xTop + topPlankWidth, 0);
    ctx.lineTo(xBottom + bottomPlankWidth, canvas.height);
    ctx.lineTo(xBottom, canvas.height);
    ctx.closePath();

    // Alternate color for plank shading
    ctx.fillStyle = i % 2 === 0 ? "#e5c79c" : "#cba474";
    ctx.fill();
  }
}

function gameLoop(timestamp) {
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

  if (timestamp - spawnTimer > 1500) {
    spawnObstacle();
    spawnTimer = timestamp;
  }

  if (timestamp - toothTimer > 4000) {
    spawnTooth();
    toothTimer = timestamp;
  }

  spawnBackgroundDecor();
  updateBackgroundDecor();
  updateObstacles();
  updatePowerups();

  for (let obj of obstacles) {
    if (checkCollision(car, obj)) {
      gameOver = true;
    }
  }

  requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") car.moveLeft();
  if (e.key === "ArrowRight") car.moveRight();
});
document
  .getElementById("leftBtn")
  .addEventListener("click", () => car.moveLeft());
document
  .getElementById("rightBtn")
  .addEventListener("click", () => car.moveRight());
document
  .getElementById("leftBtn")
  .addEventListener("touchstart", () => car.moveLeft());
document
  .getElementById("rightBtn")
  .addEventListener("touchstart", () => car.moveRight());

requestAnimationFrame(gameLoop);
