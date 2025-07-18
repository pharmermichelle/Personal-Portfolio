const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// ==== SHAPE GENERATOR ====
function generateRandomPuzzle(gridSize, pieceCount) {
  const grid = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(null)
  );
  const shapeSize = (gridSize * gridSize) / pieceCount;
  const shapes = [];
  let currentId = 1;

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  function isValid(x, y) {
    return (
      x >= 0 && y >= 0 && x < gridSize && y < gridSize && grid[y][x] === null
    );
  }

  function growShape(startX, startY) {
    const queue = [[startX, startY]];
    const blocks = [[startY, startX]];
    grid[startY][startX] = currentId;

    while (blocks.length < shapeSize && queue.length > 0) {
      const [cx, cy] = queue.shift();
      const neighbors = directions
        .map(([dx, dy]) => [cx + dx, cy + dy])
        .filter(([nx, ny]) => isValid(nx, ny));
      shuffle(neighbors);

      for (const [nx, ny] of neighbors) {
        if (blocks.length >= shapeSize) break;
        grid[ny][nx] = currentId;
        blocks.push([ny, nx]);
        queue.push([nx, ny]);
      }
    }

    return blocks;
  }

  while (currentId <= pieceCount) {
    let found = false;
    for (let y = 0; y < gridSize && !found; y++) {
      for (let x = 0; x < gridSize && !found; x++) {
        if (grid[y][x] === null) {
          const blocks = growShape(x, y);
          if (blocks.length === shapeSize) {
            shapes.push({
              name: `Shape-${currentId}`,
              color: `hsl(${Math.random() * 360}, 70%, 60%)`,
              blocks: blocks.map(([r, c]) => [
                r - Math.min(...blocks.map((b) => b[0])),
                c - Math.min(...blocks.map((b) => b[1])),
              ]),
            });
            currentId++;
            found = true;
          } else {
            return generateRandomPuzzle(gridSize, pieceCount); // Restart if failed
          }
        }
      }
    }
  }

  return shapes;
}

// ==== LEVELS ====
const levels = Array.from({ length: 10 }, (_, i) => {
  const size = 3 + i; // gridSize from 3 to 12
  return {
    gridSize: size,
    shapes: generateRandomPuzzle(size, size),
  };
});
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// ==== STATE ====
let currentLevel = 0;
let currentGridSize = levels[currentLevel].gridSize;
let cellSize = canvas.width / currentGridSize;
let availableShapes = shuffle([...levels[currentLevel].shapes]);

let acornCount = 0;
let placedPieces = [];
let heldPiece = null;
let pointerGridX = 0;
let pointerGridY = 0;
let heldOffset = [0, 0];

function updateAcornsDisplay() {
  document.getElementById("acorns").textContent = acornCount;
}

// ==== INPUT HANDLERS ====
function getGridCoords(x, y) {
  const rect = canvas.getBoundingClientRect();
  const gx = Math.floor((x - rect.left) / cellSize);
  const gy = Math.floor((y - rect.top) / cellSize);
  return [gx, gy];
}

function handlePointerDown(x, y) {
  if (!heldPiece) return;
  const [gx, gy] = getGridCoords(x, y);
  pointerGridX = gx;
  pointerGridY = gy;
  draw();
}

function handlePointerMove(x, y) {
  const [gx, gy] = getGridCoords(x, y);
  if (gx !== pointerGridX || gy !== pointerGridY) {
    pointerGridX = gx;
    pointerGridY = gy;
    draw();
  }
}

function handlePointerUp() {
  if (!heldPiece) return;

  const adjustedX = pointerGridX - heldPiece.origin[1];
  const adjustedY = pointerGridY - heldPiece.origin[0];

  // Validate shape placement
  for (const [r, c] of heldPiece.blocks) {
    const gx = adjustedX + c;
    const gy = adjustedY + r;

    // Reset cursor back to default or grab
    document.body.style.cursor = "default";

    // Remove any sidebar selection highlight
    document
      .querySelectorAll(".shape-piece")
      .forEach((el) => el.classList.remove("selected"));

    // Out of bounds check
    if (gx < 0 || gx >= currentGridSize || gy < 0 || gy >= currentGridSize) {
      heldPiece = null;
      draw();
      return; // Cancel placement
    }

    // Overlap check
    for (const placed of placedPieces) {
      for (const [pr, pc] of placed.blocks) {
        const px = placed.x + pc;
        const py = placed.y + pr;
        if (gx === px && gy === py) {
          heldPiece = null;
          draw();
          return; // Cancel placement
        }
      }
    }
  }

  // All checks passed — place the piece
  placedPieces.push({
    ...heldPiece,
    x: adjustedX,
    y: adjustedY,
  });

  availableShapes = availableShapes.filter((s) => s.name !== heldPiece.name);
  heldPiece = null;
  renderSidePanel();
  draw();
  checkWinCondition();
}

// ==== EVENT LISTENERS ====
canvas.addEventListener("mousedown", (e) =>
  handlePointerDown(e.clientX, e.clientY)
);
canvas.addEventListener("mousemove", (e) =>
  handlePointerMove(e.clientX, e.clientY)
);
canvas.addEventListener("mouseup", handlePointerUp);

canvas.addEventListener("touchstart", (e) => {
  const t = e.touches[0];
  handlePointerDown(t.clientX, t.clientY);
});
canvas.addEventListener("touchmove", (e) => {
  const t = e.touches[0];
  handlePointerMove(t.clientX, t.clientY);
});
canvas.addEventListener("touchend", handlePointerUp);

