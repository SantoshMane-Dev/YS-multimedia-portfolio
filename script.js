document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-menu");
  const workDropdown = document.querySelector(".nav-work-dropdown");

  const closeWorkMenus = () => {
    if (!workDropdown) return;

    workDropdown.classList.remove("open");
    const mainButton = workDropdown.querySelector(":scope > .nav-dropdown-toggle");
    if (mainButton) mainButton.setAttribute("aria-expanded", "false");

    workDropdown.querySelectorAll(".nav-work-category").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
    workDropdown.querySelectorAll(".nav-work-submenu, .nav-design-links").forEach((panel) => {
      panel.hidden = true;
    });
    workDropdown.querySelectorAll(".nav-work-group").forEach((button) => {
      button.setAttribute("aria-expanded", "false");
    });
    workDropdown.querySelectorAll(".nav-work-leaves").forEach((panel) => {
      panel.hidden = true;
    });
  };

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("active");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (workDropdown) {
    const mainButton = workDropdown.querySelector(":scope > .nav-dropdown-toggle");

    mainButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const shouldOpen = !workDropdown.classList.contains("open");
      closeWorkMenus();
      if (shouldOpen) {
        workDropdown.classList.add("open");
        mainButton.setAttribute("aria-expanded", "true");
      }
    });

    workDropdown.querySelectorAll(".nav-work-category").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const panel = button.nextElementSibling;
        if (!panel) return;

        const isOpen = button.getAttribute("aria-expanded") === "true";
        const section = button.closest(".nav-work-section");

        workDropdown.querySelectorAll(":scope .nav-work-category").forEach((other) => {
          if (other !== button) {
            other.setAttribute("aria-expanded", "false");
            const otherPanel = other.nextElementSibling;
            if (otherPanel) otherPanel.hidden = true;
          }
        });

        button.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;

        if (section) {
          section.classList.toggle("expanded", !isOpen);
        }
      });
    });

    workDropdown.querySelectorAll(".nav-work-group").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const panel = button.nextElementSibling;
        if (!panel) return;

        const isOpen = button.getAttribute("aria-expanded") === "true";
        const parent = button.closest(".nav-work-section-inner");

        parent?.querySelectorAll(".nav-work-group").forEach((other) => {
          if (other !== button) {
            other.setAttribute("aria-expanded", "false");
            const otherPanel = other.nextElementSibling;
            if (otherPanel) otherPanel.hidden = true;
          }
        });

        button.setAttribute("aria-expanded", String(!isOpen));
        panel.hidden = isOpen;
      });
    });
  }

  document.addEventListener("click", (event) => {
    if (workDropdown && !event.target.closest(".nav-work-dropdown")) {
      closeWorkMenus();
    }
  });

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      if (nav && menuToggle) {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      }
      closeWorkMenus();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeWorkMenus();
      nav?.classList.remove("active");
      menuToggle?.classList.remove("active");
      menuToggle?.setAttribute("aria-expanded", "false");
    }
  });

  const header = document.querySelector("header");
  if (header) {
    const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 50);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  const revealElements = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, instance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            instance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* Homepage portfolio explorer: direct group -> subcategory -> library. */
  document.querySelectorAll(".portfolio-main-group").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = button.nextElementSibling;
      if (!panel) return;

      const isOpen = button.getAttribute("aria-expanded") === "true";
      const parent = button.closest(".portfolio-category-list");

      parent?.querySelectorAll(".portfolio-main-group").forEach((other) => {
        if (other !== button) {
          other.setAttribute("aria-expanded", "false");
          const otherPanel = other.nextElementSibling;
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      button.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
});
