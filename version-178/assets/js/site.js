(function () {
  var header = document.getElementById("siteHeader");
  var menuToggle = document.getElementById("menuToggle");
  var mobileNav = document.getElementById("mobileNav");

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 48) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (menuToggle && mobileNav && header) {
    menuToggle.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("show");
      header.classList.toggle("open", opened);
      document.body.classList.toggle("menu-open", opened);
      menuToggle.textContent = opened ? "×" : "☰";
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener("mouseenter", function () {
        show(Number(thumb.getAttribute("data-hero-thumb")) || 0);
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  var filterForm = document.querySelector("[data-filter-form]");
  var filterList = document.querySelector("[data-filter-list]");
  if (filterForm && filterList) {
    var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-movie-card]"));
    var params = new URLSearchParams(window.location.search);
    var qInput = filterForm.querySelector("[name='q']");
    var categoryInput = filterForm.querySelector("[name='category']");
    var yearInput = filterForm.querySelector("[name='year']");

    if (qInput && params.get("q")) {
      qInput.value = params.get("q");
    }
    if (categoryInput && params.get("category")) {
      categoryInput.value = params.get("category");
    }
    if (yearInput && params.get("year")) {
      yearInput.value = params.get("year");
    }

    function applyFilter() {
      var q = qInput ? qInput.value.trim().toLowerCase() : "";
      var category = categoryInput ? categoryInput.value : "";
      var year = yearInput ? yearInput.value : "";
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var cardCategory = card.getAttribute("data-category") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matched = true;
        if (q && text.indexOf(q) === -1) {
          matched = false;
        }
        if (category && cardCategory !== category) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        card.classList.toggle("is-hidden", !matched);
      });
    }

    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    [qInput, categoryInput, yearInput].forEach(function (input) {
      if (input) {
        input.addEventListener("input", applyFilter);
        input.addEventListener("change", applyFilter);
      }
    });

    applyFilter();
  }
})();
