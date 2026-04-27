let state = JSON.parse(localStorage.getItem("lifeGame")) || {
  age: 18,
  xp: 0,
  energy: 100,
  lastUpdate: Date.now(),
  napStart: null,
  boostCount: 0,
  lastBoostAge: 18,
  completedTasks: {},
  moneySaved: 0,
  totalEnergySpent: 0,
  avatarType: null,
  outfit: "Starter Clothes",
};

if (state.moneySaved === undefined) state.moneySaved = 0;
if (state.totalEnergySpent === undefined) state.totalEnergySpent = 0;
if (!state.avatarType) state.avatarType = "girl";
if (!state.outfit) state.outfit = "Starter Clothes";
if (!state.completedTasks) state.completedTasks = {};
if (!state.lastDecay) state.lastDecay = Date.now();

const maxEnergy = 100;

const taskSpots = [
  { match: ["Homework", "Study", "Exam"], spot: "desk", icon: "📚" },
  { match: ["Dishes"], spot: "sink", icon: "🍽️" },
  { match: ["Laundry"], spot: "laundry", icon: "🧺" },
  { match: ["Bathroom"], spot: "bathroom", icon: "🚿" },
  { match: ["Kitchen", "Microwave"], spot: "kitchen", icon: "🍳" },
  { match: ["Groceries"], spot: "grocery", icon: "🛒" },
  {
    match: ["Fish", "Cat", "Dog", "Litter", "Tank", "Groom"],
    spot: "pet",
    icon: "🐾",
  },
  {
    match: ["Baby", "Diaper", "Bath", "Kid", "Hockey"],
    spot: "kid",
    icon: "🧒",
  },
  {
    match: ["Mortgage", "Maintenance", "Renovation"],
    spot: "house",
    icon: "🔧",
  },
  { match: ["Date", "Wedding", "College", "Pool"], spot: "life", icon: "💬" },
];

const stages = {
  18: [
    { name: "Do Homework", energy: 10, xp: 20 },
    { name: "Wash Dishes (Dorm)", energy: 8, xp: 15 },
    { name: "Laundry (Dorm)", energy: 12, xp: 25 },
    { name: "Clean Bathroom", energy: 10, xp: 20 },
    { name: "Go To Work (Dishwasher)", energy: 8, xp: 15, money: 25 },
  ],

  19: [{ name: "Study Session", energy: 12, xp: 25 }],

  20: [{ name: "Clean Kitchen (Suite)", energy: 14, xp: 30 }],

  21: [{ name: "Final Exam Cram", energy: 20, xp: 40 }],

  22: [
    { name: "Apply for Jobs", energy: 15, xp: 30 },
    { name: "Apartment Cleaning", energy: 12, xp: 20 },
    { name: "Budget Groceries", energy: 10, xp: 20 },
  ],

  23: [{ name: "Extra Work Shift", energy: 18, xp: 35, money: 75 }],

  24: [{ name: "Go To Work (Wait Tables)", energy: 20, xp: 40, money: 95 }],

  25: [{ name: "IT Job", energy: 22, xp: 45, money: 140 }],

  26: [
    { name: "Catch Up Laundry (Overflow)", energy: 18, xp: 30 },
    { name: "Dish Pile Cleanup", energy: 16, xp: 28 },
  ],

  27: [{ name: "Go to Work (IT Job)", energy: 20, xp: 40, money: 160 }],

  30: [
    { name: "Feed Fish", energy: 3, xp: 5 },
    { name: "Clean Tank", energy: 8, xp: 12 },
  ],

  32: [
    { name: "Pay Mortgage", energy: 12, xp: 20 },
    { name: "Home Maintenance", energy: 18, xp: 35 },
  ],

  35: [
    { name: "Feed Cat", energy: 5, xp: 10 },
    { name: "Clean Litter", energy: 8, xp: 15 },
    { name: "Go on Date", energy: 10, xp: 18 },
  ],

  36: [
    { name: "Wedding Planning", energy: 20, xp: 40 },
    { name: "Home Renovation", energy: 22, xp: 45 },
  ],

  38: [
    { name: "Feed Baby", energy: 12, xp: 20 },
    { name: "Change Diaper", energy: 10, xp: 18 },
    { name: "Bath Time", energy: 14, xp: 25 },
  ],

  40: [
    { name: "Walk Dog", energy: 10, xp: 18 },
    { name: "Groom Dog", energy: 12, xp: 22 },
  ],

  43: [{ name: "Supervise Kid Chores", energy: 12, xp: 20 }],

  48: [{ name: "Coach Hockey Practice", energy: 15, xp: 25 }],

  56: [{ name: "Visit Kid at College", energy: 18, xp: 30 }],

  60: [
    { name: "Light Chores", energy: 6, xp: 10 },
    { name: "Hire Maid (Finally)", energy: 2, xp: 5 },
    { name: "Walk Dog (Slower)", energy: 6, xp: 10 },
  ],

  65: [{ name: "Retire", energy: 0, xp: 0 }],
};

function save() {
  state.lastUpdate = Date.now();
  localStorage.setItem("lifeGame", JSON.stringify(state));
}

function startOver() {
  const confirmReset = confirm(
    "Start over? This clears your saved life progress. Very realistic.",
  );

  if (!confirmReset) return;

  localStorage.removeItem("lifeGame");
  location.reload();
}

function loadOfflineProgress() {
  let now = Date.now();

  if (state.napStart) {
    if (now - state.napStart >= 3 * 60 * 60 * 1000) {
      state.energy = maxEnergy;
      state.napStart = null;
    }
  }
}

