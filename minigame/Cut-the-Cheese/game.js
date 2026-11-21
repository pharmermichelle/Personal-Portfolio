(() => {
  "use strict";

  /*
    CUT THE CHEESE — image-ready cheese shooter

    Drop final art into:
      assets/cheese/mozzarella.png
      assets/cheese/cheddar.png
      assets/cheese/american.png
      assets/cheese/muenster.png
      assets/cheese/colby.png
      assets/cheese/swiss.png
      assets/cheese/parm-wheel.png
      assets/cheese/knife.png

    The game automatically uses those images if they load.
    Until then it draws stylized placeholder cheese/knife art.
  */

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const levelEl = document.getElementById("levelValue");
  const timeEl = document.getElementById("timeValue");
  const shotsEl = document.getElementById("shotsValue");
  const parmProgressEl = document.getElementById("parmProgressValue");
  const parmEl = document.getElementById("parmValue");
  const parmBtn = document.getElementById("parmBtn");
  const nextQueueEl = document.getElementById("nextQueue");
  const startOverlay = document.getElementById("startOverlay");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const gameOverStats = document.getElementById("gameOverStats");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const soundBtn = document.getElementById("soundBtn");
  const fireBtn = document.getElementById("fireBtn");
  const knifePowerBtn = document.getElementById("knifePowerBtn");
  const boardPowerBtn = document.getElementById("boardPowerBtn");
  const knifeCountEl = document.getElementById("knifeCount");
  const boardCountEl = document.getElementById("boardCount");
  const cheeseRoster = document.getElementById("cheeseRoster");
  const toolStatus = document.getElementById("toolStatus");
  const prepTitle = document.getElementById("prepTitle");
  const prepInfo = document.getElementById("prepInfo");
  const prepTime = document.getElementById("prepTime");
  const prepKnifeCount = document.getElementById("prepKnifeCount");
  const prepBoardCount = document.getElementById("prepBoardCount");
  const prepParmCount = document.getElementById("prepParmCount");
  const bonusKnifeBtn = document.getElementById("bonusKnifeBtn");
  const bonusBoardBtn = document.getElementById("bonusBoardBtn");
  const bonusTimeBtn = document.getElementById("bonusTimeBtn");
  const bonusStatus = document.getElementById("bonusStatus");
  const extendTimeBtn = document.getElementById("extendTimeBtn");
  const endBonusStatus = document.getElementById("endBonusStatus");
  const gameOverTitle = document.getElementById("gameOverTitle");

  const W = canvas.width;
  const H = canvas.height;

  const COLS = 10;
  const RADIUS = 38;
  const DIAM = RADIUS * 2;
  // Every cheese uses the same centered, staggered hexagonal lattice.
  const GRID_STEP = 80;
  const ROW_H = Math.sqrt(3) * GRID_STEP / 2;
  const BOARD_TOP = 36;
  const KNIFE_Y = H - 108;
  const DANGER_Y = KNIFE_Y - ROW_H * 4;
  const SHOT_SPEED = 13.5;

  const CHEESES = [
    { id: "mozzarella", label: "Mozzarella", color: "#f7f2df" },
    { id: "cheddar",    label: "Cheddar",    color: "#ee8b22" },
    { id: "american",   label: "American",   color: "#fff0b9" },
    { id: "muenster",   label: "Muenster",   color: "#f2e5c7" },
    { id: "colby",      label: "Colby",      color: "#efad35" },
    { id: "swiss",      label: "Swiss",      color: "#f4d65f" },
  ];

  const IMAGE_PATHS = {
    mozzarella: "assets/cheese/mozzarella.png",
    cheddar: "assets/cheese/cheddar.png",
    american: "assets/cheese/american.png",
    muenster: "assets/cheese/muenster.png",
    colby: "assets/cheese/colby.png",
    swiss: "assets/cheese/swiss.png",
    parm: "assets/cheese/parm-wheel.png",
    knife: "assets/cheese/knife.png",
  };

  const images = {};
  Object.entries(IMAGE_PATHS).forEach(([key, src]) => {
    const img = new Image();
    img.src = src;
    images[key] = img;
  });

  let grid, projectile, queue, level, shots, seconds, clearEvents, parms;
  let running = false;
  let aimAngle = -Math.PI / 2;
  let lastTime = 0;
  let elapsedAccum = 0;
  let soundOn = true;
  let usingParm = false;
  let addRowEvery = 14;
  let nextRowShot = addRowEvery;
  // Separate the next-level countdown from the elapsed run time.
  let remainingSeconds = 240;
  let timedOut = false, gameBusy = false, extraTimeUsed = false, activeTool = null;
  let levelBonusClaimed = false, previewBusy = false;
  const SAVE_KEY = "retro-cut-cheese-inventory-v1";
  const POWER_LIMIT = 25;
  const allowedTools = ["knife", "board", "parm"];
  const safeNumber = value => Number.isInteger(value) && value >= 0 ? Math.min(POWER_LIMIT,value) : 0;
  function loadInventory(){
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY)||"{}");
      return {knife:safeNumber(saved.knife),board:safeNumber(saved.board),parm:safeNumber(saved.parm)};
    }catch(_){return {knife:0,board:0,parm:0};}
  }
  const inventory = loadInventory();
  function saveInventory(){
    try {localStorage.setItem(SAVE_KEY,JSON.stringify(inventory));}catch(_){}
  }
  function grantTool(type,count=1){
    if(!allowedTools.includes(type))return false;
    const initial=inventory[type];
    inventory[type]=Math.min(POWER_LIMIT,inventory[type]+count);
    saveInventory();
    return inventory[type]>initial;
  }
  // Three opening varieties, then introduce one at levels 2, 3 and 4.
  // The later levels get denser boards and shorter refill intervals.
  const cheeseCountForLevel = n => Math.min(6,3+Math.max(0,n-1));
  const activeCheeses = () => CHEESES.slice(0,cheeseCountForLevel(level));
  const startingRows = n => n<=2?3:n<=4?4:n<=7?5:Math.min(7,5+Math.floor((n-7)/3));
  const shotsPerDrop = n => Math.max(7,15-Math.floor((n-1)*.85));
  const levelSeconds = n => Math.max(145,240-Math.max(0,n-1)*12);
  function randCheese() {
    const options=activeCheeses();
    return options[(Math.random()*options.length)|0].id;
  }
  function makeQueue() {
    return Array.from({ length: 5 }, randCheese);
  }
  function displayTimer(){
    const t=Math.max(0,Math.ceil(remainingSeconds));
    timeEl.textContent=String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");
    timeEl.closest(".hud-card")?.classList.toggle("warning",running&&t<=30);
  }
  function updateInventoryUI(message){
    knifeCountEl.textContent=level<2?"LV 2":String(inventory.knife);
    boardCountEl.textContent=level<3?"LV 3":String(inventory.board);
    prepKnifeCount.textContent=inventory.knife;
    prepBoardCount.textContent=inventory.board;
    prepParmCount.textContent=inventory.parm;
    knifePowerBtn.disabled=!running||!!projectile||level<2||inventory.knife<=0;
    boardPowerBtn.disabled=!running||!!projectile||level<3||inventory.board<=0;
    knifePowerBtn.setAttribute("aria-pressed",String(activeTool==="knife"));
    boardPowerBtn.setAttribute("aria-pressed",String(activeTool==="board"));
    cheeseRoster.textContent="Level "+level+" • "+cheeseCountForLevel(level)+" cheese varieties";
    if(message)toolStatus.textContent=message;
  }
  function prepareLevel(message=""){
    running=false;
    activeTool=null;usingParm=false;previewBusy=false;
    fireBtn.disabled=true;
    prepTitle.textContent="Level "+level+" • "+(level===1?"The Cheese Course":level<=3?"The Sharper Course":"The Cheese Challenge");
    prepInfo.textContent=(message?message+" ":"")+"Match 4+ cheeses to clear the board. This level has "+cheeseCountForLevel(level)+" varieties and "+startingRows(level)+" starting rows.";
    prepTime.textContent="⏱ "+formatTime(remainingSeconds)+" to finish this level";
    startBtn.textContent="▶ START LEVEL "+level;
    startOverlay.classList.add("visible");
    gameOverOverlay.classList.remove("visible");
    renderBonusUI();
    updateInventoryUI();
    displayTimer();
  }
  function resetLevelBoard(){
    grid=[];projectile=null;
    for(let row=0;row<startingRows(level);row++)createRow(row);
    queue=makeQueue();
    shots=0;clearEvents=0;
    addRowEvery=shotsPerDrop(level);
    nextRowShot=addRowEvery;
    remainingSeconds=levelSeconds(level);
    extraTimeUsed=false;levelBonusClaimed=false;
    activeTool=null;usingParm=false;aimAngle=-Math.PI/2;elapsedAccum=0;timedOut=false;
    updateHud();
    prepareLevel();
  }

  function columnsInRow(row) {
    // Ten centered cheeses, then nine centered cheeses, repeating.
    return row % 2 ? COLS - 1 : COLS;
  }

  function createRow(row) {
    for (let col = 0; col < columnsInRow(row); col++) {
      grid.push({
        row,
        col,
        type: randCheese(),
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
      });
    }
  }

  function initGrid() {
    grid = [];
    // Every position is snapped to the grid; only the cheese varieties are random.
    for (let row = 0; row < 4; row++) createRow(row);
  }

  function resetGame() {
    level=1;seconds=0;parms=inventory.parm;
    resetLevelBoard();
  }

  function cellCenter(row, col) {
    const rowWidth = (columnsInRow(row) - 1) * GRID_STEP;
    return {
      x: (W - rowWidth) / 2 + col * GRID_STEP,
      y: BOARD_TOP + RADIUS + row * ROW_H
    };
  }

  function closestCell(x, y) {
    let row = Math.max(0, Math.round((y - BOARD_TOP - RADIUS) / ROW_H));
    let best = null;
    for (let rr = Math.max(0, row - 1); rr <= row + 1; rr++) {
      for (let c = 0; c < columnsInRow(rr); c++) {
        const p = cellCenter(rr, c);
        const d = Math.hypot(x - p.x, y - p.y);
        if (!best || d < best.d) best = { row: rr, col: c, d };
      }
    }
    return best;
  }

  function getAt(row, col) {
    return grid.find(c => c.row === row && c.col === col);
  }

  function neighbors(cell) {
    const parity = cell.row % 2;
    const offsets = parity
      ? [[-1,0],[-1,1],[0,-1],[0,1],[1,0],[1,1]]
      : [[-1,-1],[-1,0],[0,-1],[0,1],[1,-1],[1,0]];
    return offsets
      .map(([dr, dc]) => getAt(cell.row + dr, cell.col + dc))
      .filter(Boolean);
  }

  function clusterFrom(start) {
    const type = start.type;
    const out = [];
    const stack = [start];
    const seen = new Set([start.id]);
    while (stack.length) {
      const cur = stack.pop();
      out.push(cur);
      neighbors(cur).forEach(n => {
        if (n.type === type && !seen.has(n.id)) {
          seen.add(n.id);
          stack.push(n);
        }
      });
    }
    return out;
  }

  function removeCells(cells) {
    const ids = new Set(cells.map(c => c.id));
    grid = grid.filter(c => !ids.has(c.id));
  }

  function removeFloating() {
    const topCells = grid.filter(c => c.row === 0);
    const connected = new Set(topCells.map(c => c.id));
    const stack = [...topCells];
    while (stack.length) {
      const cur = stack.pop();
      neighbors(cur).forEach(n => {
        if (!connected.has(n.id)) {
          connected.add(n.id);
          stack.push(n);
        }
      });
    }
    grid = grid.filter(c => connected.has(c.id));
  }

  function registerClearEvent() {
    clearEvents++;
    if (clearEvents % 5 === 0) {
      if(grantTool("parm"))parms=inventory.parm;
      chirp(520, .07);
      setTimeout(() => chirp(760, .08), 80);
    } else {
      chirp(650, .05);
    }
  }

  function addRows(count) {
    // Push existing cheese downward.
    grid.forEach(c => c.row += count);

    for (let row = 0; row < count; row++) createRow(row);
  }

  function advanceLevelIfNeeded() {
    if(grid.length)return;
    const finished=level;
    level++;
    const earned=[];
    if(level===2 && grantTool("knife"))earned.push("🔪 Row Knife +1");
    if(level===3 && grantTool("board"))earned.push("🪵 Spin Board +1");
    if(level>3 && level%3===0 && grantTool("knife"))earned.push("🔪 Row Knife +1");
    if(level>3 && level%4===0 && grantTool("board"))earned.push("🪵 Spin Board +1");
    resetLevelBoard();
    const unlock = cheeseCountForLevel(level)>cheeseCountForLevel(finished)
      ? "New cheese variety unlocked! ":"";
    prepareLevel("Level "+finished+" cleared! "+unlock+(earned.length?"Earned "+earned.join(", ")+".":""));
    chirp(880,.12);
  }

  function dangerReached() {
    return grid.some(c => cellCenter(c.row, c.col).y + RADIUS >= DANGER_Y);
  }

  function shoot() {
    if (!running || projectile) return;
    fireBtn.disabled = true;

    const isParm = usingParm && parms > 0;
    if (isParm) {
      parms--;
      usingParm = false;
    }

    const type = isParm ? "parm" : queue.shift();
    if (!isParm) queue.push(randCheese());

const tipDistance = 142;

const launchX =
  W / 2 + Math.cos(aimAngle) * tipDistance;

const launchY =
  KNIFE_Y + 28 + Math.sin(aimAngle) * tipDistance;

projectile = {
  x: launchX,
  y: launchY,
  vx: Math.cos(aimAngle) * SHOT_SPEED,
  vy: Math.sin(aimAngle) * SHOT_SPEED,
  type,
  parm: isParm
};
    
    shots++;
    if (shots >= nextRowShot) {
      // Always add pairs so the existing staggered rows keep their x positions.
      addRows(2);
      nextRowShot = shots + addRowEvery;
    }

    chirp(isParm ? 180 : 290, .04);
    updateHud();

    if (dangerReached()) endGame();
  }

  function collideProjectile() {
    if (!projectile) return false;

    if (projectile.y - RADIUS <= BOARD_TOP) return true;

    for (const c of grid) {
      const p = cellCenter(c.row, c.col);
      const rr = projectile.parm ? 46 : RADIUS;
      if (Math.hypot(projectile.x - p.x, projectile.y - p.y) <= rr + RADIUS - 4) {
        return true;
      }
    }
    return false;
  }

  function settleProjectile() {
    if (!projectile) return;

    if (projectile.parm) {
      const blastRadius = 155;
      const hit = grid.filter(c => {
        const p = cellCenter(c.row, c.col);
        return Math.hypot(projectile.x - p.x, projectile.y - p.y) <= blastRadius;
      });
      removeCells(hit);
      removeFloating();
      projectile = null;
      fireBtn.disabled = !running;
      updateHud();
      advanceLevelIfNeeded();
      if (dangerReached()) endGame();
      return;
    }

    // Snap each landed cheese to a legal, vacant hex cell connected to the stack.
    // Occupied coordinates must never be re-used, even in a crowded row.
    const occupied = new Set(grid.map(c => c.row + ":" + c.col));
    const maxRow = Math.max(1, ...grid.map(c => c.row + 2));
    const candidates = [];
    for (let row = 0; row <= maxRow; row++) {
      for (let col = 0; col < columnsInRow(row); col++) {
        if (occupied.has(row + ":" + col)) continue;
        const point = cellCenter(row, col);
        if (row !== 0 && neighbors({ row, col }).length === 0) continue;
        candidates.push({ row, col, d: Math.hypot(projectile.x - point.x, projectile.y - point.y) });
      }
    }
    candidates.sort((a,b) => a.d - b.d);
    const target = candidates[0] || closestCell(projectile.x, projectile.y);
    if (occupied.has(target.row + ":" + target.col)) {
      // No vacant slot remains: do not overlap two cheese sprites in one cell.
      projectile = null;
      endGame();
      return;
    }

    const cell = {
      row: target.row,
      col: target.col,
      type: projectile.type,
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    };
    grid.push(cell);
    projectile = null;
    fireBtn.disabled = !running;

    const cluster = clusterFrom(cell);
    if (cluster.length >= 4) {
      removeCells(cluster);
      removeFloating();
      registerClearEvent();
    }

    advanceLevelIfNeeded();
    updateHud();

    if (dangerReached()) endGame();
  }

  function updateProjectile() {
    if (!projectile) return;

    projectile.x += projectile.vx;
    projectile.y += projectile.vy;

    const rr = projectile.parm ? 46 : RADIUS;
    if (projectile.x - rr <= 0 && projectile.vx < 0) {
      projectile.x = rr;
      projectile.vx *= -1;
      chirp(150, .02);
    }
    if (projectile.x + rr >= W && projectile.vx > 0) {
      projectile.x = W - rr;
      projectile.vx *= -1;
      chirp(150, .02);
    }

    if (collideProjectile()) settleProjectile();
  }

  function drawWood() {
    const grad = ctx.createLinearGradient(0,0,W,H);
    grad.addColorStop(0, "#c88a49");
    grad.addColorStop(.5, "#a86d34");
    grad.addColorStop(1, "#8c5729");
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,W,H);

    ctx.save();
    ctx.globalAlpha = .22;
    ctx.strokeStyle = "#5e3517";
    ctx.lineWidth = 5;
    for (let y = 45; y < H; y += 115) {
      ctx.beginPath();
      for (let x = -30; x <= W + 30; x += 35) {
        const yy = y + Math.sin((x + y) * .013) * 7;
        if (x === -30) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = .13;
    for (let i = 0; i < 13; i++) {
      const x = (i * 173) % W;
      const y = 70 + ((i * 277) % (H - 140));
      ctx.beginPath();
      ctx.ellipse(x,y,45,12,.2,0,Math.PI*2);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(92,41,17,.55)";
    ctx.lineWidth = 5;
    ctx.setLineDash([12,12]);
    ctx.beginPath();
    ctx.moveTo(0, DANGER_Y);
    ctx.lineTo(W, DANGER_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(70,30,10,.75)";
    ctx.font = "bold 22px Courier New";
    ctx.textAlign = "right";
    ctx.fillText("CHEESE LIMIT", W - 14, DANGER_Y - 10);
  }

  function drawImageOrFallback(imgKey, x, y, size, fallback) {
    const img = images[imgKey];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x - size/2, y - size/2, size, size);
    } else {
      fallback();
    }
  }
  
  function drawCheese(type, x, y, scale = 1) {
    const s = DIAM * scale;
    drawImageOrFallback(type, x, y, s, () => {
      ctx.save();
      ctx.translate(x,y);
      ctx.scale(scale,scale);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#65401e";

      if (type === "mozzarella") {
        ctx.fillStyle = "#faf6e8";
        ctx.beginPath();
        ctx.moveTo(-31,-7); ctx.quadraticCurveTo(-24,-37,2,-34);
        ctx.quadraticCurveTo(32,-36,34,-4);
        ctx.quadraticCurveTo(31,31,0,35);
        ctx.quadraticCurveTo(-34,30,-31,-7);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#e5dfcc";
        ctx.beginPath(); ctx.arc(-9,4,5,0,Math.PI*2); ctx.fill();
      } else {
        let fill = CHEESES.find(c=>c.id===type)?.color || "#eee";
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.roundRect(-34,-28,68,56,10);
        ctx.fill(); ctx.stroke();

        if (type === "cheddar") {
          ctx.fillStyle = "#da6f15";
          ctx.fillRect(-24,-18,48,6);
          ctx.fillRect(-14,3,40,5);
        } else if (type === "american") {
          ctx.fillStyle = "#fff7d9";
          ctx.beginPath(); ctx.moveTo(-26,-20); ctx.lineTo(28,-20); ctx.lineTo(20,20); ctx.lineTo(-30,22); ctx.closePath(); ctx.fill();
        } else if (type === "muenster") {
          ctx.strokeStyle = "#df7c3b";
          ctx.lineWidth = 7;
          ctx.strokeRect(-29,-23,58,46);
        } else if (type === "colby") {
          ctx.fillStyle = "#f8cf71";
          for (let i=0;i<4;i++) {
            ctx.beginPath(); ctx.ellipse(-20+i*13,-10+(i%2)*20,8,3,.5,0,Math.PI*2); ctx.fill();
          }
        } else if (type === "swiss") {
          ctx.fillStyle = "#c6aa39";
          [[-15,-9,7],[13,-12,5],[7,12,8],[-22,15,4]].forEach(([hx,hy,r])=>{
            ctx.beginPath(); ctx.arc(hx,hy,r,0,Math.PI*2); ctx.fill();
          });
        }
      }
      ctx.restore();
    });
  }

  function drawParm(x,y,scale=1) {
    const size = 92*scale;
    drawImageOrFallback("parm", x,y,size, () => {
      ctx.save();
      ctx.translate(x,y);
      ctx.scale(scale,scale);
      ctx.fillStyle = "#e1bc55";
      ctx.strokeStyle = "#7e5523";
      ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(0,0,44,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#bd9134";
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle = "#79511f";
      ctx.font = "bold 18px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("PARM",0,6);
      ctx.restore();
    });
  }

  function drawAimGuide() {
  if (!running || projectile) return;

  const startX = W / 2;
  const startY = KNIFE_Y - 45;

  let x = startX;
  let y = startY;

  let dx = Math.cos(aimAngle);
  let dy = Math.sin(aimAngle);

  const step = 18;
  const maxDots = 32;

  ctx.save();

  ctx.fillStyle = "rgba(255, 248, 215, 0.8)";
  ctx.strokeStyle = "rgba(74, 39, 15, 0.35)";

  for (let i = 0; i < maxDots; i++) {
    x += dx * step;
    y += dy * step;

    // Predict side-wall bounce
    if (x <= RADIUS) {
      x = RADIUS;
      dx *= -1;
    }

    if (x >= W - RADIUS) {
      x = W - RADIUS;
      dx *= -1;
    }

    // Stop guide if it reaches the top
    if (y <= BOARD_TOP + RADIUS) break;

    // Stop guide when it would hit existing cheese
    let collision = false;

    for (const c of grid) {
      const p = cellCenter(c.row, c.col);

      if (
        Math.hypot(x - p.x, y - p.y) <
        RADIUS * 1.75
      ) {
        collision = true;
        break;
      }
    }

    if (collision) {
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    // Alternate dots for that retro shooter look
    if (i % 2 === 0) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  }

  
function drawKnife() {
  const pivotX = W / 2;
  const pivotY = KNIFE_Y + 28;

  // This controls how far the knife extends from the handle pivot.
  const knifeLength = 210;
  const knifeHeight = 104;

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(aimAngle);

  if (images.knife.complete && images.knife.naturalWidth > 0) {
    /*
      Draw the knife so the HANDLE is close to the rotation point.
      If your knife faces the wrong direction, change:
          -170
      to:
          -40
      and/or rotate by Math.PI below.
    */
    ctx.drawImage(
      images.knife,
      -170,
      -knifeHeight / 2,
      knifeLength,
      knifeHeight
    );
  } else {
    // Fallback knife
    ctx.fillStyle = "#d9d5c9";
    ctx.strokeStyle = "#47382d";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(-170, -18);
    ctx.lineTo(-35, -18);
    ctx.lineTo(-8, 0);
    ctx.lineTo(-35, 18);
    ctx.lineTo(-170, 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#533018";
    ctx.beginPath();
    ctx.roundRect(-25, -26, 65, 52, 15);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
  
  function drawBoard() {
    drawWood();

    for (const c of grid) {
      const p = cellCenter(c.row, c.col);
      drawCheese(c.type, p.x, p.y);
    }

    if (projectile) {
      projectile.parm
        ? drawParm(projectile.x, projectile.y, 1)
        : drawCheese(projectile.type, projectile.x, projectile.y);
    }

    drawAimGuide();
    drawKnife();

    // Current loaded cheese preview
    if (!projectile) {
      const tipDistance = 142;

      const cheeseX =
        W / 2 + Math.cos(aimAngle) * tipDistance;

      const cheeseY =
        KNIFE_Y + 28 + Math.sin(aimAngle) * tipDistance;

      if (usingParm && parms > 0) {
        drawParm(cheeseX, cheeseY, 0.42);
      } else {
        drawCheese(
          queue[0],
          cheeseX,
          cheeseY,
          0.54
        );
      }
    }
  } // <-- THIS was missing

  function updateHud() {
  levelEl.textContent = level;
  shotsEl.textContent = shots;
  parmEl.textContent = parms;
  parmProgressEl.textContent = 5 - (clearEvents % 5);

  parmBtn.disabled = parms <= 0 || !!projectile;
  parmBtn.textContent = usingParm ? "ARMED" : "USE";

  nextQueueEl.innerHTML = "";

  queue.slice(0, 5).forEach(type => {
    const d = document.createElement("div");
    const ch = CHEESES.find(c => c.id === type);

    d.className = "next-dot";
    d.title = ch.label;
    d.style.background = ch.color;

    if (type === "swiss") {
      d.style.borderRadius = "50% 12% 50% 18%";
    } else if (type === "mozzarella") {
      d.style.borderRadius = "48% 52% 43% 55%";
    } else {
      d.style.borderRadius = "6px";
    }

    nextQueueEl.appendChild(d);
  });
}

function formatTime(s) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0");

  const sec = Math.floor(s % 60)
    .toString()
    .padStart(2, "0");

  return `${m}:${sec}`;
}

function loop(ts) {
  const dt = Math.min(50, ts - lastTime || 16);
  lastTime = ts;

  if (running) {
    elapsedAccum += dt;

    if (elapsedAccum >= 1000) {
      const whole = Math.floor(elapsedAccum / 1000);

      seconds += whole;
      elapsedAccum -= whole * 1000;

      timeEl.textContent = formatTime(seconds);
    }

    updateProjectile();
  }

  drawBoard();
  requestAnimationFrame(loop);
}

function startGame() {
  resetGame();

  running = true;

  startOverlay.classList.remove("visible");
  gameOverOverlay.classList.remove("visible");
  fireBtn.disabled = false;

  timeEl.textContent = "00:00";
}

function endGame() {
  running = false;
  projectile = null;
  fireBtn.disabled = true;

  gameOverStats.textContent =
    `Level ${level} • ${formatTime(seconds)} • ${shots} cheese shots • ${clearEvents} cluster clears`;

  gameOverOverlay.classList.add("visible");

  chirp(110, 0.18);
}

function setAimFromPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();

  const x =
    (clientX - rect.left) *
    W /
    rect.width;

  const y =
    (clientY - rect.top) *
    H /
    rect.height;

  const dx = x - W / 2;
  const dy = y - KNIFE_Y;

  let a = Math.atan2(dy, dx);

  const min = -Math.PI + 0.23;
  const max = -0.23;

  a = Math.max(min, Math.min(max, a));

  aimAngle = a;
}

// Aim without shooting. On phones, a touch chooses the direction and
// dragging adjusts it, even when the starting point is away from the knife.
// Mouse hover also adjusts the preview; only FIRE or Space launches cheese.
let aimingPointerId = null;
canvas.addEventListener("pointerdown", e => {
  if (!running || projectile) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;
  aimingPointerId = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (_error) {}
  setAimFromPoint(e.clientX, e.clientY);
  e.preventDefault();
});
canvas.addEventListener("pointermove", e => {
  if (!running || projectile) return;
  if (e.pointerType === "mouse" || e.pointerId === aimingPointerId) {
    setAimFromPoint(e.clientX, e.clientY);
  }
});
function finishAim(e) {
  if (aimingPointerId !== e.pointerId) return;
  if (running && !projectile) setAimFromPoint(e.clientX, e.clientY);
  aimingPointerId = null;
}
canvas.addEventListener("pointerup", finishAim);
canvas.addEventListener("pointercancel", e => {
  if (aimingPointerId === e.pointerId) aimingPointerId = null;
});
fireBtn.addEventListener("click", shoot);

document.addEventListener("keydown", e => {
  if (!running) return;

  if (e.key === "ArrowLeft") {
    aimAngle = Math.max(
      -Math.PI + 0.23,
      aimAngle - 0.09
    );

    e.preventDefault();

  } else if (e.key === "ArrowRight") {

    aimAngle = Math.min(
      -0.23,
      aimAngle + 0.09
    );

    e.preventDefault();

  } else if (e.code === "Space") {

    shoot();
    e.preventDefault();

  } else if (
    e.key.toLowerCase() === "p" &&
    parms > 0 &&
    !projectile
  ) {

    usingParm = !usingParm;
    updateHud();
  }
});

parmBtn.addEventListener("click", () => {
  if (
    !running ||
    parms <= 0 ||
    projectile
  ) return;

  usingParm = !usingParm;
  updateHud();
});

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", startGame);

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;

  soundBtn.textContent =
    soundOn ? "🔊" : "🔇";
});

function chirp(freq = 300, duration = 0.04) {
  if (!soundOn) return;

  try {
    const AudioCtx =
      window.AudioContext ||
      window.webkitAudioContext;

    const ac =
      chirp.ac ||
      (chirp.ac = new AudioCtx());

    const o = ac.createOscillator();
    const g = ac.createGain();

    o.type = "square";
    o.frequency.value = freq;

    g.gain.value = 0.028;

    o.connect(g);
    g.connect(ac.destination);

    const now = ac.currentTime;

    g.gain.setValueAtTime(
      0.028,
      now
    );

    g.gain.exponentialRampToValueAtTime(
      0.001,
      now + duration
    );

    o.start(now);
    o.stop(now + duration);

  } catch (_) {
    // Ignore browsers that block audio.
  }
}

resetGame();

timeEl.textContent = "00:00";

requestAnimationFrame(loop);

})();