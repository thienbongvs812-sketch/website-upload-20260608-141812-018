(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;

        function setSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                setSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                setSlide((current + 1) % slides.length);
            }, 5000);
        }
    }

    document.querySelectorAll("[data-card-filter]").forEach(function (panel) {
        var input = panel.querySelector("input");
        var select = panel.querySelector("select");
        var grid = panel.parentElement.querySelector(".filter-grid");

        if (!input || !select || !grid) {
            return;
        }

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var year = select.value;
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

            cards.forEach(function (card) {
                var haystack = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(" ").toLowerCase();
                var yearMatch = !year || card.dataset.year === year;
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = yearMatch && keywordMatch ? "" : "none";
            });
        }

        input.addEventListener("input", applyFilter);
        select.addEventListener("change", applyFilter);
    });

    var globalInput = document.getElementById("global-search-input");
    var globalCategory = document.getElementById("global-search-category");
    var globalResults = document.getElementById("search-results");

    if (globalInput && globalCategory && globalResults && window.SearchMovies) {
        function createCard(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return [
                "<article class=\"movie-card\">",
                "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"观看" + escapeHtml(movie.title) + "\">",
                "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
                "<span class=\"play-chip\">播放</span>",
                "</a>",
                "<div class=\"movie-card-body\">",
                "<h2><a href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a></h2>",
                "<p class=\"meta-line\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>",
                "<p class=\"card-summary\">" + escapeHtml(movie.summary) + "</p>",
                "<div class=\"tag-row\">" + tags + "</div>",
                "</div>",
                "</article>"
            ].join("");
        }

        function escapeHtml(value) {
            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function renderSearch() {
            var keyword = globalInput.value.trim().toLowerCase();
            var category = globalCategory.value;
            var matched = window.SearchMovies.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.categoryName,
                    movie.tags.join(" "),
                    movie.summary
                ].join(" ").toLowerCase();
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                var categoryMatch = !category || movie.category === category;
                return keywordMatch && categoryMatch;
            }).slice(0, 120);

            globalResults.innerHTML = matched.map(createCard).join("");
        }

        globalInput.addEventListener("input", renderSearch);
        globalCategory.addEventListener("change", renderSearch);
        renderSearch();
    }
})();
