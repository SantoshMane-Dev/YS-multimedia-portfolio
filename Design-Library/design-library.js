document.addEventListener("DOMContentLoaded", () => {
  /*
   * DESIGN LIBRARY
   *
   * Images belong in:
   * ../assets/images/
   *
   * Example:
   * {
   *   src: "../assets/images/wedding-card-01.jpg",
   *   title: "Wedding Invitation",
   *   description: "Traditional wedding invitation design."
   * }
   */

  const designData = {
    "wedding-cards": {
      title: "Wedding Card Designs",
      description: "Elegant and creative wedding invitation designs.",
      designs: [],
    },

    banners: {
      title: "Banner Design",
      description: "Professional promotional and event banner designs.",
      designs: [],
    },

    "social-media": {
      title: "Social Media Graphics",
      description: "Creative graphics designed for social media.",
      designs: [],
    },

    "custom-graphics": {
      title: "Custom Graphics",
      description: "Custom graphic design created for different visual needs.",
      designs: [],
    },
  };

  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");

  const titleElement = document.getElementById("design-library-title");
  const descriptionElement = document.getElementById(
    "design-library-description",
  );
  const designLibrary = document.getElementById("design-library");
  const emptyLibrary = document.getElementById("empty-design-library");

  if (!titleElement || !descriptionElement || !designLibrary || !emptyLibrary) {
    console.error("Design library elements are missing.");
    return;
  }

  if (!topic || !designData[topic]) {
    titleElement.textContent = "Design Portfolio";
    descriptionElement.textContent =
      "Select a design category from our portfolio.";
    emptyLibrary.classList.add("show");
    return;
  }

  const category = designData[topic];

  titleElement.textContent = category.title;
  descriptionElement.textContent = category.description;

  if (!category.designs || category.designs.length === 0) {
    emptyLibrary.classList.add("show");
    return;
  }

  emptyLibrary.classList.remove("show");

  category.designs.forEach((design, index) => {
    const card = document.createElement("article");
    card.className = "portfolio-card";

    const number = String(index + 1).padStart(2, "0");

    card.innerHTML = `
      <div class="portfolio-image-wrapper">
        <img
          src="${design.src}"
          alt="${design.title}"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div class="portfolio-card-info">
        <span class="portfolio-card-number">${number}</span>

        <h2 class="portfolio-card-title">
          ${design.title}
        </h2>

        <p class="portfolio-card-description">
          ${design.description || ""}
        </p>
      </div>
    `;

    designLibrary.appendChild(card);
  });

  const images = designLibrary.querySelectorAll(".portfolio-image-wrapper img");

  images.forEach((image) => {
    image.addEventListener("click", () => {
      openLightbox(image.src, image.alt);
    });
  });

  function openLightbox(imageSrc, imageAlt) {
    const overlay = document.createElement("div");

    overlay.className = "image-modal open";

    overlay.innerHTML = `
      <button
        class="modal-close"
        type="button"
        aria-label="Close image"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <img src="${imageSrc}" alt="${imageAlt}" />
    `;

    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector(".modal-close");

    const closeLightbox = () => {
      overlay.classList.remove("open");

      setTimeout(() => {
        overlay.remove();
      }, 200);
    };

    closeButton.addEventListener("click", closeLightbox);

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeLightbox();
      }
    });

    const escapeHandler = (event) => {
      if (event.key === "Escape") {
        closeLightbox();
        document.removeEventListener("keydown", escapeHandler);
      }
    };

    document.addEventListener("keydown", escapeHandler);
  }
});
