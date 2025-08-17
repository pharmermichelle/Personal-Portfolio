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

document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".split-hero");
  if (hero) {
    setTimeout(() => {
      hero.classList.add("visible");
    }, 100); // Small delay for smoother entrance
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");

  // Load saved theme
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  } else if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  // Update button label
  function updateButtonLabel() {
    if (document.body.classList.contains("dark-mode")) {
      toggleBtn.innerText = "☀️ Light Mode";
    } else {
      toggleBtn.innerText = "🌙 Dark Mode";
    }
  }

  updateButtonLabel();

  toggleBtn.addEventListener("click", () => {
    if (document.body.classList.contains("dark-mode")) {
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    } else {
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    }

    updateButtonLabel();
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const projectCards = document.querySelectorAll(".project-card");

  projectCards.forEach((card) => {
    const primaryLink = card.querySelector("a.project-link");
    if (!primaryLink) return;

    // Make the whole card clickable
    card.addEventListener("click", () => {
      window.open(primaryLink.href, primaryLink.target || "_self");
    });

    // Show pointer cursor so it feels clickable
    card.style.cursor = "pointer";

    // Keep inner links behaving normally
    card.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", (e) => e.stopPropagation());
    });

    // Keyboard accessibility: Enter/Space triggers the primary link
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        primaryLink.click();
      }
    });
  });
});
