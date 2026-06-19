(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            siteNav.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle("active", itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle("active", itemIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener("click", function () {
                showSlide(itemIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function (form) {
        var scope = form.closest("[data-filter-scope]") || document;
        var qInput = form.querySelector("[data-filter-q]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var typeSelect = form.querySelector("[data-filter-type]");
        var empty = scope.querySelector("[data-empty]");
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

        function applyFilter() {
            var q = qInput ? qInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var search = card.getAttribute("data-search") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = true;

                if (q && search.indexOf(q) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [qInput, yearSelect, typeSelect].forEach(function (node) {
            if (node) {
                node.addEventListener("input", applyFilter);
                node.addEventListener("change", applyFilter);
            }
        });
    });

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
        window.addEventListener("scroll", function () {
            backTop.classList.toggle("show", window.scrollY > 420);
        });
        backTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();
