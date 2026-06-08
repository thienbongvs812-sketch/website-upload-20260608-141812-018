import { H as Hls } from './video-vendor-dru42stk.js';

const root = document.documentElement.dataset.root || '';

function ready(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

function initImageFallbacks() {
    document.querySelectorAll('img').forEach((image) => {
        image.addEventListener('error', () => {
            image.classList.add('image-missing');
        });
    });
}

function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const panel = document.querySelector('.mobile-panel');

    if (!toggle || !panel) {
        return;
    }

    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isOpen));
        panel.hidden = isOpen;
        document.body.classList.toggle('no-scroll', !isOpen);
    });

    panel.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            toggle.setAttribute('aria-expanded', 'false');
            panel.hidden = true;
            document.body.classList.remove('no-scroll');
        });
    });
}

function initSearchForms() {
    document.querySelectorAll('.site-search-form').forEach((form) => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = form.querySelector('input[name="q"]');
            const query = input ? input.value.trim() : '';
            const target = `${root}search.html${query ? `?q=${encodeURIComponent(query)}` : ''}`;
            window.location.href = target;
        });
    });
}

function initHeroCarousel() {
    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');

    if (slides.length <= 1) {
        return;
    }

    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(() => show(current + 1), 5000);
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            show(Number(dot.dataset.slideTarget || 0));
            restart();
        });
    });

    prev?.addEventListener('click', () => {
        show(current - 1);
        restart();
    });

    next?.addEventListener('click', () => {
        show(current + 1);
        restart();
    });

    restart();
}

function initLocalFilters() {
    document.querySelectorAll('.filter-input').forEach((input) => {
        const grid = document.querySelector('.filter-grid');
        const empty = document.querySelector('.empty-filter-message');

        if (!grid) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll('.movie-card'));

        input.addEventListener('input', () => {
            const query = input.value.trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach((card) => {
                const haystack = (card.dataset.search || '').toLowerCase();
                const match = !query || haystack.includes(query);
                card.hidden = !match;
                if (match) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        });
    });
}

function buildSearchCard(movie) {
    const tags = (movie.tags || [])
        .slice(0, 4)
        .map((tag) => `<span>${escapeHtml(tag)}</span>`)
        .join('');

    return `
        <article class="movie-card" data-search="${escapeHtml(movie.search)}">
            <a href="${escapeHtml(movie.url)}" class="movie-link" aria-label="观看 ${escapeHtml(movie.title)}">
                <figure class="movie-cover">
                    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
                    <span class="play-mark" aria-hidden="true">▶</span>
                    <span class="category-pill">${escapeHtml(movie.category)}</span>
                    <span class="year-pill">${escapeHtml(movie.year)}</span>
                </figure>
                <div class="movie-body">
                    <h3>${escapeHtml(movie.title)}</h3>
                    <p>${escapeHtml(movie.oneLine)}</p>
                    <div class="movie-meta">
                        <span>${escapeHtml(movie.region)}</span>
                        <span>${escapeHtml(movie.type)}</span>
                        <span>${escapeHtml(movie.genre)}</span>
                    </div>
                    <div class="tag-row">${tags}</div>
                </div>
            </a>
        </article>`;
}

function initSearchPage() {
    const results = document.querySelector('.search-results');
    const summary = document.querySelector('.search-summary');
    const form = document.querySelector('.search-page-form');
    const input = form?.querySelector('input[name="q"]');

    if (!results || !window.SEARCH_MOVIES) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();

    if (input) {
        input.value = query;
    }

    if (!query) {
        results.innerHTML = '';
        if (summary) {
            summary.textContent = '请输入关键词开始搜索。';
        }
        return;
    }

    const lowerQuery = query.toLowerCase();
    const matched = window.SEARCH_MOVIES.filter((movie) => {
        return String(movie.search || '').toLowerCase().includes(lowerQuery);
    });

    results.innerHTML = matched.slice(0, 240).map(buildSearchCard).join('');
    initImageFallbacks();

    if (summary) {
        const suffix = matched.length > 240 ? '，已展示前 240 条' : '';
        summary.textContent = `关键词“${query}”找到 ${matched.length} 条结果${suffix}。`;
    }
}

function initPlayers() {
    document.querySelectorAll('.player-shell').forEach((shell) => {
        const video = shell.querySelector('video');
        const button = shell.querySelector('.player-start');
        const source = shell.dataset.src;
        let hls = null;
        let started = false;

        if (!video || !button || !source) {
            return;
        }

        function start() {
            if (started) {
                video.play().catch(() => {});
                return;
            }

            started = true;
            shell.classList.add('is-playing');

            if (Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(() => {});
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (!data.fatal) {
                        return;
                    }
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    }
                    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.addEventListener('loadedmetadata', () => {
                    video.play().catch(() => {});
                }, { once: true });
            } else {
                shell.classList.remove('is-playing');
                button.querySelector('strong').textContent = '当前浏览器不支持 HLS 播放';
                button.querySelector('small').textContent = '请更换支持 HLS 的浏览器访问';
            }
        }

        button.addEventListener('click', start);

        window.addEventListener('pagehide', () => {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

ready(() => {
    initImageFallbacks();
    initMobileMenu();
    initSearchForms();
    initHeroCarousel();
    initLocalFilters();
    initSearchPage();
    initPlayers();
});
