(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var links = document.querySelector("[data-nav-links]");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        links.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          stop();
          show(index);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    }

    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-filter-select]");
    var areas = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]"));

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyQueryFromUrl() {
      if (!input || !input.hasAttribute("data-url-query")) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var key = input.getAttribute("data-url-query");
      var value = params.get(key);
      if (value) {
        input.value = value;
      }
    }

    function filterCards() {
      var q = normalize(input ? input.value : "");
      var s = normalize(select ? select.value : "");

      areas.forEach(function (area) {
        var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.textContent);
          var matched = (!q || text.indexOf(q) !== -1) && (!s || text.indexOf(s) !== -1);
          card.classList.toggle("is-hidden", !matched);
        });
      });
    }

    applyQueryFromUrl();

    if (input) {
      input.addEventListener("input", filterCards);
    }

    if (select) {
      select.addEventListener("change", filterCards);
    }

    filterCards();
  });
})();
