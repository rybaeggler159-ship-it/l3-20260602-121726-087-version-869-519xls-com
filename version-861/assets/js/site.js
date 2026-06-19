(function () {
  var menuButton = document.querySelector('[data-menu-btn]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeSlide = 0;
  function setSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === activeSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === activeSlide);
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      setSlide(i);
    });
  });
  if (slides.length > 1) {
    setInterval(function () {
      setSlide(activeSlide + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function renderResults(box, items, term) {
    if (!box) {
      return;
    }
    if (!term) {
      box.innerHTML = '';
      box.classList.remove('open');
      return;
    }
    var html = items.slice(0, 24).map(function (item) {
      var meta = [item.year, item.region, item.type, item.genre].filter(Boolean).join(' · ');
      return '<a class="search-result-item" href="' + item.url + '"><img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '"><span><strong>' + item.title + '</strong><span>' + meta + '</span><span>' + item.summary + '</span></span></a>';
    }).join('');
    box.innerHTML = html;
    box.classList.toggle('open', Boolean(html));
  }

  var input = document.querySelector('[data-search-input]');
  var resultsBox = document.querySelector('[data-search-results]');
  if (input) {
    input.addEventListener('input', function () {
      var term = normalize(input.value);
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' '));
        card.style.display = !term || text.indexOf(term) !== -1 ? '' : 'none';
      });
      if (window.SEARCH_ITEMS && Array.isArray(window.SEARCH_ITEMS)) {
        var matched = window.SEARCH_ITEMS.filter(function (item) {
          return normalize([item.title, item.year, item.region, item.type, item.genre, item.summary].join(' ')).indexOf(term) !== -1;
        });
        renderResults(resultsBox, matched, term);
      }
    });
    document.addEventListener('click', function (event) {
      if (resultsBox && !event.target.closest('.search-box')) {
        resultsBox.classList.remove('open');
      }
    });
  }

  function activatePlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-overlay');
    var url = player.getAttribute('data-video-url');
    if (!video || !url) {
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video.hlsBound) {
        var hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        video.hlsBound = hls;
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', url);
      }
    } else {
      video.setAttribute('src', url);
    }
    video.setAttribute('controls', 'controls');
    if (button) {
      button.classList.add('hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('.watch-player')).forEach(function (player) {
    var button = player.querySelector('.play-overlay');
    if (button) {
      button.addEventListener('click', function () {
        activatePlayer(player);
      });
    }
    var video = player.querySelector('video');
    if (video) {
      video.addEventListener('click', function () {
        activatePlayer(player);
      });
    }
  });
})();
