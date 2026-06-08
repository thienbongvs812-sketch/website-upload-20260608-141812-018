(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function loadLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }

  window.initMoviePlayer = function (videoId, overlayId, stream) {
    ready(function () {
      var video = document.getElementById(videoId);
      var overlay = document.getElementById(overlayId);
      if (!video || !stream) {
        return;
      }
      function bind() {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }
        loadLibrary(function () {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({ enableWorker: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
        });
      }
      function start() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === "function") {
          play.catch(function () {
            video.controls = true;
          });
        }
      }
      bind();
      if (overlay) {
        overlay.addEventListener("click", start);
      }
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  };
})();
