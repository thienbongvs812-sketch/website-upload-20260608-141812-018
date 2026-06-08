(function () {
  window.initPlayer = function (options) {
    var video = document.getElementById("moviePlayer");
    var overlay = document.getElementById("playOverlay");
    var shell = video ? video.closest(".video-shell") : null;
    var message = document.getElementById("playerMessage");
    var hls = null;
    var ready = false;
    var streamUrl = options && options.streamUrl ? options.streamUrl : "";

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text || "";
      message.classList.toggle("show", Boolean(text));
    }

    function attach() {
      if (!video || !streamUrl || ready) {
        return Promise.resolve();
      }
      ready = true;
      setMessage("正在加载");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage("");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("视频暂时无法播放，请稍后再试");
          }
        });
        return Promise.resolve();
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", function () {
          setMessage("");
        }, { once: true });
        video.addEventListener("error", function () {
          setMessage("视频暂时无法播放，请稍后再试");
        });
        return Promise.resolve();
      }
      setMessage("视频暂时无法播放，请稍后再试");
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        if (!video) {
          return;
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setMessage("点击视频继续播放");
          });
        }
      });
    }

    if (!video) {
      return;
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("playing");
      }
      setMessage("");
    });

    video.addEventListener("pause", function () {
      if (shell) {
        shell.classList.remove("playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
