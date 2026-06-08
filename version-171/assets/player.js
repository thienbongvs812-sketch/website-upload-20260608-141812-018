(function() {
  function attach(video, source) {
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hlsInstance = hls;
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else {
      video.src = source;
    }
  }

  window.initMoviePlayer = function(source) {
    const video = document.getElementById("movie-player");
    const overlay = document.getElementById("play-overlay");
    if (!video || !source) {
      return;
    }
    attach(video, source);

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showOverlay() {
      if (overlay && video.paused) {
        overlay.classList.remove("is-hidden");
      }
    }

    function startPlayback() {
      hideOverlay();
      const playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function() {
          showOverlay();
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);
    video.addEventListener("click", function() {
      if (video.paused) {
        startPlayback();
      }
    });
  };
})();
