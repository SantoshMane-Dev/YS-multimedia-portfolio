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

  /* =========================================================
       CATEGORY HAS NO VIDEOS
       ========================================================= */

  if (!category.videos || category.videos.length === 0) {
    emptyLibrary.classList.add("show");

    return;
  }

  /* =========================================================
       VIDEOS EXIST
       ========================================================= */

  emptyLibrary.classList.remove("show");

  /* =========================================================
       CREATE VIDEO CARDS
       ========================================================= */

  category.videos.forEach((video, index) => {
    const card = document.createElement("article");

    card.className = "library-card";

    const number = String(index + 1).padStart(2, "0");

    card.innerHTML = `

                <div class="library-video-wrapper">

                    <video
                        class="library-video"
                        src="${video.src}"
                        controls
                        playsinline
                        preload="metadata"
                        controlsList="nodownload"
                    ></video>

                </div>


                <div class="library-card-info">

                    <span class="library-card-number">
                        ${number}
                    </span>


                    <h2 class="library-card-title">
                        ${video.title}
                    </h2>


                    <p class="library-card-description">
                        ${video.description || ""}
                    </p>

                </div>

            `;

    library.appendChild(card);
  });

  /* =========================================================
       OPTIONAL:
       PAUSE OTHER VIDEOS WHEN ONE STARTS
       ========================================================= */

  const allVideos = library.querySelectorAll("video");

  allVideos.forEach((video) => {
    video.addEventListener("play", () => {
      allVideos.forEach((otherVideo) => {
        if (otherVideo !== video && !otherVideo.paused) {
          otherVideo.pause();
        }
      });
    });
  });
});
