const pointsEl = document.getElementById("points");
const doubleTakesEl = document.getElementById("doubleTakes");
const statusText = document.getElementById("statusText");
const buildSummary = document.getElementById("buildSummary");
const chanceSummary = document.getElementById("chanceSummary");
const passerLane = document.getElementById("passerLane");
const uninterestedPassersEl = document.getElementById("uninterestedPassers");

const cakeEl = document.getElementById("cake");
const caseEl = document.getElementById("case");
const tableEl = document.getElementById("table");

const winModal = document.getElementById("winModal");
const finalUninterestedEl = document.getElementById("finalUninterested");
const sharePreviewEl = document.getElementById("sharePreview");
const copyShareBtn = document.getElementById("copyShareBtn");
const shareBtn = document.getElementById("shareBtn");
const downloadScoreBtn = document.getElementById("downloadScoreBtn");
const restartBtn = document.getElementById("restartBtn");
const winBackdrop = document.getElementById("winBackdrop");

let points = 0;
let doubleTakes = 0;
let uninterestedPassers = 0;
let gameWon = false;
const gameUrl = window.location.href;

let upgrades = {
  cake: 0,
  case: 0,
  table: 0,
};

const purchased = {
  cake15: false,
  cake50: false,
  cake100: false,
  case15: false,
  case50: false,
  case100: false,
  table15: false,
  table50: false,
  table100: false,
};

const costs = {
  cake15: 5,
  cake50: 15,
  cake100: 30,
  case15: 5,
  case50: 15,
  case100: 30,
  table15: 5,
  table50: 15,
  table100: 30,
};

const doubleTakeMessages = [
  "Double-take! Somebody noticed that lemon pound cake.",
  "Double-take! Someone must have the munchies.",
  "Whoa… that cake just turned heads.",
  "Double-take! That slice is looking dangerous.",
  "Somebody smelled that lemon glaze from across the room.",
  "Double-take! Eyes locked on the cake.",
  "Someone just reconsidered their life choices… for cake.",
  "That cake just caused a moment.",
  "Double-take! That’s not just cake, that’s an experience.",
  "Somebody just fell in love with dessert.",
  "Double-take! That lemon pound cake is hitting different.",
  "That cake just interrupted someone’s day.",
  "Double-take! That’s main character cake energy.",
  "Someone just forgot where they were going.",
  "That cake just demanded attention.",
  "Double-take! Yeah… they’re coming back for that.",
  "That cake made someone want to cut a slice.",
  "That cake looks so nice... somebody just had to look twice.",
];

const buttons = {};
Object.keys(costs).forEach((id) => {
  buttons[id] = document.getElementById(id);
});

function getDoubleTakeChance() {
  const base = 20;

  const cakeBonus = [0, 10, 22, 36][upgrades.cake];
  const caseBonus = [0, 7, 15, 24][upgrades.case];
  const tableBonus = [0, 5, 11, 20][upgrades.table];

  return Math.min(base + cakeBonus + caseBonus + tableBonus, 100);
}

function updateUI() {
  pointsEl.textContent = points;
  doubleTakesEl.textContent = doubleTakes;
  uninterestedPassersEl.textContent = uninterestedPassers;
  cakeEl.className = `cake level-${upgrades.cake}`;
  caseEl.className = `cake-case level-${upgrades.case}`;
  tableEl.className = `table level-${upgrades.table}`;

  const cakeText = [
    "one simple slice",
    "a few slices",
    "a half cake with glaze",
    "a full fancy lemon pound cake",
  ][upgrades.cake];

  const caseText = [
    "bare display",
    "glass dome",
    "polished stand",
    "premium bakery case",
  ][upgrades.case];

  const tableText = [
    "plain table",
    "runner table",
    "decorated table",
    "fully styled centerpiece table",
  ][upgrades.table];

  buildSummary.textContent = `${tableText}, ${cakeText}, ${caseText}.`;

  chanceSummary.textContent = `Current double-take chance: ${getDoubleTakeChance()}%`;

  Object.keys(buttons).forEach((id) => {
    const isPurchased = purchased[id];

    buttons[id].disabled = isPurchased || points < costs[id];

    if (isPurchased) {
      buttons[id].classList.add("completed");
    } else {
      buttons[id].classList.remove("completed");
    }
  });
}

