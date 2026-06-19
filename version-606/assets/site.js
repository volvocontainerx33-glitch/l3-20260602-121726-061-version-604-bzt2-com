
import { H as Hls } from './hls-vendor-dru42stk.js';

function setupMobileNav() {
    const button = document.querySelector('[data-mobile-toggle]');
    const nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
        return;
    }

    button.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
}

function setupHeroCarousel() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
        return;
    }

    let activeIndex = 0;

    function showSlide(index) {
        activeIndex = index;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    window.setInterval(() => {
        showSlide((activeIndex + 1) % slides.length);
    }, 5200);
}

function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
}

function setupFilters() {
    const panels = Array.from(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach((panel) => {
        const search = panel.querySelector('[data-search]');
        const year = panel.querySelector('[data-year-filter]');
        const type = panel.querySelector('[data-type-filter]');
        const count = panel.querySelector('[data-result-count]');
        const scope = panel.parentElement || document;
        const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));

        function update() {
            const query = normalizeText(search ? search.value : '');
            const selectedYear = year ? year.value : '';
            const selectedType = type ? type.value : '';
            let visible = 0;

            cards.forEach((card) => {
                const text = normalizeText(card.dataset.searchText);
                const cardYear = String(card.dataset.year || '');
                const cardType = String(card.dataset.type || '');
                const matchesQuery = !query || text.includes(query);
                const matchesYear = !selectedYear || cardYear.includes(selectedYear);
                const matchesType = !selectedType || cardType.includes(selectedType);
                const isVisible = matchesQuery && matchesYear && matchesType;

                card.classList.toggle('is-hidden', !isVisible);
                if (isVisible) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [search, year, type].forEach((control) => {
            if (control) {
                control.addEventListener('input', update);
                control.addEventListener('change', update);
            }
        });

        update();
    });
}

function setupPlayers() {
    const players = Array.from(document.querySelectorAll('[data-video-url]'));

    players.forEach((video) => {
        const source = video.dataset.videoUrl;
        const card = video.closest('.player-card');
        const status = card ? card.querySelector('[data-player-status]') : null;
        const button = card ? card.querySelector('[data-play-trigger]') : null;

        if (!source) {
            if (status) {
                status.textContent = '当前影片暂无播放源';
            }
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            if (status) {
                status.textContent = '浏览器原生 HLS 已就绪';
            }
        } else if (Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (status) {
                    status.textContent = 'HLS 播放源已绑定';
                }
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (status) {
                    status.textContent = data && data.fatal ? '播放源加载异常' : '正在尝试恢复播放';
                }
            });
        } else if (status) {
            status.textContent = '当前浏览器不支持 HLS 播放';
        }

        if (button) {
            button.addEventListener('click', () => {
                video.play().catch(() => {
                    if (status) {
                        status.textContent = '请再次点击播放器开始播放';
                    }
                });
            });
        }

        video.addEventListener('play', () => {
            if (button) {
                button.classList.add('is-hidden');
            }
            if (status) {
                status.textContent = '正在播放';
            }
        });

        video.addEventListener('pause', () => {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });
    });
}

setupMobileNav();
setupHeroCarousel();
setupFilters();
setupPlayers();
