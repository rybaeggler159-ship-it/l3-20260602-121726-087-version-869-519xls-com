document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 320) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  initHeroCarousel();
  initMovieFilters();
});

function initHeroCarousel() {
  var carousel = document.querySelector('[data-hero-carousel]');
  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      showSlide(index);
      start();
    });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);
  showSlide(0);
  start();
}

function initMovieFilters() {
  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-movie-list]'));
  if (!lists.length) {
    return;
  }

  var searchInput = document.querySelector('[data-search-input]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var countBox = document.querySelector('[data-filter-count]');
  var cards = [];

  lists.forEach(function (list) {
    cards = cards.concat(Array.prototype.slice.call(list.querySelectorAll('.movie-card')));
  });

  function norm(value) {
    return String(value || '').trim().toLowerCase();
  }

  function cardText(card) {
    return [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-type'),
      card.getAttribute('data-year'),
      card.getAttribute('data-genre'),
      card.getAttribute('data-tags'),
      card.textContent
    ].join(' ').toLowerCase();
  }

  function applyFilters() {
    var query = norm(searchInput && searchInput.value);
    var region = norm(regionSelect && regionSelect.value);
    var type = norm(typeSelect && typeSelect.value);
    var year = norm(yearSelect && yearSelect.value);
    var visible = 0;

    cards.forEach(function (card) {
      var matchQuery = !query || cardText(card).indexOf(query) !== -1;
      var matchRegion = !region || norm(card.getAttribute('data-region')) === region;
      var matchType = !type || norm(card.getAttribute('data-type')) === type;
      var matchYear = !year || norm(card.getAttribute('data-year')) === year;
      var show = matchQuery && matchRegion && matchType && matchYear;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    if (countBox) {
      countBox.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
    }
  }

  [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  applyFilters();
}
