const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 32;
const LEVEL_COUNT = 30;

const COLORS = {
  I: "#0b7285",
  J: "#1f6f50",
  L: "#c66b3d",
  O: "#c8a454",
  S: "#2b8a3e",
  T: "#6f4773",
  Z: "#c83245",

  garbage1: "#344255",
  garbage2: "#50627a",

  empty: "#05070a"
};

const TETROMINOES = {
  I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
  J: [[1,0,0],[1,1,1],[0,0,0]],
  L: [[0,0,1],[1,1,1],[0,0,0]],
  O: [[1,1],[1,1]],
  S: [[0,1,1],[1,1,0],[0,0,0]],
  T: [[0,1,0],[1,1,1],[0,0,0]],
  Z: [[1,1,0],[0,1,1],[0,0,0]]
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const levelEl = document.getElementById("level");
const linesEl = document.getElementById("lines");
const scoreEl = document.getElementById("score");

const restartBtn = document.getElementById("restartBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const rotateBtn = document.getElementById("rotateBtn");
const downBtn = document.getElementById("downBtn");
const dropBtn = document.getElementById("dropBtn");

let board;
let currentPiece;

let dropCounter = 0;
let dropInterval = 800;
let lastTime = 0;

let level = 1;
let linesCleared = 0;
let score = 0;
let gameOver = false;

let animationFrameId = null;

function createMatrix(cols, rows) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rotateMatrixCW(matrix) {
  const h = matrix.length;
  const w = matrix[0].length;
  const rotated = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      rotated[x][h - 1 - y] = matrix[y][x];
    }
  }
  return rotated;
}

function hasPathToBottom(grid) {
  const visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  const queue = [];

  for (let x = 0; x < COLS; x++) {
    if (!grid[0][x]) {
      visited[0][x] = true;
      queue.push([0, x]);
    }
  }

  while (queue.length) {
    const [y, x] = queue.shift();
    if (y === ROWS - 1) return true;

    const neighbors = [
      [y + 1, x],
      [y - 1, x],
      [y, x + 1],
      [y, x - 1]
    ];

    for (const [ny, nx] of neighbors) {
      if (
        ny >= 0 &&
        ny < ROWS &&
        nx >= 0 &&
        nx < COLS &&
        !visited[ny][nx] &&
        !grid[ny][nx]
      ) {
        visited[ny][nx] = true;
        queue.push([ny, nx]);
      }
    }
  }

  return false;
}

function generateHalfFilledBoard(levelIndex) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const grid = createMatrix(COLS, ROWS);
    const startRow = Math.floor(ROWS / 2);
    const density = Math.min(0.62, 0.28 + (levelIndex - 1) * 0.012);

    for (let y = startRow; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (Math.random() < density) {
          grid[y][x] = {
            type: Math.random() < 0.5 ? "garbage1" : "garbage2",
            solid: true
          };
        }
      }

      if (grid[y].every(cell => cell)) {
        grid[y][Math.floor(Math.random() * COLS)] = null;
      }
    }

    for (let x = 0; x < COLS; x++) {
      grid[0][x] = null;
    }

    if (hasPathToBottom(grid)) return grid;
  }

  const fallback = createMatrix(COLS, ROWS);
  for (let y = Math.floor(ROWS / 2); y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      fallback[y][x] = { type: "garbage1", solid: true };
    }
  }

  for (let y = 0; y < ROWS; y++) {
    fallback[y][Math.floor(COLS / 2)] = null;
  }

  return fallback;
}

function isBoardSolvable(grid) {
  return hasPathToBottom(grid);
}

function createPiece() {
  const shapeId = randomChoice(Object.keys(TETROMINOES));
  const matrix = TETROMINOES[shapeId].map(row => row.slice());

  return {
    shapeId,
    matrix,
    x: ((COLS / 2) | 0) - ((matrix[0].length / 2) | 0),
    y: 0
  };
}

function collide(board, piece) {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (piece.matrix[y][x]) {
        const bx = x + piece.x;
        const by = y + piece.y;
        if (bx < 0 || bx >= COLS || by >= ROWS || (by >= 0 && board[by][bx])) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge(board, piece) {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (piece.matrix[y][x]) {
        const bx = x + piece.x;
        const by = y + piece.y;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
          board[by][bx] = { type: piece.shapeId, solid: true };
        }
      }
    }
  }
}

function clearLines() {
  let cleared = 0;

  for (let y = ROWS - 1; y >= 0;) {
    if (board[y].every(cell => cell && cell.solid)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
    } else {
      y--;
    }
  }

  if (cleared) {
    linesCleared += cleared;
    score += cleared * 100 * level;
    dropInterval = Math.max(120, dropInterval - cleared * 10);
  }
}

function colorForCell(cell) {
  if (cell.type === "garbage1") return COLORS.garbage1;
  if (cell.type === "garbage2") return COLORS.garbage2;
  return COLORS[cell.type] || COLORS.empty;
}

