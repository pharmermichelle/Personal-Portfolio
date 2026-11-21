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
  const $=id=>document.getElementById(id);
  const cheeseWallet=$("cheeseWallet"),powerMenuBtn=$("powerMenuBtn"),powerMenu=$("powerMenu"),
    powerMenuCloseBtn=$("powerMenuCloseBtn"),powerMenuDoneBtn=$("powerMenuDoneBtn"),
    powerWallet=$("powerWallet"),equippedKnifeName=$("equippedKnifeName"),knifeShop=$("knifeShop"),
    knifeSkillStatus=$("knifeSkillStatus"),watchAimBtn=$("watchAimBtn"),aimBoostStatus=$("aimBoostStatus"),
    knifeQuickActions=$("knifeQuickActions"),holdCheeseBtn=$("holdCheeseBtn"),
    discardCheeseBtn=$("discardCheeseBtn");

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
    { id: "swiss",      label: "Swiss",      color: "#f4d65f" },
    { id: "american",   label: "American",   color: "#fff0b9" },
    { id: "muenster",   label: "Muenster",   color: "#f2e5c7" },
    { id: "colby",      label: "Colby",      color: "#efad35" },
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
  let menuOpen=false,aimAdBusy=false,aimBoostSeconds=0,heldCheese=null,discardsUsed=0;
  const KNIFE_KEY="retro-cut-cheese-knives-v1";
  const KNIVES=[
    {name:"Classic Cutter",cost:0,aim:32,desc:"Standard aiming guide."},
    {name:"Precision Blade",cost:60,aim:68,desc:"Longer trajectory and clearer bounce preview."},
    {name:"Double Cheddar",cost:175,aim:77,desc:"Hold one extra cheese and swap it with the loaded cheese."},
    {name:"Cheese Reaper",cost:330,aim:88,desc:"Keep your reserve and discard up to two unwanted cheeses per level."}
  ];
  function loadKnifeData(){
    try{
      const data=JSON.parse(localStorage.getItem(KNIFE_KEY)||"{}");
      const tier=Number.isInteger(data.tier)?Math.max(0,Math.min(3,data.tier)):0;
      return {points:Number.isSafeInteger(data.points)&&data.points>=0?Math.min(9999999,data.points):0,
        tier,equipped:Number.isInteger(data.equipped)?Math.max(0,Math.min(tier,data.equipped)):0};
    }catch(_){return {points:0,tier:0,equipped:0};}
  }
  const knifeData=loadKnifeData();
  const currentKnife=()=>KNIVES[knifeData.equipped];
  function saveKnifeData(){try{localStorage.setItem(KNIFE_KEY,JSON.stringify(knifeData));}catch(_){}}
  function collectCheese(count){
    if(count<=0)return;
    knifeData.points=Math.min(9999999,knifeData.points+5*count);
    saveKnifeData();
    knifeSkillStatus.textContent="+"+(5*count)+" Cheese Points for "+count+" broken cheeses!";
    renderKnifeShop();
  }
  function chooseKnife(tier){
    if(tier<0||tier>=KNIVES.length||tier>knifeData.tier+1)return;
    if(tier>knifeData.tier){
      if(knifeData.points<KNIVES[tier].cost){knifeSkillStatus.textContent="Earn more Cheese Points to unlock this knife.";return;}
      knifeData.points-=KNIVES[tier].cost;
      knifeData.tier=tier;
    }
    knifeData.equipped=tier;
    if(tier<2)heldCheese=null;
    saveKnifeData();
    knifeSkillStatus.textContent=KNIVES[tier].name+" equipped!";
    syncQueueToBoard();
    updateHud();
  }
  function renderKnifeShop(){
    cheeseWallet.textContent="🧀 "+knifeData.points.toLocaleString()+" pts";
    powerWallet.textContent="🧀 "+knifeData.points.toLocaleString()+" Cheese Points";
    equippedKnifeName.textContent=currentKnife().name+" equipped";
    knifeShop.replaceChildren();
    KNIVES.forEach((knife,i)=>{
      const card=document.createElement("div"),title=document.createElement("strong"),
        desc=document.createElement("p"),price=document.createElement("span"),btn=document.createElement("button");
      card.className="knife-card";if(i===knifeData.equipped)card.classList.add("is-equipped");
      title.textContent=["🔪 ","🎯 ","🔁 ","♻️ "][i]+knife.name;desc.textContent=knife.desc;
      price.className="knife-price";price.textContent=i===0?"FREE":knife.cost+" Cheese Points · permanent";
      btn.type="button";
      btn.textContent=i===knifeData.equipped?"EQUIPPED":i<=knifeData.tier?"EQUIP":i===knifeData.tier+1?"BUY "+knife.cost+" 🧀":"LOCKED";
      btn.disabled=i===knifeData.equipped||i>knifeData.tier+1||(i>knifeData.tier&&knifeData.points<knife.cost);
      btn.addEventListener("click",()=>chooseKnife(i));
      card.append(title,desc,price,btn);knifeShop.appendChild(card);
    });
    holdCheeseBtn.hidden=knifeData.equipped<2;
    discardCheeseBtn.hidden=knifeData.equipped<3;
    knifeQuickActions.hidden=knifeData.equipped<2||!running||menuOpen;
    holdCheeseBtn.textContent=heldCheese?"↔ SWAP "+(CHEESES.find(c=>c.id===heldCheese)?.label||"HELD"):"↔ HOLD / SWAP";
    holdCheeseBtn.disabled=!running||!!projectile||menuOpen;
    discardCheeseBtn.textContent="✖ DISCARD "+Math.max(0,2-discardsUsed)+"/2";
    discardCheeseBtn.disabled=!running||!!projectile||menuOpen||discardsUsed>=2;
    powerMenuBtn.disabled=!running;
    const boosted=aimBoostSeconds>0,ad=Boolean(window.RetroRewardedAds?.isConfigured());
    watchAimBtn.disabled=aimAdBusy||boosted||(!ad&&aimFallbackUsed());
    watchAimBtn.textContent=boosted?"🎯 Extended Guide Active ("+Math.ceil(aimBoostSeconds)+"s)":aimAdBusy?"Checking ad…":ad?"▶ Watch Ad for 90s Guide":"🎁 Free 90s Guide (No Ad Available)";
  }
  const SAVE_KEY = "retro-cut-cheese-inventory-v1";
  const PROGRESS_KEY = "retro-cut-cheese-highest-level-v1";
  function loadLevel(){
    try{
      const n=Number(localStorage.getItem(PROGRESS_KEY));
      return Number.isInteger(n)&&n>=1&&n<=200?n:1;
    }catch(_){return 1;}
  }
  function saveLevel(){
    try{localStorage.setItem(PROGRESS_KEY,String(level));}catch(_){}
  }
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
  // Gentle first two levels: 3 cheeses. Introduce a fourth at Level 3,
  // fifth at Level 5, and sixth at Level 7 while boards get denser.
  const cheeseCountForLevel = n => Math.min(6,3+Math.floor((Math.max(1,n)-1)/2));
  const activeCheeses = () => CHEESES.slice(0,cheeseCountForLevel(level));
  // Level 1 is a welcoming, two-row tutorial with easy-to-hit matching groups.
  const startingRows = n => n===1?2:n===2?3:n<=4?4:n<=7?5:Math.min(7,5+Math.floor((n-7)/3));
  const shotsPerDrop = n => n===1?26:n===2?20:Math.max(7,15-Math.floor((n-1)*.85));
  const levelSeconds = n => Math.max(145,240-Math.max(0,n-1)*12);
  // Only the types actually left on the board may appear in the launcher.
  // An eliminated cheese cannot come back in the queue or in future falling rows.
  function boardCheeseTypes() {
    const present=new Set(grid.map(c=>c.type));
    return activeCheeses().map(c=>c.id).filter(id=>present.has(id));
  }
  function randCheese(pool=boardCheeseTypes()) {
    const options=pool.length?pool:activeCheeses().map(c=>c.id);
    return options[Math.floor(Math.random()*options.length)];
  }
  function makeQueue() {
    const pool=boardCheeseTypes();
    return Array.from({ length: 5 },()=>randCheese(pool));
  }
  function syncQueueToBoard(){
    if(!grid.length)return;
    const pool=boardCheeseTypes();
    const allowed=new Set(pool);
    // Keep the same order for still-available cheeses; replace extinct
    // ones immediately, including the loaded shot at the knife tip.
    queue=Array.from({length:5},(_,i)=>{
      const current=queue[i];
      return allowed.has(current)?current:randCheese(pool);
    });
    if(heldCheese&&!allowed.has(heldCheese))heldCheese=null;
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
    prepInfo.textContent=(message?message+" ":"")+"Match 4+ cheeses to clear the board. "+cheeseCountForLevel(level)+" varieties: "+activeCheeses().map(c=>c.label).join(", ")+". "+startingRows(level)+" starting rows.";
    prepTime.textContent="⏱ "+formatTime(remainingSeconds)+" to finish this level";
    startBtn.textContent="▶ START LEVEL "+level;
    startOverlay.classList.add("visible");
    gameOverOverlay.classList.remove("visible");
    bonusStatus.textContent="";
    renderBonusUI();
    updateInventoryUI();
    displayTimer();
  }
  function resetLevelBoard(){
    grid=[];projectile=null;
    if(level===1)createOpeningBoard();
    else{
      const fullPool=activeCheeses().map(c=>c.id);
      for(let row=0;row<startingRows(level);row++)createRow(row,fullPool);
    }
    queue=makeQueue();
    shots=0;clearEvents=0;
    addRowEvery=shotsPerDrop(level);
    nextRowShot=addRowEvery;
    remainingSeconds=levelSeconds(level);
    extraTimeUsed=false;levelBonusClaimed=false;
    activeTool=null;usingParm=false;aimAngle=-Math.PI/2;elapsedAccum=0;timedOut=false;
    heldCheese=null;discardsUsed=0;aimBoostSeconds=0;
    updateHud();
    prepareLevel();
  }

  function columnsInRow(row) {
    // Ten centered cheeses, then nine centered cheeses, repeating.
    return row % 2 ? COLS - 1 : COLS;
  }

  function createRow(row,pool=activeCheeses().map(c=>c.id)){
    for(let col=0;col<columnsInRow(row);col++){
      grid.push({
        row,col,type:randCheese(pool),
        id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`
      });
    }
  }
  function createOpeningBoard(){
    // Deliberate matching regions so the first level can be finished in
    // a few good shots, rather than 29 completely randomized pieces.
    const types=["mozzarella","cheddar","swiss"];
    for(let row=0;row<2;row++){
      for(let col=0;col<columnsInRow(row);col++){
        const type=types[col< (row?3:4)?0:col< (row?6:7)?1:2];
        grid.push({
          row,col,type,
          id:crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`
        });
      }
    }
  }

  function initGrid() {
    grid = [];
    // Every position is snapped to the grid; only the cheese varieties are random.
    for (let row = 0; row < 4; row++) createRow(row);
  }

  function resetGame() {
    level=loadLevel();seconds=0;parms=inventory.parm;
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

  function addRows(count){
    // Sample survivor types BEFORE shifting. Extinct types stay extinct
    // even when the challenge adds new rows.
    const pool=boardCheeseTypes();
    if(!pool.length)return;
    grid.forEach(c=>c.row+=count);
    for(let row=0;row<count;row++)createRow(row,pool);
  }

  function advanceLevelIfNeeded() {
    if(grid.length)return;
    const finished=level;
    level++;
    saveLevel();
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
    if (!running || projectile || menuOpen) return;
    const tool=activeTool && inventory[activeTool]>0 ? activeTool : null;
    const isParm=!tool && usingParm && inventory.parm>0;
    if(tool){
      inventory[tool]--;
      saveInventory();
      activeTool=null;
    }else if(isParm){
      inventory.parm--;
      saveInventory();
      parms=inventory.parm;
      usingParm=false;
    }
    fireBtn.disabled = true;
    // A cheese wiped out by the previous hit can never be fired again.
    syncQueueToBoard();
    const type = tool || (isParm?"parm":queue.shift());
    if (!tool && !isParm)queue.push(randCheese());

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
  parm: isParm,
  tool
};
    
    shots++;
    // Add challenge rows AFTER resolving the hit. This lets the shot
    // eliminate a cheese type before new rows are generated.
    chirp(isParm ? 180 : 290, .04);
    updateHud();

    if (dangerReached()) endGame("limit");
    updateInventoryUI(tool?"Power-up launched!":"");
  }

  function collideProjectile() {
    if (!projectile) return false;

    if (projectile.y - RADIUS <= BOARD_TOP) return true;

    for (const c of grid) {
      const p = cellCenter(c.row, c.col);
      const rr = projectile.parm || projectile.tool ? 46 : RADIUS;
      if (Math.hypot(projectile.x - p.x, projectile.y - p.y) <= rr + RADIUS - 4) {
        return true;
      }
    }
    return false;
  }

  function completeShot(){
    if(grid.length && shots>=nextRowShot){
      // Add pairs so the existing staggered hex rows do not shift sideways.
      addRows(2);
      nextRowShot=shots+addRowEvery;
    }
    syncQueueToBoard();
    advanceLevelIfNeeded();
    updateHud();
    if(running&&dangerReached())endGame("limit");
  }
  function settleProjectile() {
    if (!projectile) return;
    if(projectile.tool){
      const initialCount=grid.length;
      const fired=projectile;
      const nearest=closestCell(fired.x,fired.y);
      let cells=[];
      if(fired.tool==="knife"){
        // Cut a whole horizontal cheese row regardless of cheese type.
        cells=grid.filter(c=>c.row===nearest.row);
      }else if(fired.tool==="board"){
        // Spinning cutting board clears a 4-row × 4-column block.
        const startRow=Math.max(0,nearest.row-1);
        const startCol=Math.max(0,Math.min(COLS-4,nearest.col-1));
        cells=grid.filter(c=>c.row>=startRow&&c.row<startRow+4&&c.col>=startCol&&c.col<startCol+4);
      }
      removeCells(cells);
      removeFloating();
      collectCheese(initialCount-grid.length);
      projectile=null;
      fireBtn.disabled=false;
      updateInventoryUI((fired.tool==="knife"?"Row Knife":"Spin Board")+" cleared "+cells.length+" cheeses!");
      completeShot();
      return;
    }
    if (projectile.parm) {
      const initialCount=grid.length;
      const blastRadius = 155;
      const hit = grid.filter(c => {
        const p = cellCenter(c.row, c.col);
        return Math.hypot(projectile.x - p.x, projectile.y - p.y) <= blastRadius;
      });
      removeCells(hit);
      removeFloating();
      collectCheese(initialCount-grid.length);
      projectile = null;
      fireBtn.disabled = !running;
      completeShot();
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
      const initialCount=grid.length;
      removeCells(cluster);
      removeFloating();
      collectCheese(initialCount-grid.length);
      registerClearEvent();
    }

    completeShot();
  }

  function updateProjectile() {
    if (!projectile) return;

    projectile.x += projectile.vx;
    projectile.y += projectile.vy;

    const rr = projectile.parm || projectile.tool ? 46 : RADIUS;
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
    if(!running||projectile||menuOpen)return;
    // Aim from the true projectile tip; trace wall bounces and exact hit radius.
    const radius=usingParm||activeTool?46:RADIUS;
    const tipDistance=142;
    let x=W/2+Math.cos(aimAngle)*tipDistance;
    let y=KNIFE_Y+28+Math.sin(aimAngle)*tipDistance;
    let dx=Math.cos(aimAngle),dy=Math.sin(aimAngle);
    const extended=aimBoostSeconds>0;
    const steps=extended?165:currentKnife().aim;
    ctx.save();
    ctx.fillStyle=extended?"rgba(124,255,234,.95)":"rgba(255,248,215,.85)";
    ctx.strokeStyle=extended?"rgba(31,255,214,.98)":"rgba(255,240,178,.75)";
    ctx.lineWidth=extended?5:3;
    for(let i=0;i<steps;i++){
      x+=dx*9;y+=dy*9;
      if(x<radius){x=2*radius-x;dx=Math.abs(dx);}
      if(x>W-radius){x=2*(W-radius)-x;dx=-Math.abs(dx);}
      let hit=y-radius<=BOARD_TOP;
      if(!hit)hit=grid.some(c=>{
        const p=cellCenter(c.row,c.col);
        return Math.hypot(x-p.x,y-p.y)<=radius+RADIUS-4;
      });
      if(hit){
        ctx.beginPath();ctx.arc(x,y,extended?17:11,0,Math.PI*2);ctx.stroke();
        if(extended){ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();}
        break;
      }
      if(i%3===0){ctx.beginPath();ctx.arc(x,y,extended?5:4,0,Math.PI*2);ctx.fill();}
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
  
  function drawTool(type,x,y){
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(type==="knife" ? -.4 : (performance.now()/320));
    ctx.fillStyle=type==="knife"?"#d3ecf5":"#f1cf83";
    ctx.strokeStyle="#50301c";
    ctx.lineWidth=5;
    if(type==="knife"){
      ctx.beginPath();ctx.roundRect(-45,-10,90,20,5);ctx.fill();ctx.stroke();
      ctx.fillStyle="#84552b";ctx.fillRect(-49,-11,30,22);
    }else{
      ctx.beginPath();ctx.roundRect(-38,-38,76,76,9);ctx.fill();ctx.stroke();
      ctx.strokeStyle="#9b6c3a";ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(-23,-23);ctx.lineTo(23,23);ctx.moveTo(23,-23);ctx.lineTo(-23,23);ctx.stroke();
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
      projectile.tool
        ? drawTool(projectile.tool,projectile.x,projectile.y)
        : projectile.parm ? drawParm(projectile.x, projectile.y, 1)
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

      if(activeTool)drawTool(activeTool,cheeseX,cheeseY);
      else if (usingParm && inventory.parm > 0) {
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

  parms=inventory.parm;
  parmBtn.disabled = !running || parms <= 0 || !!projectile;
  parmBtn.textContent = usingParm ? "ARMED" : "USE";
  updateInventoryUI();
  renderKnifeShop();

  nextQueueEl.replaceChildren();

  // Use exactly the same PNG assets as the board, not approximate color chips.
  // If artwork cannot load, show the game's cheese name rather than
  // falsely suggesting a different-looking cheese.
  queue.slice(0,5).forEach((type,index)=>{
    const tile=document.createElement("div");
    const art=document.createElement("img");
    const cheese=CHEESES.find(c=>c.id===type);
    tile.className="next-dot";
    if(index===0)tile.classList.add("next-loaded");
    tile.title=(index===0?"Loaded: ":"Next: ")+(cheese?.label||type);
    art.src=IMAGE_PATHS[type];
    art.alt=cheese?.label||type;
    art.loading="eager";
    art.decoding="async";
    art.onerror=()=>{
      tile.replaceChildren();
      tile.textContent=(cheese?.label||type).slice(0,3).toUpperCase();
      tile.classList.add("next-fallback");
    };
    tile.appendChild(art);
    nextQueueEl.appendChild(tile);
  });
}


const FALLBACK_KEY="retro-cheese-daily-bonuses-v1";
const AD_UNAVAILABLE=new Set(["not_configured","no_fill","no_response","unsupported","unavailable","load_failed","error"]);
function bonusStamp(){
  const day=new Date().toLocaleDateString("en-CA");
  return day+":level-"+level;
}
function fallbackAlreadyUsed(){
  try{
    const saved=JSON.parse(localStorage.getItem(FALLBACK_KEY)||"{}");
    return saved[bonusStamp()]===true;
  }catch(_){return levelBonusClaimed;}
}
function rememberFallback(){
  levelBonusClaimed=true;
  try{
    const saved=JSON.parse(localStorage.getItem(FALLBACK_KEY)||"{}");
    const today=new Date().toLocaleDateString("en-CA")+":";
    const trimmed=Object.fromEntries(Object.entries(saved).filter(([key])=>key.startsWith(today)));
    trimmed[bonusStamp()]=true;
    localStorage.setItem(FALLBACK_KEY,JSON.stringify(trimmed));
  }catch(_){}
}
function renderBonusUI(){
  const adReady=Boolean(window.RetroRewardedAds?.isConfigured());
  const noFree=fallbackAlreadyUsed();
  for(const [kind,button,minLevel] of [["knife",bonusKnifeBtn,2],["board",bonusBoardBtn,3],["time",bonusTimeBtn,1]]){
    const locked=level<minLevel;
    const capped=kind!=="time"&&inventory[kind]>=POWER_LIMIT;
    const usedTime=kind==="time"&&extraTimeUsed;
    button.disabled=previewBusy||locked||capped||usedTime||(!adReady&&noFree);
    const noun=kind==="knife"?"Row Knife":kind==="board"?"Spin Board":"+45 Seconds";
    button.textContent=(locked?"🔒 LEVEL "+minLevel+" • ":adReady?"▶ Watch Ad • ":"🎁 Free • ")+noun;
    if(capped)button.textContent=noun+" • FULL";
    if(usedTime)button.textContent="Time bonus used this level";
  }
  extendTimeBtn.disabled=previewBusy||extraTimeUsed||(!adReady&&noFree);
  extendTimeBtn.textContent=adReady?"▶ Watch Ad for +45 Seconds":"🎁 Free +45 Seconds (No Ad)";
  startBtn.disabled=previewBusy;
  restartBtn.disabled=previewBusy;
  if(!previewBusy&&!/^(Free fallback|Ad reward) confirmed:/.test(bonusStatus.textContent)){
    bonusStatus.textContent=adReady
      ?"Optional rewarded ad: receive the selected bonus only after the ad grants its reward."
      :noFree?"Your free fallback bonus for this level was used today. More can be earned through play."
      :"No rewarded ad is configured. Pick one free bonus for this level today, or start playing.";
  }
}
function grantBonus(kind,fromTimeout,isFree){
  if(kind==="time"){
    if(extraTimeUsed)return false;
    remainingSeconds+=45;
    extraTimeUsed=true;
  }else if(!grantTool(kind))return false;
  if(isFree)rememberFallback();
  updateHud();
  displayTimer();
  if(fromTimeout){
    if(kind!=="time")return false;
    startGame(true);
  }
  const label=kind==="time"?"+45 seconds":kind==="knife"?"+1 Row Knife":"+1 Spin Board";
  const note=(isFree?"Free fallback":"Ad reward")+" confirmed: "+label+".";
  bonusStatus.textContent=note;
  endBonusStatus.textContent=note;
  prepTime.textContent="⏱ "+formatTime(remainingSeconds)+" to finish this level";
  updateInventoryUI(note);
  return true;
}
async function requestBonus(kind,fromTimeout=false){
  if(previewBusy||running||(fromTimeout&&(!timedOut||extraTimeUsed)))return;
  if(!fromTimeout&&level<(kind==="knife"?2:kind==="board"?3:1))return;
  if(kind==="time"&&extraTimeUsed)return;
  if(kind!=="time"&&inventory[kind]>=POWER_LIMIT)return;
  const adReady=Boolean(window.RetroRewardedAds?.isConfigured());
  // A player can accept a genuinely unavailable-ad fallback only once per level per day.
  if(!adReady&&fallbackAlreadyUsed()){
    (fromTimeout?endBonusStatus:bonusStatus).textContent="Today's free bonus for this level was already claimed. Retry the level or return tomorrow.";
    return;
  }
  previewBusy=true;
  renderBonusUI();
  const status=fromTimeout?endBonusStatus:bonusStatus;
  status.textContent=adReady?"Checking optional rewarded ad…":"No ad is available; claiming your free fallback…";
  try{
    if(!adReady){
      grantBonus(kind,fromTimeout,true);
      return;
    }
    const result=await window.RetroRewardedAds.watch({
      onStatus:msg=>{status.textContent=msg;}
    });
    if(result.granted){
      grantBonus(kind,fromTimeout,false);
    }else if(AD_UNAVAILABLE.has(result.reason)&&!fallbackAlreadyUsed()){
      grantBonus(kind,fromTimeout,true);
    }else{
      status.textContent=result.message||"The ad did not grant a bonus; nothing was spent.";
    }
  }catch(_){
    if(!fallbackAlreadyUsed())grantBonus(kind,fromTimeout,true);
    else status.textContent="The ad could not load, and today's fallback is already used.";
  }finally{
    previewBusy=false;
    renderBonusUI();
  }
}
bonusKnifeBtn.addEventListener("click",()=>{void requestBonus("knife");});
bonusBoardBtn.addEventListener("click",()=>{void requestBonus("board");});
bonusTimeBtn.addEventListener("click",()=>{void requestBonus("time");});
extendTimeBtn.addEventListener("click",()=>{void requestBonus("time",true);});


const AIM_FREE_KEY="retro-cut-cheese-aim-free-v1";
function aimFallbackUsed(){
  try{
    const d=JSON.parse(localStorage.getItem(AIM_FREE_KEY)||"{}");
    return d[new Date().toLocaleDateString("en-CA")+":level-"+level]===true;
  }catch(_){return false;}
}
function noteAimFallback(){
  try{
    const today=new Date().toLocaleDateString("en-CA")+":";
    const old=JSON.parse(localStorage.getItem(AIM_FREE_KEY)||"{}");
    const d=Object.fromEntries(Object.entries(old).filter(([k])=>k.startsWith(today)));
    d[today+"level-"+level]=true;
    localStorage.setItem(AIM_FREE_KEY,JSON.stringify(d));
  }catch(_){}
}
function openPowerMenu(){
  if(!running||menuOpen)return;
  menuOpen=true;
  powerMenu.classList.add("visible");
  powerMenuBtn.setAttribute("aria-expanded","true");
  renderKnifeShop();
  powerMenuCloseBtn.focus?.();
}
function closePowerMenu(){
  if(!menuOpen)return;
  menuOpen=false;
  powerMenu.classList.remove("visible");
  powerMenuBtn.setAttribute("aria-expanded","false");
  lastTime=performance.now();elapsedAccum=0;
  renderKnifeShop();
  powerMenuBtn.focus?.();
}
function holdOrSwap(){
  if(!running||menuOpen||projectile||knifeData.equipped<2)return;
  syncQueueToBoard();
  if(heldCheese)[queue[0],heldCheese]=[heldCheese,queue[0]];
  else{heldCheese=queue.shift();queue.push(randCheese());}
  updateHud();
  toolStatus.textContent="Reserve: "+heldCheese+". Tap Hold/Swap again to exchange cheeses.";
}
function discardLoadedCheese(){
  if(!running||menuOpen||projectile||knifeData.equipped<3||discardsUsed>=2)return;
  syncQueueToBoard();
  queue.shift();queue.push(randCheese());discardsUsed++;
  updateHud();
  toolStatus.textContent="Cheese discarded; "+(2-discardsUsed)+" discards remain this level.";
}
async function requestExtendedGuide(){
  if(!running||!menuOpen||aimAdBusy||aimBoostSeconds>0)return;
  const currentLevel=level,adAvailable=Boolean(window.RetroRewardedAds?.isConfigured());
  if(!adAvailable&&aimFallbackUsed()){
    aimBoostStatus.textContent="Today's free guide for this level was already claimed.";
    return;
  }
  aimAdBusy=true;renderKnifeShop();
  aimBoostStatus.textContent=adAvailable?"Checking optional rewarded ad…":"No ad available. Granting free guide…";
  try{
    let granted=false,free=false;
    if(!adAvailable){granted=true;free=true;}
    else{
      const result=await window.RetroRewardedAds.watch({
        onStatus:message=>{if(level===currentLevel)aimBoostStatus.textContent=message;}
      });
      granted=Boolean(result?.granted);
      if(!granted&&AD_UNAVAILABLE.has(result?.reason)&&!aimFallbackUsed()){granted=true;free=true;}
      else if(!granted)aimBoostStatus.textContent=result?.message||"The ad did not grant a guide.";
    }
    if(granted&&currentLevel===level&&running){
      if(free)noteAimFallback();
      aimBoostSeconds=90;
      aimBoostStatus.textContent=(free?"Free":"Ad-earned")+" extended guide unlocked for 90 seconds of active play.";
      toolStatus.textContent="🎯 Extended aiming path activated!";
    }
  }catch(_){
    if(currentLevel===level&&!aimFallbackUsed()){
      noteAimFallback();aimBoostSeconds=90;
      aimBoostStatus.textContent="Ad unavailable; free extended guide activated.";
    }else aimBoostStatus.textContent="Ad unavailable; no guide granted.";
  }finally{aimAdBusy=false;renderKnifeShop();}
}
powerMenuBtn.addEventListener("click",openPowerMenu);
powerMenuCloseBtn.addEventListener("click",closePowerMenu);
powerMenuDoneBtn.addEventListener("click",closePowerMenu);
holdCheeseBtn.addEventListener("click",holdOrSwap);
discardCheeseBtn.addEventListener("click",discardLoadedCheese);
watchAimBtn.addEventListener("click",()=>{void requestExtendedGuide();});

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
  const dt = Math.min(50,ts-lastTime||16);
  lastTime=ts;
  if(running&&!menuOpen&&!document.hidden){
    elapsedAccum+=dt;
    if(elapsedAccum>=1000){
      const whole=Math.floor(elapsedAccum/1000);
      seconds+=whole;
      remainingSeconds=Math.max(0,remainingSeconds-whole);
      if(aimBoostSeconds>0){
        aimBoostSeconds=Math.max(0,aimBoostSeconds-whole);
        if(!aimBoostSeconds)toolStatus.textContent="Extended guide expired; the equipped knife still has its regular guide.";
      }
      elapsedAccum-=whole*1000;
      displayTimer();
      if(remainingSeconds<=0)endGame("time");
    }
    if(running)updateProjectile();
  }
  drawBoard();
  requestAnimationFrame(loop);
}
function startGame(force=false){
  if(previewBusy&&!force)return;
  running=true;timedOut=false;
  startOverlay.classList.remove("visible");
  gameOverOverlay.classList.remove("visible");
  fireBtn.disabled=!!projectile;
  lastTime=performance.now();
  elapsedAccum=0;
  displayTimer();
  updateHud();
}
function endGame(reason="limit"){
  if(!running)return;
  running=false;
  projectile=null;
  activeTool=null;
  menuOpen=false;powerMenu.classList.remove("visible");
  fireBtn.disabled=true;
  timedOut=reason==="time";
  gameOverTitle.textContent=timedOut?"Time’s up!":"That cheese got too close.";
  gameOverStats.textContent="Level "+level+" • "+formatTime(seconds)+" played • "+shots+" shots • "+clearEvents+" cluster clears";
  endBonusStatus.textContent=timedOut?"Optional time extension or retry; earned tools stay in inventory.":"Retry this level. Your saved tools are safe.";
  extendTimeBtn.hidden=!timedOut||extraTimeUsed;
  extendTimeBtn.disabled=false;
  extendTimeBtn.textContent="▶ Get +45 Seconds";
  restartBtn.textContent="↻ RETRY LEVEL "+level;
  gameOverOverlay.classList.add("visible");
  updateInventoryUI();
  chirp(110,.18);
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
  if (!running || projectile || menuOpen) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;
  aimingPointerId = e.pointerId;
  try { canvas.setPointerCapture(e.pointerId); } catch (_error) {}
  setAimFromPoint(e.clientX, e.clientY);
  e.preventDefault();
});
canvas.addEventListener("pointermove", e => {
  if (!running || projectile || menuOpen) return;
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
  if(e.key==="Escape"&&menuOpen){closePowerMenu();e.preventDefault();return;}
  if (!running || menuOpen) return;

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
  if(!running||menuOpen||inventory.parm<=0||projectile)return;
  usingParm=!usingParm;
  activeTool=null;
  updateHud();
});
function selectTool(type){
  if(!running||menuOpen||projectile||inventory[type]<=0||level<(type==="knife"?2:3))return;
  activeTool=activeTool===type?null:type;
  usingParm=false;
  updateHud();
  updateInventoryUI(activeTool?"Ready: "+(type==="knife"?"Row Knife":"Spin Board")+". Aim and press FIRE!":"Regular cheese shot selected.");
}
knifePowerBtn.addEventListener("click",()=>selectTool("knife"));
boardPowerBtn.addEventListener("click",()=>selectTool("board"));

startBtn.addEventListener("click",startGame);
restartBtn.addEventListener("click",()=>{
  if(previewBusy)return;
  // Retry the same level with a freshly generated board, not an involuntary full reset.
  resetLevelBoard();
});

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

displayTimer();

requestAnimationFrame(loop);

})();