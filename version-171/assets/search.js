(function() {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function card(movie) {
    const tags = movie.tags.slice(0, 3).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return [
      "<article class=\"movie-card\">",
      "<a class=\"movie-cover-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" class=\"movie-cover\" loading=\"lazy\" onerror=\"this.style.opacity='0';\">",
      "<span class=\"movie-score\">" + escapeHtml(movie.rating) + "</span>",
      "<span class=\"movie-play\">▶</span>",
      "</a>",
      "<div class=\"movie-card-body\">",
      "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
      "<p>" + escapeHtml(movie.summary) + "</p>",
      "<div class=\"tag-row\">" + tags + "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  const params = new URLSearchParams(window.location.search);
  const keyword = params.get("q") || "";
  const input = document.getElementById("search-page-input");
  const results = document.getElementById("search-results");
  const title = document.getElementById("search-result-title");
  const desc = document.getElementById("search-result-desc");
  if (!input || !results || !Array.isArray(window.SEARCH_MOVIES || SEARCH_MOVIES)) {
    return;
  }
  input.value = keyword;
  if (!keyword.trim()) {
    return;
  }
  const query = normalize(keyword.trim());
  const found = SEARCH_MOVIES.filter(function(movie) {
    const text = [movie.title, movie.region, movie.type, movie.genre, movie.category, movie.tags.join(" "), movie.summary, movie.year].join(" ");
    return normalize(text).indexOf(query) !== -1;
  }).slice(0, 120);
  title.textContent = "搜索结果";
  desc.textContent = found.length ? "已为你匹配相关影片，点击卡片进入详情播放。" : "没有找到完全匹配的影片，可以换一个关键词继续搜索。";
  results.innerHTML = found.map(card).join("");
})();
