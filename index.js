const badges = document.querySelectorAll(".cert-badge");

badges.forEach((badge) => {
  badge.addEventListener("mouseenter", function () {
    // You can add a modal preview or anything you want on hover.
  });

  badge.addEventListener("mouseleave", function () {
    // Close modal or reset hover state.
  });
});
