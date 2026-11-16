document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
       VIDEO LIBRARY DATA
       =========================================================

       Each category has:

       title
       description
       videos[]

       To add a video, put the video inside:

       assets/videos/

       Then add its filename below.

       ========================================================= */

  const videoData = {
    /* =====================================================
           WEDDING VIDEOGRAPHY
           ===================================================== */

    mehendi: {
      title: "Mehendi",

      description: "Mehendi ceremony videography.",

      videos: [
        /*
                Example:

                {
                    src: "../assets/videos/mehendi-01.mp4",
                    title: "Mehendi Ceremony",
                    description:
                        "Mehendi ceremony highlights."
                }

                */
      ],
    },

    grahdev: {
      title: "Grahdev",

      description: "Grahdev ceremony videography.",

      videos: [],
    },

    bangdiya: {
      title: "Bangdiya",

      description: "Bangdiya ceremony videography.",

      videos: [],
    },

    haldi: {
      title: "Haldi",

      description: "Haldi ceremony videography.",

      videos: [],
    },

    engagement: {
      title: "Engagement",

      description: "Engagement ceremony videography.",

      videos: [],
    },

    wedding: {
      title: "Wedding",

      description: "Wedding ceremony videography.",

      videos: [],
    },

    "digital-wedding-invitation": {
      title: "Digital Wedding Invitation",

      description: "Digital wedding invitation videos.",

      videos: [],
    },

    reception: {
      title: "Reception",

      description: "Wedding reception videography.",

      videos: [],
    },

    /* =====================================================
           PRE-WEDDING VIDEOGRAPHY
           ===================================================== */

    "cinematic-pre-wedding": {
      title: "Cinematic Pre-Wedding",

      description: "Cinematic pre-wedding films.",

      videos: [],
    },

    "couple-reels": {
      title: "Couple Reels",

      description: "Creative couple reels.",

      videos: [],
    },

    "save-the-date": {
      title: "Save the Date Video",

      description: "Creative Save the Date videos.",

      videos: [],
    },

    /* =====================================================
           EVENT VIDEOGRAPHY
           ===================================================== */

    birthday: {
      title: "Birthday",

      description: "Birthday event videography.",

      videos: [],
    },

    anniversary: {
      title: "Anniversary",

      description: "Anniversary event videography.",

      videos: [],
    },

    "baby-welcome-shoot": {
      title: "Baby Welcome Shoot",

      description: "Baby welcome event videography.",

      videos: [],
    },

    "shop-opening": {
      title: "Shop Opening",

      description: "Shop opening event videography.",

      videos: [],
    },

    "new-car-delivery": {
      title: "New Car Delivery",

      description: "New car delivery event videography.",

      videos: [],
    },

    vatpournima: {
      title: "Vatpournima",

      description: "Vatpournima event videography.",

      videos: [],
    },

    /* =====================================================
           BABY SHOOT
           ===================================================== */

    "baby-shoot": {
      title: "Baby Shoot",

      description: "Baby shoot videography.",

      videos: [],
    },
  };

  /* =========================================================
       GET TOPIC FROM URL
       ========================================================= */

  const params = new URLSearchParams(window.location.search);

  const topic = params.get("topic");

  /* =========================================================
       PAGE ELEMENTS
       ========================================================= */

  const titleElement = document.getElementById("library-title");

  const descriptionElement = document.getElementById("library-description");

  const library = document.getElementById("video-library");

  const emptyLibrary = document.getElementById("empty-library");

  /* =========================================================
       CHECK ELEMENTS
       ========================================================= */

  if (!titleElement || !descriptionElement || !library || !emptyLibrary) {
    console.error("Video library elements are missing.");

    return;
  }

  /* =========================================================
       INVALID / UNKNOWN TOPIC
       ========================================================= */

  if (!topic || !videoData[topic]) {
    titleElement.textContent = "Video Library";

    descriptionElement.textContent =
      "Select a category from our videography portfolio.";

    emptyLibrary.classList.add("show");

    return;
  }

  /* =========================================================
       LOAD SELECTED CATEGORY
       ========================================================= */

  const category = videoData[topic];

  titleElement.textContent = category.title;

  descriptionElement.textContent = category.description;

  const showEmptyState = (heading, message) => {
    emptyLibrary.querySelector("h2").textContent = heading;
    emptyLibrary.querySelector("p").textContent = message;
    emptyLibrary.classList.add("show");
  };

  const renderVideos = (videos) => {
    library.replaceChildren();
    if (!videos.length) {
      showEmptyState("No Videos Yet", "Videos for this category will be added here soon.");
      return;
    }

    emptyLibrary.classList.remove("show");
    videos.forEach((video, index) => {
      const card = document.createElement("article");
      card.className = "library-card";

      const wrapper = document.createElement("div");
      wrapper.className = "library-video-wrapper";
      const player = document.createElement("video");
      player.className = "library-video";
      player.src = video.src;
      player.controls = true;
      player.playsInline = true;
      player.preload = "metadata";
      player.setAttribute("controlsList", "nodownload");
      wrapper.append(player);

      const info = document.createElement("div");
      info.className = "library-card-info";
      const number = document.createElement("span");
      number.className = "library-card-number";
      number.textContent = String(index + 1).padStart(2, "0");
      const title = document.createElement("h2");
      title.className = "library-card-title";
      title.textContent = video.title;
      const description = document.createElement("p");
      description.className = "library-card-description";
      description.textContent = video.description || "";
      info.append(number, title, description);
      card.append(wrapper, info);
      library.append(card);
    });

    const allVideos = library.querySelectorAll("video");
    allVideos.forEach((video) => {
      video.addEventListener("play", () => {
        allVideos.forEach((otherVideo) => {
          if (otherVideo !== video && !otherVideo.paused) otherVideo.pause();
        });
      });
    });
  };

  const client = window.portfolioSupabase;
  if (!client) {
    if (category.videos.length) {
      renderVideos(category.videos);
    } else {
      showEmptyState(
        "Library Not Connected",
        "The portfolio admin has not been connected to Supabase yet.",
      );
    }
    return;
  }

  showEmptyState("Loading Videos", "Please wait while this category loads.");
  client
    .from("portfolio_items")
    .select("title, description, object_path")
    .eq("media_type", "video")
    .eq("category", topic)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .then(async ({ data, error }) => {
      if (error) throw error;
      const videos = await Promise.all(
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
      renderVideos(videos);
    })
    .catch((error) => {
      console.error("Could not load portfolio videos:", error);
      showEmptyState(
        "Unable to Load Videos",
        "Please try again later. The portfolio administrator may need to check the Supabase setup.",
      );
    });
});
