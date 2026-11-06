"use strict";

// Acorn Ascent v2 — solvable puzzles, pointer drag/drop, rotations, undo, hints.
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const dragPreview = document.getElementById("drag-preview");
const BOARD_SIZE = canvas.width;
const SAVE_KEY = "acorn-ascent-progress-v2";
const PALETTE = ["#eeb476", "#8cbe91", "#90b8d8", "#da9da1", "#b0a4db", "#d6cc85", "#80bec1", "#db9d70", "#a9cc9a"];
const CONFIG = [
  { size: 3, pieces: 3, twists: 0, label: "The First Branch", difficulty: "GENTLE" },
  { size: 4, pieces: 4, twists: 0, label: "The Mossy Fork", difficulty: "GENTLE" },
  { size: 4, pieces: 4, twists: 2, label: "The Curved Bough", difficulty: "WARMING UP" },
  { size: 5, pieces: 5, twists: 3, label: "The Hidden Knothole", difficulty: "WARMING UP" },
  { size: 5, pieces: 6, twists: 4, label: "The Rustling Leaves", difficulty: "TRICKY" },
  { size: 6, pieces: 6, twists: 5, label: "The Twisting Limbs", difficulty: "TRICKY" },
  { size: 6, pieces: 7, twists: 6, label: "The Old Owl's Perch", difficulty: "CHALLENGING" },
  { size: 7, pieces: 7, twists: 7, label: "The High Canopy", difficulty: "CHALLENGING" },
  { size: 7, pieces: 8, twists: 8, label: "The Windy Crown", difficulty: "EXPERT" },
  { size: 8, pieces: 9, twists: 9, label: "The Topmost Branch", difficulty: "EXPERT" },
];

