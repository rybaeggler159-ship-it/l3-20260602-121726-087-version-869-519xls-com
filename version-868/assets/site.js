(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function getRoot() {
        return document.body.getAttribute("data-root") || "";
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupNavSearch() {
        var forms = document.querySelectorAll("[data-nav-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var url = getRoot() + "search.html";
                if (query) {
                    url += "?q=" + encodeURIComponent(query);
                }
                window.location.href = url;
            });
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilters() {
        var blocks = document.querySelectorAll("[data-card-search]");
        blocks.forEach(function (block) {
            var input = block.querySelector("input");
            var count = block.querySelector("[data-result-count]");
            var scope = block.parentElement;
            if (!input || !scope) {
                return;
            }
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            function apply() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.classList.toggle("hidden-by-filter", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (count) {
                    count.textContent = visible + " 条结果";
                }
            }
            input.addEventListener("input", apply);
            apply();
        });
    }

    function setupImageFallback() {
        function markMissing(target) {
            if (target && target.tagName === "IMG") {
                target.classList.add("is-missing");
                target.removeAttribute("src");
            }
        }

        document.addEventListener("error", function (event) {
            markMissing(event.target);
        }, true);

        document.querySelectorAll("img").forEach(function (image) {
            if (image.complete && image.naturalWidth === 0) {
                markMissing(image);
            }
        });
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (wrap) {
            var video = wrap.querySelector("video");
            var button = wrap.querySelector("[data-play-button]");
            var message = wrap.querySelector("[data-player-message]");
            var source = wrap.getAttribute("data-src") || "";
            var loaded = false;
            var hls = null;

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function loadAndPlay() {
                if (!video || !source) {
                    setMessage("当前影片没有可用播放源。");
                    return;
                }

                if (!loaded) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                        loaded = true;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                        loaded = true;
                    } else {
                        video.src = source;
                        loaded = true;
                        setMessage("浏览器可能不支持 HLS，建议使用支持 HLS 的浏览器访问。");
                    }
                }

                if (button) {
                    button.classList.add("hidden");
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setMessage("播放器已加载，请再次点击视频播放按钮。");
                    });
                }
            }

            if (button) {
                button.addEventListener("click", loadAndPlay);
            }
            if (video) {
                video.addEventListener("play", function () {
                    if (button) {
                        button.classList.add("hidden");
                    }
                });
                video.addEventListener("error", function () {
                    setMessage("播放源加载失败，请稍后重试。");
                    if (hls) {
                        hls.destroy();
                    }
                });
            }
        });
    }

    function createResultCard(movie) {
        var root = getRoot();
        var tags = [movie.region, movie.type, movie.year].concat(movie.genres || []).slice(0, 4);
        return [
            '<article class="movie-card" data-movie-card>',
            '    <a class="poster-frame" href="' + root + movie.url + '">',
            '        <img src="' + root + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '        <span class="poster-play">▶</span>',
            '    </a>',
            '    <div class="movie-card-body">',
            '        <div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + movie.year + '</span></div>',
            '        <h3><a href="' + root + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '        <p>' + escapeHtml(movie.oneLine || "") + '</p>',
            '        <div class="chip-row">' + tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join("") + '</div>',
            '    </div>',
            '</article>'
        ].join("\n");
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-input]");
        var button = document.querySelector("[data-search-button]");
        var results = document.querySelector("[data-search-results]");
        var hint = document.querySelector("[data-search-hint]");
        var data = window.MOVIE_INDEX || [];
        if (!input || !results) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var query = input.value.trim().toLowerCase();
            var list = data.filter(function (movie) {
                if (!query) {
                    return true;
                }
                var haystack = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine
                ].join(" ").toLowerCase();
                return haystack.indexOf(query) !== -1;
            }).slice(0, 120);

            results.innerHTML = list.map(createResultCard).join("\n");
            if (hint) {
                hint.textContent = query
                    ? "找到 " + list.length + " 条结果，最多显示前 120 条。"
                    : "当前展示全站推荐结果，输入关键词可缩小范围。";
            }
        }

        input.addEventListener("input", render);
        if (button) {
            button.addEventListener("click", render);
        }
        render();
    }

    ready(function () {
        setupMobileMenu();
        setupNavSearch();
        setupHero();
        setupLocalFilters();
        setupImageFallback();
        setupPlayers();
        setupSearchPage();
    });
})();
