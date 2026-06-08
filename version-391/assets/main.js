(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector(".menu-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = document.body.classList.toggle("nav-open");
            toggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function activate(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                activate(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                activate(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                activate(i);
                restart();
            });
        });
        activate(0);
        restart();
    }

    function setupSearch() {
        var input = document.querySelector("[data-search-input]");
        if (!input) {
            return;
        }
        var root = document.querySelector(".searchable-list") || document;
        var items = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .rank-item"));
        input.addEventListener("input", function () {
            var query = input.value.trim().toLowerCase();
            items.forEach(function (item) {
                var text = item.textContent.toLowerCase() + " " + Array.prototype.map.call(item.attributes, function (attr) {
                    return attr.value.toLowerCase();
                }).join(" ");
                item.classList.toggle("search-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var gate = shell.querySelector(".play-gate");
            var stream = shell.getAttribute("data-stream");
            var attached = false;
            var hls = null;

            function attachAndPlay() {
                if (!video || !stream) {
                    return;
                }
                if (!attached) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = stream;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(stream);
                        hls.attachMedia(video);
                    } else {
                        video.src = stream;
                    }
                    attached = true;
                }
                shell.classList.add("is-playing");
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (gate) {
                gate.addEventListener("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    attachAndPlay();
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (!attached) {
                        attachAndPlay();
                    }
                });
            }
            shell.addEventListener("click", function (event) {
                if (event.target === shell) {
                    attachAndPlay();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupNavigation();
        setupCarousel();
        setupSearch();
        setupPlayers();
    });
})();