function getShareText() {
  return `I reached 100% double-take chance in Lemon Pound Cake Double Take with ${uninterestedPassers} uninterested passers. Play here: ${gameUrl}`;
}

function showWinModal() {
  finalUninterestedEl.textContent = uninterestedPassers;
  sharePreviewEl.textContent = getShareText();
  winModal.classList.remove("hidden");

  setTimeout(() => {
    const winAd = document.querySelector(".win-ad ins");

    if (winAd && window.adsbygoogle) {
      try {
        (adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.log("Ad already loaded or blocked");
      }
    }
  }, 300);
}

function hideWinModal() {
  winModal.classList.add("hidden");
}

function restartGame() {
  points = 0;
  doubleTakes = 0;
  uninterestedPassers = 0;
  gameWon = false;

  upgrades = {
    cake: 0,
    case: 0,
    table: 0,
  };

  Object.keys(purchased).forEach((key) => {
    purchased[key] = false;
  });

  statusText.textContent = "A few people are walking by...";
  updateUI();
  hideWinModal();
}

function tryBuy(id, category, newLevel) {
  if (purchased[id]) return;
  if (points < costs[id]) return;

  const currentLevel = upgrades[category];

  if (newLevel !== currentLevel + 1) {
    statusText.textContent = `You need to buy ${category} level ${currentLevel + 1} first.`;
    return;
  }

  points -= costs[id];
  purchased[id] = true;
  upgrades[category] = newLevel;

  statusText.textContent = `Upgrade bought: ${category} level ${newLevel}. The cake setup looks better already.`;
  updateUI();
  checkWin();
}

buttons.cake15.addEventListener("click", () => tryBuy("cake15", "cake", 1));
buttons.cake50.addEventListener("click", () => tryBuy("cake50", "cake", 2));
buttons.cake100.addEventListener("click", () => tryBuy("cake100", "cake", 3));

buttons.case15.addEventListener("click", () => tryBuy("case15", "case", 1));
buttons.case50.addEventListener("click", () => tryBuy("case50", "case", 2));
buttons.case100.addEventListener("click", () => tryBuy("case100", "case", 3));

buttons.table15.addEventListener("click", () => tryBuy("table15", "table", 1));
buttons.table50.addEventListener("click", () => tryBuy("table50", "table", 2));
buttons.table100.addEventListener("click", () =>
  tryBuy("table100", "table", 3),
);

downloadScoreBtn.addEventListener("click", downloadScoreImage);

function createPasser() {
  if (gameWon) return;

  const passer = document.createElement("div");
  passer.className = "passer";
  passer.style.left = "-60px";

  const head = document.createElement("div");
  head.className = "head";

  const body = document.createElement("div");
  body.className = "body";

  const bodyColors = ["#6a8eb8", "#b86a6a", "#6bb07f", "#8e72b8", "#c28b47"];
  body.style.background =
    bodyColors[Math.floor(Math.random() * bodyColors.length)];

  const skinTones = ["#7d5337", "#a56d46", "#c58a61", "#6a432b"];
  head.style.background =
    skinTones[Math.floor(Math.random() * skinTones.length)];

  passer.appendChild(head);
  passer.appendChild(body);
  passerLane.appendChild(passer);

  let x = -60;
  const speed = 1.6 + Math.random() * 1.4;
  let reacted = false;

  const randomModifier = Math.floor(Math.random() * 15) - 6;
  const chance = Math.max(
    3,
    Math.min(getDoubleTakeChance() + randomModifier, 98),
  );

  const interval = setInterval(() => {
    // 🔥 STOP everything if game is won
    if (gameWon) {
      clearInterval(interval);
      passer.remove();
      return;
    }

    x += speed;
    passer.style.left = `${x}px`;

    if (!reacted && x > 220) {
      reacted = true;
      const roll = Math.random() * 100;

      if (roll < chance) {
        passer.classList.add("double-take");
        points += 1;
        doubleTakes += 1;

        const msg =
          doubleTakeMessages[
            Math.floor(Math.random() * doubleTakeMessages.length)
          ];

        statusText.textContent = msg;
      } else {
        uninterestedPassers += 1;
        statusText.textContent =
          "No double-take that time. Maybe the cake needs more work.";
      }

      updateUI();
      checkWin();
    }

    if (x > passerLane.offsetWidth + 60) {
      clearInterval(interval);
      passer.remove();
    }
  }, 16);
}

function spawnLoop() {
  createPasser();
  const nextSpawn = 550 + Math.random() * 700;
  setTimeout(spawnLoop, nextSpawn);
}

function checkWin() {
  if (gameWon) return;

  if (getDoubleTakeChance() >= 100) {
    gameWon = true;
    statusText.textContent = `Perfect display! 100% reached with ${uninterestedPassers} uninterested passers.`;
    updateUI();
    showWinModal();
  }
}

copyShareBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(getShareText());
    copyShareBtn.textContent = "Copied!";
    setTimeout(() => {
      copyShareBtn.textContent = "Copy Result";
    }, 1400);
  } catch (err) {
    copyShareBtn.textContent = "Copy failed";
    setTimeout(() => {
      copyShareBtn.textContent = "Copy Result";
    }, 1400);
  }
});

