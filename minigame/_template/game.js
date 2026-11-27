(() => {
  "use strict";

  const start = document.querySelector("#start");
  const action = document.querySelector("#action");
  const restart = document.querySelector("#restart");
  const status = document.querySelector("#game-status");
  let round = "ready";

  function render(message) {
    status.textContent = message;
    start.disabled = round !== "ready";
    action.disabled = round !== "playing";
    restart.disabled = round === "ready";
  }

  start.addEventListener("click", () => {
    round = "playing";
    render("Round in progress.");
    action.focus();
  });

  action.addEventListener("click", () => {
    if (round !== "playing") return;
    round = "complete";
    render("Round complete.");
    restart.focus();
  });

  restart.addEventListener("click", () => {
    round = "ready";
    render("Ready.");
    start.focus();
  });
})();
