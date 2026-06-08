(function () {
    window.initPlayer = function (config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var stream = config.stream;
        var loaded = false;
        var hls = null;

        if (!video || !overlay || !stream) {
            return;
        }

        function attachStream() {
            if (loaded) {
                return Promise.resolve();
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return Promise.resolve();
            }

            video.src = stream;
            return Promise.resolve();
        }

        function playVideo() {
            attachStream().then(function () {
                overlay.classList.add("hidden");
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        overlay.classList.remove("hidden");
                    });
                }
            });
        }

        overlay.addEventListener("click", playVideo);

        video.addEventListener("play", function () {
            overlay.classList.add("hidden");
        });

        video.addEventListener("pause", function () {
            if (!video.ended) {
                overlay.classList.remove("hidden");
            }
        });

        video.addEventListener("ended", function () {
            overlay.classList.remove("hidden");
        });

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