// Reproducible PRNG: the same level yields the same puzzle after Restart.
function randomGenerator(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(items, rng) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function normalized(blocks) {
  const minR = Math.min(...blocks.map((p) => p[0]));
  const minC = Math.min(...blocks.map((p) => p[1]));
  return blocks.map(([r, c]) => [r - minR, c - minC]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
}
function rotateBlocks(blocks) {
  const maxR = Math.max(...blocks.map(([r]) => r));
  return normalized(blocks.map(([r, c]) => [c, maxR - r]));
}
function isConnected(cells) {
  if (!cells.length) return false;
  const keys = new Set(cells.map(([r, c]) => `${r},${c}`));
  const seen = new Set();
  const stack = [cells[0]];
  while (stack.length) {
    const [r, c] = stack.pop();
    const key = `${r},${c}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const [dr, dc] of [[0,1], [0,-1], [1,0], [-1,0]]) {
      const next = `${r + dr},${c + dc}`;
      if (keys.has(next) && !seen.has(next)) stack.push([r + dr, c + dc]);
    }
  }
  return seen.size === keys.size;
}

function generateLevel(index) {
  const config = CONFIG[index];
  const size = config.size;
  const rng = randomGenerator(43571 + index * 104729);
  // Split the square into regions first. Every resulting puzzle has a known,
  // complete, non-overlapping solution, unlike random piece generation.
  let regions = [{ top: 0, left: 0, height: size, width: size }];
  while (regions.length < config.pieces) {
    const candidates = regions.map((r, i) => ({ r, i }))
      .filter(({ r }) => r.width > 1 || r.height > 1)
      .sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
    const { r, i } = candidates[0];
    const horizontal = r.height > 1 && (r.width === 1 || (r.height >= r.width ? rng() < .76 : rng() < .28));
    const extent = horizontal ? r.height : r.width;
    const cut = Math.max(1, Math.min(extent - 1, Math.round(extent * (.35 + rng() * .3))));
    const a = { ...r }, b = { ...r };
    if (horizontal) { a.height = cut; b.top += cut; b.height -= cut; }
    else { a.width = cut; b.left += cut; b.width -= cut; }
    regions.splice(i, 1, a, b);
  }
  const owner = Array.from({ length: size }, () => Array(size).fill(-1));
  regions.forEach((region, id) => {
    for (let r = region.top; r < region.top + region.height; r++) {
      for (let c = region.left; c < region.left + region.width; c++) owner[r][c] = id;
    }
  });
  // Move a few boundary cells to make interesting connected polyominoes.
  const minArea = index < 2 ? 2 : 3;
  for (let trial = 0; trial < size * size * 28; trial++) {
    const r = Math.floor(rng() * size), c = Math.floor(rng() * size);
    const neighbors = shuffled([[0,1], [1,0], [0,-1], [-1,0]], rng);
    const source = owner[r][c];
    for (const [dr, dc] of neighbors) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size || owner[nr][nc] === source) continue;
      const target = owner[nr][nc];
      const sourceCells = [], targetCells = [];
      owner.forEach((row, rr) => row.forEach((id, cc) => {
        if (id === source && !(rr === r && cc === c)) sourceCells.push([rr, cc]);
        if (id === target) targetCells.push([rr, cc]);
      }));
      if (sourceCells.length < minArea || targetCells.length > Math.ceil(size * size / config.pieces * 1.6)) continue;
      if (!isConnected(sourceCells)) continue;
      if (rng() < .33) { owner[r][c] = target; break; }
    }
  }

  const shapes = Array.from({ length: config.pieces }, (_, id) => {
    const cells = [];
    owner.forEach((row, r) => row.forEach((o, c) => { if (o === id) cells.push([r, c]); }));
    const originR = Math.min(...cells.map(([r]) => r));
    const originC = Math.min(...cells.map(([, c]) => c));
    const solutionBlocks = normalized(cells);
    let initialBlocks = solutionBlocks;
    if (index >= 2 && id < config.twists) {
      const rotations = 1 + Math.floor(rng() * 3);
      for (let turn = 0; turn < rotations; turn++) initialBlocks = rotateBlocks(initialBlocks);
    }
    return {
      id,
      color: PALETTE[id % PALETTE.length],
      initialBlocks,
      solutionBlocks,
      target: { row: originR, col: originC },
    };
  });
  return { ...config, shapes: shuffled(shapes, rng) };
}
const levels = CONFIG.map((_, index) => generateLevel(index));

let currentLevel = 0;
let acornCount = 0;
let placedPieces = [];
let selection = null; // { shape, blocks, original?: placedRecord }
let hoverPlacement = null;
let pointerDrag = null;
let history = [];
let hintUsed = false;
let hintTarget = null;
let completed = false;
let levelLocked = false;
let transitionTimer = null;

const $ = (id) => document.getElementById(id);
const levelData = () => levels[currentLevel];
const cellSize = () => BOARD_SIZE / levelData().size;
function trackEvent(name, details = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, details);
}
function message(text, type = "") {
  const el = $("game-message");
  el.textContent = text;
  el.className = `game-message ${type}`;
}
function saveProgress() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ level: currentLevel, acorns: acornCount, complete: completed })); }
  catch (_) { /* Browser storage may be disabled. */ }
}
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (saved && Number.isInteger(saved.level) && saved.level >= 0 && saved.level < levels.length) {
      currentLevel = saved.level;
      acornCount = Math.max(0, Math.min(10, Number(saved.acorns) || 0));
      completed = !!saved.complete;
    }
  } catch (_) { /* Start fresh. */ }
}
function makeProgressSteps() {
  const wrapper = $("progress-steps");
  wrapper.replaceChildren();
  for (let i = 0; i < 10; i++) {
    const step = document.createElement("span");
    step.className = "progress-step";
    step.setAttribute("aria-hidden", "true");
    wrapper.appendChild(step);
  }
}
function updateProgressRail() {
  const ratio = Math.min(1, (currentLevel + (completed ? 1 : 0)) / 10);
  const narrow = window.matchMedia("(max-width: 750px)").matches;
  const fill = $("climb-fill"), chip = $("chip");
  if (narrow) {
    fill.style.width = `${ratio * 100}%`;
    fill.style.height = "10px";
    chip.style.left = `${8 + ratio * 84}%`;
    chip.style.bottom = "";
  } else {
    fill.style.height = `${ratio * 85}%`;
    fill.style.width = "12px";
    chip.style.left = "50%";
    chip.style.bottom = `${8 + ratio * 72}%`;
  }
}
function updateUI() {
  const level = levelData();
  $("level").textContent = String(currentLevel + 1);
  $("rail-level").textContent = String(currentLevel + 1);
  $("acorns").textContent = String(acornCount);
  $("board-title").textContent = level.label;
  $("difficulty").textContent = level.difficulty;
  $("pieces-count").textContent = `${placedPieces.length} / ${level.shapes.length}`;
  $("pieces-remaining").textContent = `${level.shapes.length - placedPieces.length} left`;
  $("hint-count").textContent = hintUsed ? "0" : "1";
  $("hint-btn").disabled = hintUsed || levelLocked;
  $("rotate-btn").disabled = !selection || levelLocked || currentLevel < 2;
  $("cancel-btn").disabled = !selection || levelLocked;
  $("undo-btn").disabled = !(history.length || (selection && selection.original)) || levelLocked;
  [...$("progress-steps").children].forEach((step, i) => {
    step.className = `progress-step ${i < currentLevel ? "done" : i === currentLevel ? "current" : ""}`;
  });
  updateProgressRail();
}

// Visuals: walnut-bark puzzle board, subtle carved grid, and highlighted placement.
function drawBoard() {
  const size = levelData().size, cs = cellSize();
  const bg = ctx.createLinearGradient(0, 0, BOARD_SIZE, BOARD_SIZE);
  bg.addColorStop(0, "#3d2b22"); bg.addColorStop(.5, "#4b3224"); bg.addColorStop(1, "#2d211b");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, BOARD_SIZE, BOARD_SIZE);
  ctx.save(); ctx.globalAlpha = .12;
  for (let i = 0; i < 34; i++) {
    const x = (i * 73 + 19) % BOARD_SIZE;
    ctx.beginPath(); ctx.moveTo(x, 0);
    ctx.bezierCurveTo(x - 22, 140, x + 33, 280, x - 9, BOARD_SIZE);
    ctx.strokeStyle = i % 3 ? "#b77d43" : "#150c08";
    ctx.lineWidth = i % 3 ? 2 : 5;
    ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(242, 215, 155, .29)"; ctx.lineWidth = 1;
  for (let n = 1; n < size; n++) {
    const p = n * cs;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, BOARD_SIZE); ctx.moveTo(0, p); ctx.lineTo(BOARD_SIZE, p); ctx.stroke();
  }
  ctx.strokeStyle = "rgba(245, 212, 152, .55)"; ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, BOARD_SIZE - 4, BOARD_SIZE - 4);
}
function paintBlocks(blocks, top, left, color, opacity = 1, strokeColor = "rgba(34, 42, 30, .65)") {
  const cs = cellSize();
  ctx.save(); ctx.globalAlpha = opacity;
  for (const [r, c] of blocks) {
    const x = (left + c) * cs, y = (top + r) * cs;
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y + 2, cs - 4, cs - 4);
    ctx.fillStyle = "rgba(255, 255, 255, .13)";
    ctx.fillRect(x + 3, y + 3, cs - 6, Math.max(3, cs * .1));
    ctx.strokeStyle = strokeColor; ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, cs - 4, cs - 4);
  }
  ctx.restore();
}
function draw() {
  drawBoard();
  for (const item of placedPieces) paintBlocks(item.blocks, item.row, item.col, item.shape.color);
  if (hintTarget) {
    const cs = cellSize();
    ctx.save(); ctx.setLineDash([7, 5]); ctx.lineWidth = 4; ctx.strokeStyle = "#ffe6a9";
    ctx.fillStyle = "rgba(255, 225, 142, .17)";
    for (const [r, c] of hintTarget.shape.solutionBlocks) {
      const x = (hintTarget.shape.target.col + c) * cs;
      const y = (hintTarget.shape.target.row + r) * cs;
      ctx.fillRect(x, y, cs, cs); ctx.strokeRect(x + 4, y + 4, cs - 8, cs - 8);
    }
    ctx.restore();
  }
  if (selection && hoverPlacement) {
    const valid = canPlace(selection.blocks, hoverPlacement.row, hoverPlacement.col);
    paintBlocks(selection.blocks, hoverPlacement.row, hoverPlacement.col,
      valid ? selection.shape.color : "#d87a6c", .65,
      valid ? "#e8f6c5" : "#f9aaa1");
  }
}
function inBoard(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  if (clientX < rect.left || clientX >= rect.right || clientY < rect.top || clientY >= rect.bottom) return null;
  const scaleX = BOARD_SIZE / rect.width, scaleY = BOARD_SIZE / rect.height;
  return {
    col: Math.floor((clientX - rect.left) * scaleX / cellSize()),
    row: Math.floor((clientY - rect.top) * scaleY / cellSize()),
  };
}
function candidateFromPoint(x, y) {
  if (!selection) return null;
  const cell = inBoard(x, y);
  if (!cell) return null;
  const maxR = Math.max(...selection.blocks.map(([r]) => r));
  const maxC = Math.max(...selection.blocks.map(([, c]) => c));
  return { row: cell.row - Math.floor(maxR / 2), col: cell.col - Math.floor(maxC / 2) };
}
function canPlace(blocks, row, col) {
  const size = levelData().size;
  const occupied = new Set(placedPieces.flatMap(p => p.blocks.map(([r, c]) => `${p.row + r},${p.col + c}`)));
  for (const [r, c] of blocks) {
    const rr = row + r, cc = col + c;
    if (rr < 0 || cc < 0 || rr >= size || cc >= size || occupied.has(`${rr},${cc}`)) return false;
  }
  return true;
}
function occupiedAt(cell) {
  if (!cell) return null;
  return placedPieces.find(p => p.blocks.some(([r, c]) => p.row + r === cell.row && p.col + c === cell.col)) || null;
}
function clearDragGhost() { dragPreview.classList.remove("active"); dragPreview.replaceChildren(); }
function updateDragGhost(clientX, clientY) {
  if (!pointerDrag || !selection || !pointerDrag.moved) { clearDragGhost(); return; }
  const blocks = selection.blocks;
  const rows = Math.max(...blocks.map(([r]) => r)) + 1;
  const cols = Math.max(...blocks.map(([, c]) => c)) + 1;
  const scale = Math.min(27, 120 / Math.max(rows, cols));
  const p = document.createElement("canvas");
  p.width = cols * scale + 6; p.height = rows * scale + 6;
  const g = p.getContext("2d");
  g.fillStyle = selection.shape.color;
  for (const [r, c] of blocks) {
    g.fillRect(c * scale + 3, r * scale + 3, scale - 2, scale - 2);
    g.strokeStyle = "#ecedd6"; g.lineWidth = 1; g.strokeRect(c * scale + 3, r * scale + 3, scale - 2, scale - 2);
  }
  dragPreview.replaceChildren(p);
  dragPreview.style.transform = `translate(${clientX - p.width / 2}px, ${clientY - p.height / 2}px)`;
  dragPreview.classList.add("active");
}
function cancelSelection(restore = true) {
  if (selection && selection.original && restore) placedPieces.push(selection.original);
  selection = null; hoverPlacement = null; pointerDrag = null;
  clearDragGhost(); renderPieceTray(); updateUI(); draw();
}

function selectShape(shape, original = null) {
  if (levelLocked) return;

  // Keep the current rotation when selecting
  // the same piece again.
  const keepRotation =
    selection &&
    selection.shape.id === shape.id &&
    !original &&
    !selection.original;

  const blocks = keepRotation
    ? selection.blocks.map(([r, c]) => [r, c])
    : (original ? original.blocks : shape.initialBlocks)
        .map(([r, c]) => [r, c]);

  if (selection && selection.original) {
    placedPieces.push(selection.original);
  }

  if (original) {
    placedPieces = placedPieces.filter(p => p !== original);
  }

  selection = { shape, blocks, original };
  hoverPlacement = null;

  if (original) {
    renderPieceTray();
  } else {
    document.querySelectorAll(".piece-tile").forEach(btn => {
      const active = Number(btn.dataset.shapeId) === shape.id;
      btn.classList.toggle("selected", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  updateUI();
  draw();
  message("Drag to the board, or tap a spot to place.");
}

function placeSelected(candidate) {
  if (!selection || !candidate) return false;
  if (!canPlace(selection.blocks, candidate.row, candidate.col)) {
    message("That spot doesn't fit. Try a different space or rotate the piece.", "error");
    return false;
  }
  const previous = placedPieces.map(p => ({ ...p, blocks: p.blocks.map(b => [...b]) }));
  if (selection.original) previous.push(selection.original);
  history.push(previous);
  placedPieces.push({ shape: selection.shape, blocks: selection.blocks.map(b => [...b]), row: candidate.row, col: candidate.col });
  selection = null; hoverPlacement = null; clearDragGhost();
  renderPieceTray(); updateUI(); draw();
  message("Piece placed! Keep filling the hollow.", "success");
  checkWin();
  return true;
}
function rotateSelection() {
  if (!selection || levelLocked) { message("Choose a piece to rotate first."); return; }
  if (currentLevel < 2) { message("Rotation unlocks on Branch 3."); return; }
  selection.blocks = rotateBlocks(selection.blocks);
  if (hoverPlacement) draw();
  renderPieceTray(); updateUI();
  message("Piece rotated clockwise.");
}
function undoPlacement() {
  if (levelLocked) return;
  if (selection && selection.original) { cancelSelection(); message("Piece returned to its previous spot."); return; }
  if (selection) cancelSelection();
  const last = history.pop();
  if (!last) { message("Nothing to undo yet."); return; }
  placedPieces = last;
  renderPieceTray(); updateUI(); draw(); message("Last placement undone.");
}
function showHint() {
  if (hintUsed || levelLocked) return;
  const next = levelData().shapes.find(p => !placedPieces.some(placed => placed.shape.id === p.id));
  if (!next) return;
  hintUsed = true;
  hintTarget = { shape: next };
  updateUI(); draw();
  message(`The golden outline shows where piece ${next.id + 1} belongs. You may need to rotate it.`);
  window.setTimeout(() => { hintTarget = null; draw(); }, 4200);
}

function renderPieceTray() {
  const panel = $("pieces-panel");
  panel.replaceChildren();
  const remaining = levelData().shapes.filter(shape =>
    !placedPieces.some(placed => placed.shape.id === shape.id) &&
    !(selection && selection.original && selection.shape.id === shape.id)
  );
  for (const shape of remaining) {
    const isSelected = selection && selection.shape.id === shape.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `piece-tile ${isSelected ? "selected" : ""}`;
    button.dataset.shapeId = String(shape.id);
    button.setAttribute("aria-label", `Select puzzle piece ${shape.id + 1}`);
    button.setAttribute("aria-pressed", String(!!isSelected));
    const preview = document.createElement("canvas");
    preview.width = 80; preview.height = 68;
    const blocks = isSelected ? selection.blocks : shape.initialBlocks;
    const rows = Math.max(...blocks.map(([r]) => r)) + 1;
    const cols = Math.max(...blocks.map(([, c]) => c)) + 1;
    const scale = Math.min(17, 58 / Math.max(rows, cols));
    const startX = (80 - cols * scale) / 2, startY = (68 - rows * scale) / 2;
    const pc = preview.getContext("2d");
    for (const [r, c] of blocks) {
      const x = startX + c * scale, y = startY + r * scale;
      pc.fillStyle = shape.color; pc.fillRect(x, y, scale - 1, scale - 1);
      pc.strokeStyle = "rgba(25,36,28,.5)"; pc.strokeRect(x, y, scale - 1, scale - 1);
    }
    button.append(preview);
    const label = document.createElement("small"); label.textContent = `PIECE ${shape.id + 1}`;
    button.append(label);
button.addEventListener("pointerdown", (e) => {
  if (levelLocked || (e.pointerType === "mouse" && e.button !== 0)) return;
  e.preventDefault();

  // Preserve the rotation if this piece is already selected.
  if (!selection || selection.shape.id !== shape.id) {
    selectShape(shape);
  }

  pointerDrag = {
    id: e.pointerId,
    source: "tray",
    x: e.clientX,
    y: e.clientY,
    moved: false
  };
});
    button.addEventListener("click", (e) => {
      if (e.detail === 0) selectShape(shape); // keyboard activation
    });
    panel.appendChild(button);
  }
  if (!remaining.length) {
    const empty = document.createElement("div"); empty.className = "tray-empty";
    empty.textContent = "All pieces on the board! 🌿";
    panel.appendChild(empty);
  }
}

canvas.addEventListener("pointerdown", e => {
  if (levelLocked || (e.pointerType === "mouse" && e.button !== 0)) return;
  e.preventDefault();
  const cell = inBoard(e.clientX, e.clientY);
  if (!selection) {
    const existing = occupiedAt(cell);
    if (existing) selectShape(existing.shape, existing);
    else { message("Pick a shape from the piece tray first."); return; }
    pointerDrag = { id: e.pointerId, source: "boardPickup", x: e.clientX, y: e.clientY, moved: false };
  } else {
    pointerDrag = { id: e.pointerId, source: "board", x: e.clientX, y: e.clientY, moved: false };
  }
  hoverPlacement = candidateFromPoint(e.clientX, e.clientY);
  draw();
});
canvas.addEventListener("pointermove", e => {
  if (pointerDrag || !selection) return;
  hoverPlacement = candidateFromPoint(e.clientX, e.clientY);
  draw();
});
canvas.addEventListener("pointerleave", () => {
  if (!pointerDrag) { hoverPlacement = null; draw(); }
});
window.addEventListener("pointermove", e => {
  if (!pointerDrag || e.pointerId !== pointerDrag.id) return;
  if (Math.hypot(e.clientX - pointerDrag.x, e.clientY - pointerDrag.y) >= 7) pointerDrag.moved = true;
  hoverPlacement = candidateFromPoint(e.clientX, e.clientY);
  updateDragGhost(e.clientX, e.clientY);
  draw();
});
function finishDrag(e) {
  if (!pointerDrag || e.pointerId !== pointerDrag.id) return;
  const { source, moved } = pointerDrag;
  const candidate = candidateFromPoint(e.clientX, e.clientY);
  pointerDrag = null;
  clearDragGhost();
  // Tap on a tray piece selects; tap on board places; dragging does both.
  if ((source === "board" || moved) && candidate) placeSelected(candidate);
  else if (source === "boardPickup" && !moved) {
    message("Piece picked up. Tap the board to reposition it, or press Cancel.");
  } else if (source === "tray" && !moved) {
    message("Piece selected. Tap a square on the board, or drag it there.");
  } else if (source === "board" && !candidate) {
    message("Drop the piece inside the puzzle board.", "error");
  }
  hoverPlacement = null;
  draw();
}
window.addEventListener("pointerup", finishDrag);
window.addEventListener("pointercancel", e => {
  if (!pointerDrag || pointerDrag.id !== e.pointerId) return;
  pointerDrag = null; clearDragGhost(); hoverPlacement = null; draw();
});
window.addEventListener("keydown", e => {
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
  if (e.key.toLowerCase() === "r" && selection) { e.preventDefault(); rotateSelection(); }
  if (e.key === "Escape" && selection) { e.preventDefault(); cancelSelection(); }
});
$("rotate-btn").addEventListener("click", rotateSelection);
$("undo-btn").addEventListener("click", undoPlacement);
$("hint-btn").addEventListener("click", showHint);
$("cancel-btn").addEventListener("click", () => cancelSelection());
$("restart-button").addEventListener("click", restartLevel);
$("play-again-btn").addEventListener("click", restartGame);
window.addEventListener("resize", updateProgressRail);

function checkWin() {
  if (levelLocked || placedPieces.length !== levelData().shapes.length) return;
  const filled = new Set(placedPieces.flatMap(p => p.blocks.map(([r, c]) => `${p.row + r},${p.col + c}`)));
  if (filled.size !== levelData().size ** 2) return;
  levelLocked = true;
  acornCount++;
  updateUI();
  trackEvent("complete_level", { level: currentLevel + 1, acorns: acornCount });
  message(`Branch ${currentLevel + 1} complete! Chip found an acorn! 🌰`, "success");
  if (currentLevel === levels.length - 1) {
    completed = true;
    saveProgress();
    transitionTimer = window.setTimeout(showFinal, 1250);
  } else {
    transitionTimer = window.setTimeout(() => {
      currentLevel++;
      resetLevel();
      saveProgress();
    }, 1250);
  }
}
function resetLevel() {
  window.clearTimeout(transitionTimer);
  levelLocked = false;
  selection = null; hoverPlacement = null; pointerDrag = null;
  clearDragGhost();
  placedPieces = []; history = []; hintUsed = false; hintTarget = null;
  renderPieceTray(); updateUI(); draw();
  message(currentLevel < 2 ? "Tap or drag the colored shapes onto the board." : "You can rotate your pieces on this branch. Press R or use Rotate.");
}
function restartLevel() {
  if (levelLocked) return;
  trackEvent("restart_level", { level: currentLevel + 1 });
  resetLevel();
}
function showFinal() {
  $("final-screen").hidden = false;
  updateProgressRail();
  trackEvent("game_complete", { acorns: acornCount });
}
function restartGame() {
  window.clearTimeout(transitionTimer);
  $("final-screen").hidden = true;
  currentLevel = 0; acornCount = 0; completed = false;
  try { localStorage.removeItem(SAVE_KEY); } catch (_) { /* no storage */ }
  resetLevel();
  saveProgress();
}

makeProgressSteps();
loadProgress();
resetLevel();
if (completed) showFinal();
