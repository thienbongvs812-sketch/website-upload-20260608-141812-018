(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
            return;
        }
        document.addEventListener("DOMContentLoaded", callback);
    }

    function setupMenu() {
        const button = document.querySelector(".mobile-menu-button");
        const panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        document.querySelectorAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                const input = form.querySelector("input[name='q']");
                if (!input) {
                    return;
                }
                const value = input.value.trim();
                if (!value) {
                    event.preventDefault();
                    input.focus();
                    return;
                }
                event.preventDefault();
                window.location.href = "./search.html?q=" + encodeURIComponent(value);
            });
        });
    }

    function setupHero() {
        const root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        const slides = Array.from(root.querySelectorAll(".hero-slide"));
        const dots = Array.from(root.querySelectorAll(".hero-dot"));
        const prev = root.querySelector(".hero-prev");
        const next = root.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        let index = 0;
        let timer = null;

        function activate(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = setInterval(function () {
                activate(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                activate(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                activate(dotIndex);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        activate(0);
        start();
    }

    function setupCategoryFilter() {
        const input = document.querySelector("[data-category-filter]");
        const grid = document.querySelector("[data-filter-grid]");
        if (!input || !grid) {
            return;
        }
        const cards = Array.from(grid.querySelectorAll(".movie-card"));
        input.addEventListener("input", function () {
            const query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                const haystack = [
                    card.dataset.title,
                    card.dataset.type,
                    card.dataset.year,
                    card.dataset.region,
                    card.textContent
                ].join(" ").toLowerCase();
                card.hidden = query && haystack.indexOf(query) === -1;
            });
        });
    }

    function movieCard(movie) {
        const tags = movie.tags.slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a class=\"movie-poster\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"movie-duration\">" + escapeHtml(movie.duration) + "</span>",
            "<span class=\"movie-category\">" + escapeHtml(movie.category) + "</span>",
            "</a>",
            "<div class=\"movie-card-body\">",
            "<div class=\"movie-tags\">" + tags + "</div>",
            "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>",
            "<p>" + escapeHtml(movie.description) + "</p>",
            "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.rating) + " 分</span></div>",
            "</div>",
            "</article>"
        ].join("");
    }

    function setupSearchPage() {
        const input = document.getElementById("search-page-input");
        const resultRoot = document.getElementById("search-results");
        const title = document.getElementById("search-title");
        const summary = document.getElementById("search-summary");
        if (!input || !resultRoot || !window.movieCatalog) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const query = (params.get("q") || "").trim();
        input.value = query;
        const normalized = query.toLowerCase();
        const list = window.movieCatalog.filter(function (movie) {
            if (!normalized) {
                return true;
            }
            const haystack = [movie.title, movie.category, movie.year, movie.region, movie.type, movie.genre, movie.description, movie.tags.join(" ")].join(" ").toLowerCase();
            return haystack.indexOf(normalized) !== -1;
        }).slice(0, 240);
        if (title) {
            title.textContent = query ? "“" + query + "”相关影视" : "影视作品";
        }
        if (summary) {
            summary.textContent = list.length ? "点击卡片可进入详情与播放页面。" : "没有找到完全匹配的内容，可尝试更换关键词。";
        }
        resultRoot.innerHTML = list.map(movieCard).join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        setupMenu();
        setupSearchForms();
        setupHero();
        setupCategoryFilter();
        setupSearchPage();
    });
}());
