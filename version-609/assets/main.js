(function () {
  const header = document.querySelector('[data-header]');
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
      mobileToggle.textContent = mobilePanel.classList.contains('open') ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(input.value.trim());
    });
  });

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const previous = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  const grid = document.querySelector('[data-movie-grid]');
  const searchInput = document.querySelector('[data-card-search]');
  const filters = Array.from(document.querySelectorAll('[data-card-filter]'));

  if (grid && (searchInput || filters.length)) {
    const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && searchInput) {
      searchInput.value = query;
    }

    function includesValue(actual, expected) {
      return !expected || String(actual || '').toLowerCase().includes(expected.toLowerCase());
    }

    function applyFilters() {
      const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const textMatch = !keyword || String(card.dataset.filter || '').toLowerCase().includes(keyword);
        const filterMatch = filters.every(function (filter) {
          const field = filter.dataset.filterField;
          return includesValue(card.dataset[field], filter.value.trim());
        });
        card.classList.toggle('hidden-by-filter', !(textMatch && filterMatch));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    filters.forEach(function (filter) {
      filter.addEventListener('change', applyFilters);
    });

    applyFilters();
  }
})();
