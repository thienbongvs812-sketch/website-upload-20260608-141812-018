(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupCarousel() {
        document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-dot]"));
            var prev = carousel.querySelector("[data-carousel-prev]");
            var next = carousel.querySelector("[data-carousel-next]");
            if (!slides.length) {
                return;
            }
            var current = 0;
            var timer = null;

            function show(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            carousel.addEventListener("mouseenter", stop);
            carousel.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function setupScrollRows() {
        document.querySelectorAll("[data-scroll-left]").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = document.getElementById(button.getAttribute("data-scroll-left"));
                if (target) {
                    target.scrollBy({ left: -420, behavior: "smooth" });
                }
            });
        });
        document.querySelectorAll("[data-scroll-right]").forEach(function (button) {
            button.addEventListener("click", function () {
                var target = document.getElementById(button.getAttribute("data-scroll-right"));
                if (target) {
                    target.scrollBy({ left: 420, behavior: "smooth" });
                }
            });
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var typeFilter = panel.querySelector("[data-type-filter]");
            var yearFilter = panel.querySelector("[data-year-filter]");
            var container = panel.parentElement || document;
            var list = container.querySelector("[data-movie-list]");
            var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]")) : [];
            var empty = container.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            if (input && query) {
                input.value = query;
            }

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function apply() {
                var term = normalize(input ? input.value : "");
                var typeValue = typeFilter ? typeFilter.value : "all";
                var yearValue = yearFilter ? yearFilter.value : "all";
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category")
                    ].join(" "));
                    var cardType = card.getAttribute("data-type") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matchesTerm = !term || haystack.indexOf(term) !== -1;
                    var matchesType = typeValue === "all" || cardType === typeValue;
                    var matchesYear = yearValue === "all" || cardYear === yearValue;
                    var show = matchesTerm && matchesType && matchesYear;
                    card.style.display = show ? "" : "none";
                    if (show) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, typeFilter, yearFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    ready(function () {
        setupMenu();
        setupCarousel();
        setupScrollRows();
        setupFilters();
    });
})();

function initMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
        return;
    }
    var started = false;
    var hlsInstance = null;

    function hideButton() {
        button.classList.add("is-hidden");
    }

    function playVideo() {
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function () {
                video.controls = true;
            });
        }
    }

    function attach() {
        if (started) {
            hideButton();
            playVideo();
            return;
        }
        started = true;
        hideButton();
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.load();
            playVideo();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                playVideo();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hlsInstance.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hlsInstance.recoverMediaError();
                } else {
                    hlsInstance.destroy();
                    hlsInstance = null;
                    video.src = source;
                    video.load();
                }
            });
        } else {
            video.src = source;
            video.load();
        }
    }

    button.addEventListener("click", attach);
    video.addEventListener("click", function () {
        if (!started || video.paused) {
            attach();
        }
    });
    video.addEventListener("play", hideButton);
    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
