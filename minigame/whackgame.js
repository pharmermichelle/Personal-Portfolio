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
let bugTimer;
let saveService;
let deviceSaver;
let bugCount = 6; // Start with 6 bugs
let gameStarted = false;
let featureCreepActive = false;
let bugs = [];

function validateSave(state) {
  if (!Number.isSafeInteger(state?.highScore) || state.highScore < 0) {
    throw new Error("Invalid high score");
  }
  return { highScore: state.highScore };
}

function legacySave() {
  try {
    return validateSave({ highScore: Number(localStorage.getItem("highScore")) });
  } catch {
    return { highScore: 0 };
  }
}

let highScore = legacySave().highScore;
highScoreEl.textContent = highScore;

function restoreScore(state) {
  if (gameStarted) resetGame();
  highScore = state.highScore;
  highScoreEl.textContent = highScore;
}

const scoreAdapter = {
  gameId: "whack-a-bug",
  displayName: "Whack-a-Bug",
  schemaVersion: 1,
  gameVersion: "v1",
  emptyState: () => ({ highScore: 0 }),
  validateSave,
  readLegacyLocal: legacySave,
  restoreState: restoreScore,
  meaningful: state => state.highScore > 0,
  summarizeSave: state => `High score: ${state.highScore}`,
};

async function initializeCloudSave() {
  if (saveService || !window.RetroSaveService || !window.retroArcadeSupabaseClient) return;
  startBtn.disabled = true;
  try {
    saveService = window.RetroSaveService.create(scoreAdapter, {
      statusId: "whack-save-status",
      optionsId: "whack-sync-options",
    });
    restoreScore(await saveService.initialize() || scoreAdapter.emptyState());
  } catch {
    saveService = null;
    document.getElementById("whack-save-status").textContent = "Device only • cloud save unavailable";
  } finally {
    startBtn.disabled = false;
  }
}

window.addEventListener("retro-arcade-auth-ready", initializeCloudSave);
document.addEventListener("DOMContentLoaded", async () => {
  if (saveService || !window.RetroSaveService) return;
  deviceSaver = window.RetroSaveService.create(scoreAdapter, { statusId: "whack-save-status" });
  const restored = await deviceSaver.initialize();
  if (!saveService && restored) restoreScore(restored);
});

function recordHighScore() {
  if (score <= highScore) return;
  highScore = score;
  highScoreEl.textContent = highScore;
  const saver = saveService || deviceSaver;
  if (saver) {
    saver.save({ highScore });
  } else {
    try { localStorage.setItem("highScore", String(highScore)); } catch {}
  }
}

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
  bugTimer = setTimeout(() => {
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
      recordHighScore();
      alert("Game Over!");
    }
  }, 1000);

  gameStarted = true;
}

function resetGame() {
  clearInterval(gameTimer);
  clearTimeout(bugTimer);
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
