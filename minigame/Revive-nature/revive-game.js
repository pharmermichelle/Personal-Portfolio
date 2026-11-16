const SAVE_KEY = "reviveNatureSave_v2";
const TUTORIAL_KEY = "reviveNatureTutorial_v1";
const MAX_HEALTH = 10;
const STARTING_MONEY = 2250; 
const LAND_PRICES = [1750, 2500, 3400, 4500];
const RESTORATION_REWARDS = [120, 180, 240, 320, 750];
const HYDRO_TICK_MS = 12000;
const HYDRO_BUILD_COST = 30;
const HYDRO_DAILY_COST = 2;

let BIOMES = {};
let PLANTS = {};
let state = null;
let selectedTileIndex = null;
let toastTimer = null;
let dragState = null;

const $ = (selector) => document.querySelector(selector);

async function boot() {
  try {
    [BIOMES, PLANTS] = await Promise.all([
      fetch("biomes.json").then(r => r.json()),
      fetch("plants.json").then(r => r.json())
    ]);
  } catch (error) {
    showFatalDataError();
    return;
  }

  bindStaticEvents();
  window.setInterval(runHydroAutomation, HYDRO_TICK_MS);

  const saved = loadGame();
  if (saved) {
    state = saved;
    normalizeSave();
    showGame();
  } else {
    renderPropertyChoices();
    showPropertyScreen();
  }
}

function showFatalDataError() {
  document.body.innerHTML = `
    <div style="padding:30px;color:#fff;font-family:monospace">
      <h1>Revive Nature</h1>
      <p>The JSON files could not be loaded.</p>
      <p>Run this folder from a local web server rather than opening index.html directly.</p>
      <p>For example: <code>python -m http.server 8000</code></p>
    </div>
  `;
}

function bindStaticEvents() {
  $("#save-button").addEventListener("click", () => {
    saveGame();
    toast("GAME SAVED!");
  });

  $("#reset-button").addEventListener("click", confirmReset);
  $("#world-button").addEventListener("click", openWorldMap);
  $("#help-button").addEventListener("click", () => openTutorial(0));

  $("#water-station").addEventListener("click", () => movePlayerToElement($("#water-station"), () => buySupply("water")));
  $("#fertilizer-station").addEventListener("click", () => movePlayerToElement($("#fertilizer-station"), () => buySupply("fertilizer")));
  $("#sell-bin").addEventListener("click", () => movePlayerToElement($("#sell-bin"), () => {
    toast("Harvest ripe crops directly from their plots.");
  }));

  $("#quick-actions").addEventListener("click", event => {
    const action = event.target.closest("[data-quick]")?.dataset.quick;
    if (!action || selectedTileIndex === null) return;
    if (action === "water" || action === "fertilizer") quickCare(action);
    if (action === "harvest") harvestPlant(selectedTileIndex);
    if (action === "plant") openEmptyPlotModal(selectedTileIndex);
  });
  let gridZoom = 1;
  const setGridZoom = value => {
    gridZoom = Math.round(clamp(value, .85, 1.3) * 100) / 100;
    $("#farm-grid").style.setProperty("--grid-zoom", gridZoom);
    $("#zoom-label").textContent = gridZoom === 1 ? "FIT" : Math.round(gridZoom * 100) + "%";
  };
  $("#zoom-in-button").addEventListener("click", () => setGridZoom(gridZoom + .15));
  $("#zoom-out-button").addEventListener("click", () => setGridZoom(gridZoom - .15));
  $("#zoom-fit-button").addEventListener("click", () => setGridZoom(1));
  setupPlayerDragging();
}

