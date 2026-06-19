
(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var backTop = document.querySelector('[data-back-top]');

    if (backTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 420) {
                backTop.classList.add('is-visible');
            } else {
                backTop.classList.remove('is-visible');
            }
        });

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')));
                startTimer();
            });
        });

        startTimer();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.data-card'));
    var count = document.querySelector('[data-filter-count]');

    function updateCount(visible, total) {
        if (count) {
            count.textContent = '当前显示 ' + visible + ' / ' + total + ' 条内容';
        }
    }

    function filterCards(query) {
        var keyword = (query || '').trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-year'),
                card.getAttribute('data-region'),
                card.getAttribute('data-type'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var match = !keyword || haystack.indexOf(keyword) !== -1;
            card.style.display = match ? '' : 'none';
            if (match) {
                visible += 1;
            }
        });

        updateCount(visible, cards.length);
    }

    if (cards.length) {
        updateCount(cards.length, cards.length);
    }

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            filterCards(searchInput.value);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (button) {
        button.addEventListener('click', function () {
            var value = button.getAttribute('data-filter') || '';
            if (searchInput) {
                searchInput.value = value;
            }
            filterCards(value);
        });
    });

    function setupPlayer() {
        var video = document.querySelector('.js-video-player');
        var start = document.querySelector('[data-player-start]');

        if (!video || !start) {
            return;
        }

        var source = video.getAttribute('data-src');
        var initialized = false;

        function initializeAndPlay() {
            if (!source) {
                return;
            }

            if (!initialized) {
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                initialized = true;
            }

            start.classList.add('is-hidden');
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    start.classList.remove('is-hidden');
                });
            }
        }

        start.addEventListener('click', initializeAndPlay);
        video.addEventListener('play', function () {
            start.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (!video.ended) {
                start.classList.remove('is-hidden');
            }
        });
    }

    setupPlayer();
})();
