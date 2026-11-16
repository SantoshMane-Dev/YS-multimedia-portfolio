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

  const showEmptyState = (heading, message) => {
    emptyLibrary.querySelector("h2").textContent = heading;
    emptyLibrary.querySelector("p").textContent = message;
    emptyLibrary.classList.add("show");
  };

  const imageModal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const closeButton = document.getElementById("modal-close");
  const closeLightbox = () => {
    imageModal.classList.remove("open");
    modalImage.removeAttribute("src");
    modalImage.alt = "";
  };

  closeButton?.addEventListener("click", closeLightbox);
  imageModal?.addEventListener("click", (event) => {
    if (event.target === imageModal) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });

  const renderDesigns = (designs) => {
    designLibrary.replaceChildren();
    if (!designs.length) {
      showEmptyState("No Designs Yet", "Designs for this category will be added here soon.");
      return;
    }

    emptyLibrary.classList.remove("show");
    designs.forEach((design, index) => {
      const card = document.createElement("article");
      card.className = "portfolio-card";
      const wrapper = document.createElement("div");
      wrapper.className = "portfolio-image-wrapper";
      const image = document.createElement("img");
      image.src = design.src;
      image.alt = design.title;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("click", () => {
        modalImage.src = image.src;
        modalImage.alt = image.alt;
        imageModal.classList.add("open");
      });
      wrapper.append(image);

      const info = document.createElement("div");
      info.className = "portfolio-card-info";
      const number = document.createElement("span");
      number.className = "portfolio-card-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("h2");
      title.className = "portfolio-card-title";
      title.textContent = design.title;
      const description = document.createElement("p");
      description.className = "portfolio-card-description";
      description.textContent = design.description || "";
      info.append(number, title, description);
      card.append(wrapper, info);
      designLibrary.append(card);
    });
  };

  const client = window.portfolioSupabase;
  if (!client) {
    if (category.designs.length) {
      renderDesigns(category.designs);
    } else {
      showEmptyState(
        "Library Not Connected",
        "The portfolio admin has not been connected to Supabase yet.",
      );
    }
    return;
  }

  showEmptyState("Loading Designs", "Please wait while this category loads.");
  client
    .from("portfolio_items")
    .select("title, description, object_path")
    .eq("media_type", "image")
    .eq("category", topic)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .then(async ({ data, error }) => {
      if (error) throw error;
      const designs = await Promise.all(
        data.map(async (item) => {
          const { data: signedFile, error: signedUrlError } = await client.storage
            .from("portfolio-media")
            .createSignedUrl(item.object_path, 3600);
          if (signedUrlError) throw signedUrlError;
          return {
            src: signedFile.signedUrl,
            title: item.title,
            description: item.description,
          };
        }),
      );
      renderDesigns(designs);
    })
    .catch((error) => {
      console.error("Could not load portfolio designs:", error);
      showEmptyState(
        "Unable to Load Designs",
        "Please try again later. The portfolio administrator may need to check the Supabase setup.",
      );
    });
});
