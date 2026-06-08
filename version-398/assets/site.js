(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restartHero() {
      if (!slides.length) {
        return;
      }
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
        restartHero();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
        restartHero();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        restartHero();
      });
    });

    restartHero();

    Array.prototype.slice.call(document.querySelectorAll(".movie-filter")).forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var sort = panel.querySelector("[data-filter-sort]");
      var type = panel.querySelector("[data-filter-type]");
      var target = panel.parentElement.querySelector(".filter-target");
      var cards = target ? Array.prototype.slice.call(target.querySelectorAll(".movie-card")) : [];

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var typeValue = type ? type.value : "";

        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" ").toLowerCase();
          var matchedQuery = !query || text.indexOf(query) !== -1;
          var matchedType = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
          card.classList.toggle("is-filter-hidden", !(matchedQuery && matchedType));
        });
      }

      function applySort() {
        if (!target || !sort) {
          return;
        }
        var direction = sort.value;
        cards.sort(function (a, b) {
          var yearA = Number(a.getAttribute("data-year")) || 0;
          var yearB = Number(b.getAttribute("data-year")) || 0;
          return direction === "asc" ? yearA - yearB : yearB - yearA;
        });
        cards.forEach(function (card) {
          target.appendChild(card);
        });
        applyFilter();
      }

      if (input) {
        input.addEventListener("input", applyFilter);
      }

      if (type) {
        type.addEventListener("change", applyFilter);
      }

      if (sort) {
        sort.addEventListener("change", applySort);
      }

      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input) {
        input.value = q;
        applyFilter();
      }
    });

    Array.prototype.slice.call(document.querySelectorAll(".player-card")).forEach(function (card) {
      var video = card.querySelector("video");
      var source = video ? video.querySelector("source") : null;
      var overlay = card.querySelector(".player-overlay");
      var hls = null;
      var initialized = false;

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      }

      function preparePlayer() {
        if (!video || !source || initialized) {
          return;
        }
        initialized = true;
        var url = source.getAttribute("src");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
      }

      function startPlayer() {
        preparePlayer();
        hideOverlay();
        if (video) {
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {});
          }
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayer);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            startPlayer();
          }
        });
        video.addEventListener("play", hideOverlay);
        video.addEventListener("error", function () {
          if (hls && window.Hls) {
            hls.recoverMediaError();
          }
        });
      }
    });
  });
})();
