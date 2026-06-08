(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function readQuery() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function applyFilters() {
    var keyword = normalize(searchInput ? searchInput.value : '');
    var category = normalize(categorySelect ? categorySelect.value : '');
    var year = normalize(yearSelect ? yearSelect.value : '');

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-category'),
        card.getAttribute('data-keywords'),
        card.getAttribute('data-year')
      ].join(' '));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) >= 0;
      var matchesCategory = !category || normalize(card.getAttribute('data-category')) === category;
      var matchesYear = !year || normalize(card.getAttribute('data-year')) === year;

      card.style.display = matchesKeyword && matchesCategory && matchesYear ? '' : 'none';
    });
  }

  if (searchInput) {
    var initialQuery = readQuery();

    if (initialQuery) {
      searchInput.value = initialQuery;
    }

    searchInput.addEventListener('input', applyFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', applyFilters);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }

  if (searchInput || categorySelect || yearSelect) {
    applyFilters();
  }
})();
