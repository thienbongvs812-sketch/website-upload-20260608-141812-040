(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        const button = document.querySelector('[data-menu-toggle]');
        const menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupScrollTop() {
        document.querySelectorAll('[data-scroll-top]').forEach(function (button) {
            button.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    function setupImageFallbacks() {
        document.querySelectorAll('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-cover-missing');
                const parent = image.closest('.movie-poster, .hero-poster, .hero-bg, .detail-backdrop, .category-preview');
                if (parent) {
                    parent.classList.add('is-cover-missing');
                }
            }, { once: true });
        });
    }

    function setupHeroCarousel() {
        const carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }

        const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }

        let currentIndex = 0;
        let timer = null;

        function activate(index) {
            currentIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, offset) {
                slide.classList.toggle('is-active', offset === currentIndex);
            });
            dots.forEach(function (dot, offset) {
                dot.classList.toggle('is-active', offset === currentIndex);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(currentIndex + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                const index = Number(dot.getAttribute('data-hero-dot')) || 0;
                activate(index);
                start();
            });
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupFilters() {
        document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
            const input = scope.querySelector('[data-search-input]');
            const selects = Array.from(scope.querySelectorAll('[data-filter-field]'));
            const resultContainer = scope.querySelector('[data-filter-results]') || document;
            const cards = Array.from(resultContainer.querySelectorAll('[data-movie-card]'));
            const counter = scope.querySelector('[data-filter-count]');
            const emptyState = scope.querySelector('[data-empty-state]') || document.querySelector('[data-empty-state]');

            function applyFilters() {
                const keyword = normalize(input ? input.value : '');
                const activeFilters = selects.map(function (select) {
                    return {
                        field: select.getAttribute('data-filter-field'),
                        value: normalize(select.value)
                    };
                }).filter(function (filter) {
                    return filter.field && filter.value;
                });

                let visibleCount = 0;

                cards.forEach(function (card) {
                    const haystack = normalize(card.getAttribute('data-title'));
                    const matchesKeyword = !keyword || haystack.includes(keyword);
                    const matchesFilters = activeFilters.every(function (filter) {
                        const value = normalize(card.getAttribute('data-' + filter.field));
                        return value === filter.value || value.includes(filter.value);
                    });
                    const visible = matchesKeyword && matchesFilters;
                    card.classList.toggle('is-hidden-by-filter', !visible);
                    if (visible) {
                        visibleCount += 1;
                    }
                });

                if (counter) {
                    counter.textContent = '当前显示 ' + visibleCount + ' / ' + cards.length + ' 部影片';
                }
                if (emptyState) {
                    emptyState.hidden = visibleCount !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', applyFilters);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilters);
            });
            applyFilters();
        });
    }

    ready(function () {
        setupMobileMenu();
        setupScrollTop();
        setupImageFallbacks();
        setupHeroCarousel();
        setupFilters();
    });
})();
