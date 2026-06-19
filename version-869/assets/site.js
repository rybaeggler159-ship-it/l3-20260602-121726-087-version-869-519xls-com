(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");

    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll(".hero-thumb"));
    var activeIndex = 0;
    var heroTimer = null;

    function activateSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === activeIndex);
      });
      thumbs.forEach(function (thumb, idx) {
        thumb.classList.toggle("active", idx === activeIndex);
      });
    }

    thumbs.forEach(function (thumb, idx) {
      thumb.addEventListener("click", function () {
        activateSlide(idx);
        if (heroTimer) {
          clearInterval(heroTimer);
        }
        heroTimer = setInterval(function () {
          activateSlide(activeIndex + 1);
        }, 5200);
      });
    });

    if (slides.length > 1) {
      heroTimer = setInterval(function () {
        activateSlide(activeIndex + 1);
      }, 5200);
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".site-search"));
    searchInputs.forEach(function (input) {
      var panel = input.closest(".search-panel");
      var reset = panel ? panel.querySelector(".clear-search") : null;
      var list = document.querySelector(".searchable-list");

      function applySearch() {
        if (!list) {
          return;
        }
        var keyword = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .ranking-item"));
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-genre") || "",
            card.getAttribute("data-region") || "",
            card.getAttribute("data-category") || "",
            card.innerText || ""
          ].join(" ").toLowerCase();
          card.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
        });
      }

      input.addEventListener("input", applySearch);
      if (reset) {
        reset.addEventListener("click", function () {
          input.value = "";
          applySearch();
          input.focus();
        });
      }
    });

    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    var layer = document.querySelector(".player-layer");

    if (video && button && window.playerData && window.playerData.stream) {
      var loaded = false;
      var streamUrl = window.playerData.stream;

      function loadStream() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function playVideo() {
        loadStream();
        if (layer) {
          layer.classList.add("is-hidden");
        }
        var action = video.play();
        if (action && action.catch) {
          action.catch(function () {});
        }
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });
    }
  });
})();
