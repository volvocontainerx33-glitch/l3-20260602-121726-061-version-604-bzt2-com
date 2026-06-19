(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function bindMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      document.body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function cardText(card, key) {
    return (card.getAttribute("data-" + key) || "").toLowerCase();
  }

  function bindFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var scope = panel.closest(".filter-scope") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-card"));
      var empty = scope.querySelector("[data-empty-state]");
      var textInput = panel.querySelector("[data-filter-text]");
      var regionInput = panel.querySelector("[data-filter-region]");
      var typeInput = panel.querySelector("[data-filter-type]");
      var yearInput = panel.querySelector("[data-filter-year]");
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");

      if (q && textInput) {
        textInput.value = q;
      }

      function apply() {
        var text = textInput ? textInput.value.trim().toLowerCase() : "";
        var region = regionInput ? regionInput.value.trim().toLowerCase() : "";
        var type = typeInput ? typeInput.value.trim().toLowerCase() : "";
        var year = yearInput ? yearInput.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            cardText(card, "title"),
            cardText(card, "region"),
            cardText(card, "genre"),
            cardText(card, "year"),
            cardText(card, "type")
          ].join(" ");
          var ok = true;
          if (text && haystack.indexOf(text) === -1) {
            ok = false;
          }
          if (region && cardText(card, "region").indexOf(region) === -1) {
            ok = false;
          }
          if (type && cardText(card, "type").indexOf(type) === -1) {
            ok = false;
          }
          if (year && cardText(card, "year") !== year) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [textInput, regionInput, typeInput, yearInput].forEach(function (field) {
        if (!field) {
          return;
        }
        field.addEventListener("input", apply);
        field.addEventListener("change", apply);
      });

      apply();
    });
  }

  window.VideoSite = {
    start: function (source) {
      ready(function () {
        var video = document.getElementById("movie-player");
        var cover = document.querySelector("[data-player-cover]");
        var loaded = false;
        var stream;

        if (!video) {
          return;
        }

        function load() {
          if (loaded) {
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            stream = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            stream.loadSource(source);
            stream.attachMedia(video);
            video._stream = stream;
          } else {
            video.src = source;
          }
          loaded = true;
        }

        function play() {
          load();
          if (cover) {
            cover.classList.add("is-hidden");
          }
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        }

        if (cover) {
          cover.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
          if (!loaded || video.paused) {
            play();
          }
        });

        video.addEventListener("play", function () {
          if (cover) {
            cover.classList.add("is-hidden");
          }
        });

        window.addEventListener("beforeunload", function () {
          if (stream && stream.destroy) {
            stream.destroy();
          }
        });
      });
    }
  };

  ready(function () {
    bindMenu();
    bindHero();
    bindFilters();
  });
})();
