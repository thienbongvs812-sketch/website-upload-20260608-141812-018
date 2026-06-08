(function () {
    function initMoviePlayer(source) {
        const shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        const video = shell.querySelector("video");
        const cover = shell.querySelector(".player-cover");
        const button = shell.querySelector(".player-start");
        if (!video || !source) {
            return;
        }
        let initialized = false;
        let hls = null;

        function load() {
            if (!initialized) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
                    hls = new globalThis.Hls({
                        lowLatencyMode: true,
                        enableWorker: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
                initialized = true;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            const playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", load);
        }
        if (cover) {
            cover.addEventListener("click", load);
        }
        video.addEventListener("click", function () {
            if (!initialized) {
                load();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    }

    globalThis.initMoviePlayer = initMoviePlayer;
}());
