(function () {
    const button = document.querySelector('[data-menu-button]');
    const nav = document.querySelector('[data-mobile-nav]');
    if (button && nav) {
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    if (slides.length > 1) {
        let active = 0;
        const show = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(active + 1);
        }, 5200);
    }

    const filterForm = document.querySelector('[data-filter-form]');
    if (filterForm) {
        const input = filterForm.querySelector('[name="q"]');
        const year = filterForm.querySelector('[name="year"]');
        const region = filterForm.querySelector('[name="region"]');
        const cards = Array.from(document.querySelectorAll('[data-title]'));
        const empty = document.querySelector('[data-empty-tip]');
        const run = function () {
            const q = (input && input.value || '').trim().toLowerCase();
            const y = year && year.value || '';
            const r = region && region.value || '';
            let visible = 0;
            cards.forEach(function (card) {
                const hay = (card.dataset.title + ' ' + card.dataset.tags + ' ' + card.dataset.year + ' ' + card.dataset.region).toLowerCase();
                const ok = (!q || hay.includes(q)) && (!y || card.dataset.year === y) && (!r || card.dataset.region === r);
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        };
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            run();
        });
        filterForm.addEventListener('input', run);
        filterForm.addEventListener('change', run);
        run();
    }
}());

function initStaticMoviePlayer(sourceUrl, videoId, overlayId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);
    if (!video || !sourceUrl) {
        return;
    }

    const attachSource = function () {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            return;
        }
        video.src = sourceUrl;
    };

    attachSource();

    const start = function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
}