function renderPropertyChoices() {
  const container = $("#property-options");
  container.innerHTML = "";

  Object.entries(BIOMES).forEach(([id, biome]) => {
    const card = document.createElement("article");
    card.className = `property-card ${id}`;
    card.innerHTML = `
      <div class="biome-icon">${biome.icon}</div>
      <h3>${biome.name}</h3>
      <p>${biome.description}</p>
      <div class="perk">${biome.perk}</div>
      <strong>Plot 1: $${LAND_PRICES[0].toLocaleString()}</strong>
      <br><br>
      <button class="pixel-button" data-buy-start="${id}">BUY & START</button>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll("[data-buy-start]").forEach(button => {
    button.addEventListener("click", () => startNewGame(button.dataset.buyStart));
  });
}

function startNewGame(startBiomeId) {
  const biome = BIOMES[startBiomeId];

  state = {
    version: 1,
    money: STARTING_MONEY - LAND_PRICES[0],
    inventory: {
      water: 0,
      fertilizer: 0
    },
    carrying: null,
    currentBiome: startBiomeId,
    ownedBiomes: [startBiomeId],
    ownedPlots: 1,
    biomes: {},
    lastPlayed: Date.now(),
    totalHarvests: 0
  };

  state.biomes[startBiomeId] = generateBiomeState(startBiomeId);
  saveGame();
  showGame();
  toast(`${biome.name.toUpperCase()} PURCHASED! RESTORE THE LAND.`);
}

function generateBiomeState(biomeId) {
  const biome = BIOMES[biomeId];
  const layoutIndex = randomInt(0, biome.layouts.length - 1);
  const layout = biome.layouts[layoutIndex];

  return {
    layoutIndex,
    restoredCount: 0,
    rewardMilestones: 0,
    tiles: layout.map((plantId, index) => ({
      index,
      restored: false,
      mode: "damaged",
      plant: createPlant(plantId, true),
      hydroDays: 0
    }))
  };
}

function createPlant(plantId, damaged = false) {
  const info = PLANTS[plantId];
  return {
    id: plantId,
    health: damaged ? randomInt(0, 3) : 3,
    waterGiven: 0,
    fertilizerGiven: 0,
    minWater: info.minWater,
    minFertilizer: info.minFertilizer,
    mature: false,
    originalRestoration: damaged
  };
}

function normalizeSave() {
  state.inventory ??= { water: 0, fertilizer: 0 };
  state.carrying ??= null;
  state.biomes ??= {};
  state.ownedBiomes ??= [];
  state.ownedPlots ??= Math.max(1, state.ownedBiomes.length);
  state.totalHarvests ??= 0;
  Object.values(state.biomes).forEach(b => { b.rewardMilestones ??= Math.floor((b.restoredCount || 0) / 5); });

  if (state.ownedPlots === 1 && state.money < 0) {
    state.money = 500;
  }
}

function showPropertyScreen() {
  $("#property-screen").classList.add("active");
  $("#game-screen").classList.remove("active");
}

function showGame() {
  $("#property-screen").classList.remove("active");
  $("#game-screen").classList.add("active");

  ensureCurrentBiome();
  renderEverything();
  requestAnimationFrame(respawnPlayer);
  // Existing players also get the new walkthrough once, without losing their save.
  if (!localStorage.getItem(TUTORIAL_KEY)) openTutorial(0);
}

function ensureCurrentBiome() {
  if (!state.biomes[state.currentBiome]) {
    state.biomes[state.currentBiome] = generateBiomeState(state.currentBiome);
  }
}

function renderEverything() {
  const biome = BIOMES[state.currentBiome];
  const biomeState = state.biomes[state.currentBiome];

  $("#biome-label").textContent = `${biome.icon} ${biome.name}`;
  $("#current-biome-name").textContent = biome.name;
  $("#current-biome-description").textContent = biome.description;

  const stage = $("#world-stage");
  stage.className = `world-stage ${state.currentBiome} revival-${Math.min(5, Math.floor(biomeState.restoredCount / 5))}`;

  $("#money-value").textContent = `$${Math.floor(state.money).toLocaleString()}`;
  $("#water-value").textContent = state.inventory.water;
  $("#fertilizer-value").textContent = state.inventory.fertilizer;
  $("#restored-value").textContent = `${biomeState.restoredCount}/25`;

  const progress = Math.round((biomeState.restoredCount / 25) * 100);
  $("#progress-text").textContent = `${progress}%`;
  $("#progress-bar").style.width = `${progress}%`;
  const tier = Math.floor(biomeState.restoredCount / 5);
  $("#mission-status").textContent = biomeState.restoredCount === 25 ? "🌳 Biome revived! Explore or keep growing." :
    `Restore ${(tier + 1) * 5}/25 plots → Earn ${RESTORATION_REWARDS[tier]}`;
  const total = Object.values(state.biomes).reduce((sum, b) => sum + (b.restoredCount || 0), 0);
  $("#region-status").textContent = `Region revived: ${total}/100 plots`;
  $("#wildlife-status").textContent = ["🍂 Healing begins", "🌼 Wildflowers return", "🦋 Butterflies return", "🐝 Bees return", "🐦 Birds return", "🌳 Thriving habitat"][Math.min(5, tier)];

  $("#water-price").textContent = `$${biome.waterPrice}`;
  $("#fertilizer-price").textContent = `$${biome.fertilizerPrice}`;

  renderCarry();
  renderGrid();
  renderSelectedPlant();
}

function renderGrid() {
  const grid = $("#farm-grid");
  const biomeState = state.biomes[state.currentBiome];
  grid.innerHTML = "";

  biomeState.tiles.forEach((tile, index) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "tile";
    if (index === selectedTileIndex) el.classList.add("selected");
    el.setAttribute("aria-label", tile.plant
      ? `${PLANTS[tile.plant.id].name}, health ${tile.plant.health} of 10${tile.plant.mature ? ", ready to harvest" : ""}`
      : "Restored plot, ready to plant");
    el.dataset.tileIndex = index;

    if (tile.mode === "hydro") el.classList.add("hydro");
    else if (tile.restored) el.classList.add("restored");
    else el.classList.add("damaged");

    if (tile.plant) {
      const plant = tile.plant;
      const info = PLANTS[plant.id];

      if (plant.health <= 3) el.classList.add("health-low");
      else if (plant.health <= 7) el.classList.add("health-mid");
      else el.classList.add("health-high");

      if (plant.mature) el.classList.add("mature");

      const hydroBadge = tile.mode === "hydro" ? `<span class="tile-badge">AUTO</span>` : "";
      el.innerHTML = `
        ${hydroBadge}
        <span class="plant-sprite">${info.sprite}</span>
        <div class="health-mini"><span style="width:${plant.health * 10}%"></span></div>
      `;
    } else {
      const symbol = tile.mode === "hydro" ? "💧" : ({pasture:"🌼",lakeside:"🌾",desert:"🌵",mountain:"🌲"}[state.currentBiome] || "🌱");
      el.innerHTML = `<span class="plant-sprite">${symbol}</span>`;
    }

    el.addEventListener("click", () => {
      selectedTileIndex = index;
      renderSelectedPlant();
      movePlayerToElement(el, () => interactWithTile(index));
    });

    grid.appendChild(el);
  });
}

function setupPlayerDragging() {
  const player = $("#player");
  const stage = $("#world-stage");

  player.addEventListener("pointerdown", event => {
    if (!state) return;

    player.setPointerCapture(event.pointerId);
    const playerRect = player.getBoundingClientRect();

    dragState = {
      pointerId: event.pointerId,
      offsetX: event.clientX - playerRect.left,
      offsetY: event.clientY - playerRect.top
    };

    player.classList.add("dragging");
  });

  player.addEventListener("pointermove", event => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const stageRect = stage.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();

    let x = event.clientX - stageRect.left - dragState.offsetX;
    let y = event.clientY - stageRect.top - dragState.offsetY;

    x = clamp(x, 0, stage.clientWidth - playerRect.width);
    y = clamp(y, 0, stage.clientHeight - playerRect.height);

    player.style.left = `${x}px`;
    player.style.top = `${y}px`;
  });

  player.addEventListener("pointerup", event => {
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    dragState = null;
    player.classList.remove("dragging");
    detectDropTarget();
  });

  player.addEventListener("pointercancel", () => {
    dragState = null;
    player.classList.remove("dragging");
  });
}

function detectDropTarget() {
  const playerRect = $("#player").getBoundingClientRect();

  const stations = [
    { element: $("#water-station"), action: () => buySupply("water") },
    { element: $("#fertilizer-station"), action: () => buySupply("fertilizer") },
    { element: $("#sell-bin"), action: () => toast("Harvest ripe crops directly from their plots.") }
  ];

  for (const target of stations) {
    if (rectsOverlap(playerRect, target.element.getBoundingClientRect())) {
      target.action();
      return;
    }
  }

  const tiles = [...document.querySelectorAll(".tile")];
  for (const tile of tiles) {
    if (rectsOverlap(playerRect, tile.getBoundingClientRect())) {
      const index = Number(tile.dataset.tileIndex);
      selectedTileIndex = index;
      interactWithTile(index);
      return;
    }
  }
}

function movePlayerToElement(element, callback) {
  const stage = $("#world-stage");
  const player = $("#player");
  const stageRect = stage.getBoundingClientRect();
  const targetRect = element.getBoundingClientRect();

  const x = targetRect.left - stageRect.left + targetRect.width / 2 - player.offsetWidth / 2;
  const y = targetRect.top - stageRect.top + targetRect.height / 2 - player.offsetHeight / 2;

  player.style.transition = "left .18s steps(4,end), top .18s steps(4,end)";
  player.style.left = `${clamp(x, 0, stage.clientWidth - player.offsetWidth)}px`;
  player.style.top = `${clamp(y, 0, stage.clientHeight - player.offsetHeight)}px`;

  setTimeout(() => {
    player.style.transition = "";
    callback?.();
  }, 190);
}

function respawnPlayer() {
  const stage = $("#world-stage");
  const house = $("#house");
  const player = $("#player");
  const stageRect = stage.getBoundingClientRect();
  const houseRect = house.getBoundingClientRect();

  player.style.left = `${houseRect.right - stageRect.left + 10}px`;
  player.style.top = `${houseRect.top - stageRect.top + 25}px`;
}

function buySupply(type) {
  const biome = BIOMES[state.currentBiome];
  const price = type === "water" ? biome.waterPrice : biome.fertilizerPrice;

  if (state.carrying) {
    toast(`You're already carrying ${state.carrying === "water" ? "water 💧" : "fertilizer 🧪"}.`);
    return;
  }

  if (state.money < price) {
    toast("Not enough money for that supply.");
    return;
  }

  state.money -= price;
  state.inventory[type] += 1;
  state.carrying = type;

  saveGame();
  renderEverything();
  toast(type === "water" ? `Picked up water for $${price}.` : `Picked up fertilizer for $${price}.`);
}

function interactWithTile(index) {
  const tile = state.biomes[state.currentBiome].tiles[index];
  selectedTileIndex = index;

  if (!tile.plant) {
    openEmptyPlotModal(index);
    renderSelectedPlant();
    return;
  }

  if (tile.mode === "hydro") {
    interactWithHydro(index);
    return;
  }

  if (tile.plant.mature) {
    harvestPlant(index);
    return;
  }

  if (!state.carrying) {
    renderSelectedPlant();
    const need = getPlantNeed(tile.plant);
    toast(need.message);
    return;
  }

  applyTreatment(index, state.carrying);
}

function applyTreatment(index, type) {
  const tile = state.biomes[state.currentBiome].tiles[index];
  const plant = tile.plant;

  if (!plant || plant.mature) return;
  if (state.inventory[type] <= 0) return;

  state.inventory[type] -= 1;
  state.carrying = null;

  if (type === "water") plant.waterGiven += 1;
  if (type === "fertilizer") plant.fertilizerGiven += 1;

  const otherMinimumSatisfied =
    type === "water"
      ? plant.fertilizerGiven >= plant.minFertilizer
      : plant.waterGiven >= plant.minWater;

  /*
    A treatment normally gives +1 health.
    At health 9, the final point is held until BOTH minimum treatment
    requirements are satisfied. This prevents a crop from maturing on
    only water or only fertilizer.
  */
  if (plant.health < 9) {
    plant.health += 1;
  } else if (plant.health === 9 && otherMinimumSatisfied) {
    const currentMinimumSatisfied =
      type === "water"
        ? plant.waterGiven >= plant.minWater
        : plant.fertilizerGiven >= plant.minFertilizer;

    if (currentMinimumSatisfied) plant.health = 10;
  }

  plant.health = Math.min(MAX_HEALTH, plant.health);

  plant.mature =
    plant.health >= MAX_HEALTH &&
    plant.waterGiven >= plant.minWater &&
    plant.fertilizerGiven >= plant.minFertilizer;

  saveGame();
  renderEverything();

  if (plant.mature) {
    toast(`${PLANTS[plant.id].name.toUpperCase()} REVIVED! Drag back to harvest.`);
  } else {
    toast(getPlantNeed(plant).message);
  }
}

function getPlantNeed(plant) {
  if (plant.mature) {
    return { type: "ready", message: "Ready to harvest!" };
  }

  const waterRatio = plant.waterGiven / plant.minWater;
  const fertilizerRatio = plant.fertilizerGiven / plant.minFertilizer;

  if (plant.health >= 9) {
    if (plant.waterGiven < plant.minWater) {
      return { type: "water", message: "💧 Almost revived — it still needs more water." };
    }
    if (plant.fertilizerGiven < plant.minFertilizer) {
      return { type: "fertilizer", message: "🧪 Almost revived — it still needs more nutrients." };
    }
  }

  if (waterRatio < fertilizerRatio) {
    return { type: "water", message: "💧 This plant needs water more." };
  }

  if (fertilizerRatio < waterRatio) {
    return { type: "fertilizer", message: "🧪 This plant needs fertilizer more." };
  }

  return { type: "either", message: "🌱 Water or fertilizer will help this plant recover." };
}

function harvestPlant(index) {
  const biomeState = state.biomes[state.currentBiome];
  const tile = biomeState.tiles[index];
  const plant = tile.plant;
  if (!plant || !plant.mature) return;

  const info = PLANTS[plant.id];
  const biome = BIOMES[state.currentBiome];
  let saleValue = Math.round(info.baseSell * biome.sellMultiplier);

  if (tile.mode === "hydro") {
    const operatingCost = tile.hydroDays * HYDRO_DAILY_COST;
    saleValue = Math.max(1, saleValue - operatingCost);
  }

  state.money += saleValue;
  state.totalHarvests++;
  let milestoneBonus = 0;

  if (!tile.restored) {
    tile.restored = true;
    biomeState.restoredCount += 1;
    if (biomeState.restoredCount % 5 === 0) {
      const idx = biomeState.restoredCount / 5 - 1;
      if (biomeState.rewardMilestones < idx + 1) {
        milestoneBonus = RESTORATION_REWARDS[idx];
        biomeState.rewardMilestones = idx + 1;
        state.money += milestoneBonus;
      }
    }
  }

  tile.plant = null;
  tile.hydroDays = 0;

  saveGame();
  renderEverything();

  if (biomeState.restoredCount === 25) {
    state.money += 500;
    saveGame();
    renderEverything();
    openCompletionModal();
    return;
  }

  toast(`${info.name} sold for ${saleValue}. ${milestoneBonus ? `🌟 Restoration bonus: +${milestoneBonus}!` : "The plot is flourishing!"}`);
}

function openEmptyPlotModal(index) {
  const tile = state.biomes[state.currentBiome].tiles[index];
  if (tile.plant) return;

  const biome = BIOMES[state.currentBiome];
  const cropButtons = biome.plants.map(plantId => {
    const p = PLANTS[plantId];
    return `<button class="pixel-button crop-choice" data-plant="${plantId}">
      ${p.sprite} ${p.name} — seed $${p.seedCost}
    </button>`;
  }).join(" ");

  showModal(`
    <h2>${tile.mode === "hydro" ? "HYDROPONIC PLOT" : "RESTORED PLOT"}</h2>
    <p>This square is healthy land now. Choose what happens next.</p>

    <h3>Plant normally</h3>
    <p>Manual crops have the best final profit.</p>
    <div class="modal-actions">${cropButtons}</div>

    ${tile.mode !== "hydro" ? `
      <hr>
      <h3>Build hydroponics — $${HYDRO_BUILD_COST}</h3>
      <p>Hydro crops receive automatic care every ${HYDRO_TICK_MS / 1000} seconds while playing. Each cycle reduces sale value by ${HYDRO_DAILY_COST}.</p>
      <button id="build-hydro" class="pixel-button">BUILD HYDROPONICS</button>
    ` : ""}

    <div class="modal-actions">
      <button id="close-modal" class="pixel-button secondary">CLOSE</button>
    </div>
  `);

  document.querySelectorAll(".crop-choice").forEach(button => {
    button.addEventListener("click", () => plantCrop(index, button.dataset.plant));
  });

  $("#build-hydro")?.addEventListener("click", () => buildHydro(index));
  $("#close-modal").addEventListener("click", hideModal);
}

function plantCrop(index, plantId) {
  const tile = state.biomes[state.currentBiome].tiles[index];
  const info = PLANTS[plantId];

  if (state.money < info.seedCost) {
    toast("Not enough money for that seed.");
    return;
  }

  state.money -= info.seedCost;
  tile.plant = createPlant(plantId, false);
  tile.plant.originalRestoration = false;

  saveGame();
  hideModal();
  renderEverything();
  toast(`${info.name} planted.`);
}

function buildHydro(index) {
  const tile = state.biomes[state.currentBiome].tiles[index];

  if (state.money < HYDRO_BUILD_COST) {
    toast("Not enough money to build hydroponics.");
    return;
  }

  state.money -= HYDRO_BUILD_COST;
  tile.mode = "hydro";
  tile.hydroDays = 0;

  saveGame();
  hideModal();
  renderEverything();
  toast("Hydroponic bed installed!");
  setTimeout(() => openEmptyPlotModal(index), 350);
}

function interactWithHydro(index) {
  const tile = state.biomes[state.currentBiome].tiles[index];

  if (!tile.plant) {
    openEmptyPlotModal(index);
    return;
  }

  if (tile.plant.mature) {
    harvestPlant(index);
    return;
  }

  toast("This bed grows automatically. Come back when its crop is ready!");
}

function runHydroAutomation() {
  if (!state) return;
  let changed = false, ready = 0;
  Object.values(state.biomes).forEach(b => b.tiles.forEach(tile => {
    if (tile.mode !== "hydro" || !tile.plant || tile.plant.mature) return;
    advanceHydroDay(tile);
    changed = true;
    if (tile.plant.mature) ready++;
  }));
  if (changed) {
    saveGame();
    renderEverything();
    if (ready) toast(`💧 ${ready} hydro crop${ready === 1 ? "" : "s"} ready to harvest!`);
  }
}

function quickCare(type) {
  if (selectedTileIndex === null || !state) return;
  const tile = state.biomes[state.currentBiome].tiles[selectedTileIndex];
  if (!tile?.plant || tile.plant.mature || tile.mode === "hydro") return;
  if (state.carrying && state.carrying !== type) {
    toast("Use your carried supply first.");
    return;
  }
  if (!state.carrying) {
    const biome = BIOMES[state.currentBiome];
    const price = type === "water" ? biome.waterPrice : biome.fertilizerPrice;
    if (state.money < price) { toast("Not enough money. Harvest ripe crops for income."); return; }
    state.money -= price;
    state.inventory[type] += 1;
  }
  applyTreatment(selectedTileIndex, type);
}

function renderQuickActions(tile) {
  const hint = $("#care-hint"), actions = $("#quick-actions");
  if (!tile) {
    hint.textContent = "Tap any crop to inspect and care for it.";
    actions.innerHTML = "";
    return;
  }
  if (!tile.plant) {
    hint.textContent = "Healthy soil! Plant another crop or leave it wild.";
    actions.innerHTML = '<button type="button" class="pixel-button" data-quick="plant">🌱 PLANT CROP</button>';
    return;
  }
  const p = tile.plant, info = PLANTS[p.id];
  hint.textContent = `${info.sprite} ${info.name} · Health ${p.health}/10 · Water ${p.waterGiven}/${p.minWater} · Nutrients ${p.fertilizerGiven}/${p.minFertilizer}`;
  if (p.mature) {
    actions.innerHTML = '<button type="button" class="pixel-button" data-quick="harvest">🌾 HARVEST & SELL</button>';
    return;
  }
  if (tile.mode === "hydro") { actions.innerHTML = '<span class="auto-hint">💧 Automatic care running</span>'; return; }
  const biome = BIOMES[state.currentBiome];
  const w = state.carrying === "water" ? 0 : biome.waterPrice, f = state.carrying === "fertilizer" ? 0 : biome.fertilizerPrice;
  actions.innerHTML = `
    <button type="button" class="pixel-button care-water" data-quick="water" ${state.money < w || state.carrying === "fertilizer" ? "disabled" : ""}>💧 WATER ${w ? "$" + w : "(HELD)"}</button>
    <button type="button" class="pixel-button care-fert" data-quick="fertilizer" ${state.money < f || state.carrying === "water" ? "disabled" : ""}>🧪 FERTILIZE ${f ? "$" + f : "(HELD)"}</button>`;
}

function advanceHydroDay(tile) {
  const plant = tile.plant;
  tile.hydroDays += 1;

  if (plant.waterGiven <= plant.fertilizerGiven) {
    plant.waterGiven += 1;
  } else {
    plant.fertilizerGiven += 1;
  }

  if (plant.health < 10) plant.health += 1;

  if (plant.health >= 10) {
    plant.waterGiven = Math.max(plant.waterGiven, plant.minWater);
    plant.fertilizerGiven = Math.max(plant.fertilizerGiven, plant.minFertilizer);
    plant.mature = true;
  }
}

function renderCarry() {
  const carrying = state.carrying;
  const label = carrying === "water" ? "Water 💧" :
                carrying === "fertilizer" ? "Fertilizer 🧪" :
                "Nothing";

  $("#carry-value").textContent = label;

  const badge = $("#carry-badge");
  if (!carrying) {
    badge.classList.add("hidden");
  } else {
    badge.classList.remove("hidden");
    badge.textContent = carrying === "water" ? "💧" : "🧪";
  }
}

function renderSelectedPlant() {
  const card = $("#plant-card");

  if (selectedTileIndex === null || !state) {
    renderQuickActions(null);
    card.classList.add("empty");
    $("#plant-name").textContent = "Move to a plant";
    $("#plant-details").innerHTML = "<p>Drag your farmer onto a crop to inspect it.</p>";
    return;
  }

  const tile = state.biomes[state.currentBiome].tiles[selectedTileIndex];
  renderQuickActions(tile);

  if (!tile.plant) {
    card.classList.remove("empty");
    $("#plant-name").textContent = tile.mode === "hydro" ? "Empty hydro bed" : "Restored soil";
    $("#plant-details").innerHTML = `
      <p>${tile.mode === "hydro" ? "Ready for another automated crop." : "Ready for a new crop or hydroponics."}</p>
    `;
    return;
  }

  const plant = tile.plant;
  const info = PLANTS[plant.id];
  const need = getPlantNeed(plant);
  const biome = BIOMES[state.currentBiome];
  let sale = Math.round(info.baseSell * biome.sellMultiplier);
  if (tile.mode === "hydro") sale = Math.max(1, sale - tile.hydroDays * HYDRO_DAILY_COST);

  card.classList.remove("empty");
  $("#plant-name").textContent = `${info.sprite} ${info.name}`;
  $("#plant-details").innerHTML = `
    <div class="stat-row"><span>Health</span><b>${plant.health}/10</b></div>
    <div class="stat-row"><span>Water</span><b>${plant.waterGiven}/${plant.minWater} min</b></div>
    <div class="stat-row"><span>Fertilizer</span><b>${plant.fertilizerGiven}/${plant.minFertilizer} min</b></div>
    <div class="stat-row"><span>Sale value</span><b>$${sale}</b></div>
    ${tile.mode === "hydro" ? `<div class="stat-row"><span>Hydro days</span><b>${tile.hydroDays}</b></div>` : ""}
    <div class="need-box">${need.message}</div>
  `;
}

function openWorldMap() {
  const cards = Object.entries(BIOMES).map(([id, biome]) => {
    const owned = state.ownedBiomes.includes(id);
    const current = state.currentBiome === id;
    const biomeState = state.biomes[id];
    const restored = biomeState?.restoredCount ?? 0;

    return `
      <div class="world-map-card ${current ? "current" : ""} ${owned ? "" : "locked"}">
        <h3>${biome.icon} ${biome.name}</h3>
        <p>${biome.perk}</p>
        ${owned
          ? `<p>Restored: ${restored}/25</p>
             <button class="pixel-button" data-travel="${id}" ${current ? "disabled" : ""}>
               ${current ? "YOU ARE HERE" : "TRAVEL"}
             </button>`
          : `<p>Plot ${state.ownedPlots + 1}: $${getNextLandPrice().toLocaleString()}</p>
   <button class="pixel-button" data-purchase="${id}">
     BUY PLOT ${state.ownedPlots + 1}
   </button>`
        }
      </div>
    `;
  }).join("");

  showModal(`
    <h2>WORLD MAP</h2>
    <p>Restore all four biomes to build one thriving connected region.</p>
    <div class="world-map-grid">${cards}</div>
    <div class="modal-actions">
      <button id="close-modal" class="pixel-button secondary">CLOSE</button>
    </div>
  `);

  document.querySelectorAll("[data-travel]").forEach(button => {
    button.addEventListener("click", () => travelToBiome(button.dataset.travel));
  });

  document.querySelectorAll("[data-purchase]").forEach(button => {
    button.addEventListener("click", () => purchaseBiome(button.dataset.purchase));
  });

  $("#close-modal").addEventListener("click", hideModal);
}

function purchaseBiome(id) {
  const biome = BIOMES[id];
  const landPrice = getNextLandPrice();

  if (state.money < landPrice) {
    toast(`You need $${landPrice.toLocaleString()} to buy Plot ${state.ownedPlots + 1}.`);
    return;
  }

  state.money -= landPrice;
  state.ownedBiomes.push(id);
  state.ownedPlots += 1;
  state.biomes[id] = generateBiomeState(id);
  state.currentBiome = id;
  selectedTileIndex = null;

  saveGame();
  hideModal();
  renderEverything();
  requestAnimationFrame(respawnPlayer);
  toast(`${biome.name.toUpperCase()} PURCHASED!`);
}

function travelToBiome(id) {
  if (!state.ownedBiomes.includes(id)) return;

  state.currentBiome = id;
  selectedTileIndex = null;
  saveGame();
  hideModal();
  renderEverything();
  requestAnimationFrame(respawnPlayer);
  toast(`Traveled to ${BIOMES[id].name}.`);
}

function openCompletionModal() {
  const allRestored =
    Object.keys(BIOMES).every(id =>
      state.ownedBiomes.includes(id) &&
      state.biomes[id]?.restoredCount === 25
    );

  showModal(`
    <h2>✨ ${BIOMES[state.currentBiome].name.toUpperCase()} REVIVED!</h2>
    <p>All 25 plots in this biome have been permanently restored.</p>
    <p><b>Restoration bonus: +$500</b></p>
    ${allRestored
      ? `<h3>🌎 NATURE HAS RETURNED</h3>
         <p>You own and have restored all four biomes. The full region is thriving again!</p>`
      : `<p>Keep farming here or use the World Map to expand into another biome.</p>`
    }
    <div class="modal-actions">
      <button id="completion-world" class="pixel-button">WORLD MAP</button>
      <button id="close-modal" class="pixel-button secondary">KEEP FARMING</button>
    </div>
  `);

  $("#completion-world").addEventListener("click", openWorldMap);
  $("#close-modal").addEventListener("click", hideModal);
}

function confirmReset() {
  showModal(`
    <h2>RESET GAME?</h2>
    <p>This permanently erases your local Revive Nature save on this browser.</p>
    <div class="modal-actions">
      <button id="confirm-reset" class="pixel-button danger">YES, RESET</button>
      <button id="close-modal" class="pixel-button secondary">CANCEL</button>
    </div>
  `);

  $("#confirm-reset").addEventListener("click", () => {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(TUTORIAL_KEY);
    location.reload();
  });

  $("#close-modal").addEventListener("click", hideModal);
}

const TUTORIAL_STEPS = [
  {
    title: "Welcome, Nature Keeper!",
    icon: "🌍 🌱 🌻",
    body: "Your mission is to bring four damaged habitats back to life. Each property has <b>25 struggling plants</b>. Nurse them back to health and harvest them to permanently restore the soil.",
    note: "Every 5 restored plots earns a cash bonus. You can see your progress in the top bar."
  },
  {
    title: "Tap a Plant",
    icon: "👆 🌽 🥕",
    body: "Tap any plant in the 5 × 5 field to select it. The <b>Crop Care</b> buttons at the bottom of your phone let you buy and immediately apply <b>💧 Water</b> or <b>🧪 Fertilizer</b>. Tap as often as needed.",
    note: "Each plant must reach 10/10 health and receive at least 3 water and 3 fertilizer treatments. You can also drag the farmer between stations and crops."
  },
  {
    title: "Harvest, Earn & Replant",
    icon: "🌾 💰 🌼",
    body: "When a plant is ready, tap <b>HARVEST & SELL</b> in the Crop Care bar. You'll earn money and turn its damaged plot into healthy land. Tap an empty plot to plant more crops for income, or simply leave it wild.",
    note: "A revived plot stays restored even when you grow a new crop on it. You never have to restore that same square twice."
  },
  {
    title: "Explore & Grow",
    icon: "🗺️ 🏞️ 🦋",
    body: "Use <b>WORLD MAP</b> below the field to buy another biome when you have enough money. Hydroponic beds on restored plots can grow crops automatically. Each biome has its own plants and costs.",
    note: "Your game saves automatically in this browser. Tap <b>❔ HELP</b> above the field whenever you want this tour again. Good luck!"
  }
];

function finishTutorial() {
  localStorage.setItem(TUTORIAL_KEY, "seen");
  hideModal();
}

function openTutorial(step = 0) {
  const index = clamp(step, 0, TUTORIAL_STEPS.length - 1);
  const item = TUTORIAL_STEPS[index];
  showModal(`
    <div class="tutorial-content">
      <p class="tutorial-step">HOW TO PLAY · STEP ${index + 1} OF ${TUTORIAL_STEPS.length}</p>
      <span class="tutorial-illustration" aria-hidden="true">${item.icon}</span>
      <h2>${item.title}</h2>
      <p>${item.body}</p>
      <p class="tutorial-note">${item.note}</p>
      <div class="tutorial-navigation">
        ${index > 0 ? '<button id="tutorial-back" type="button" class="pixel-button secondary">← BACK</button>' : ""}
        <button id="tutorial-next" type="button" class="pixel-button">${index === TUTORIAL_STEPS.length - 1 ? "START PLAYING ✓" : "NEXT →"}</button>
        <button id="tutorial-skip" type="button" class="pixel-button tutorial-skip">SKIP TOUR</button>
      </div>
    </div>
  `);
  $("#tutorial-back")?.addEventListener("click", () => openTutorial(index - 1));
  $("#tutorial-next").addEventListener("click", () => {
    if (index === TUTORIAL_STEPS.length - 1) finishTutorial();
    else openTutorial(index + 1);
  });
  $("#tutorial-skip").addEventListener("click", finishTutorial);
  $("#tutorial-next").focus();
}

function showModal(html) {
  $("#modal-content").innerHTML = html;
  $("#modal-backdrop").classList.remove("hidden");
}

function hideModal() {
  $("#modal-backdrop").classList.add("hidden");
  $("#modal-content").innerHTML = "";
}

function saveGame() {
  if (!state) return;
  state.lastPlayed = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2300);
}

function getNextLandPrice() {
  const index = Math.min(
    state?.ownedPlots ?? 0,
    LAND_PRICES.length - 1
  );

  return LAND_PRICES[index];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rectsOverlap(a, b) {
  const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  const overlapArea = overlapX * overlapY;
  const playerArea = a.width * a.height;
  return overlapArea >= playerArea * 0.18;
}

window.addEventListener("beforeunload", saveGame);
window.addEventListener("resize", () => {
  if (state) respawnPlayer();
});

boot();
