(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function initMenu() {
        var button = qs('[data-menu-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
            button.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function initHero() {
        var slider = qs('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = qsa('[data-hero-slide]', slider);
        var dots = qsa('[data-hero-dot]', slider);
        var prev = qs('[data-hero-prev]', slider);
        var next = qs('[data-hero-next]', slider);
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function movieCard(movie) {
        return [
            '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
            '    <div class="poster">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
            '        <span class="play-chip">▶</span>',
            '    </div>',
            '    <div class="card-body">',
            '        <h3 class="card-title">' + escapeHtml(movie.title) + '</h3>',
            '        <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="card-meta">',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '            <span>' + escapeHtml(movie.region) + '</span>',
            '            <span>' + escapeHtml(movie.type) + '</span>',
            '        </div>',
            '    </div>',
            '</a>'
        ].join('');
    }

    function initSearchPage() {
        var input = qs('#searchInput');
        var results = qs('#searchResults');
        var empty = qs('#searchEmpty');
        if (!input || !results || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        input.value = query;

        function render() {
            var keyword = input.value.trim().toLowerCase();
            var list = window.MOVIE_SEARCH_DATA;
            var filtered = keyword ? list.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.oneLine,
                    movie.category,
                    movie.region,
                    movie.type,
                    movie.year,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();
                return haystack.indexOf(keyword) !== -1;
            }) : list.slice(0, 96);
            var showList = filtered.slice(0, 120);
            results.innerHTML = showList.map(movieCard).join('');
            if (empty) {
                empty.classList.toggle('is-visible', filtered.length === 0);
            }
        }

        input.addEventListener('input', render);
        var form = input.closest('form');
        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                var value = input.value.trim();
                var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
                window.history.replaceState(null, '', url);
                render();
            });
        }
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initSearchPage();
    });
}());
