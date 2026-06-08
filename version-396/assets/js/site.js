(function () {
  var yearTargets = document.querySelectorAll('[data-year]');
  yearTargets.forEach(function (target) {
    target.textContent = new Date().getFullYear();
  });

  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-dot]'));
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var index = 0;
    var timer = null;

    function render() {
      if (!track || slides.length === 0) {
        return;
      }
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
        slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function go(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      render();
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }
      stop();
      timer = window.setInterval(function () {
        go(index + 1);
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
        go(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        go(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        go(dotIndex);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    render();
    start();
  });

  document.querySelectorAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-card-search]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
    var empty = scope.querySelector('[data-empty]');
    var filterValue = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var query = normalize(input ? input.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-text'));
        var filterText = normalize(card.getAttribute('data-filter'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchFilter = filterValue === 'all' || filterText.indexOf(normalize(filterValue)) !== -1;
        var shouldShow = matchQuery && matchFilter;
        card.style.display = shouldShow ? '' : 'none';
        if (shouldShow) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        filterValue = button.getAttribute('data-filter-value') || 'all';
        apply();
      });
    });

    apply();
  });
})();
