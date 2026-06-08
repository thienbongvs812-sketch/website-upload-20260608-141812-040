(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  if (slides.length > 1) {
    var index = 0;
    var showSlide = function (next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });
    setInterval(function () {
      showSlide(index + 1);
    }, 5000);
  }

  var getText = function (element) {
    return (element.getAttribute('data-search') || element.textContent || '').toLowerCase();
  };

  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };

  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
  lists.forEach(function (list) {
    var scope = list.closest('.container') || document;
    var input = scope.querySelector('.page-filter-input');
    var yearFilter = scope.querySelector('.year-filter');
    var categoryFilter = scope.querySelector('.category-filter');
    var sortFilter = scope.querySelector('.sort-filter');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .wide-card'));
    var empty = list.querySelector('.empty-state');
    cards.forEach(function (card, i) {
      card.setAttribute('data-default-order', i.toString());
    });
    if (yearFilter) {
      var years = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      }).filter(Boolean))).sort(function (a, b) {
        return parseInt(b, 10) - parseInt(a, 10);
      });
      years.forEach(function (year) {
        var option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
      });
    }
    var apply = function () {
      var query = normalize(input ? input.value : '');
      var selectedYear = yearFilter ? yearFilter.value : '';
      var selectedCategory = categoryFilter ? categoryFilter.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var matchesQuery = !query || getText(card).indexOf(query) !== -1;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        var matchesCategory = !selectedCategory || card.getAttribute('data-category') === selectedCategory;
        var show = matchesQuery && matchesYear && matchesCategory;
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
      if (sortFilter) {
        var sorted = cards.slice().sort(function (a, b) {
          var mode = sortFilter.value;
          if (mode === 'year-desc') {
            return parseInt(b.getAttribute('data-year') || '0', 10) - parseInt(a.getAttribute('data-year') || '0', 10);
          }
          if (mode === 'year-asc') {
            return parseInt(a.getAttribute('data-year') || '0', 10) - parseInt(b.getAttribute('data-year') || '0', 10);
          }
          if (mode === 'title') {
            return getText(a).localeCompare(getText(b), 'zh-Hans-CN');
          }
          return parseInt(a.getAttribute('data-default-order') || '0', 10) - parseInt(b.getAttribute('data-default-order') || '0', 10);
        });
        var target = list.querySelector('.movie-grid') || list;
        sorted.forEach(function (card) {
          target.appendChild(card);
        });
      }
    };
    [input, yearFilter, categoryFilter, sortFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q');
    if (queryValue && input) {
      input.value = queryValue;
    }
    apply();
  });

  Array.prototype.slice.call(document.querySelectorAll('.player-card')).forEach(function (card) {
    var video = card.querySelector('video');
    var button = card.querySelector('.player-overlay');
    var source = card.getAttribute('data-player-source');
    var started = false;
    var start = function () {
      if (!video || !source) {
        return;
      }
      if (!started) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        started = true;
      }
      if (button) {
        button.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', start);
    }
    card.addEventListener('click', function (event) {
      if (event.target === card) {
        start();
      }
    });
  });
})();