function drawCell(x, y, cell) {
  const px = x * BLOCK_SIZE;
  const py = y * BLOCK_SIZE;

  if (!cell) {
    ctx.fillStyle = COLORS.empty;
    ctx.fillRect(px, py, BLOCK_SIZE, BLOCK_SIZE);

    ctx.strokeStyle = "rgba(38, 50, 68, 0.72)";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      px + 0.5,
      py + 0.5,
      BLOCK_SIZE - 1,
      BLOCK_SIZE - 1
    );

    return;
  }

  const color = colorForCell(cell);

  ctx.fillStyle = color;
  ctx.fillRect(
    px + 1,
    py + 1,
    BLOCK_SIZE - 2,
    BLOCK_SIZE - 2
  );

  const isGarbage =
    cell.type === "garbage1" ||
    cell.type === "garbage2";

  ctx.strokeStyle = isGarbage
    ? "rgba(170, 195, 225, 0.48)"
    : "rgba(0, 0, 0, 0.75)";

  ctx.lineWidth = isGarbage ? 2 : 2;

  ctx.strokeRect(
    px + 1.5,
    py + 1.5,
    BLOCK_SIZE - 3,
    BLOCK_SIZE - 3
  );

  /*
  Adds a small top highlight so blocked tiles look visibly raised.
  */
  if (isGarbage) {
    ctx.strokeStyle = "rgba(225, 235, 248, 0.18)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(px + 3, py + 3);
    ctx.lineTo(px + BLOCK_SIZE - 3, py + 3);
    ctx.stroke();
  }
}

function drawBoard() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      drawCell(x, y, board[y][x]);
    }
  }
}

function drawPiece(piece) {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (piece.matrix[y][x]) {
        const bx = piece.x + x;
        const by = piece.y + y;
        if (by >= 0) {
          drawCell(bx, by, { type: piece.shapeId, solid: true });
        }
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  if (currentPiece) drawPiece(currentPiece);

  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f5f5f5";
    ctx.textAlign = "center";
    ctx.font = "bold 28px system-ui";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  }
}

function updateHud() {
  levelEl.textContent = level;
  linesEl.textContent = linesCleared;
  scoreEl.textContent = score;
}

function startLevel(levelIndex) {
  board = generateHalfFilledBoard(levelIndex);
  if (!isBoardSolvable(board)) {
    board = generateHalfFilledBoard(levelIndex);
  }
  currentPiece = createPiece();
  dropInterval = Math.max(800 - (levelIndex - 1) * 20, 200);
  dropCounter = 0;
  gameOver = false;
  updateHud();
}

function resetGame() {
  level = 1;
  linesCleared = 0;
  score = 0;

  dropCounter = 0;
  lastTime = performance.now();

  startLevel(1);
  updateHud();
  draw();
}

function endGame() {
  gameOver = true;
}

function drop() {
  currentPiece.y++;
  if (collide(board, currentPiece)) {
    currentPiece.y--;
    merge(board, currentPiece);
    clearLines();
    updateHud();

    if (currentPiece.y === 0) {
      endGame();
      return;
    }

    if (linesCleared >= level * 3 && level < LEVEL_COUNT) {
      level++;
      startLevel(level);
      return;
    }

    currentPiece = createPiece();
    if (collide(board, currentPiece)) {
      endGame();
    }
  }
  dropCounter = 0;
}

function move(dir) {
  currentPiece.x += dir;
  if (collide(board, currentPiece)) {
    currentPiece.x -= dir;
  }
}

function softDrop() {
  currentPiece.y++;
  if (collide(board, currentPiece)) {
    currentPiece.y--;
    drop();
  }
}

function hardDrop() {
  while (!collide(board, currentPiece)) {
    currentPiece.y++;
  }
  currentPiece.y--;
  drop();
}

function rotate() {
  const original = currentPiece.matrix;
  currentPiece.matrix = rotateMatrixCW(original);

  if (collide(board, currentPiece)) {
    currentPiece.x++;
    if (collide(board, currentPiece)) {
      currentPiece.x -= 2;
      if (collide(board, currentPiece)) {
        currentPiece.x++;
        currentPiece.matrix = original;
      }
    }
  }
}

function update(time = performance.now()) {
  const deltaTime = Math.min(time - lastTime, 100);
  lastTime = time;

  if (!gameOver && currentPiece) {
    dropCounter += deltaTime;

    if (dropCounter >= dropInterval) {
      drop();
    }
  }

  draw();
  animationFrameId = requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.code === "ArrowLeft") move(-1);
  else if (e.code === "ArrowRight") move(1);
  else if (e.code === "ArrowUp") rotate();
  else if (e.code === "ArrowDown") softDrop();
  else if (e.code === "Space") hardDrop();
});

function runIfPlaying(action) {
  if (!gameOver && currentPiece) {
    action();
  }
}

function bindControl(button, action, options = {}) {
  const repeat = options.repeat ?? false;
  const repeatDelay = options.repeatDelay ?? 180;
  const repeatRate = options.repeatRate ?? 90;

  let delayTimer = null;
  let repeatTimer = null;

  function stop() {
    clearTimeout(delayTimer);
    clearInterval(repeatTimer);

    delayTimer = null;
    repeatTimer = null;
  }

  button.addEventListener("pointerdown", event => {
    event.preventDefault();

    if (button.setPointerCapture) {
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional.
      }
    }

    runIfPlaying(action);

    if (repeat) {
      delayTimer = setTimeout(() => {
        repeatTimer = setInterval(() => {
          runIfPlaying(action);
        }, repeatRate);
      }, repeatDelay);
    }
  });

  button.addEventListener("pointerup", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("lostpointercapture", stop);
  button.addEventListener("contextmenu", event => {
    event.preventDefault();
  });
}

bindControl(leftBtn, () => move(-1), {
  repeat: true
});

bindControl(rightBtn, () => move(1), {
  repeat: true
});

bindControl(downBtn, softDrop, {
  repeat: true,
  repeatRate: 70
});

bindControl(rotateBtn, rotate);

bindControl(dropBtn, hardDrop);

restartBtn.addEventListener("click", event => {
  event.preventDefault();
  resetGame();
});

resetGame();
animationFrameId = requestAnimationFrame(update);