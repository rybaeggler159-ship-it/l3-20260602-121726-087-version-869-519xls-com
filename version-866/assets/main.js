document.addEventListener('DOMContentLoaded', function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var isHidden = mobilePanel.hasAttribute('hidden');
      if (isHidden) {
        mobilePanel.removeAttribute('hidden');
        menuButton.setAttribute('aria-expanded', 'true');
      } else {
        mobilePanel.setAttribute('hidden', '');
        menuButton.setAttribute('aria-expanded', 'false');
      }
    });
  }

  var carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
  var prev = carousel.querySelector('[data-prev]');
  var next = carousel.querySelector('[data-next]');
  var dots = carousel.querySelector('[data-dots]');
  var activeIndex = 0;
  var timer = null;

  function renderDots() {
    if (!dots) {
      return;
    }
    dots.innerHTML = '';
    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', '切换到第 ' + (index + 1) + ' 屏');
      dot.addEventListener('click', function () {
        showSlide(index);
        restart();
      });
      dots.appendChild(dot);
    });
  }

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });
    if (dots) {
      Array.prototype.slice.call(dots.children).forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }
  }

  function goNext() {
    showSlide(activeIndex + 1);
  }

  function goPrev() {
    showSlide(activeIndex - 1);
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(goNext, 5000);
  }

  if (next) {
    next.addEventListener('click', function () {
      goNext();
      restart();
    });
  }

  if (prev) {
    prev.addEventListener('click', function () {
      goPrev();
      restart();
    });
  }

  renderDots();
  showSlide(0);
  restart();
});
