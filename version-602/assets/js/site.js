function ready(fn) {
    if (document.readyState !== "loading") {
        fn();
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var nav = document.querySelector(".nav-links");
    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var active = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
            slide.classList.toggle("is-active", idx === active);
        });
        dots.forEach(function (dot, idx) {
            dot.classList.toggle("is-active", idx === active);
        });
    }

    if (slides.length) {
        showSlide(0);
        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(active + 1);
        }, 5200);
    }

    var search = document.querySelector("#movieSearch");
    var region = document.querySelector("#regionFilter");
    var type = document.querySelector("#typeFilter");
    var year = document.querySelector("#yearFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function filterCards() {
        var q = normalize(search && search.value);
        var r = normalize(region && region.value);
        var t = normalize(type && type.value);
        var y = normalize(year && year.value);
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var cardRegion = normalize(card.getAttribute("data-region"));
            var cardType = normalize(card.getAttribute("data-type"));
            var cardYear = normalize(card.getAttribute("data-year"));
            var visible = true;
            if (q && text.indexOf(q) === -1) {
                visible = false;
            }
            if (r && cardRegion !== r) {
                visible = false;
            }
            if (t && cardType !== t) {
                visible = false;
            }
            if (y && cardYear !== y) {
                visible = false;
            }
            card.classList.toggle("hidden-card", !visible);
        });
    }

    [search, region, type, year].forEach(function (control) {
        if (control) {
            control.addEventListener("input", filterCards);
            control.addEventListener("change", filterCards);
        }
    });
});

function initMoviePlayer(videoId, buttonId, frameId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var frame = document.getElementById(frameId);
    var loaded = false;

    function attach() {
        if (!video || loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function play() {
        if (!video) {
            return;
        }
        attach();
        if (frame) {
            frame.classList.add("is-playing");
        }
        var task = video.play();
        if (task && typeof task.catch === "function") {
            task.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            play();
        });
    }
    if (frame) {
        frame.addEventListener("click", function () {
            play();
        });
    }
    if (video) {
        video.addEventListener("click", function (event) {
            event.stopPropagation();
            if (video.paused) {
                play();
            }
        });
    }
}
