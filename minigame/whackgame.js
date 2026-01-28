const holes = document.querySelectorAll(".hole");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const highScoreEl = document.getElementById("high-score-value");
const featureCreepEl = document.getElementById("feature-creep");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");

let score = 0;
let timeLeft = 20;
let lastHole;
let gameTimer;
let bugCount = 6; // Start with 6 bugs
let gameStarted = false;
let featureCreepActive = false;
let bugs = [];

const highScore = localStorage.getItem("highScore") || 0;
highScoreEl.textContent = highScore;

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];
  if (hole === lastHole) return randomHole(holes);
  lastHole = hole;
  return hole;
}

function showBug() {
  const time = randomTime(500, 1000);
  const hole = randomHole(holes);
  const bugType = Math.random() < 0.5 ? "bug" : "bug-red"; // Randomly choose green or red bug emoji

  // Insert the emoji inside the hole
  hole.innerHTML = `<div class="${bugType}">${
    bugType === "bug" ? "🐞" : "🪲"
  }</div>`;

  // Handle bug disappearing after some time
  setTimeout(() => {
    hole.innerHTML = ""; // Remove the bug
    if (timeLeft > 0 && !featureCreepActive) showBug(); // Continue showing bugs unless feature creep is active
  }, time);
}

function startGame() {
  score = 0;
  timeLeft = 20;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  featureCreepEl.style.display = "none"; // Hide feature creep message
  bugs = [];
  showBug(); // Start showing bugs

  gameTimer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(gameTimer);
      if (score > highScore) {
        localStorage.setItem("highScore", score);
        highScoreEl.textContent = score;
      }
      alert("Game Over!");
    }
  }, 1000);

  gameStarted = true;
}

function resetGame() {
  clearInterval(gameTimer);
  gameStarted = false;
  score = 0;
  timeLeft = 20;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  featureCreepEl.style.display = "none"; // Hide feature creep
  holes.forEach((hole) => (hole.innerHTML = "")); // Clear any existing bugs
  bugs = [];
}

document.querySelectorAll(".hole").forEach((hole) => {
  hole.addEventListener("click", () => {
    const bug = hole.querySelector(".bug, .bug-red");
    if (!bug) return;

    // Update score based on bug type
    if (bug.classList.contains("bug")) {
      score += 1; // Green bugs are worth 1 point
    } else {
      score += 3; // Red bugs are worth 3 points
    }

    // Remove the bug after it's clicked
    hole.innerHTML = "";
    scoreEl.textContent = score;
  });
});

// Feature creep: Add more holes for bugs to pop out of
featureCreepEl.addEventListener("click", () => {
  featureCreepActive = true;
  const gameContainer = document.getElementById("game");
  const newHole = document.createElement("div");
  newHole.classList.add("hole");
  gameContainer.appendChild(newHole); // Add new hole to game container
  holes.push(newHole); // Add the new hole to the array of holes
  featureCreepEl.style.display = "none"; // Hide the feature creep message after it's used
  setTimeout(() => {
    featureCreepActive = false; // Deactivate feature creep after a delay
  }, 5000); // Deactivate feature creep after 5 seconds
});

// Start button functionality
startBtn.addEventListener("click", () => {
  if (!gameStarted) startGame();
});

// Reset button functionality
resetBtn.addEventListener("click", resetGame);
