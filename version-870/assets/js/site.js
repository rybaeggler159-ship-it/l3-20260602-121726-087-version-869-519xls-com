(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var value = input ? input.value.trim() : '';
        var target = './movies.html';

        if (value) {
          target += '?q=' + encodeURIComponent(value);
        }

        window.location.href = target;
      });
    });

    var searchInput = document.querySelector('[data-movie-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list] .movie-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
    var activeCategory = 'all';

    function normalize(value) {
      return String(value || '').toLowerCase();
    }

    function applyMovieFilter() {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(searchInput ? searchInput.value : '');

      cards.forEach(function (card) {
        var category = card.getAttribute('data-category') || '';
        var haystack = normalize(card.getAttribute('data-meta') || card.textContent);
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchCategory = activeCategory === 'all' || category === activeCategory;
        card.classList.toggle('is-hidden', !(matchKeyword && matchCategory));
      });
    }

    if (searchInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query) {
        searchInput.value = query;
      }

      searchInput.addEventListener('input', applyMovieFilter);
      applyMovieFilter();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        activeCategory = chip.getAttribute('data-filter-category') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        applyMovieFilter();
      });
    });

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
      var prev = carousel.querySelector('[data-hero-prev]');
      var next = carousel.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

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

      function startCarousel() {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5000);
      }

      function restartCarousel() {
        if (timer) {
          window.clearInterval(timer);
        }
        startCarousel();
      }

      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(current - 1);
          restartCarousel();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          showSlide(current + 1);
          restartCarousel();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
          restartCarousel();
        });
      });

      showSlide(0);
      startCarousel();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var source = player.getAttribute('data-src');
      var hlsInstance = null;
      var loaded = false;

      function loadAndPlay() {
        if (!video || !source) {
          return;
        }

        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else {
            video.src = source;
          }

          loaded = true;
        }

        if (button) {
          button.classList.add('hidden');
        }

        video.controls = true;
        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          loadAndPlay();
        });
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!loaded) {
            loadAndPlay();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
