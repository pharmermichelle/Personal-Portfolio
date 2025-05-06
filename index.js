const badges = document.querySelectorAll(".cert-badge");

badges.forEach((badge) => {
  badge.addEventListener("mouseenter", function () {
    // You can add a modal preview or anything you want on hover.
  });

  badge.addEventListener("mouseleave", function () {
    // Close modal or reset hover state.
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll(".project-filter-nav button");
  const projectCards = document.querySelectorAll(".project-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove 'active' class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      const filter = button.getAttribute("data-filter");

      projectCards.forEach((card) => {
        const tags = card.getAttribute("data-tags");
        const matches = filter === "all" || tags.includes(filter);
        card.style.display = matches ? "block" : "none";
      });
    });
  });
});
