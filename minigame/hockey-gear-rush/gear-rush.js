/* Gear Rush — Locker Room Edition.
 * Personal game progress is device-local. Account XP is a separate, guarded service:
 * timed, unassisted first clears of levels 1–5 only. Personal stars are never ranked.
 */
(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const GEAR = [
    { id: "helmet", name: "Helmet", image: "assets/gear/helmet.png" },
    { id: "glove", name: "Glove", image: "assets/gear/glove.png" },
    { id: "skates", name: "Skates", image: "assets/gear/skates.png" },
    { id: "stick", name: "Hockey Stick", image: "assets/gear/stick.png" },
    { id: "puck", name: "Puck", image: "assets/gear/puck.png" },
    { id: "net", name: "Net", image: "assets/gear/net.png" },
    { id: "shin-pad", name: "Shin Pads", image: "assets/gear/shin_pad.png" },
    { id: "elbow-pad", name: "Elbow Pads", image: "assets/gear/elbow_pad.png" },
    { id: "chest-pad", name: "Chest Pad", image: "assets/gear/chest_pad.png" },
    { id: "jersey", name: "Jersey", image: "assets/gear/jersey.png" }
  ];
  const CLUTTER = ["🧦", "📚", "🥤", "🎮", "🎒", "🧸", "📦", "🎧", "🧃", "🍌", "🧤", "📱", "🛹", "🏀"];
  const STORAGE_KEY = "retro:gear-rush:locker-progress:v2";
  const MAX_LEVEL = 15;
  const BASE_ITEM_SIZE = 52;
  const CHAPTERS = ["Rookie Locker", "Team Bench", "Away Locker"];
  const blankSave = () => ({ version: 2, unlocked: 1, stars: {}, bestTimes: {}, matches: 0, cleanups: 0, collection: [] });

  function readSave() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!value || value.version !== 2) return blankSave();
      const next = blankSave();
      next.unlocked = clamp(Math.trunc(Number(value.unlocked) || 1), 1, MAX_LEVEL);
      for (const [k, v] of Object.entries(value.stars || {})) {
        const n = Number(k);
        if (Number.isInteger(n) && n >= 1 && n <= MAX_LEVEL && Number.isInteger(v) && v >= 0 && v <= 3) next.stars[k] = v;
      }
      for (const [k, v] of Object.entries(value.bestTimes || {})) {
        const n = Number(k);
        if (Number.isInteger(n) && n >= 1 && n <= MAX_LEVEL && Number.isFinite(v) && v > 0 && v < 10000) next.bestTimes[k] = v;
      }
      next.matches = clamp(Math.trunc(Number(value.matches) || 0), 0, 100000);
      next.cleanups = clamp(Math.trunc(Number(value.cleanups) || 0), 0, 100000);
      next.collection = Array.isArray(value.collection) ? [...new Set(value.collection.filter(id => GEAR.some(g => g.id === id)))].slice(0, GEAR.length) : [];
      return next;
    } catch (_) { return blankSave(); }
  }
  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
    catch (_) { status("Device storage unavailable. Progress may not survive a reload."); }
  }
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const shuffle = source => {
    const copy = [...source];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const clock = sec => {
    const n = Math.max(0, Math.ceil(sec));
    return Math.floor(n / 60) + ":" + String(n % 60).padStart(2, "0");
  };

  const progress = readSave();
  let level = progress.unlocked;
  let chosenMode = "rush";
  let state = "ready"; // ready | running | paused | results
  let elapsed = 0, lastTick = 0, timer = null, total = 0, found = 0, assisted = false;
  let targets = [], collected = new Set(), pieces = [];
  let resultWasLate = false;

  function status(message) {
    $("status").textContent = message;
  }
  function config(n = level) {
    // More intricate rooms, not endlessly multiplying objects in a small phone view.
    const tier = Math.min(MAX_LEVEL - 1, n - 1);
    return {
      targets: Math.min(GEAR.length, 4 + Math.floor(tier / 3)),
      clutter: Math.min(17, 9 + tier),
      parTime: 32 + Math.min(16, tier * 2),
      chapter: Math.floor(tier / 5) + 1
    };
  }
  function setMode(mode) {
    if (state === "running" || state === "paused") return;
    chosenMode = mode;
    if (state === "results") {
      state = "ready";
      $("pause-button").disabled = true;
      $("restart-button").disabled = true;
      $("hint-button").disabled = true;
    }
    elapsed = 0;
    document.querySelectorAll("[data-mode]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    });
    const messages = {
      rush: "Beat the target time for more stars. You can still finish if the clock runs over.",
      relaxed: "No timer pressure. Find all the gear and explore at your own pace.",
      cleanup: "A quick optional tidy-up bonus. No account XP or leaderboard advantage."
    };
    $("mode-help").textContent = messages[mode];
    $("clock-label").textContent = mode === "relaxed" ? "Elapsed" : mode === "cleanup" ? "Cleanup" : "Clock";
    $("start-button").textContent = mode === "cleanup" ? "🧹 Start Cleanup" : "▶ Start Round";
    updateScoreboard();
    setWelcome();
  }
  function updateScoreboard() {
    $("level-value").textContent = level + " / " + MAX_LEVEL;
    $("clock-value").textContent = clock(elapsed);
    $("found-value").textContent = found + " / " + total;
    const best = progress.bestTimes[String(level)];
    $("best-value").textContent = best ? clock(best) : "—";
    $("level-selector-value").textContent = "Room " + level + " · " + CHAPTERS[config().chapter - 1];
    $("level-back").disabled = state === "running" || state === "paused" || level <= 1;
    $("level-forward").disabled = state === "running" || state === "paused" || level >= progress.unlocked;
    $("collection-count").textContent = progress.collection.length + " / " + GEAR.length;
    $("best-stars").textContent = "★".repeat(progress.stars[String(level)] || 0) + "☆".repeat(3 - (progress.stars[String(level)] || 0));
    $("progress-fill").style.width = total ? Math.round(100 * found / total) + "%" : "0%";
    $("counter-note").textContent = state === "running" ? "Find the highlighted equipment" : "Ready when you are";
  }

  function showOverlay(kicker, heading, text, primary, secondary = "") {
    $("overlay-kicker").textContent = kicker;
    $("overlay-heading").textContent = heading;
    $("overlay-text").textContent = text;
    $("overlay-primary").textContent = primary;
    $("overlay-secondary").hidden = !secondary;
    if (secondary) $("overlay-secondary").textContent = secondary;
    $("overlay").hidden = false;
  }
  function hideOverlay() { $("overlay").hidden = true; }
  function setWelcome() {
    const cfg = config();
    $("pile-area").dataset.chapter = String(cfg.chapter);
    if (chosenMode === "cleanup") {
      showOverlay("Locker Room Bonus", "Quick Cleanup", "Clear a small messy room. This is an optional mini-game with no XP or time pressure.", "🧹 Start Cleanup");
    } else {
      showOverlay("Room " + level + " • " + (chosenMode === "rush" ? "Beat the Clock" : "Relaxed Search"),
        "Ready for Faceoff?",
        "Find " + cfg.targets + " pieces of hockey gear. " +
        (chosenMode === "rush" ? "Aim for " + cfg.parTime + " seconds or less to earn your stars." : "Take your time; every piece counts."),
        "▶ Start Round");
    }
    status(chosenMode === "rush" ? "Tap Start to begin. First five timed levels can earn signed-in account XP on eligible first clears." :
      "Your progress is saved on this device. No account XP in this mode.");
    $("start-button").textContent = chosenMode === "cleanup" ? "🧹 Start Cleanup" : "▶ Start Round";
  }

  function makeCells(boardWidth, boardHeight, size) {
    const gap = Math.max(7, Math.round(size * 0.18));
    const columns = Math.max(3, Math.floor((boardWidth - 14) / (size + gap)));
    const rows = Math.max(3, Math.floor((boardHeight - 14) / (size + gap)));
    const dx = (boardWidth - size - 16) / Math.max(1, columns - 1);
    const dy = (boardHeight - size - 16) / Math.max(1, rows - 1);
    const cells = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < columns; x++)
      cells.push({ x: 8 + x * dx, y: 8 + y * dy });
    return shuffle(cells);
  }
  function makePiece(item, cell, kind, size, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "item item--" + kind;
    button.style.width = size + "px";
    button.style.height = size + "px";
    button.style.left = cell.x + "px";
    button.style.top = cell.y + "px";
    button.style.zIndex = String(index + 1);
    button.dataset.kind = kind;
    if (kind === "gear") {
      button.setAttribute("aria-label", "Collect " + item.name);
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = "";
      img.draggable = false;
      button.append(img);
    } else {
      button.setAttribute("aria-label", "Move or clear clutter");
      button.textContent = item;
    }
    const piece = { button, item, kind, x: cell.x, y: cell.y, size };
    pieces.push(piece);
    button.addEventListener("click", event => {
      if (piece.suppressClick) { piece.suppressClick = false; return; }
      if (state !== "running") return;
      if (kind === "gear") collect(item, piece);
      else clearClutter(piece);
    });
    bindDrag(piece);
    return button;
  }
  function bindDrag(piece) {
    const button = piece.button;
    let dragging = null;
    button.addEventListener("pointerdown", event => {
      if (state !== "running" || event.button !== 0) return;
      dragging = { id: event.pointerId, sx: event.clientX, sy: event.clientY, x: piece.x, y: piece.y, moved: false };
      try { button.setPointerCapture(event.pointerId); } catch (_) {}
    });
    button.addEventListener("pointermove", event => {
      if (!dragging || dragging.id !== event.pointerId || state !== "running") return;
      const dx = event.clientX - dragging.sx, dy = event.clientY - dragging.sy;
      if (!dragging.moved && Math.hypot(dx, dy) < 7) return;
      dragging.moved = true;
      const board = $("pile-area");
      piece.x = clamp(dragging.x + dx, 0, board.clientWidth - piece.size);
      piece.y = clamp(dragging.y + dy, 0, board.clientHeight - piece.size);
      button.style.left = piece.x + "px";
      button.style.top = piece.y + "px";
      button.style.zIndex = "80";
    });
    const finish = event => {
      if (!dragging || (event && event.pointerId !== dragging.id)) return;
      if (dragging.moved) {
        piece.suppressClick = true;
        // Suppress the immediate synthetic click after dragging; do not suppress later taps.
        setTimeout(() => { piece.suppressClick = false; }, 50);
      }
      dragging = null;
      try { if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    button.addEventListener("pointerup", finish);
    button.addEventListener("pointercancel", finish);
    button.addEventListener("lostpointercapture", () => { dragging = null; });
  }
  function renderTargets() {
    $("target-list").replaceChildren();
    for (const gear of targets) {
      const li = document.createElement("li");
      li.className = "target-item" + (collected.has(gear.id) ? " is-found" : "");
      const image = document.createElement("img");
      image.src = gear.image; image.alt = "";
      const name = document.createElement("span"); name.textContent = gear.name;
      const check = document.createElement("span"); check.className = "check"; check.textContent = "✓"; check.setAttribute("aria-hidden", "true");
      li.append(image, name, check);
      $("target-list").append(li);
    }
    $("targets-title").textContent = chosenMode === "cleanup" ? "Tidy the Locker Room" : "Equipment Checklist";
  }
  function fillBoard() {
    const board = $("pile-area");
    const layer = $("pieces-layer");
    layer.replaceChildren(); // Keep the start/pause/results overlay and rink decoration intact.
    pieces = []; collected = new Set(); found = 0;
    const cfg = config();
    board.dataset.chapter = String(cfg.chapter);
    const cleanup = chosenMode === "cleanup";
    const boardSize = Math.min(BASE_ITEM_SIZE, Math.max(44, Math.floor(board.clientWidth / 6.2)));
    const cells = makeCells(board.clientWidth, board.clientHeight, boardSize);
    targets = cleanup ? [] : shuffle(GEAR).slice(0, cfg.targets);
    // Every target has a separate cell. No opaque pile can bury a needed item.
    const clutterCount = cleanup ? Math.min(14, cells.length) : Math.min(cfg.clutter, cells.length - targets.length);
    const entries = cleanup
      ? Array.from({ length: clutterCount }, () => ({ item: CLUTTER[Math.floor(Math.random() * CLUTTER.length)], kind: "cleanup" }))
      : [...targets.map(item => ({ item, kind: "gear" })),
         ...Array.from({ length: clutterCount }, () => ({ item: CLUTTER[Math.floor(Math.random() * CLUTTER.length)], kind: "clutter" }))];
    // Draw in randomized order; overlap is deliberately minimized by the cell allocation.
    shuffle(entries).forEach((entry, i) => {
      const node = makePiece(entry.item, cells[i], entry.kind, boardSize, i);
      layer.append(node);
    });
    total = cleanup ? entries.length : targets.length;
    renderTargets();
    updateScoreboard();
  }

  function tick() {
    if (state !== "running") return;
    const now = performance.now();
    elapsed += Math.min(.3, Math.max(0, (now - lastTick) / 1000));
    lastTick = now;
    $("clock-value").textContent = clock(elapsed);
    if (chosenMode === "rush") {
      const remaining = Math.max(0, config().parTime - elapsed);
      $("counter-note").textContent = remaining ? clock(remaining) + " until par time" : "Keep going — you can still finish!";
    }
  }
  function stopClock() { clearInterval(timer); timer = null; }
  function startClock() {
    stopClock(); lastTick = performance.now();
    timer = setInterval(tick, 120);
  }
  function begin() {
    if (state === "running") return;
    elapsed = 0; found = 0; assisted = false; resultWasLate = false;
    fillBoard();
    state = "running";
    hideOverlay();
    $("start-button").disabled = true;
    $("pause-button").disabled = false;
    $("restart-button").disabled = false;
    $("hint-button").disabled = chosenMode === "cleanup";
    document.querySelectorAll("[data-mode]").forEach(b => b.disabled = true);
    updateScoreboard();
    startClock();
    if (chosenMode === "rush" && level <= 5) window.RetroLevelXP?.begin(level);
    status(chosenMode === "cleanup" ? "Tap the clutter to tidy the locker room." : "Find everything on the checklist. Tap to collect or drag items aside.");
  }
  function pause(auto = false) {
    if (state !== "running") return;
    tick(); stopClock(); state = "paused";
    $("pause-button").textContent = "▶ Resume";
    showOverlay(auto ? "Game Paused" : "Taking a Break", "You're Paused",
      "Your time stopped. No penalty for stepping away.", "▶ Resume", "↻ Restart Room");
    status("Paused — no time is counted while you're away.");
  }
  function resume() {
    if (state !== "paused") return;
    if (document.hidden) return;
    state = "running"; hideOverlay(); startClock();
    $("pause-button").textContent = "Ⅱ Pause";
    status("Back on the ice — find your gear!");
  }
  function finishRound() {
    tick(); stopClock(); state = "results";
    $("pause-button").disabled = true;
    $("pause-button").textContent = "Ⅱ Pause";
    $("start-button").disabled = false;
    $("restart-button").disabled = false;
    $("hint-button").disabled = true;
    document.querySelectorAll("[data-mode]").forEach(b => b.disabled = false);
    progress.matches = Math.min(100000, progress.matches + 1);
    if (chosenMode === "cleanup") {
      progress.cleanups = Math.min(100000, progress.cleanups + 1);
      persist(); updateScoreboard();
      showOverlay("Locker Room Tidy", "Spotless!", "You cleared " + total + " items in " + clock(elapsed) + ". Bonus cleanup complete!", "▶ Play Gear Rush", "↻ Clean Again");
      status("Cleanup complete! Pick Rush or Relaxed to continue hunting for equipment.");
      return;
    }
    const par = config().parTime;
    resultWasLate = chosenMode === "rush" && elapsed > par;
    const stars = chosenMode === "relaxed" ? 1 : (elapsed <= par * .72 && !assisted ? 3 : elapsed <= par && !assisted ? 2 : 1);
    progress.stars[String(level)] = Math.max(progress.stars[String(level)] || 0, stars);
    const old = progress.bestTimes[String(level)];
    if (!old || elapsed < old) progress.bestTimes[String(level)] = Math.round(elapsed * 10) / 10;
    if (level === progress.unlocked && level < MAX_LEVEL) progress.unlocked = level + 1;
    persist();
    updateScoreboard();
    const eligible = chosenMode === "rush" && !assisted && level <= 5 && elapsed >= 6;
    if (eligible) {
      // The server checks first-clear dedupe and attempt timing. This is NOT
      // proof of independent gameplay and must not become a ranked score.
      Promise.resolve(window.RetroLevelXP?.complete(level)).then(result => {
        // The award event displays confirmed server XP; only handle unconfirmed outcomes here.
        if (!result) status("Room cleared on this device. Account XP is not yet confirmed.");
        else if (result.type === "guest") status("Room saved locally. Sign in before starting to earn account XP.");
        else if (result.type === "pending" || result.type === "unverified")
          status("Room saved locally. Account XP not confirmed; try a fresh signed-in round.");
      }).catch(() => status("Room cleared locally. Account XP could not be confirmed."));
    }
    const achievement = "★".repeat(stars) + "☆".repeat(3 - stars);
    const bonus = resultWasLate ? " Finished after the target time — optional cleanup is available." : "";
    const note = assisted ? " Spotlight used; this was an assisted run." : "";
    showOverlay("Room " + level + " Complete", achievement + " • Gear Found!",
      "Your time: " + clock(elapsed) + ". " + (chosenMode === "relaxed" ? "Relaxed play." : "Target: " + clock(par) + ".") + bonus + note,
      level < MAX_LEVEL ? "▶ Next Room" : "↻ Play Again",
      resultWasLate ? "🧹 Bonus Cleanup" : "↻ Replay Room");
    status("Level saved on your device. " +
      (eligible ? "Checking your signed-in XP eligibility…" :
       chosenMode === "relaxed" ? "Relaxed mode has no account XP." :
       assisted ? "Spotlight-assisted runs have no account XP." :
       chosenMode === "rush" && elapsed < 6 ? "The server requires at least six seconds for account XP; stars are saved." :
       "Official XP currently covers the first five timed levels."));
  }

  function collect(item, piece) {
    if (state !== "running" || collected.has(item.id)) return;
    collected.add(item.id); found++;
    piece.button.classList.add("is-found");
    piece.button.disabled = true;
    if (!progress.collection.includes(item.id)) progress.collection.push(item.id);
    renderTargets();
    updateScoreboard();
    status("✓ " + item.name + " found! " + (total - found) + " more to go.");
    if (found >= total) finishRound();
  }
  function clearClutter(piece) {
    if (piece.button.disabled || state !== "running") return;
    piece.button.disabled = true;
    piece.button.classList.add("is-cleared");
    if (chosenMode === "cleanup") {
      found++; updateScoreboard();
      status("Nice cleanup! " + (total - found) + " items remaining.");
      if (found >= total) finishRound();
    } else {
      status("Clutter moved aside. Keep searching for your equipment.");
    }
  }
  function spotlight() {
    if (state !== "running" || chosenMode === "cleanup" || assisted) return;
    const remaining = pieces.find(p => p.kind === "gear" && !collected.has(p.item.id));
    if (!remaining) return;
    assisted = true; $("hint-button").disabled = true;
    remaining.button.classList.add("is-spotlight");
    remaining.button.focus({ preventScroll: true });
    setTimeout(() => remaining.button.classList.remove("is-spotlight"), 3500);
    status("Spotlight shows " + remaining.item.name + ". This round is assisted and earns no account XP.");
  }
  function nextRoom() {
    if (chosenMode === "cleanup") { setMode("rush"); state = "ready"; setWelcome(); updateScoreboard(); return; }
    if (level < MAX_LEVEL) level++;
    else level = 1;
    if (level > progress.unlocked) level = progress.unlocked;
    state = "ready"; elapsed = 0;
    $("pause-button").disabled = true;
    $("pause-button").textContent = "Ⅱ Pause";
    $("restart-button").disabled = true;
    $("hint-button").disabled = true;
    document.querySelectorAll("[data-mode]").forEach(b => b.disabled = false);
    setWelcome(); updateScoreboard();
  }
  function restart() {
    stopClock(); state = "ready"; elapsed = 0;
    $("pause-button").disabled = true; $("pause-button").textContent = "Ⅱ Pause";
    $("restart-button").disabled = true; $("hint-button").disabled = true;
    $("start-button").disabled = false;
    document.querySelectorAll("[data-mode]").forEach(b => b.disabled = false);
    setWelcome(); updateScoreboard();
  }

  document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $("start-button").addEventListener("click", () => state === "paused" ? resume() : begin());
  $("pause-button").addEventListener("click", () => state === "paused" ? resume() : pause());
  $("restart-button").addEventListener("click", restart);
  $("hint-button").addEventListener("click", spotlight);
  $("overlay-primary").addEventListener("click", () => {
    if (state === "paused") resume();
    else if (state === "results") nextRoom();
    else begin();
  });
  $("overlay-secondary").addEventListener("click", () => {
    if (state === "paused") restart();
    else if (state === "results" && chosenMode === "cleanup") begin();
    else if (state === "results" && resultWasLate) { setMode("cleanup"); begin(); }
    else restart();
  });
  $("level-back").addEventListener("click", () => {
    if (level > 1 && state !== "running" && state !== "paused") { level--; restart(); }
  });
  $("level-forward").addEventListener("click", () => {
    if (level < progress.unlocked && state !== "running" && state !== "paused") { level++; restart(); }
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(true); });
  window.addEventListener("resize", () => {
    // An orientation change should never strand a collectible outside the board.
    const board = $("pile-area");
    for (const piece of pieces) {
      piece.x = clamp(piece.x, 0, Math.max(0, board.clientWidth - piece.size));
      piece.y = clamp(piece.y, 0, Math.max(0, board.clientHeight - piece.size));
      piece.button.style.left = piece.x + "px";
      piece.button.style.top = piece.y + "px";
    }
  }, { passive: true });
  window.addEventListener("blur", () => { if (state === "running") pause(true); });
  window.addEventListener("retro-level-xp", event => {
    if (event.detail?.gameId !== "hockey-gear-rush") return;
    if (event.detail.type === "award") {
      status(event.detail.amount > 0
        ? "★ +" + event.detail.amount + " account XP confirmed! Visit your profile to see it."
        : "Room finished. Account XP was already earned for this level.");
    } else if (event.detail.type === "error" && chosenMode === "rush")
      status("Room progress saved locally. Account XP: " + (event.detail.message || "unavailable"));
  });

  setMode("rush");
  $("pause-button").disabled = true;
  $("restart-button").disabled = true;
  $("hint-button").disabled = true;
  updateScoreboard();
  // Reserve the display ad and never insert ad UI in the timed tapping surface.
  if (location.protocol === "https:") {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
  }
})();
