(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      if (slides.length === 0) {
        return;
      }
      var index = 0;
      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
        });
      });
      show(0);
      window.setInterval(function () {
        show(index + 1);
      }, 5000);
    });
  }

  function setupSearch() {
    document.querySelectorAll("[data-search-zone]").forEach(function (zone) {
      var input = zone.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(zone.querySelectorAll("[data-movie-card]"));
      var filters = Array.prototype.slice.call(zone.querySelectorAll("[data-filter]"));
      var empty = zone.querySelector("[data-no-results]");
      var activeField = "all";
      var activeValue = "all";
      function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
      }
      function matchCard(card, query) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags")
        ].join(" "));
        var fieldPass = true;
        if (activeField !== "all") {
          fieldPass = normalize(card.getAttribute("data-" + activeField)).indexOf(normalize(activeValue)) !== -1;
        }
        return fieldPass && haystack.indexOf(query) !== -1;
      }
      function update() {
        var query = normalize(input ? input.value : "");
        var visible = 0;
        cards.forEach(function (card) {
          var pass = matchCard(card, query);
          card.style.display = pass ? "" : "none";
          if (pass) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }
      if (input) {
        input.addEventListener("input", update);
      }
      filters.forEach(function (button) {
        button.addEventListener("click", function () {
          filters.forEach(function (item) {
            item.classList.remove("is-active");
          });
          button.classList.add("is-active");
          activeField = button.getAttribute("data-filter-field") || "all";
          activeValue = button.getAttribute("data-filter") || "all";
          update();
        });
      });
      update();
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
