(function() {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const thumbs = Array.from(hero.querySelectorAll("[data-hero-thumb]"));
    let index = 0;
    let timer = null;

    function setHero(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
      thumbs.forEach(function(thumb, thumbIndex) {
        thumb.classList.toggle("is-active", thumbIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        setHero(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        setHero(Number(dot.getAttribute("data-hero-dot") || 0));
        startTimer();
      });
    });

    thumbs.forEach(function(thumb) {
      thumb.addEventListener("click", function() {
        setHero(Number(thumb.getAttribute("data-hero-thumb") || 0));
        startTimer();
      });
    });

    setHero(0);
    startTimer();
  }

  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  const searchInput = document.querySelector("[data-search-input]");
  const yearFilter = document.querySelector("[data-year-filter]");
  const typeFilter = document.querySelector("[data-type-filter]");
  const regionFilter = document.querySelector("[data-region-filter]");
  const emptyState = document.querySelector("[data-empty-state]");

  function uniqueValues(name) {
    return Array.from(new Set(cards.map(function(card) {
      return card.getAttribute(name) || "";
    }).filter(Boolean))).sort(function(a, b) {
      if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
        return Number(b) - Number(a);
      }
      return a.localeCompare(b, "zh-Hans-CN");
    });
  }

  function fillSelect(select, name) {
    if (!select || select.options.length > 1) {
      return;
    }
    uniqueValues(name).forEach(function(value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function applyQueryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (searchInput && params.get("q")) {
      searchInput.value = params.get("q");
    }
    if (yearFilter && params.get("year")) {
      yearFilter.value = params.get("year");
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const year = yearFilter ? yearFilter.value : "";
    const type = typeFilter ? typeFilter.value : "";
    const region = regionFilter ? regionFilter.value : "";
    let visible = 0;

    cards.forEach(function(card) {
      const haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-type") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-tags") || "",
        card.getAttribute("data-year") || ""
      ].join(" ").toLowerCase();
      const matched = (!keyword || haystack.indexOf(keyword) > -1)
        && (!year || card.getAttribute("data-year") === year)
        && (!type || card.getAttribute("data-type") === type)
        && (!region || card.getAttribute("data-region") === region);

      card.classList.toggle("is-hidden", !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (cards.length) {
    fillSelect(yearFilter, "data-year");
    fillSelect(typeFilter, "data-type");
    fillSelect(regionFilter, "data-region");
    applyQueryFromUrl();
    [searchInput, yearFilter, typeFilter, regionFilter].forEach(function(control) {
      if (control) {
        control.addEventListener("input", filterCards);
        control.addEventListener("change", filterCards);
      }
    });
    filterCards();
  }
}());
