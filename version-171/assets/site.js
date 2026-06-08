(function() {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    const button = document.querySelector(".mobile-menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function() {
      const open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    const slider = document.querySelector(".js-hero-slider");
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupLocalFilter() {
    const grid = document.querySelector("[data-filter-grid]");
    const search = document.querySelector(".local-search");
    const year = document.querySelector(".year-filter");
    if (!grid || (!search && !year)) {
      return;
    }
    const items = Array.from(grid.children);

    function apply() {
      const query = search ? search.value.trim().toLowerCase() : "";
      const selectedYear = year ? year.value : "";
      items.forEach(function(item) {
        const text = [
          item.getAttribute("data-title"),
          item.getAttribute("data-tags"),
          item.getAttribute("data-region"),
          item.getAttribute("data-genre")
        ].join(" ").toLowerCase();
        const itemYear = item.getAttribute("data-year") || "";
        const visible = (!query || text.indexOf(query) !== -1) && (!selectedYear || itemYear === selectedYear);
        item.classList.toggle("is-filtered-out", !visible);
      });
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    apply();
  }

  ready(function() {
    setupMobileMenu();
    setupHero();
    setupLocalFilter();
  });
})();
