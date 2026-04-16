(() => {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    helpBtn: document.getElementById("helpBtn"),
    helpOverlay: document.getElementById("helpOverlay"),
    openHelpBtn: document.getElementById("openHelpBtn"),
    closeHelpBtn: document.getElementById("closeHelpBtn"),
    gameOverHelpBtn: document.getElementById("gameOverHelpBtn"),
    scoreValue: document.getElementById("scoreValue"),
    heartsValue: document.getElementById("heartsValue"),
    timeValue: document.getElementById("timeValue"),
    difficultyText: document.getElementById("difficultyText"),
    startOverlay: document.getElementById("startOverlay"),
    gameOverOverlay: document.getElementById("gameOverOverlay"),
    gameOverSummary: document.getElementById("gameOverSummary"),
    finalStats: document.getElementById("finalStats"),
    finalWardrobe: document.getElementById("finalWardrobe"),
    damageFlash: document.getElementById("damageFlash"),
    wardrobePanel: document.getElementById("wardrobePanel"),
    slots: {
      shirt: document.getElementById("slot-shirt"),
      pants: document.getElementById("slot-pants"),
      shoes: document.getElementById("slot-shoes"),
      hat: document.getElementById("slot-hat"),
    },
    startBtn: document.getElementById("startBtn"),
    restartBtn: document.getElementById("restartBtn"),
  };

  const config = {
    maxHearts: 5,
    baseSpawnInterval: 760,
    minSpawnInterval: 235,
    chaosRampEvery: 10,
    playerBaseSpeed: 420,
    playerBaseRadius: 22,
    initialInvulnMs: 1200,
    damageInvulnMs: 850,
    itemDespawnMargin: 100,
    backgroundGrid: 56,
    scoreTickPerSecond: 10,
  };

  const defs = {
    goodFood: [
      {
        type: "apple",
        label: "Apple",
        emoji: "🍎",
        heal: 1,
        score: 60,
        color: "#ff7f7f",
      },
      {
        type: "banana",
        label: "Banana",
        emoji: "🍌",
        heal: 1,
        score: 60,
        color: "#f3d15b",
      },
      {
        type: "carrot",
        label: "Carrot",
        emoji: "🥕",
        heal: 1,
        score: 60,
        color: "#ffb26b",
      },
      {
        type: "broccoli",
        label: "Broccoli",
        emoji: "🥦",
        heal: 1,
        score: 60,
        color: "#79d884",
      },
      {
        type: "grapes",
        label: "Grapes",
        emoji: "🍇",
        heal: 1,
        score: 60,
        color: "#b487f8",
      },
    ],

    goodRegen: [
      {
        type: "water",
        label: "Water",
        emoji: "💧",
        score: 85,
        color: "#6ec8ff",
        regenPerSecond: 0.42,
        duration: 5.0,
      },
      {
        type: "sleep",
        label: "Sleep",
        emoji: "💤",
        score: 95,
        color: "#a9b8ff",
        regenPerSecond: 0.55,
        duration: 4.8,
      },
      {
        type: "sunlight",
        label: "Sunlight",
        emoji: "☀️",
        score: 90,
        color: "#ffd36a",
        regenPerSecond: 0.38,
        duration: 5.6,
      },
      {
        type: "yoga",
        label: "Yoga",
        emoji: "🧘‍♀️",
        score: 100,
        color: "#c89cff",
        regenPerSecond: 0.46,
        duration: 5.2,
      },
    ],

    goodCalm: [
      {
        type: "book",
        label: "Book",
        emoji: "📚",
        score: 100,
        color: "#7fe0a6",
        calmDuration: 5.0,
        calmStrength: 0.18,
      },
      {
        type: "podcast",
        label: "Podcast",
        emoji: "🎧",
        score: 100,
        color: "#8bc1ff",
        calmDuration: 4.6,
        calmStrength: 0.16,
      },
      {
        type: "coding",
        label: "Coding",
        emoji: "💻",
        score: 110,
        color: "#8bd6ff",
        calmDuration: 5.2,
        calmStrength: 0.2,
      },
      {
        type: "creative",
        label: "Creative Hobby",
        emoji: "🎨",
        score: 105,
        color: "#ff9fcb",
        calmDuration: 5.0,
        calmStrength: 0.18,
      },
    ],

    goodShield: [
      {
        type: "savings",
        label: "Savings",
        emoji: "💰",
        score: 120,
        color: "#ffd36a",
        shields: 1,
      },
      {
        type: "investment",
        label: "Investment",
        emoji: "📈",
        score: 125,
        color: "#7ee081",
        shields: 1,
      },
      {
        type: "paidbill",
        label: "Paid Bill",
        emoji: "🧾",
        score: 120,
        color: "#7ee081",
        shields: 1,
        drawMode: "paidBill",
      },
    ],

    goodSupport: [
      {
        type: "family",
        label: "Family",
        emoji: "👨‍👩‍👧",
        score: 130,
        color: "#ffe08a",
        heal: 2,
        clearsDebuffs: true,
      },
      {
        type: "friendship",
        label: "Friendship",
        emoji: "🤝",
        score: 130,
        color: "#9de9ff",
        heal: 2,
        clearsDebuffs: true,
      },
    ],

    wardrobe: [
      {
        lane: "shirt",
        tier: 1,
        type: "shirt",
        label: "Shirt",
        emoji: "👕",
        score: 150,
        color: "#7cb4ff",
      },
      {
        lane: "shirt",
        tier: 2,
        type: "hoodie",
        label: "Hoodie",
        emoji: "🧥",
        score: 180,
        color: "#8fd6ff",
      },
      {
        lane: "shirt",
        tier: 3,
        type: "jacket",
        label: "Jacket",
        emoji: "✨",
        score: 220,
        color: "#ffd36a",
      },

      {
        lane: "pants",
        tier: 1,
        type: "pants",
        label: "Pants",
        emoji: "👖",
        score: 150,
        color: "#7fe0a6",
      },
      {
        lane: "pants",
        tier: 2,
        type: "cargo",
        label: "Cargo",
        emoji: "🛡️",
        score: 180,
        color: "#7ee081",
      },

      {
        lane: "shoes",
        tier: 1,
        type: "shoes",
        label: "Shoes",
        emoji: "👟",
        score: 150,
        color: "#ff9ca8",
      },
      {
        lane: "shoes",
        tier: 2,
        type: "boots",
        label: "Boots",
        emoji: "👢",
        score: 180,
        color: "#ffb0ba",
      },

      {
        lane: "hat",
        tier: 1,
        type: "hat",
        label: "Hat",
        emoji: "🧢",
        score: 170,
        color: "#b899ff",
      },
    ],

    badDamage: [
      {
        type: "bill",
        label: "Past Due",
        emoji: "🧾",
        damage: 1,
        score: -20,
        color: "#ff8f8f",
        drawMode: "bill",
      },
      {
        type: "drama",
        label: "Drama",
        emoji: "😡",
        damage: 1,
        score: -20,
        color: "#ff8b5f",
      },
      {
        type: "burger",
        label: "Burger",
        emoji: "🍔",
        damage: 1,
        score: -20,
        color: "#efb16b",
      },
      {
        type: "fries",
        label: "Fries",
        emoji: "🍟",
        damage: 1,
        score: -20,
        color: "#ffb14d",
      },
      {
        type: "soda",
        label: "Soda",
        emoji: "🥤",
        damage: 1,
        score: -20,
        color: "#8fd7ff",
      },
    ],

    badDrain: [
      {
        type: "gas",
        label: "Gas Spike",
        emoji: "⛽",
        score: -15,
        color: "#ffae75",
        drainPerSecond: 42,
        duration: 3.4,
      },
      {
        type: "crash",
        label: "Stock Crash",
        emoji: "📉",
        score: -15,
        color: "#ff7f9e",
        drainPerSecond: 48,
        duration: 3.1,
      },
    ],

    badDebuff: [
      {
        type: "doomscroll",
        label: "Doomscroll",
        emoji: "📱",
        score: -15,
        color: "#b7c6ff",
        slowMult: 0.66,
        duration: 2.7,
      },
      {
        type: "nosignal",
        label: "No Signal",
        emoji: "📴",
        score: -15,
        color: "#8fa7ff",
        slowMult: 0.72,
        duration: 2.2,
      },
      {
        type: "lowbattery",
        label: "Low Battery",
        emoji: "🪫",
        score: -15,
        color: "#ffde8b",
        slowMult: 0.62,
        duration: 2.5,
      },
    ],

    badConfuse: [
      {
        type: "thread",
        label: "Internet Argument",
        emoji: "🧵",
        score: -15,
        color: "#d09cff",
        invertDuration: 1.8,
      },
      {
        type: "overwhelm",
        label: "Overwhelm",
        emoji: "😵‍💫",
        score: -15,
        color: "#c08cff",
        invertDuration: 2.2,
      },
    ],

    badTrickster: [
      {
        type: "robot",
        label: "Robot",
        emoji: "🤖",
        damage: 1,
        score: -20,
        color: "#c6d0df",
      },
    ],
  };

  const state = {
    width: 0,
    height: 0,
    running: false,
    gameOver: false,
    lastTs: 0,
    elapsed: 0,
    score: 0,
    spawnTimer: 0,
    difficultyLevel: 1,
    player: null,
    pointer: { x: 0, y: 0, active: false },
    entities: [],
    particles: [],
    toasts: [],
    backgroundOffset: 0,
    statusBanner: "",
    statusBannerTimer: 0,
    stats: {
      goodCollected: 0,
      badHits: 0,
      foodCollected: 0,
      wardrobeCollected: 0,
      supportCollected: 0,
      shieldsUsed: 0,
    },
  };

  function createPlayer() {
    return {
      x: state.width * 0.5,
      y: state.height * 0.62,
      baseRadius: config.playerBaseRadius,
      hearts: 3,
      fractionalHeal: 0,
      invuln: 0,
      scoreMult: 1,
      hitboxScale: 1,
      speedBonus: 1,
      damageResist: 0,
      awareness: false,
      shields: 0,
      wardrobe: {
        shirt: 0,
        pants: 0,
        shoes: 0,
        hat: 0,
      },
      effects: {
        regenMs: 0,
        regenRate: 0,
        calmMs: 0,
        calmStrength: 0,
        slowMs: 0,
        slowMult: 1,
        invertMs: 0,
        drainMs: 0,
        drainRate: 0,
      },
    };
  }

  function openHelp() {
    ui.helpOverlay.classList.remove("hidden");
  }

  function closeHelp() {
    ui.helpOverlay.classList.add("hidden");
  }

  function resetGame() {
    state.running = false;
    state.gameOver = false;
    state.lastTs = 0;
    state.elapsed = 0;
    state.score = 0;
    state.spawnTimer = 0;
    state.difficultyLevel = 1;
    state.entities = [];
    state.particles = [];
    state.toasts = [];
    state.backgroundOffset = 0;
    state.statusBanner = "";
    state.statusBannerTimer = 0;
    state.stats = {
      goodCollected: 0,
      badHits: 0,
      foodCollected: 0,
      wardrobeCollected: 0,
      supportCollected: 0,
      shieldsUsed: 0,
      causes: {
        bill: 0,
        drama: 0,
        junk: 0,
        robot: 0,
        drain: 0,
        slow: 0,
        confuse: 0,
      },
    };

    state.player = createPlayer();
    state.player.invuln = config.initialInvulnMs;
    state.pointer.x = state.player.x;
    state.pointer.y = state.player.y;

    updateWardrobeUI();
    updateHud();
  }

  function startGame() {
    resetGame();
    state.running = true;
    ui.startOverlay.classList.add("hidden");
    ui.gameOverOverlay.classList.add("hidden");
  }

  function getCauseMessage(cause) {
    const messages = {
      generic: {
        line: "2026 just hit different.",
        tip: "💡 Tip: Try again and adapt to the chaos.",
      },
      bill: {
        line: "2026 buried you in late bills.",
        tip: "💡 Tip: Pay those bills before they stack up.",
      },
      drama: {
        line: "2026 dragged you into too much drama.",
        tip: "💡 Tip: Protect your peace. Not everything needs a response.",
      },
      junk: {
        line: "2026 got you on fast food overload.",
        tip: "💡 Tip: Eat more fruits and veggies to stay in the game.",
      },
      robot: {
        line: "2026 fooled you with AI chaos.",
        tip: "💡 Tip: Not everything you see is real. Stay sharp.",
      },
      drain: {
        line: "2026 drained your energy and your score.",
        tip: "💡 Tip: Watch for slow drains. They sneak up on you.",
      },
      slow: {
        line: "2026 slowed you down too much.",
        tip: "💡 Tip: Stay focused and avoid distractions.",
      },
      confuse: {
        line: "2026 completely scrambled your brain.",
        tip: "💡 Tip: When things feel backwards, stay calm and ride it out.",
      },
    };

    return (
      messages[cause] || {
        line: "2026 just hit different.",
        tip: "💡 Tip: Try again and adapt to the chaos.",
      }
    );
  }

  function getTopCause() {
    const entries = Object.entries(state.stats.causes);
    entries.sort((a, b) => b[1] - a[1]);

    if (!entries.length || entries[0][1] === 0) {
      return "generic";
    }

    return entries[0][0];
  }

  function endGame() {
    state.running = false;
    state.gameOver = true;
    ui.gameOverOverlay.classList.remove("hidden");

    const gearSummary = [
      state.player.wardrobe.shirt
        ? `Shirt T${state.player.wardrobe.shirt}`
        : null,
      state.player.wardrobe.pants
        ? `Pants T${state.player.wardrobe.pants}`
        : null,
      state.player.wardrobe.shoes
        ? `Shoes T${state.player.wardrobe.shoes}`
        : null,
      state.player.wardrobe.hat ? `Hat` : null,
    ]
      .filter(Boolean)
      .join(", ");

    const topCause = getTopCause();
    const causeData = getCauseMessage(topCause);

    ui.gameOverSummary.innerHTML = `
  You survived ${state.elapsed.toFixed(1)} seconds of chaos.<br><br>
  <strong>${causeData.line}</strong><br>
  <span style="color:#aeb7c7">${causeData.tip}</span>
`;

    ui.finalStats.innerHTML = `
      Score: <strong>${Math.floor(state.score)}</strong><br>
      Time: <strong>${state.elapsed.toFixed(1)}s</strong><br>
      Food grabbed: <strong>${state.stats.foodCollected}</strong><br>
      Support grabs: <strong>${state.stats.supportCollected}</strong><br>
      Bad hits: <strong>${state.stats.badHits}</strong><br>
      Shields used: <strong>${state.stats.shieldsUsed}</strong>
    `;

    ui.finalWardrobe.innerHTML = gearSummary
      ? `Collected: <strong>${gearSummary}</strong><br>Wardrobe pieces: <strong>${state.stats.wardrobeCollected}</strong>`
      : "No drip. 2026 really won that round.";
  }

  function resize() {
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    state.width = rect.width;
    state.height = rect.height;

    if (!state.player) {
      state.player = createPlayer();
    } else {
      state.player.x = Math.min(Math.max(state.player.x, 30), state.width - 30);
      state.player.y = Math.min(
        Math.max(state.player.y, 30),
        state.height - 30,
      );
    }
  }

  function isMobileWidth() {
    return state.width <= 720;
  }

  function getDifficultyLabel(level) {
    const labels = [
      "Easy-ish",
      "Warming up",
      "Messy",
      "Chaotic",
      "Unhinged",
      "Absolutely cursed",
    ];
    return labels[Math.min(labels.length - 1, level - 1)];
  }

  function buildEffectSummary() {
    const effects = state.player.effects;
    const parts = [];

    if (state.player.shields > 0) parts.push(`🛡 ${state.player.shields}`);
    if (effects.regenMs > 0) parts.push("💧 Regen");
    if (effects.calmMs > 0) parts.push("📚 Focus");
    if (effects.slowMs > 0) parts.push("🐢 Slow");
    if (effects.invertMs > 0) parts.push("😵 Inverted");
    if (effects.drainMs > 0) parts.push("💸 Drain");
    if (state.player.damageResist > 0) parts.push("✨ Resist");
    if (state.player.awareness) parts.push("🧢 Aware");

    return parts.join(" · ");
  }

  function updateHud() {
    const p = state.player;
    ui.scoreValue.textContent = Math.floor(state.score).toLocaleString();
    ui.timeValue.textContent = `${state.elapsed.toFixed(1)}s`;

    if (isMobileWidth()) {
      ui.heartsValue.textContent = `❤️ ${p.hearts}/${config.maxHearts}${p.shields > 0 ? `  🛡 ${p.shields}` : ""}`;
    } else {
      ui.heartsValue.textContent =
        "❤️".repeat(p.hearts) +
        "🖤".repeat(Math.max(0, config.maxHearts - p.hearts)) +
        (p.shields > 0 ? `  🛡${p.shields}` : "");
    }

    const effectSummary = buildEffectSummary();
    const baseText = `Chaos Level ${state.difficultyLevel} · ${getDifficultyLabel(state.difficultyLevel)}`;
    ui.difficultyText.textContent = effectSummary
      ? `${baseText} · ${effectSummary}`
      : baseText;
  }

  function getWardrobeDisplay(lane, tier) {
    const maps = {
      shirt: [
        { icon: "👕", label: "Shirt" },
        { icon: "🧥", label: "Hoodie" },
        { icon: "✨", label: "Jacket" },
      ],
      pants: [
        { icon: "👖", label: "Pants" },
        { icon: "🛡️", label: "Cargo" },
      ],
      shoes: [
        { icon: "👟", label: "Shoes" },
        { icon: "👢", label: "Boots" },
      ],
      hat: [{ icon: "🧢", label: "Hat" }],
    };

    const arr = maps[lane];
    if (!arr || tier <= 0) {
      return {
        shirt: { icon: "👕", label: "Shirt" },
        pants: { icon: "👖", label: "Pants" },
        shoes: { icon: "👟", label: "Shoes" },
        hat: { icon: "🧢", label: "Hat" },
      }[lane];
    }

    return arr[Math.min(arr.length - 1, tier - 1)];
  }

  function updateWardrobeUI() {
    for (const [lane, el] of Object.entries(ui.slots)) {
      if (!el) continue;
      const tier = state.player.wardrobe[lane] || 0;
      const info = getWardrobeDisplay(lane, tier);
      const iconEl = el.querySelector(".wardrobeIcon");
      const labelEl = el.querySelector(".wardrobeLabel");
      if (iconEl) iconEl.textContent = info.icon;
      if (labelEl)
        labelEl.textContent = tier > 0 ? `${info.label} T${tier}` : info.label;
      el.classList.toggle("active", tier > 0);
    }
  }

  function getSpawnInterval() {
    let reduced = config.baseSpawnInterval - (state.difficultyLevel - 1) * 52;
    if (state.player.effects.calmMs > 0) reduced += 120;
    return Math.max(config.minSpawnInterval, reduced);
  }

  function getDangerBias() {
    const base = 0.5 + (state.difficultyLevel - 1) * 0.045;
    const calmReduction =
      state.player.effects.calmMs > 0
        ? state.player.effects.calmStrength * 0.22
        : 0;
    return Math.max(0.34, Math.min(0.82, base - calmReduction));
  }

  function getNextWardrobeItems() {
    const next = [];

    if (state.player.wardrobe.shirt < 3) {
      next.push(
        defs.wardrobe.find(
          (item) =>
            item.lane === "shirt" &&
            item.tier === state.player.wardrobe.shirt + 1,
        ),
      );
    }
    if (state.player.wardrobe.pants < 2) {
      next.push(
        defs.wardrobe.find(
          (item) =>
            item.lane === "pants" &&
            item.tier === state.player.wardrobe.pants + 1,
        ),
      );
    }
    if (state.player.wardrobe.shoes < 2) {
      next.push(
        defs.wardrobe.find(
          (item) =>
            item.lane === "shoes" &&
            item.tier === state.player.wardrobe.shoes + 1,
        ),
      );
    }
    if (state.player.wardrobe.hat < 1) {
      next.push(
        defs.wardrobe.find((item) => item.lane === "hat" && item.tier === 1),
      );
    }

    return next.filter(Boolean);
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pickWeightedDefinition() {
    const isDanger = Math.random() < getDangerBias();

    if (isDanger) {
      const buckets = [
        { kind: "badDamage", weight: 34 },
        { kind: "badDrain", weight: 18 },
        { kind: "badDebuff", weight: 22 },
        { kind: "badConfuse", weight: 16 },
        { kind: "badTrickster", weight: 10 },
      ];
      const total = buckets.reduce((sum, b) => sum + b.weight, 0);
      let roll = Math.random() * total;
      for (const b of buckets) {
        roll -= b.weight;
        if (roll <= 0) {
          return { bucket: b.kind, data: randomItem(defs[b.kind]) };
        }
      }
      return { bucket: "badDamage", data: randomItem(defs.badDamage) };
    }

    const wardrobeLeft = getNextWardrobeItems();
    const wardrobeChance = wardrobeLeft.length ? 0.15 : 0;

    if (Math.random() < wardrobeChance) {
      return { bucket: "wardrobe", data: randomItem(wardrobeLeft) };
    }

    const buckets = [
      { kind: "goodFood", weight: 36 },
      { kind: "goodRegen", weight: 17 },
      { kind: "goodCalm", weight: 16 },
      { kind: "goodShield", weight: 14 },
      { kind: "goodSupport", weight: 8 },
    ];
    const total = buckets.reduce((sum, b) => sum + b.weight, 0);
    let roll = Math.random() * total;
    for (const b of buckets) {
      roll -= b.weight;
      if (roll <= 0) {
        return { bucket: b.kind, data: randomItem(defs[b.kind]) };
      }
    }

    return { bucket: "goodFood", data: randomItem(defs.goodFood) };
  }

  function createEntityFromPick(pick, x, y, angle, speed) {
    const size = pick.bucket === "wardrobe" ? 24 : 21 + Math.random() * 7;
    return {
      id: Math.random().toString(36).slice(2),
      kind: pick.bucket,
      data: pick.data,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 1.8,
      pulse: Math.random() * Math.PI * 2,
      life: 0,
      collected: false,
      isDecoy: false,
      glow: getGlowForKind(pick.bucket, pick.data),
    };
  }

  function spawnEntity() {
    const pick = pickWeightedDefinition();
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) {
      x = -50;
      y = Math.random() * state.height;
    } else if (side === 1) {
      x = state.width + 50;
      y = Math.random() * state.height;
    } else if (side === 2) {
      x = Math.random() * state.width;
      y = -50;
    } else {
      x = Math.random() * state.width;
      y = state.height + 50;
    }

    const centerBiasX =
      state.width * 0.5 + (Math.random() - 0.5) * state.width * 0.36;
    const centerBiasY =
      state.height * 0.55 + (Math.random() - 0.5) * state.height * 0.3;
    let angle = Math.atan2(centerBiasY - y, centerBiasX - x);
    angle += (Math.random() - 0.5) * 0.55;

    const speedBase = 86 + state.difficultyLevel * 18;
    const speedVariance = pick.bucket.startsWith("bad") ? 95 : 72;
    let speed = speedBase + Math.random() * speedVariance;

    if (state.player.effects.calmMs > 0 && pick.bucket.startsWith("bad")) {
      speed *= 1 - state.player.effects.calmStrength;
    }

    const entity = createEntityFromPick(pick, x, y, angle, speed);
    state.entities.push(entity);

    if (
      pick.bucket === "badTrickster" &&
      pick.data.type === "robot" &&
      Math.random() < 0.62
    ) {
      const decoy = createEntityFromPick(
        pick,
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        angle + (Math.random() - 0.5) * 0.35,
        speed * (0.94 + Math.random() * 0.12),
      );
      decoy.isDecoy = true;
      decoy.glow = "rgba(180, 190, 220, 0.18)";
      state.entities.push(decoy);
    }
  }

  function getGlowForKind(kind, data) {
    if (kind.startsWith("bad")) return "rgba(255, 95, 95, 0.92)";
    if (kind === "wardrobe") return "rgba(139, 193, 255, 0.92)";
    if (kind === "goodShield") return "rgba(255, 211, 106, 0.96)";
    if (kind === "goodSupport") return "rgba(255, 232, 138, 0.96)";
    if (kind === "goodCalm") return "rgba(120, 205, 255, 0.96)";
    if (kind === "goodRegen") return "rgba(126, 224, 129, 0.96)";
    if (kind === "goodFood") return "rgba(110, 225, 129, 0.92)";
    return data?.color || "rgba(255,255,255,0.9)";
  }

  function spawnBurst(x, y, color, amount = 8) {
    for (let i = 0; i < amount; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 45 + Math.random() * 120;
      const ttl = 0.55 + Math.random() * 0.4;

      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: ttl,
        ttl,
        size: 3 + Math.random() * 4,
        color,
      });
    }
  }

  function addToast(text, x, y, color = "#ffffff") {
    state.toasts.push({
      text,
      x,
      y,
      life: 900,
      maxLife: 900,
      color,
    });
  }

  function setBanner(text, ms = 1000) {
    state.statusBanner = text;
    state.statusBannerTimer = ms;
  }

  function flashDamage() {
    ui.damageFlash.style.transition = "none";
    ui.damageFlash.style.opacity = "1";

    requestAnimationFrame(() => {
      ui.damageFlash.style.transition = "opacity 260ms ease";
      ui.damageFlash.style.opacity = "0";
    });
  }

  function clampPlayer() {
    const pad = 20;
    state.player.x = Math.max(pad, Math.min(state.width - pad, state.player.x));
    state.player.y = Math.max(
      pad,
      Math.min(state.height - pad, state.player.y),
    );
  }

  function healPlayer(amount) {
    if (amount <= 0) return;
    state.player.fractionalHeal += amount;

    while (
      state.player.fractionalHeal >= 1 &&
      state.player.hearts < config.maxHearts
    ) {
      state.player.hearts += 1;
      state.player.fractionalHeal -= 1;
    }

    if (state.player.hearts >= config.maxHearts) {
      state.player.hearts = config.maxHearts;
      state.player.fractionalHeal = 0;
    }
  }

  function clearDebuffs() {
    state.player.effects.slowMs = 0;
    state.player.effects.slowMult = 1;
    state.player.effects.invertMs = 0;
    state.player.effects.drainMs = 0;
    state.player.effects.drainRate = 0;
    setBanner("Support cleared the chaos", 1000);
  }

  function applyWardrobeBuff(item) {
    const lane = item.lane;
    state.player.wardrobe[lane] = Math.max(
      state.player.wardrobe[lane],
      item.tier,
    );
    state.stats.wardrobeCollected += 1;

    if (lane === "shirt") {
      if (item.tier === 1)
        state.player.scoreMult = Math.max(state.player.scoreMult, 1.18);
      if (item.tier === 2)
        state.player.scoreMult = Math.max(state.player.scoreMult, 1.32);
      if (item.tier === 3) {
        state.player.scoreMult = Math.max(state.player.scoreMult, 1.4);
        state.player.damageResist = 0.25;
      }
    }

    if (lane === "pants") {
      if (item.tier === 1)
        state.player.hitboxScale = Math.min(state.player.hitboxScale, 0.86);
      if (item.tier === 2)
        state.player.hitboxScale = Math.min(state.player.hitboxScale, 0.76);
    }

    if (lane === "shoes") {
      if (item.tier === 1)
        state.player.speedBonus = Math.max(state.player.speedBonus, 1.18);
      if (item.tier === 2)
        state.player.speedBonus = Math.max(state.player.speedBonus, 1.32);
    }

    if (lane === "hat") {
      state.player.awareness = true;
    }

    updateWardrobeUI();
  }

  function applyDamageHit(entity) {
    if (entity.isDecoy) {
      addToast("FAKE BOT", entity.x, entity.y, "#d9dfff");
      spawnBurst(entity.x, entity.y, "#cfd5ea", 7);
      return;
    }

    if (state.player.invuln > 0) return;

    if (state.player.shields > 0) {
      state.player.shields -= 1;
      state.player.invuln = 300;
      state.stats.shieldsUsed += 1;
      addToast("SHIELD BLOCK", entity.x, entity.y, "#ffd36a");
      spawnBurst(entity.x, entity.y, "#ffd36a", 12);
      setBanner("Shield absorbed the hit", 900);
      return;
    }

    const type = entity.data.type;

    if (type === "bill") state.stats.causes.bill++;
    else if (type === "drama") state.stats.causes.drama++;
    else if (type === "burger" || type === "fries" || type === "soda")
      state.stats.causes.junk++;
    else if (type === "robot") state.stats.causes.robot++;

    state.stats.badHits += 1;
    const resist = state.player.damageResist || 0;
    const incoming = entity.data.damage || 1;
    const actualDamage = Math.max(1, Math.ceil(incoming * (1 - resist)));

    state.player.hearts -= actualDamage;
    state.player.invuln = config.damageInvulnMs;
    state.score = Math.max(0, state.score + (entity.data.score || -20));

    addToast(
      `${entity.data.label.toUpperCase()} HIT`,
      entity.x,
      entity.y,
      "#ff7a7a",
    );
    spawnBurst(entity.x, entity.y, entity.data.color, 12);
    flashDamage();

    if (state.player.hearts <= 0) {
      state.player.hearts = 0;
      updateHud();
      endGame();
    }
  }

  function removeOneMatchingBad(types, toastText, color = "#7ee081") {
    let target = null;
    let bestDist = Infinity;

    for (const entity of state.entities) {
      if (
        entity.collected ||
        !entity.kind.startsWith("bad") ||
        !types.includes(entity.data.type)
      ) {
        continue;
      }

      const dx = entity.x - state.player.x;
      const dy = entity.y - state.player.y;
      const dist = dx * dx + dy * dy; // squared distance is enough

      if (dist < bestDist) {
        bestDist = dist;
        target = entity;
      }
    }

    if (!target) return false;

    target.collected = true;
    spawnBurst(target.x, target.y, color, 10);
    addToast(toastText, target.x, target.y, color);
    return true;
  }

  function clearCounterForGood(entity) {
    const type = entity.data.type;

    if (type === "paidbill") {
      removeOneMatchingBad(["bill"], "PAST DUE PAID", "#7ee081");
      return;
    }

    if (
      type === "apple" ||
      type === "banana" ||
      type === "carrot" ||
      type === "broccoli" ||
      type === "grapes"
    ) {
      removeOneMatchingBad(["burger", "fries"], "JUNK CLEARED", "#7ee081");
      return;
    }

    if (type === "water") {
      removeOneMatchingBad(["soda"], "SODA DITCHED", "#6ec8ff");
      return;
    }

    if (type === "friendship") {
      removeOneMatchingBad(["drama"], "DRAMA DEFUSED", "#9de9ff");
      return;
    }

    if (type === "family") {
      removeOneMatchingBad(["drama"], "FAMILY FIRST", "#ffe08a");
      return;
    }

    if (type === "investment") {
      removeOneMatchingBad(["crash"], "MARKET STABILIZED", "#7ee081");
      return;
    }

    if (type === "savings") {
      removeOneMatchingBad(["gas"], "COST BUFFERED", "#ffd36a");
      return;
    }

    if (
      type === "book" ||
      type === "podcast" ||
      type === "coding" ||
      type === "creative"
    ) {
      removeOneMatchingBad(
        ["doomscroll", "nosignal", "lowbattery"],
        "TECH CHAOS CUT",
        "#8bc1ff",
      );
      return;
    }

    if (type === "sleep" || type === "yoga" || type === "sunlight") {
      removeOneMatchingBad(["overwhelm", "thread"], "MENTAL RESET", "#c89cff");
    }
  }

  function collectEntity(entity) {
    if (entity.collected) return;
    entity.collected = true;

    const p = state.player;
    const d = entity.data;

    if (entity.kind === "goodFood") {
      state.stats.goodCollected += 1;
      state.stats.foodCollected += 1;
      state.score += d.score * p.scoreMult;
      clearCounterForGood(entity);

      if (p.hearts < config.maxHearts) {
        healPlayer(d.heal || 1);
        addToast("+1 HEART", entity.x, entity.y, "#7ee081");
      } else {
        addToast("HEALTHY!", entity.x, entity.y, "#7ee081");
      }

      spawnBurst(entity.x, entity.y, d.color, 9);
      return;
    }

    if (entity.kind === "goodRegen") {
      state.stats.goodCollected += 1;
      state.score += d.score * p.scoreMult;
      p.effects.regenMs = Math.max(p.effects.regenMs, d.duration * 1000);
      p.effects.regenRate = Math.max(p.effects.regenRate, d.regenPerSecond);
      addToast(`${d.label.toUpperCase()} BUFF`, entity.x, entity.y, "#7ee081");
      setBanner(`${d.label} active: regen up`, 1000);
      spawnBurst(entity.x, entity.y, d.color, 10);
      clearCounterForGood(entity);
      return;
    }

    if (entity.kind === "goodCalm") {
      state.stats.goodCollected += 1;
      state.score += d.score * p.scoreMult;
      p.effects.calmMs = Math.max(p.effects.calmMs, d.calmDuration * 1000);
      p.effects.calmStrength = Math.max(p.effects.calmStrength, d.calmStrength);
      addToast(`${d.label.toUpperCase()} CALM`, entity.x, entity.y, "#8bc1ff");
      setBanner(`${d.label}: chaos slowed`, 1000);
      spawnBurst(entity.x, entity.y, d.color, 10);
      clearCounterForGood(entity);
      return;
    }

    if (entity.kind === "goodShield") {
      state.stats.goodCollected += 1;
      state.score += d.score * p.scoreMult;
      p.shields += d.shields || 1;
      addToast("SHIELD UP", entity.x, entity.y, "#ffd36a");
      setBanner(`${d.label}: shield ready`, 1000);
      spawnBurst(entity.x, entity.y, d.color, 12);
      clearCounterForGood(entity);
      return;
    }

    if (entity.kind === "goodSupport") {
      state.stats.goodCollected += 1;
      state.stats.supportCollected += 1;
      state.score += d.score * p.scoreMult;
      healPlayer(d.heal || 2);
      if (d.clearsDebuffs) clearDebuffs();
      addToast(`${d.label.toUpperCase()} ❤️`, entity.x, entity.y, "#ffe08a");
      spawnBurst(entity.x, entity.y, d.color, 13);
      clearCounterForGood(entity);
      return;
    }

    if (entity.kind === "wardrobe") {
      applyWardrobeBuff(d);
      state.score += d.score * p.scoreMult;
      addToast(`NEW ${d.label.toUpperCase()}`, entity.x, entity.y, "#ffd36a");
      setBanner(`${d.label} equipped`, 900);
      spawnBurst(entity.x, entity.y, d.color, 12);
      return;
    }

    if (entity.kind === "badDamage" || entity.kind === "badTrickster") {
      applyDamageHit(entity);
      return;
    }

    if (entity.kind === "badDrain") {
      state.score = Math.max(0, state.score + (d.score || -15));

      const wasInactive = p.effects.drainMs <= 0;
      p.effects.drainMs = Math.max(p.effects.drainMs, d.duration * 1000);
      p.effects.drainRate = Math.max(p.effects.drainRate, d.drainPerSecond);

      if (wasInactive) state.stats.causes.drain++;

      addToast(`${d.label.toUpperCase()} DRAIN`, entity.x, entity.y, "#ff9b80");
      setBanner(`${d.label}: score draining`, 1000);
      spawnBurst(entity.x, entity.y, d.color, 10);
      return;
    }

    if (entity.kind === "badDebuff") {
      state.score = Math.max(0, state.score + (d.score || -15));

      const wasInactive = p.effects.slowMs <= 0;
      p.effects.slowMs = Math.max(p.effects.slowMs, d.duration * 1000);
      p.effects.slowMult = Math.min(p.effects.slowMult, d.slowMult);

      if (wasInactive) state.stats.causes.slow++;

      addToast(`${d.label.toUpperCase()} SLOW`, entity.x, entity.y, "#b7c6ff");
      setBanner(`${d.label}: movement slowed`, 1000);
      spawnBurst(entity.x, entity.y, d.color, 10);
      return;
    }

    if (entity.kind === "badConfuse") {
      state.score = Math.max(0, state.score + (d.score || -15));

      const wasInactive = p.effects.invertMs <= 0;
      p.effects.invertMs = Math.max(
        p.effects.invertMs,
        d.invertDuration * 1000,
      );

      if (wasInactive) state.stats.causes.confuse++;

      addToast(
        `${d.label.toUpperCase()} CONFUSE`,
        entity.x,
        entity.y,
        "#d09cff",
      );
      setBanner(`${d.label}: controls inverted`, 1200);
      spawnBurst(entity.x, entity.y, d.color, 10);
    }
  }

  function updateEffects(dt) {
    const p = state.player;
    const effects = p.effects;
    const ms = dt * 1000;

    if (effects.regenMs > 0) {
      effects.regenMs = Math.max(0, effects.regenMs - ms);
      healPlayer(effects.regenRate * dt);
      if (effects.regenMs === 0) effects.regenRate = 0;
    }

    if (effects.calmMs > 0) {
      effects.calmMs = Math.max(0, effects.calmMs - ms);
      if (effects.calmMs === 0) effects.calmStrength = 0;
    }

    if (effects.slowMs > 0) {
      effects.slowMs = Math.max(0, effects.slowMs - ms);
      if (effects.slowMs === 0) effects.slowMult = 1;
    }

    if (effects.invertMs > 0) {
      effects.invertMs = Math.max(0, effects.invertMs - ms);
    }

    if (effects.drainMs > 0) {
      effects.drainMs = Math.max(0, effects.drainMs - ms);
      state.score = Math.max(0, state.score - effects.drainRate * dt);
      if (effects.drainMs === 0) effects.drainRate = 0;
    }

    if (p.invuln > 0) p.invuln = Math.max(0, p.invuln - ms);

    if (state.statusBannerTimer > 0) {
      state.statusBannerTimer = Math.max(0, state.statusBannerTimer - ms);
      if (state.statusBannerTimer === 0) state.statusBanner = "";
    }
  }

  function update(dt) {
    if (!state.running) return;

    state.elapsed += dt;
    state.score += dt * config.scoreTickPerSecond * state.player.scoreMult;
    state.backgroundOffset += dt * 18;

    const newLevel = 1 + Math.floor(state.elapsed / config.chaosRampEvery);
    state.difficultyLevel = Math.max(1, newLevel);

    updateEffects(dt);

    const p = state.player;
    const dxRaw = state.pointer.x - p.x;
    const dyRaw = state.pointer.y - p.y;
    const invert = p.effects.invertMs > 0 ? -1 : 1;
    const dx = dxRaw * invert;
    const dy = dyRaw * invert;
    const dist = Math.hypot(dx, dy);

    let moveSpeed = config.playerBaseSpeed * p.speedBonus;
    if (p.effects.slowMs > 0) moveSpeed *= p.effects.slowMult;

    if (dist > 1) {
      const step = Math.min(dist, moveSpeed * dt);
      p.x += (dx / dist) * step;
      p.y += (dy / dist) * step;
    }

    clampPlayer();

    state.spawnTimer += dt * 1000;
    const spawnInterval = getSpawnInterval();
    while (state.spawnTimer >= spawnInterval) {
      state.spawnTimer -= spawnInterval;
      spawnEntity();
    }

    const robotPull = Math.min(35, 10 + state.difficultyLevel * 2);

    for (const entity of state.entities) {
      entity.life += dt;
      entity.rotation += entity.spin * dt;
      entity.pulse += dt * 6;

      if (entity.kind === "badTrickster" && entity.data.type === "robot") {
        const ang = Math.atan2(
          state.player.y - entity.y,
          state.player.x - entity.x,
        );
        const strength = entity.isDecoy ? robotPull * 0.72 : robotPull;
        entity.vx += Math.cos(ang) * strength * dt;
        entity.vy += Math.sin(ang) * strength * dt;
      }

      if (entity.kind === "badDamage" && entity.data.type === "drama") {
        entity.vx += Math.sin(entity.life * 12) * 3;
        entity.vy += Math.cos(entity.life * 10) * 3;
      }

      if (state.player.effects.calmMs > 0 && entity.kind.startsWith("bad")) {
        entity.vx *= 0.997;
        entity.vy *= 0.997;
      }

      entity.x += entity.vx * dt;
      entity.y += entity.vy * dt;
    }

    for (const p2 of state.particles) {
      p2.life -= dt;
      p2.x += p2.vx * dt;
      p2.y += p2.vy * dt;
      p2.vx *= 0.985;
      p2.vy *= 0.985;
    }
    state.particles = state.particles.filter((p2) => p2.life > 0);

    for (const t of state.toasts) {
      t.life -= dt * 1000;
      t.y -= 28 * dt;
    }
    state.toasts = state.toasts.filter((t) => t.life > 0);

    const playerRadius = state.player.baseRadius * state.player.hitboxScale;

    for (const entity of state.entities) {
      if (entity.collected) continue;

      const collisionRadius = playerRadius + entity.size * 0.62;
      if (
        Math.hypot(entity.x - state.player.x, entity.y - state.player.y) <
        collisionRadius
      ) {
        collectEntity(entity);
      }
    }

    state.entities = state.entities.filter((entity) => {
      if (entity.collected) return false;

      return !(
        entity.x < -config.itemDespawnMargin ||
        entity.x > state.width + config.itemDespawnMargin ||
        entity.y < -config.itemDespawnMargin ||
        entity.y > state.height + config.itemDespawnMargin
      );
    });

    updateHud();
  }

  function drawBackground() {
    ctx.clearRect(0, 0, state.width, state.height);

    const grad = ctx.createLinearGradient(0, 0, 0, state.height);
    grad.addColorStop(0, "#1a1f34");
    grad.addColorStop(0.45, "#121627");
    grad.addColorStop(1, "#0a0c15");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, state.width, state.height);

    const grid = config.backgroundGrid;
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = -grid; x < state.width + grid; x += grid) {
      ctx.moveTo(x + (state.backgroundOffset % grid), 0);
      ctx.lineTo(x + (state.backgroundOffset % grid), state.height);
    }

    for (let y = -grid; y < state.height + grid; y += grid) {
      ctx.moveTo(0, y + ((state.backgroundOffset * 0.6) % grid));
      ctx.lineTo(state.width, y + ((state.backgroundOffset * 0.6) % grid));
    }

    ctx.stroke();

    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = "#ffffff";
    ctx.font = isMobileWidth() ? "bold 64px Arial" : "bold 110px Arial";
    ctx.textAlign = "center";
    ctx.fillText("2026", state.width * 0.5, state.height * 0.5);
    ctx.restore();

    if (state.player.effects.slowMs > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(110, 150, 255, 0.05)";
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.restore();
    }

    if (state.player.effects.invertMs > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(194, 120, 255, 0.06)";
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.restore();
    }

    if (state.player.effects.drainMs > 0) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 90, 90, 0.045)";
      ctx.fillRect(0, 0, state.width, state.height);
      ctx.restore();
    }
  }

  function drawPlayer() {
    const p = state.player;
    const blink = p.invuln > 0 && Math.floor(p.invuln / 80) % 2 === 0;
    if (blink) return;

    const x = p.x;
    const y = p.y;
    const s = 12;

    ctx.save();
    ctx.translate(x, y);

    if (p.effects.regenMs > 0) {
      ctx.fillStyle = "rgba(126, 224, 129, 0.16)";
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.shields > 0) {
      ctx.strokeStyle = "rgba(255, 211, 106, 0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.fillStyle = "#f6d5b9";
    ctx.fillRect(-s, -s * 2.2, s * 2, s * 1.5);

    let shirtColor = "#d8dde8";
    if (p.wardrobe.shirt === 1) shirtColor = "#6fb4ff";
    if (p.wardrobe.shirt === 2) shirtColor = "#7cd7ff";
    if (p.wardrobe.shirt >= 3) shirtColor = "#ffd36a";

    let pantsColor = "#707c94";
    if (p.wardrobe.pants === 1) pantsColor = "#80df9f";
    if (p.wardrobe.pants >= 2) pantsColor = "#59c477";

    let shoesColor = "#adb6c7";
    if (p.wardrobe.shoes === 1) shoesColor = "#ff9ca8";
    if (p.wardrobe.shoes >= 2) shoesColor = "#ffb0ba";

    ctx.fillStyle = shirtColor;
    ctx.fillRect(-s * 1.1, -s * 0.7, s * 2.2, s * 1.5);

    ctx.fillStyle = pantsColor;
    ctx.fillRect(-s * 0.95, s * 0.8, s * 0.8, s * 1.5);
    ctx.fillRect(s * 0.15, s * 0.8, s * 0.8, s * 1.5);

    ctx.fillStyle = shoesColor;
    ctx.fillRect(-s * 1.05, s * 2.15, s * 0.95, s * 0.42);
    ctx.fillRect(s * 0.1, s * 2.15, s * 0.95, s * 0.42);

    if (p.wardrobe.hat > 0) {
      ctx.fillStyle = "#b78cff";
      ctx.fillRect(-s * 0.9, -s * 2.65, s * 1.8, s * 0.45);
      ctx.fillRect(-s * 0.45, -s * 3.0, s * 0.95, s * 0.55);
    }

    ctx.fillStyle = "#1b2233";
    ctx.fillRect(-s * 0.55, -s * 1.7, 2.5, 2.5);
    ctx.fillRect(s * 0.3, -s * 1.7, 2.5, 2.5);

    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.08;
    ctx.fillRect(-s * 1.3, -s * 2.5, s * 2.6, s * 5.4);

    ctx.restore();
  }

  function drawBill(entity, paid = false) {
    const w = entity.size * 1.5;
    const h = entity.size * 1.9;

    ctx.fillStyle = paid ? "#f3fff3" : "#fff9f2";
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 2;

    roundRect(ctx, -w / 2, -h / 2, w, h, 6);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";

    if (paid) {
      ctx.fillStyle = "#3baa4f";
      ctx.font = `bold ${Math.max(8, entity.size * 0.32)}px Arial`;
      ctx.fillText("PAID", 0, -1);
      ctx.fillText("✓", 0, 12);
    } else {
      ctx.fillStyle = "#e85b5b";
      ctx.font = `bold ${Math.max(8, entity.size * 0.32)}px Arial`;
      ctx.fillText("PAST", 0, -2);
      ctx.fillText("DUE", 0, 11);
    }
  }

  function drawEntity(entity) {
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.rotate(entity.rotation);

    const pulseScale = 1 + Math.sin(entity.pulse) * 0.03;
    ctx.scale(pulseScale, pulseScale);

    const ringRadius = entity.size * 1.02;

    ctx.fillStyle = "rgba(8, 12, 22, 0.55)";
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = entity.glow;
    ctx.lineWidth = state.width <= 720 ? 2 : 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius + 2, 0, Math.PI * 2);
    ctx.stroke();

    // optional awareness ring for bad items
    if (state.player.awareness && entity.kind.startsWith("bad")) {
      ctx.strokeStyle = "rgba(255, 90, 100, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius + 7, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (entity.isDecoy) {
      ctx.globalAlpha = 0.45;
    }

    if (entity.data.drawMode === "bill") {
      drawBill(entity, false);
    } else if (entity.data.drawMode === "paidBill") {
      drawBill(entity, true);
    } else {
      ctx.font = `${entity.size * 1.42}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(entity.data.emoji, 0, 0);
    }

    ctx.restore();
  }

  function drawParticles() {
    for (const p of state.particles) {
      const alpha = Math.max(0, p.life / p.ttl);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawToasts() {
    for (const t of state.toasts) {
      const alpha = Math.max(0, t.life / t.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.font = isMobileWidth() ? "bold 13px Arial" : "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawStatusStrip() {
    const effects = [];
    const p = state.player;

    if (p.shields > 0)
      effects.push({ text: `🛡 ${p.shields}`, color: "#ffd36a" });
    if (p.effects.regenMs > 0)
      effects.push({ text: "💧 REGEN", color: "#7ee081" });
    if (p.effects.calmMs > 0)
      effects.push({ text: "📚 CALM", color: "#8bc1ff" });
    if (p.effects.slowMs > 0)
      effects.push({ text: "🐢 SLOW", color: "#a9b8ff" });
    if (p.effects.invertMs > 0)
      effects.push({ text: "😵 CONFUSED", color: "#d09cff" });
    if (p.effects.drainMs > 0)
      effects.push({ text: "💸 DRAIN", color: "#ff9b80" });
    if (p.damageResist > 0)
      effects.push({ text: "✨ RESIST", color: "#ffe08a" });
    if (p.awareness) effects.push({ text: "🧢 AWARE", color: "#c8b2ff" });

    if (!effects.length && !state.statusBanner) return;

    const y = isMobileWidth() ? 96 : 78;
    const chipHeight = isMobileWidth() ? 24 : 28;
    let x = state.width * 0.5;

    const texts = [];
    if (state.statusBanner)
      texts.push({ text: state.statusBanner, color: "#ffffff" });
    for (const item of effects) texts.push(item);

    const widths = texts.map((item) => {
      ctx.font = isMobileWidth() ? "bold 11px Arial" : "bold 12px Arial";
      return Math.ceil(ctx.measureText(item.text).width) + 18;
    });

    const totalWidth =
      widths.reduce((a, b) => a + b, 0) + (widths.length - 1) * 8;
    x -= totalWidth / 2;

    texts.forEach((item, index) => {
      const w = widths[index];
      ctx.save();
      ctx.fillStyle = "rgba(8, 12, 22, 0.85)";
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, w, chipHeight, 999);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = item.color;
      ctx.font = isMobileWidth() ? "bold 11px Arial" : "bold 12px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.text, x + w / 2, y + chipHeight / 2 + 0.5);
      ctx.restore();

      x += w + 8;
    });
  }

  function draw() {
    drawBackground();
    for (const entity of state.entities) drawEntity(entity);
    drawParticles();
    drawPlayer();
    drawToasts();
    drawStatusStrip();
  }

  function frame(ts) {
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min(0.032, (ts - state.lastTs) / 1000);
    state.lastTs = ts;

    update(dt);
    draw();
    requestAnimationFrame(frame);
  }

  function getPointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function bindInput() {
    canvas.addEventListener("pointerdown", (event) => {
      const pos = getPointerPos(event);
      state.pointer.x = pos.x;
      state.pointer.y = pos.y;
      state.pointer.active = true;
    });

    canvas.addEventListener("pointermove", (event) => {
      const pos = getPointerPos(event);
      state.pointer.x = pos.x;
      state.pointer.y = pos.y;
    });

    canvas.addEventListener("pointerup", () => {
      state.pointer.active = false;
    });

    canvas.addEventListener("pointercancel", () => {
      state.pointer.active = false;
    });

    canvas.addEventListener("pointerleave", () => {
      state.pointer.active = false;
    });
  }

  function roundRect(ctxRef, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctxRef.beginPath();
    ctxRef.moveTo(x + r, y);
    ctxRef.lineTo(x + width - r, y);
    ctxRef.quadraticCurveTo(x + width, y, x + width, y + r);
    ctxRef.lineTo(x + width, y + height - r);
    ctxRef.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctxRef.lineTo(x + r, y + height);
    ctxRef.quadraticCurveTo(x, y + height, x, y + height - r);
    ctxRef.lineTo(x, y + r);
    ctxRef.quadraticCurveTo(x, y, x + r, y);
    ctxRef.closePath();
  }

  function startFromButton(event) {
    if (event) event.preventDefault();
    startGame();
  }

  function init() {
    resize();
    resetGame();
    bindInput();

    ui.helpBtn.addEventListener("click", openHelp);
    ui.openHelpBtn.addEventListener("click", openHelp);
    ui.closeHelpBtn.addEventListener("click", closeHelp);
    ui.gameOverHelpBtn.addEventListener("click", openHelp);
    ui.startBtn.addEventListener("click", startFromButton);
    ui.startBtn.addEventListener("pointerup", startFromButton);
    ui.startBtn.addEventListener("touchend", startFromButton, {
      passive: false,
    });

    ui.restartBtn.addEventListener("click", startFromButton);
    ui.restartBtn.addEventListener("pointerup", startFromButton);
    ui.restartBtn.addEventListener("touchend", startFromButton, {
      passive: false,
    });

    window.addEventListener("resize", resize);

    requestAnimationFrame(frame);
  }

  init();
})();
