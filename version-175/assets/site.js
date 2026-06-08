document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

  if (slides.length > 1) {
    var current = 0;
    var activate = function (index) {
      current = index % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
      });
    });

    window.setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  var root = document.querySelector('[data-search-page]');
  if (!root || !window.SEARCH_DATA) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var query = (params.get('q') || '').trim();
  var input = root.querySelector('[name="q"]');
  var output = root.querySelector('[data-search-results]');
  var heading = root.querySelector('[data-search-heading]');

  if (input) {
    input.value = query;
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase();
  };

  var makeCard = function (item) {
    var tags = item.tags.slice(0, 3).map(function (tag) {
      return '<span class="tag">' + tag + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="movies/' + item.id + '.html">',
      '  <div class="poster-frame">',
      '    <img src="' + item.cover + '.jpg" alt="' + item.title + '" loading="lazy" onerror="this.style.opacity=\'0\'">',
      '    <span class="play-chip">' + item.duration + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h2 class="movie-title">' + item.title + '</h2>',
      '    <div class="movie-meta"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>',
      '    <p class="movie-desc">' + item.desc + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  };

  var results = window.SEARCH_DATA;
  if (query) {
    var q = normalize(query);
    results = window.SEARCH_DATA.filter(function (item) {
      return normalize(item.title).indexOf(q) !== -1 ||
        normalize(item.desc).indexOf(q) !== -1 ||
        normalize(item.genre).indexOf(q) !== -1 ||
        normalize(item.region).indexOf(q) !== -1 ||
        normalize(item.type).indexOf(q) !== -1 ||
        normalize(item.tags.join(' ')).indexOf(q) !== -1;
    });
  }

  if (heading) {
    heading.textContent = query ? '搜索：' + query : '热门内容搜索';
  }

  if (!output) {
    return;
  }

  if (!results.length) {
    output.innerHTML = '<div class="empty-state">没有找到匹配内容</div>';
    return;
  }

  var limited = results.slice(0, 120);
  output.innerHTML = '<div class="card-grid">' + limited.map(makeCard).join('') + '</div>';

  if (results.length > limited.length) {
    output.insertAdjacentHTML('beforeend', '<p class="pagination-note">已显示前 ' + limited.length + ' 条匹配内容</p>');
  }
});
