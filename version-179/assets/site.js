(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (toggle && menu) {
      toggle.addEventListener('click', function () {
        menu.classList.toggle('open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }
      show(0);
      restart();
    }

    document.querySelectorAll('[data-scroll-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-scroll-target');
        var direction = button.getAttribute('data-direction') === 'left' ? -1 : 1;
        var target = document.getElementById(targetId);
        if (target) {
          target.scrollBy({ left: direction * 420, behavior: 'smooth' });
        }
      });
    });

    var tabButtons = Array.prototype.slice.call(document.querySelectorAll('[data-tab-target]'));
    var tabPanels = Array.prototype.slice.call(document.querySelectorAll('[data-tab-panel]'));
    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.getAttribute('data-tab-target');
        tabButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        tabPanels.forEach(function (panel) {
          panel.classList.toggle('active', panel.getAttribute('data-tab-panel') === target);
        });
      });
    });

    var filterGrid = document.querySelector('.filter-grid');
    if (filterGrid) {
      var keywordInput = document.querySelector('[data-filter-keyword]');
      var yearSelect = document.querySelector('[data-filter-year]');
      var typeSelect = document.querySelector('[data-filter-type]');
      var categorySelect = document.querySelector('[data-filter-category]');
      var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('[data-movie-card]'));

      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = normalize(yearSelect && yearSelect.value);
        var type = normalize(typeSelect && typeSelect.value);
        var category = normalize(categorySelect && categorySelect.value);

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-search'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (category && cardCategory !== category) {
            matched = false;
          }
          card.classList.toggle('is-hidden', !matched);
        });
      }

      [keywordInput, yearSelect, typeSelect, categorySelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
    }

    document.querySelectorAll('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('[data-player-video]');
      var button = shell.querySelector('[data-player-button]');
      var loaded = false;
      var hlsInstance = null;

      function loadVideo() {
        if (!video || loaded) {
          return;
        }
        var src = video.getAttribute('data-src');
        if (!src) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          loaded = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal || !hlsInstance) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              hlsInstance.destroy();
            }
          });
          loaded = true;
        }
      }

      function playVideo() {
        loadVideo();
        shell.classList.add('is-playing');
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
          }
        }
      }

      shell.addEventListener('click', function (event) {
        if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
          return;
        }
        playVideo();
      });
      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          playVideo();
        });
      }
      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('emptied', function () {
          if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
          }
          loaded = false;
        });
      }
    });
  });
})();