// ==== RENDERING ====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();
  drawPlacedPieces();
  drawHeldPreview();
}

const shapeTexture = new Image();
shapeTexture.src = "assets/shape-texture.png";

const moonGlint = new Image();
moonGlint.src = "assets/moon-glint.png";

function drawGrid() {
  for (let row = 0; row < currentGridSize; row++) {
    for (let col = 0; col < currentGridSize; col++) {
      ctx.strokeStyle = "#e9c46a";
      ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
    }
  }
}

function drawPlacedPieces() {
  placedPieces.forEach((piece) => {
    piece.blocks.forEach(([r, c]) => {
      const x = (piece.x + c) * cellSize;
      const y = (piece.y + r) * cellSize;

      // Fill color under texture
      ctx.fillStyle = piece.color;
      ctx.fillRect(x, y, cellSize, cellSize);

      // Texture overlays
      // Apply subtle texture
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.drawImage(shapeTexture, x, y, cellSize, cellSize);
      ctx.globalAlpha = 0.05;
      ctx.drawImage(moonGlint, x, y, cellSize, cellSize);
      ctx.restore();
    });
  });
}

function drawHeldPreview() {
  if (!heldPiece) return;
  ctx.save();
  ctx.globalAlpha = 0.5;

  heldPiece.blocks.forEach(([r, c]) => {
    const x = (pointerGridX + c - heldPiece.origin[1]) * cellSize;
    const y = (pointerGridY + r - heldPiece.origin[0]) * cellSize;

    // Base color
    ctx.fillStyle = heldPiece.color;
    ctx.fillRect(x, y, cellSize, cellSize);

    // Texture overlays
    // Apply subtle texture
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.drawImage(shapeTexture, x, y, cellSize, cellSize);
    ctx.globalAlpha = 0.05;
    ctx.drawImage(moonGlint, x, y, cellSize, cellSize);
    ctx.restore();
    // Outline
    ctx.strokeStyle = "#264653";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, cellSize, cellSize);
  });

  ctx.restore();
}

// ==== SIDEBAR ====
function renderSidePanel() {
  const piecesPanel = document.getElementById("pieces-panel");
  piecesPanel.innerHTML = "";

  availableShapes.forEach((shape) => {
    const preview = document.createElement("canvas");
    preview.width = 80;
    preview.height = 80;
    preview.className = "shape-piece";

    const pctx = preview.getContext("2d"); // <-- this was missing
    pctx.fillStyle = shape.color;

    const maxR = Math.max(...shape.blocks.map(([r]) => r));
    const maxC = Math.max(...shape.blocks.map(([, c]) => c));
    const scale = 60 / Math.max(maxR + 1, maxC + 1); // leave padding

    shape.blocks.forEach(([r, c]) => {
      pctx.fillRect(c * scale + 10, r * scale + 10, scale, scale);
    });

    preview.addEventListener("click", () => {
      heldPiece = {
        ...shape,
        origin: [
          Math.min(...shape.blocks.map(([r]) => r)),
          Math.min(...shape.blocks.map(([, c]) => c)),
        ],
      };
      // Remove 'selected' from all shapes
      document
        .querySelectorAll(".shape-piece")
        .forEach((el) => el.classList.remove("selected"));
      // Add 'selected' to the clicked one
      preview.classList.add("selected");

      // Change cursor to grabbing on the body
      document.body.style.cursor = "grabbing";
    });

    piecesPanel.appendChild(preview);
  });
}

// ==== LEVEL + GAME LOGIC ====

function checkWinCondition() {
  const grid = Array.from({ length: currentGridSize }, () =>
    Array(currentGridSize).fill(false)
  );

  for (const piece of placedPieces) {
    for (const [r, c] of piece.blocks) {
      const gx = piece.x + c;
      const gy = piece.y + r;

      if (
        gx < 0 ||
        gx >= currentGridSize ||
        gy < 0 ||
        gy >= currentGridSize ||
        grid[gy][gx]
      ) {
        return; // Out of bounds or overlap
      }

      grid[gy][gx] = true;
    }
  }

  const allFilled = grid.every((row) => row.every((cell) => cell));

  if (allFilled) {
    setTimeout(() => {
      acornCount++;
      updateAcornsDisplay();
      alert("Level Complete!");
      nextLevel();
    }, 100);
  }
}

function restartLevel() {
  const level = levels[currentLevel];
  currentGridSize = level.gridSize;
  cellSize = canvas.width / currentGridSize;

  placedPieces = [];
  availableShapes = shuffle([...level.shapes]); // ✅ This line stays
  heldPiece = null;
  renderSidePanel();
  draw();
  document.getElementById("level").innerText = currentLevel + 1;
}

function nextLevel() {
  if (currentLevel + 1 < levels.length) {
    currentLevel++;
    restartLevel();
  } else {
    // Final level reached, show ending screen after slight delay
    setTimeout(() => {
      document.getElementById("game-wrapper").style.display = "none";
      document.getElementById("hud").style.display = "none";
      document.getElementById("final-screen").style.display = "flex";
    }, 800);
  }
}

function restartGame() {
  currentLevel = 0;
  document.getElementById("final-screen").style.display = "none";
  document.getElementById("game-wrapper").style.display = "flex";
  document.getElementById("hud").style.display = "flex";
  restartLevel();
}
function playAgain() {
  currentLevel = 0;
  document.getElementById("final-screen").style.display = "none";
  document.getElementById("game-wrapper").style.display = "flex";
  document.getElementById("hud").style.display = "flex";
  restartLevel();
}

// ==== INIT ====
renderSidePanel();
draw();