function getRoomInfo(task) {
  return (
    taskSpots.find((item) =>
      item.match.some((word) => task.name.includes(word)),
    ) || { spot: "life", icon: "✨" }
  );
}

function doRoomTask(type) {
  if (type === "work") {
    const workTask = getTasks().find(
      (task) =>
        task.name.toLowerCase().includes("work") ||
        task.name.toLowerCase().includes("job") ||
        task.name.toLowerCase().includes("tables"),
    );

    if (!workTask) {
      alert("No work task right now. Suspiciously peaceful.");
      return;
    }

    doTask(workTask);
  }
}

function getEnergyBoostName() {
  if (state.age >= 55) return "Hot Tea";
  if (state.age >= 35) return "Coffee";
  return "Energy Drink";
}

function applyDecay() {
  let now = Date.now();
  let diff = now - state.lastDecay;

  if (diff > 60000) {
    // every minute
    state.energy = Math.max(0, state.energy - 5);
    state.lastDecay = now;
  }
}

function useEnergyBoost() {
  if (state.lastBoostAge !== state.age) {
    state.boostCount = 0;
    state.lastBoostAge = state.age;
  }

  if (state.boostCount >= 3) {
    alert(
      `No more ${getEnergyBoostName()} this age. Your heart is filing a complaint.`,
    );
    return;
  }

  state.boostCount++;
  state.energy = Math.min(maxEnergy, state.energy + 25);

  save();
  render();
}

function gainXP(amount) {
  state.xp += amount;
  state.energy -= 10;

  if (state.xp >= 100) {
    state.xp = 0;
    state.age++;
    state.boostCount = 0;
    state.lastBoostAge = state.age;

    alert("You aged up. Responsibilities increased.");
  }

  save();
  render();
}

function doTask(task) {
  const key = `${state.age}-${task.name}`;

  if (state.completedTasks[key]) {
    alert("Already done this age. Somehow it will be back next year.");
    return;
  }

  if (state.energy < task.energy) {
    alert("You're too tired. Maybe try existing less.");
    return;
  }

  state.xp += task.xp;
  state.energy -= task.energy;
  state.totalEnergySpent += task.energy;
  state.moneySaved += task.money || 0;
  state.completedTasks[key] = true;

  const availableTasks = getTasks();
  const completedThisAge = availableTasks.filter((task) => {
    return state.completedTasks[`${state.age}-${task.name}`];
  }).length;

  if (completedThisAge >= availableTasks.length) {
    state.xp = 0;
    state.age++;
    state.boostCount = 0;
    state.lastBoostAge = state.age;
    alert("You aged up. Responsibilities increased.");
  }

  save();
  render();
}

function takeNap() {
  state.napStart = Date.now();
  save();
  alert("You took a nap. Come back later.");
}

function watchAd() {
  alert("Watching ad...");
  setTimeout(() => {
    state.energy = Math.min(maxEnergy, state.energy + 30);
    save();
    render();
  }, 3000);
}

function getTasks() {
  let available = [];
  for (let age in stages) {
    if (state.age >= age) {
      available = available.concat(stages[age]);
    }
  }
  return available;
}

function render() {
  if (state.lastBoostAge !== state.age) {
    state.boostCount = 0;
    state.lastBoostAge = state.age;
  }

  document.getElementById("age").innerText = state.age;
  document.getElementById("energy").innerText = state.energy;
  document.getElementById("xp").innerText = state.xp;
  document.getElementById("moneySaved").innerText = state.moneySaved;
  document.getElementById("totalEnergySpent").innerText =
    state.totalEnergySpent;
  document.getElementById("avatar").className =
    `avatar ${state.avatarType} age-${state.age}`;

  const xpBar = document.getElementById("xpBar");
  if (xpBar) {
    xpBar.style.width = `${Math.min(100, state.xp)}%`;
  }

  const boostBtn = document.getElementById("boostBtn");
  if (boostBtn) {
    boostBtn.innerText = `${getEnergyBoostName()} (+25⚡) ${3 - state.boostCount}/3 left this age`;
  }

  const roomTasks = document.getElementById("roomTasks");
  roomTasks.innerHTML = "";

  const availableTasks = getTasks();

  const completedThisAge = availableTasks.filter((task) => {
    return state.completedTasks[`${state.age}-${task.name}`];
  }).length;

  const taskProgress = document.getElementById("taskProgress");
  if (taskProgress) {
    taskProgress.innerText = `${completedThisAge}/${availableTasks.length} responsibilities handled this age`;
  }

  const boostRoomLabel = document.getElementById("boostRoomLabel");
  if (boostRoomLabel) {
    boostRoomLabel.innerText = `${getEnergyBoostName()} ${3 - state.boostCount}/3`;
  }

  availableTasks.forEach((task) => {
    const key = `${state.age}-${task.name}`;
    const isDone = state.completedTasks[key];
    const info = getRoomInfo(task);

    if (
      task.name.toLowerCase().includes("work") ||
      task.name.toLowerCase().includes("job") ||
      task.name.toLowerCase().includes("tables")
    ) {
      return;
    }

    const btn = document.createElement("button");
    btn.className = isDone
      ? `room-item ${info.spot} done`
      : `room-item ${info.spot}`;
    btn.disabled = isDone;

    btn.innerHTML = `${info.icon}<span>${isDone ? "Done" : task.name}</span>`;
    btn.onclick = () => doTask(task);

    roomTasks.appendChild(btn);
  });
}

loadOfflineProgress();
render();