shareBtn.addEventListener("click", async () => {
  const shareData = {
    title: "Lemon Pound Cake Double Take",
    text: getShareText(),
    url: gameUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      // user canceled or browser declined
    }
  } else {
    try {
      await navigator.clipboard.writeText(getShareText());
      shareBtn.textContent = "Copied share text";
      setTimeout(() => {
        shareBtn.textContent = "Share";
      }, 1400);
    } catch (err) {
      shareBtn.textContent = "Share unavailable";
      setTimeout(() => {
        shareBtn.textContent = "Share";
      }, 1400);
    }
  }
});

restartBtn.addEventListener("click", restartGame);
winBackdrop.addEventListener("click", hideWinModal);

function downloadScoreImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;

  const ctx = canvas.getContext("2d");

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#fff5d8");
  bg.addColorStop(1, "#ead7b0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // card
  ctx.fillStyle = "rgba(255, 249, 239, 0.98)";
  roundRect(ctx, 80, 70, 1040, 490, 28, true, false);

  // heading
  ctx.fillStyle = "#2b2118";
  ctx.font = "bold 54px Trebuchet MS, Arial, sans-serif";
  ctx.fillText("Lemon Pound Cake Double Take", 130, 155);

  ctx.fillStyle = "#5f4a38";
  ctx.font = "32px Trebuchet MS, Arial, sans-serif";
  ctx.fillText("Perfect Display Reached", 130, 205);

  // score box
  ctx.fillStyle = "#fff4dd";
  roundRect(ctx, 130, 255, 360, 170, 22, true, false);

  ctx.fillStyle = "#6a4a2a";
  ctx.font = "28px Trebuchet MS, Arial, sans-serif";
  ctx.fillText("Uninterested Passers", 165, 315);

  ctx.fillStyle = "#2b2118";
  ctx.font = "bold 76px Trebuchet MS, Arial, sans-serif";
  ctx.fillText(String(uninterestedPassers), 165, 395);

  // chance
  ctx.fillStyle = "#fff4dd";
  roundRect(ctx, 530, 255, 240, 170, 22, true, false);

  ctx.fillStyle = "#6a4a2a";
  ctx.font = "28px Trebuchet MS, Arial, sans-serif";
  ctx.fillText("Final Chance", 565, 315);

  ctx.fillStyle = "#2b2118";
  ctx.font = "bold 76px Trebuchet MS, Arial, sans-serif";
  ctx.fillText("100%", 565, 395);

  // footer text
  ctx.fillStyle = "#5a3c22";
  ctx.font = "28px Trebuchet MS, Arial, sans-serif";
  wrapText(
    ctx,
    "I reached 100% double-take chance in Lemon Pound Cake Double Take. Can you beat my uninterested passer count?",
    130,
    485,
    880,
    38,
  );

  const link = document.createElement("a");
  link.download = "lemon-pound-cake-score.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === "number") {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height,
  );
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
}

updateUI();
spawnLoop();
