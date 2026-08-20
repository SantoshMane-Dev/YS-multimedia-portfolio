document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     MOBILE NAVIGATION
  ========================================================= */

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-menu");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("active");

      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");

        document.querySelectorAll(".nav-dropdown.open").forEach((dropdown) => {
          dropdown.classList.remove("open");
          const button = dropdown.querySelector(".nav-dropdown-toggle");
          if (button) button.setAttribute("aria-expanded", "false");
        });
      });
    });
  }

  /* =========================================================
     NAVIGATION DROPDOWNS
     Works with mouse, keyboard and Android touch.
  ========================================================= */

  const dropdowns = document.querySelectorAll(".nav-dropdown");

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".nav-dropdown-toggle");

    if (!button) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const shouldOpen = !dropdown.classList.contains("open");

      dropdowns.forEach((other) => {
        other.classList.remove("open");

        const otherButton = other.querySelector(".nav-dropdown-toggle");
        if (otherButton) {
          otherButton.setAttribute("aria-expanded", "false");
        }
      });

      dropdown.classList.toggle("open", shouldOpen);
      button.setAttribute("aria-expanded", String(shouldOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-dropdown")) {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");

        const button = dropdown.querySelector(".nav-dropdown-toggle");
        if (button) button.setAttribute("aria-expanded", "false");
      });
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");

        const button = dropdown.querySelector(".nav-dropdown-toggle");
        if (button) button.setAttribute("aria-expanded", "false");
      });

      if (nav && menuToggle) {
        nav.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    }
  });

  /* =========================================================
     HEADER SCROLL EFFECT
  ========================================================= */

  const header = document.querySelector("header");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 50);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* =========================================================
     SCROLL REVEAL ANIMATIONS
  ========================================================= */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
      },
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  /* =========================================================
     SMOOTH INTERNAL SCROLL
  ========================================================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
});

/* =========================================================
   COMPACT NAVIGATION
   Touch + Android + Desktop
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const dropdowns =
        document.querySelectorAll(".nav-dropdown");


    const submenus =
        document.querySelectorAll(".nav-submenu");


    /* =====================================================
       MAIN DROPDOWNS
       ===================================================== */

    dropdowns.forEach((dropdown) => {

        const button =
            dropdown.querySelector(
                ":scope > .nav-dropdown-button"
            );


        if (!button) return;


        button.addEventListener("click", (event) => {

            event.preventDefault();

            event.stopPropagation();


            const isOpen =
                dropdown.classList.contains("open");


            /* Close all other main dropdowns */

            dropdowns.forEach((other) => {

                if (other !== dropdown) {

                    other.classList.remove("open");

                    const otherButton =
                        other.querySelector(
                            ":scope > .nav-dropdown-button"
                        );

                    if (otherButton) {

                        otherButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }


                    other
                        .querySelectorAll(".nav-submenu")
                        .forEach((submenu) => {

                            submenu.classList.remove(
                                "open"
                            );

                        });

                }

            });


            /* Toggle current dropdown */

            dropdown.classList.toggle(
                "open",
                !isOpen
            );


            button.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );

        });

    });


    /* =====================================================
       SECOND LEVEL MENUS
       ===================================================== */

    submenus.forEach((submenu) => {

        const button =
            submenu.querySelector(
                ":scope > .nav-submenu-button"
            );


        if (!button) return;


        button.addEventListener("click", (event) => {

            event.preventDefault();

            event.stopPropagation();


            const isOpen =
                submenu.classList.contains("open");


            /* Close sibling submenus */

            const parent =
                submenu.parentElement;


            if (parent) {

                parent
                    .querySelectorAll(":scope > .nav-submenu")
                    .forEach((other) => {

                        if (other !== submenu) {

                            other.classList.remove(
                                "open"
                            );

                        }

                    });

            }


            submenu.classList.toggle(
                "open",
                !isOpen
            );

        });

    });


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE
       ===================================================== */

    document.addEventListener("click", () => {

        dropdowns.forEach((dropdown) => {

            dropdown.classList.remove("open");


            const button =
                dropdown.querySelector(
                    ":scope > .nav-dropdown-button"
                );


            if (button) {

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }


            dropdown
                .querySelectorAll(".nav-submenu")
                .forEach((submenu) => {

                    submenu.classList.remove(
                        "open"
                    );

                });

        });

    });


    /* =====================================================
       PREVENT MENU CLICKS FROM CLOSING THE MENU
       ===================================================== */

    document
        .querySelectorAll(
            ".nav-dropdown-menu"
        )
        .forEach((menu) => {

            menu.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                }
            );

        });


    /* =====================================================
       CLOSE MENU AFTER SELECTING A REAL LINK
       ===================================================== */

    document
        .querySelectorAll(
            ".nav-dropdown-menu a"
        )
        .forEach((link) => {

            link.addEventListener(
                "click",
                () => {

                    dropdowns.forEach(
                        (dropdown) => {

                            dropdown.classList.remove(
                                "open"
                            );

                        }
                    );

                }
            );

        });

});