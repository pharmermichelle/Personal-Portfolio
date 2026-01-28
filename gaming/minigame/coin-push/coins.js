(function () {
  const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

  // ---------- Persistent Save ----------
  const SAVE_KEY = "catCoinPusherSave_v1";
  function loadSave() {
    try {
      return (
        JSON.parse(localStorage.getItem(SAVE_KEY)) || {
          bankCents: 0,
          ownedSkins: ["Classic Cats"],
          equippedSkin: "Classic Cats",
          lastHourly: 0,
        }
      );
    } catch {
      return {
        bankCents: 0,
        ownedSkins: ["Classic Cats"],
        equippedSkin: "Classic Cats",
        lastHourly: 0,
      };
    }
  }
  function save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  }
  let saveData = loadSave();

  function dailyLoginBonus() {
    const today = new Date().toDateString();
    const last = saveData.lastLogin || null;
    if (last !== today) {
      const yesterday = new Date(Date.now() - 36 * 3600 * 1000).toDateString(); // generous window
      const streak = last === yesterday ? (saveData.streak || 0) + 1 : 1;
      saveData.streak = Math.min(streak, 7); // cap at 7 for UI clarity
      const reward = 50 * saveData.streak; // 50¢ -> $3.50 at max
      saveData.bankCents = (saveData.bankCents || 0) + reward;
      saveData.lastLogin = today;
      save();
      updateBank();
      console.log(
        `Daily bonus: +${(reward / 100).toFixed(2)} (streak x${
          saveData.streak
        })`
      );
      // (Optional) show a modal or confetti here
    }
  }

  // ---------- UI Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const bankEl = $("#bank");
  const stackLabelEl = $("#stackLabel");
  const coinsLeftEl = $("#coinsLeft");
  const winsRoundEl = $("#winsRound");
  const spentRoundEl = $("#spentRound");
  const netRoundEl = $("#netRound");
  const getCSS = (v) =>
    getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const now = () => Math.floor(Date.now() / 1000);
  function fmtCents(c) {
    return (c < 0 ? "-" : "") + "$" + (Math.abs(c) / 100).toFixed(2);
  }
  function updateBank() {
    bankEl.textContent = fmtCents(saveData.bankCents);
    save();
  }

  // ---------- Skins ----------
  const SKINS = {
    "Classic Cats": {
      price: 0,
      vars: {
        "--bg1": "#1b1b2f",
        "--bg2": "#162447",
        "--accent": "#ff9fd6",
        "--pusher": "#ff80c8",
        "--upper-shelf": "#2d2d40",
        "--lower-shelf": "#2a2a38",
        "--wall": "#2f3357",
        "--paw-overlay":
          "repeating-radial-gradient( circle at 20px 20px, rgba(255,255,255,.03) 0 6px, transparent 6px 40px ), repeating-linear-gradient(45deg, rgba(255,255,255,.02) 0 10px, transparent 10px 40px )",
      },
    },
    "Space Paws": {
      price: 1500,
      vars: {
        "--bg1": "#050816",
        "--bg2": "#0b1235",
        "--accent": "#6bdcff",
        "--pusher": "#7ae2ff",
        "--upper-shelf": "#0f1b33",
        "--lower-shelf": "#0a1427",
        "--wall": "#1b2a4a",
        "--paw-overlay":
          "radial-gradient(circle at 70% 20%, rgba(255,255,255,.06), transparent 40%), radial-gradient(circle at 20% 80%, rgba(255,255,255,.05), transparent 40%)",
      },
    },
    "Beach Boardwalk": {
      price: 1200,
      vars: {
        "--bg1": "#0c3054",
        "--bg2": "#2b8cbe",
        "--accent": "#ffd166",
        "--pusher": "#ffe08a",
        "--upper-shelf": "#1f5f86",
        "--lower-shelf": "#1a5272",
        "--wall": "#164a66",
        "--paw-overlay":
          "repeating-linear-gradient( 90deg, rgba(255,255,255,.03) 0 24px, transparent 24px 48px )",
      },
    },
    "Neon Arcade": {
      price: 2000,
      vars: {
        "--bg1": "#14001b",
        "--bg2": "#2b0040",
        "--accent": "#00ffd8",
        "--pusher": "#00f5ff",
        "--upper-shelf": "#2e0d46",
        "--lower-shelf": "#2a0a3f",
        "--wall": "#37115a",
        "--paw-overlay":
          "radial-gradient( 90vmax 60vmax at 10% 120%, rgba(0,255,216,.08), transparent ), radial-gradient( 90vmax 60vmax at 90% -20%, rgba(255,0,200,.08), transparent )",
      },
    },
  };

  function applySkin(name) {
    const skin = SKINS[name] || SKINS["Classic Cats"];
    Object.entries(skin.vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
    saveData.equippedSkin = name;
    save();
  }

  function renderStore() {
    const list = document.getElementById("storeList");
    list.innerHTML = "";
    Object.entries(SKINS).forEach(([name, skin]) => {
      const owned = saveData.ownedSkins.includes(name);
      const row = document.createElement("div");
      row.className = "store-row";
      const info = document.createElement("div");
      info.innerHTML = `<div style="font-weight:800">${name}</div><div class="notice">${
        owned ? "Owned" : "Price: " + fmtCents(skin.price)
      }</div>`;
      const actions = document.createElement("div");
      const btn = document.createElement("button");
      btn.className = "btn";
      if (!owned) {
        btn.textContent = "Buy";
        btn.onclick = () => {
          if (saveData.bankCents >= skin.price) {
            saveData.bankCents -= skin.price;
            updateBank();
            saveData.ownedSkins.push(name);
            save();
            renderStore();
            applySkin(name);
          } else alert("Not enough coins in bank!");
        };
      } else {
        btn.textContent = saveData.equippedSkin === name ? "Equipped" : "Equip";
        btn.disabled = saveData.equippedSkin === name;
        btn.onclick = () => {
          applySkin(name);
          renderStore();
        };
      }
      actions.appendChild(btn);
      row.appendChild(info);
      row.appendChild(actions);
      list.appendChild(row);
    });
  }

  // ---------- Stacks ----------
  const DENOMS = [
    {
      key: "penny",
      value: 1,
      label: "Pennies",
      color: "w-red",
      radius: 10,
    },
    {
      key: "nickel",
      value: 5,
      label: "Nickels",
      color: "w-blue",
      radius: 11,
    },
    {
      key: "dime",
      value: 10,
      label: "Dimes",
      color: "w-green",
      radius: 9,
    },
    {
      key: "quarter",
      value: 25,
      label: "Quarters",
      color: "w-orange",
      radius: 12,
    },
  ];
  const BONUS_DENOM = {
    key: "bonus",
    value: 100,
    label: "Dollars",
    radius: 14,
  };

  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pickDenom = () => DENOMS[randInt(0, DENOMS.length - 1)];

  function makeStacksSized() {
    // small / medium / huge
    const sizes = [
      [12, 18],
      [25, 40],
      [60, 120],
    ];
    return sizes.map(([a, b], i) => {
      const d = pickDenom();
      const count = randInt(a, b);
      return {
        denom: d,
        count,
        color: d.color,
        faceCents: d.value * count,
      };
    });
  }

  // ---------- Matter.js ----------
  const canvas = document.getElementById("game");
  const stage = document.getElementById("stage");
  const W = stage.clientWidth;
  const H = stage.clientHeight;

  const engine = Engine.create();
  engine.world.gravity.y = 1.12;

  const render = Render.create({
    element: stage,
    canvas,
    engine,
    options: {
      width: W,
      height: H,
      wireframes: false,
      background: "transparent",
    },
  });
  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  const world = engine.world;

  // Shelves & walls
  const upperY = H * 0.38,
    upperWidth = W * 0.65,
    upperX = 120 + upperWidth / 2;
  const lowerY = H * 0.78,
    lowerWidth = W * 0.72,
    lowerX = 160 + lowerWidth / 2;

  const upperShelf = Bodies.rectangle(upperX, upperY, upperWidth, 16, {
    isStatic: true,
    render: { fillStyle: getCSS("--upper-shelf") },
  });
  const lowerShelf = Bodies.rectangle(lowerX, lowerY, lowerWidth, 16, {
    isStatic: true,
    render: { fillStyle: getCSS("--lower-shelf") },
  });
  const leftWall = Bodies.rectangle(40, H * 0.5, 40, H, {
    isStatic: true,
    render: { fillStyle: getCSS("--wall") },
  });
  const rightWall = Bodies.rectangle(W - 20, H * 0.5, 40, H, {
    isStatic: true,
    render: { fillStyle: getCSS("--wall") },
  });

  document.getElementById("btnNudge").onclick = nudgeAll;

  // Lips & sensors
  const upperEndLip = Bodies.rectangle(
    upperX + upperWidth / 2 - 8,
    upperY - 10,
    16,
    10,
    { isStatic: true, render: { fillStyle: "#0000" } }
  );
  const trayX = lowerX + lowerWidth / 2 - 6; // front edge
  const winSensor = Bodies.rectangle(trayX + 24, lowerY - 30, 48, 220, {
    isStatic: true,
    isSensor: true,
    label: "winSensor",
    render: { fillStyle: "transparent" },
  });
  const bottomCleaner = Bodies.rectangle(W / 2, H + 60, W, 120, {
    isStatic: true,
    isSensor: true,
    label: "cleaner",
    render: { fillStyle: "transparent" },
  });

  // Lucky hole in the upper shelf (sensor)
  const luckyHole = Bodies.circle(upperX + upperWidth * 0.15, upperY - 8, 14, {
    isStatic: true,
    isSensor: true,
    label: "luckyHole",
    render: { fillStyle: "transparent" },
  });

  // A simple zig-zag chute made of tilted static bars, right side
  const chuteBodies = [
    Bodies.rectangle(trayX - 140, upperY + 10, 120, 8, {
      isStatic: true,
      angle: 0.6,
      render: { fillStyle: getCSS("--upper-shelf") },
    }),
    Bodies.rectangle(trayX - 60, upperY + 70, 120, 8, {
      isStatic: true,
      angle: -0.6,
      render: { fillStyle: getCSS("--upper-shelf") },
    }),
    Bodies.rectangle(trayX - 40, lowerY - 40, 140, 8, {
      isStatic: true,
      angle: 0.5,
      render: { fillStyle: getCSS("--upper-shelf") },
    }),
  ];
  World.add(world, [luckyHole, ...chuteBodies]);

  // Pushers
  const pusherHeight = 80;
  const pusherY = upperY - pusherHeight / 2 - 4;
  const pusherMinX = upperX - upperWidth / 2 + 60;
  const pusherMaxX = upperX + upperWidth / 2 - 90;
  let pusherDir = 1;
  const pusher = Bodies.rectangle(pusherMinX, pusherY, 24, pusherHeight, {
    isStatic: true,
    chamfer: { radius: 6 },
    render: { fillStyle: getCSS("--pusher") },
  });

  // Cosmetic lower pusher bar (static body that just oscillates a bit)
  const lowerPusher = Bodies.rectangle(
    lowerX + lowerWidth / 2 - 60,
    lowerY - 22,
    80,
    10,
    {
      isStatic: true,
      chamfer: { radius: 4 },
      render: { fillStyle: getCSS("--upper-shelf") },
    }
  );

  World.add(world, [
    upperShelf,
    lowerShelf,
    leftWall,
    rightWall,
    upperEndLip,
    winSensor,
    bottomCleaner,
    pusher,
    lowerPusher,
  ]);

  // Coins state
  const coins = new Set();
  let currentStack = null; // {denom, count}
  let spentThisRound = 0,
    wonThisRound = 0,
    netThisRound = 0;
  let autoDropping = false,
    autoTimer = null;

  function updateRoundHUD() {
    winsRoundEl.textContent = fmtCents(wonThisRound);
    spentRoundEl.textContent = fmtCents(spentThisRound);
    netRoundEl.textContent = fmtCents(wonThisRound - spentThisRound);
    coinsLeftEl.textContent = currentStack ? currentStack.count : 0;
  }
  function setStackLabel() {
    if (!currentStack) {
      stackLabelEl.textContent = "—";
      return;
    }
    stackLabelEl.textContent = `${currentStack.count} × ${
      currentStack.denom.label
    } (${fmtCents(currentStack.denom.value * currentStack.count)})`;
  }

  function cssForCoin(key) {
    switch (key) {
      case "penny":
        return "--coin-penny";
      case "nickel":
        return "--coin-nickel";
      case "dime":
        return "--coin-dime";
      case "quarter":
        return "--coin-quarter";
      case "bonus":
        return "--coin-bonus";
      default:
        return "--coin-quarter";
    }
  }

  function spawnCoinBody(denom, x, y) {
    const coin = Bodies.circle(x, y, denom.radius, {
      restitution: 0.12,
      friction: 0.25,
      frictionStatic: 0.35,
      density: 0.0019,
      label: "coin",
      render: {
        fillStyle: getCSS(cssForCoin(denom.key)),
        strokeStyle: "rgba(0,0,0,.35)",
        lineWidth: 1,
      },
    });
    coin._valueCents = denom.value;
    coins.add(coin);
    World.add(world, coin);
    return coin;
  }

  function spawnCoin() {
    if (!currentStack || currentStack.count <= 0) return;
    const d = currentStack.denom;
    const x = dropX + (Math.random() * 10 - 5);
    const y = plinkoTopY - 40;
    spawnCoinBody(d, x, y); // <— now spawns above pegs
    currentStack.count--;
    spentThisRound += d.value;
    updateRoundHUD();
    setStackLabel();
    if (currentStack.count <= 0) maybeScheduleResults();
  }

  function collect(coin) {
    if (!coins.has(coin) || coin._counted) return;
    coin._counted = true;
    wonThisRound += coin._valueCents;
    saveData.bankCents += coin._valueCents;
    updateBank();
    updateRoundHUD();
    coins.delete(coin);
    World.remove(world, coin);
  }
  function removeCoin(coin) {
    if (coins.has(coin)) {
      coins.delete(coin);
      World.remove(world, coin);
    }
  }

  // Collisions for wins & cleanup (plus bounding check)
  Events.on(engine, "collisionStart", function (e) {
    e.pairs.forEach((p) => {
      const a = p.bodyA,
        b = p.bodyB;
      if (a.label === "winSensor" && b.label === "coin") collect(b);
      else if (b.label === "winSensor" && a.label === "coin") collect(a);
      else if (a.label === "cleaner" && b.label === "coin") removeCoin(b);
      else if (b.label === "cleaner" && a.label === "coin") removeCoin(a);
      if (
        (a.label === "luckyHole" && b.label === "coin") ||
        (b.label === "luckyHole" && a.label === "coin")
      ) {
        const coin = a.label === "coin" ? a : b;
        if (coins.has(coin)) {
          // remove the original coin…
          coins.delete(coin);
          World.remove(world, coin);
          // …and launch a shiny bonus coin onto the chute
          const special = spawnCoinBody(
            { key: "bonus", value: 100, radius: 14 },
            trayX - 180,
            upperY - 30
          );
          Body.setVelocity(special, { x: 2.5, y: 0 }); // drift into the chute
          special._fromChute = true; // (no special handling needed, it will still count at the win line)
        }
      }
    });
  });
  Events.on(engine, "afterUpdate", function () {
    coins.forEach((c) => {
      // Extra safety: if coin crosses tray plane and is near lower deck height, count it
      if (!c._counted && c.position.x > trayX && c.position.y > lowerY - 80)
        collect(c);
      if (
        c.position.y > H + 120 ||
        c.position.x > W + 120 ||
        c.position.x < -120
      )
        removeCoin(c);
    });
    // Cosmetic oscillation for lower pusher
    const t = (performance.now() / 1000) % 2; // 0..2
    const offset = (t < 1 ? t : 2 - t) * 14; // triangle wave 0..14..0
    Body.setPosition(lowerPusher, {
      x: lowerX + lowerWidth / 2 - 60 - offset,
      y: lowerPusher.position.y,
    });
  });

  // Pusher animation (upper)
  function stepPusher() {
    const speed = 1.6;
    let nx = pusher.position.x + speed * pusherDir;
    if (nx >= pusherMaxX) {
      pusherDir = -1;
      nx = pusherMaxX;
    } else if (nx <= pusherMinX) {
      pusherDir = 1;
      nx = pusherMinX;
    }
    Body.setPosition(pusher, { x: nx, y: pusher.position.y });
    requestAnimationFrame(stepPusher);
  }
  stepPusher();

  // --- Plinko board ---
  const plinkoTopY = upperY - 220;
  const pegCols = 11,
    pegRows = 6,
    pegR = 5;
  let plinkoPegs = [];
  function buildPegboard() {
    const spacingX = (pusherMaxX - pusherMinX) / (pegCols - 1);
    for (let r = 0; r < pegRows; r++) {
      const offset = r % 2 === 0 ? 0 : spacingX / 2;
      for (let c = 0; c < pegCols; c++) {
        const x = pusherMinX + c * spacingX + offset;
        const y = plinkoTopY + r * 26;
        const peg = Bodies.circle(x, y, pegR, {
          isStatic: true,
          restitution: 0.5,
          label: "peg",
          render: { fillStyle: "rgba(255,255,255,.25)" },
        });
        plinkoPegs.push(peg);
      }
    }
    World.add(world, plinkoPegs);
  }
  buildPegboard();

  // Optional: aim the drop with the mouse
  let dropX = (pusherMinX + pusherMaxX) / 2;
  stage.addEventListener("mousemove", (e) => {
    const r = stage.getBoundingClientRect();
    dropX = Math.max(
      pusherMinX + 10,
      Math.min(pusherMaxX - 10, e.clientX - r.left)
    );
  });

  // Preload: fill machine with coins (upper & lower), plus a few bonus coins on the upper
  function seedInitialCoins() {
    const upperMin = pusherMinX + 30,
      upperMax = pusherMaxX - 30;
    for (let i = 0; i < 38; i++) {
      const d = DENOMS[randInt(0, DENOMS.length - 1)];
      const x = randInt(upperMin, upperMax);
      const y = upperY - 80 - Math.random() * 40;
      spawnCoinBody(d, x, y);
    }
    // Bonus bait on top shelf
    for (let i = 0; i < 3; i++) {
      const x = randInt(upperMin + 60, upperMax - 20);
      const y = upperY - 90 - Math.random() * 30;
      spawnCoinBody(BONUS_DENOM, x, y);
    }
    // Lower deck scatter
    const lowerMin = lowerX - lowerWidth / 2 + 30,
      lowerMax = lowerX + lowerWidth / 2 - 80;
    for (let i = 0; i < 90; i++) {
      const d = DENOMS[randInt(0, DENOMS.length - 1)];
      const x = randInt(lowerMin, lowerMax);
      const y = lowerY - 60 - Math.random() * 30;
      spawnCoinBody(d, x, y);
    }
  }

  // Round flow
  let resultsTimer = null;
  function startRound(stack) {
    // do not clear machine coins; just start a new drop set
    spentThisRound = 0;
    wonThisRound = 0;
    netThisRound = 0;
    updateRoundHUD();
    currentStack = { denom: stack.denom, count: stack.count };
    setStackLabel();
    coinsLeftEl.textContent = currentStack.count;
  }
  function maybeScheduleResults() {
    if (resultsTimer) clearTimeout(resultsTimer);
    resultsTimer = setTimeout(showResults, 4500);
  }
  function showResults() {
    resultsTimer = null;
    const net = wonThisRound - spentThisRound;
    netThisRound = net;
    updateRoundHUD();
    document.getElementById("resSpent").textContent = fmtCents(spentThisRound);
    document.getElementById("resWon").textContent = fmtCents(wonThisRound);
    document.getElementById("resNet").textContent = fmtCents(net);
    document.getElementById("resultsModal").classList.add("show");
  }
  // Daily nudges
  function resetDailyNudges() {
    const today = new Date().toDateString();
    if (saveData.lastNudgeReset !== today) {
      saveData.lastNudgeReset = today;
      saveData.nudgesLeft = 3;
      save();
    }
  }
  function nudgeAll() {
    if ((saveData.nudgesLeft || 0) <= 0) return alert("No nudges left today!");
    coins.forEach((c) => {
      // gentle forward tap
      Body.applyForce(c, c.position, { x: 0.0025, y: 0 });
    });
    saveData.nudgesLeft--;
    save();
    console.log(`Nudges left: ${saveData.nudgesLeft}`);
  }
  resetDailyNudges();

  // Hourly mega roll helpers
  function hourlyReady() {
    return now() - (saveData.lastHourly || 0) >= 3600;
  }
  function timeUntilHourly() {
    const diff = 3600 - (now() - (saveData.lastHourly || 0));
    if (diff <= 0) return "Ready";
    const m = Math.floor(diff / 60),
      s = diff % 60;
    return `${m}m ${s}s`;
  }

  // Stack picker UI
  let currentChoices = [];
  function openStackPicker() {
    currentChoices = makeStacksSized();
    const grid = document.getElementById("stackGrid");
    grid.innerHTML = "";
    currentChoices.forEach((s) => {
      const card = document.createElement("div");
      card.className = "card";
      const chip = document.createElement("div");
      chip.className = `wrapper-chip ${s.color}`;
      chip.textContent = "WRAPPED";
      const meta = document.createElement("div");
      meta.style.marginTop = "10px";
      meta.innerHTML = `<b>???</b><div class="muted">Random contents</div>`;
      const pick = document.createElement("button");
      pick.textContent = "Pick This";
      pick.className = "btn";
      pick.onclick = () => {
        chip.textContent = s.denom.label.toUpperCase();
        meta.innerHTML = `<b>${s.count} × ${
          s.denom.label
        }</b><div class=\"muted\">Face value ${fmtCents(s.faceCents)}</div>`;
        setTimeout(() => {
          document.getElementById("stackModal").classList.remove("show");
          startRound(s);
        }, 650);
      };
      card.appendChild(chip);
      card.appendChild(meta);
      card.appendChild(document.createElement("br"));
      card.appendChild(pick);
      grid.appendChild(card);
    });
    // Hourly mega roll
    const hourlyCard = document.createElement("div");
    hourlyCard.className = "card";
    const hchip = document.createElement("div");
    hchip.className = "wrapper-chip w-orange";
    hchip.textContent = "HOURLY MEGA";
    const hmeta = document.createElement("div");
    hmeta.style.marginTop = "10px";
    hmeta.innerHTML = `<b>Huge Surprise Roll</b><div class="muted">Available once per hour</div>`;
    const hbtn = document.createElement("button");
    hbtn.className = "btn";
    function refreshHourly() {
      const ready = hourlyReady();
      hbtn.textContent = ready
        ? "Claim & Play"
        : `Ready in ${timeUntilHourly()}`;
      hbtn.disabled = !ready;
    }
    hbtn.onclick = () => {
      const d = pickDenom();
      const count = randInt(150, 220);
      const s = {
        denom: d,
        count,
        color: d.color,
        faceCents: d.value * count,
      };
      saveData.lastHourly = now();
      save();
      document.getElementById("stackModal").classList.remove("show");
      startRound(s);
    };
    hourlyCard.appendChild(hchip);
    hourlyCard.appendChild(hmeta);
    hourlyCard.appendChild(document.createElement("br"));
    hourlyCard.appendChild(hbtn);
    grid.appendChild(hourlyCard);
    refreshHourly();

    document.getElementById("stackModal").classList.add("show");
  }

  // Controls
  document.getElementById("btnDrop").onclick = () => spawnCoin();
  document.getElementById("btnAuto").onclick = () => {
    autoDropping = !autoDropping;
    const btn = document.getElementById("btnAuto");
    btn.textContent = "Auto: " + (autoDropping ? "On" : "Off");
    btn.classList.toggle("secondary", !autoDropping);
    if (autoTimer) clearInterval(autoTimer);
    if (autoDropping) {
      autoTimer = setInterval(() => {
        if (currentStack && currentStack.count > 0) spawnCoin();
        else {
          clearInterval(autoTimer);
          autoDropping = false;
          btn.textContent = "Auto: Off";
          btn.classList.add("secondary");
        }
      }, 380);
    }
  };
  document.getElementById("btnStore").onclick = () => {
    renderStore();
    document.getElementById("storeModal").classList.add("show");
  };
  document.getElementById("btnCloseStore").onclick = () => {
    document.getElementById("storeModal").classList.remove("show");
  };
  document.getElementById("btnAgain").onclick = () => {
    document.getElementById("resultsModal").classList.remove("show");
    openStackPicker();
  };
  document.getElementById("btnStay").onclick = () => {
    document.getElementById("resultsModal").classList.remove("show");
  };
  document.getElementById("btnRandom").onclick = () => {
    const i = randInt(0, 2);
    const s = currentChoices[i];
    document.getElementById("stackModal").classList.remove("show");
    startRound(s);
  };
  document.getElementById("btnLoad").onclick = () => seedInitialCoins();

  // Boot
  applySkin(saveData.equippedSkin || "Classic Cats");
  updateBank();
  dailyLoginBonus();

  seedInitialCoins();
  openStackPicker();
})();
