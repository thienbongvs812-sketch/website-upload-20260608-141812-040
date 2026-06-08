(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var previous = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, position) {
      dot.addEventListener("click", function () {
        show(position);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }

    restart();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.sort(function (a, b) {
      return String(b).localeCompare(String(a), "zh-Hans-CN");
    });
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initCatalog() {
    var catalog = document.querySelector("[data-catalog]");
    var form = document.querySelector("[data-filter-form]");
    if (!catalog || !form) {
      return;
    }

    var cards = Array.prototype.slice.call(catalog.querySelectorAll("[data-card]"));
    var input = form.querySelector(".catalog-search");
    var selects = Array.prototype.slice.call(form.querySelectorAll(".catalog-select"));
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    ["region", "type", "year"].forEach(function (key) {
      var select = form.querySelector('[data-filter-key="' + key + '"]');
      var values = [];
      cards.forEach(function (card) {
        var value = card.getAttribute("data-" + key) || "";
        if (value && values.indexOf(value) === -1) {
          values.push(value);
        }
      });
      fillSelect(select, values);
    });

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var filters = {};
      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter-key")] = select.value;
      });

      var visible = 0;
      cards.forEach(function (card) {
        var matchKeyword = !keyword || (card.getAttribute("data-search") || "").indexOf(keyword) !== -1;
        var matchSelects = Object.keys(filters).every(function (key) {
          return !filters[key] || card.getAttribute("data-" + key) === filters[key];
        });
        var matched = matchKeyword && matchSelects;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", applyFilter);
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });
    applyFilter();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-player-cover]");
      var message = player.querySelector("[data-player-message]");
      var loaded = false;
      var hlsInstance = null;

      if (!video || !cover) {
        return;
      }

      function showMessage() {
        if (message) {
          message.hidden = false;
        }
      }

      function loadVideo() {
        if (loaded) {
          return Promise.resolve();
        }
        var url = video.getAttribute("data-video-url");
        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage();
            }
          });
          return new Promise(function (resolve) {
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            window.setTimeout(resolve, 900);
          });
        }

        video.src = url;
        return Promise.resolve();
      }

      function playVideo() {
        loadVideo().then(function () {
          cover.classList.add("is-hidden");
          var attempt = video.play();
          if (attempt && typeof attempt.catch === "function") {
            attempt.catch(function () {
              cover.classList.remove("is-hidden");
            });
          }
        });
      }

      cover.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener("play", function () {
        cover.classList.add("is-hidden");
      });
      video.addEventListener("error", showMessage);
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initCatalog();
    initPlayers();
  });
})();
