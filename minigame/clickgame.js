document.addEventListener("DOMContentLoaded", () => {
  let coins = 0; // This will represent the current available mana (dynamic)
  let totalManaCollected = 0; // This will represent the total mana gained, including from CPS
  let cps = 0; // Mana per second (CPS)
  let upgradeCost = 50;
  let golemCount = 0;
  let golemProgress = 0;
  let manaSurgeActive = false;
  let lastManaMilestone = 0;
  let isPowerupActive = false;
  let isPowerupOnCooldown = false;

  const coinCountEl = document.getElementById("coin-count"); // For current mana
  const totalManaEl = document.getElementById("total-mana-collected"); // For total mana collected (including CPS)
  const cpsEl = document.getElementById("cps");
  const clickBtn = document.getElementById("click-btn");
  const upgradeBtn = document.getElementById("upgrade-btn");
  const powerupBtn = document.getElementById("powerup-btn");

  const golemContainer = document.getElementById("golem-container");
  const toggleBtn = document.getElementById("instructions-toggle");
  const instructionsBox = document.getElementById("instructions-box");

  const requiredElements = [
    coinCountEl,
    totalManaEl,
    cpsEl,
    clickBtn,
    upgradeBtn,
    powerupBtn,

    golemContainer,
    toggleBtn,
    instructionsBox,
  ];

  if (requiredElements.some((el) => el === null)) {
    console.warn(
      "⚠️ Some elements are missing from the HTML. Game may not function correctly."
    );
  }

  toggleBtn.addEventListener("click", () => {
    instructionsBox.classList.toggle("hidden");
  });

  // Channel Mana Button
  clickBtn.addEventListener("click", () => {
    let manaPerClick = 1;
    if (manaSurgeActive && isPowerupActive) {
      manaPerClick = 4;
    } else if (manaSurgeActive || isPowerupActive) {
      manaPerClick = 2;
    }

    // Update total mana collected (this includes CPS and clicks)
    totalManaCollected += manaPerClick;

    // Update the available mana (coins), it will decrease when spent
    coins += manaPerClick;

    updateDisplay();

    // Check if total mana has crossed the next milestone (500, 1000, 1500, etc.)
    const nextMilestone = Math.floor(totalManaCollected / 500) * 500;

    if (nextMilestone > lastManaMilestone) {
      lastManaMilestone = nextMilestone;
      activateManaSurge(nextMilestone);
    }

    // Display hint message when approaching a surge (between 450 and 499 total mana)
    if (
      totalManaCollected >= 450 &&
      totalManaCollected < 500 &&
      !document.querySelector(".mana-surge-msg")
    ) {
      console.log(
        `💡 You're approaching a surge... ${totalManaCollected} Mana collected so far`
      );

      const hintMsg = document.createElement("div");
      hintMsg.className = "mana-surge-msg";
      hintMsg.innerHTML = `💡 You're approaching a surge... Collect 500 total mana to unleash a hidden power!`;
      document.body.appendChild(hintMsg);
      setTimeout(() => hintMsg.remove(), 4000); // Remove after 4 seconds
    }
  });

  // Activate Mana Surge when a new milestone is reached
  function activateManaSurge(milestone) {
    console.log(`🚀 Mana Surge triggered at ${milestone} total mana!`);
    manaSurgeActive = true;
    const surgeMsg = document.createElement("div");
    surgeMsg.className = "mana-surge-msg";

    surgeMsg.innerHTML = `🌟 <strong>Mana Surge Activated!</strong><br>
      Your relentless mana gathering has reached <strong>${milestone}</strong> total mana!<br>
      The arcane winds respond to your mastery...<br>
      <strong>Double mana per click</strong> for the next <strong>15 seconds</strong>!`;
    document.body.appendChild(surgeMsg);

    setTimeout(() => {
      manaSurgeActive = false;
      surgeMsg.remove();
    }, 14000);
  }

  function updateMana() {
    coins += cps; // Add the mana generated per second to the current available mana (coins)
    totalManaCollected += cps; // Add to total mana collected
    updateDisplay(); // Update the display with the new total mana
  }

  upgradeBtn.addEventListener("click", () => {
    if (coins >= upgradeCost) {
      coins -= upgradeCost; // Subtract mana (coins) when the upgrade is purchased
      cps += 1;
      golemCount++;
      golemProgress = Math.min(golemCount, 10); // cap progress bar at 10 for demo
      console.log(
        `🪨 New auto-scribe Golem gained, there are ${golemCount} golems active!`
      );
      upgradeCost = Math.floor(upgradeCost * 1.5);

      // Update button text
      upgradeBtn.textContent = `Summon Auto-Scribe Golem (Cost: ${upgradeCost} mana)`;

      // Add Golem image
      const golemImg = document.createElement("img");
      golemImg.src = "images/scribe-golem.png";
      golemImg.alt = `Golem #${golemCount}`;
      golemImg.classList.add("golem-img");
      golemContainer.appendChild(golemImg);

      updateDisplay();
      checkVictoryCondition();
    }
  });

  powerupBtn.addEventListener("click", () => {
    // Check if user has enough coins and if powerup isn't already active or on cooldown
    if (coins >= 100 && !isPowerupActive && !isPowerupOnCooldown) {
      // Deduct the coins for powerup activation
      coins -= 100;
      isPowerupActive = true;
      isPowerupOnCooldown = true;

      // Update button text and disable it
      powerupBtn.textContent = "Mystic Tome Active! (15s)";
      powerupBtn.disabled = true;
      powerupBtn.style.backgroundColor = "#9c27b0"; // Indicating the active state

      // End powerup after 15 seconds
      setTimeout(() => {
        isPowerupActive = false;
        powerupBtn.textContent = "Mystic Tome Cooling Down... (10s)";
        powerupBtn.style.backgroundColor = "#6b4c9a"; // Indicating the cooldown state

        // End cooldown after another 10 seconds
        setTimeout(() => {
          isPowerupOnCooldown = false;
          powerupBtn.textContent = "Use Mystic Tome (Cost: 100 mana)";
          powerupBtn.disabled = false; // Re-enable the button after cooldown
        }, 10000); // 10 seconds cooldown
      }, 15000); // Powerup lasts for 15 seconds

      // Update display after spending coins
      updateDisplay();
    }
  });

  function updateDisplay() {
    // Update the current available mana (coins)
    coinCountEl.textContent = coins;

    // Update the total mana collected (which includes CPS and clicks)
    totalManaEl.textContent = totalManaCollected;

    // Update the mana per second (CPS)
    cpsEl.textContent = cps;
  }

  function checkVictoryCondition() {
    if (golemCount === 10) {
      const winMsg = document.createElement("div");
      winMsg.className = "victory-msg";
      winMsg.innerHTML = `<h2>🧙‍♀️ You Are the Realm's Supreme Wizard!</h2>
      <p>The skies shimmer as your power echoes across dimensions.</p>
      <button onclick="location.reload()">Play Again</button>`;
      document.body.appendChild(winMsg);
    }
  }

  setInterval(updateMana, 1000); // Update passive mana every second
});
