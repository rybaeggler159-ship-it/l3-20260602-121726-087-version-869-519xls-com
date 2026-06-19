document.addEventListener('DOMContentLoaded', function () {
  var players = document.querySelectorAll('[data-player]');

  function attachSource(card) {
    var video = card.querySelector('video');
    var message = card.querySelector('.player-message');
    var src = card.getAttribute('data-src');

    if (!video || !src) {
      if (message) {
        message.textContent = '播放源暂时不可用';
      }
      return;
    }

    if (video.dataset.ready === 'true') {
      video.play().catch(function () {});
      return;
    }

    if (src.indexOf('.m3u8') !== -1) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        if (message) {
          message.textContent = '当前浏览器不支持 HLS 播放';
        }
        return;
      }
    } else {
      video.src = src;
    }

    video.dataset.ready = 'true';
    card.classList.add('is-playing');
    video.play().catch(function () {
      if (message) {
        message.textContent = '已加载播放源，请点击播放器继续播放';
      }
    });
  }

  players.forEach(function (card) {
    var button = card.querySelector('.play-overlay');
    var video = card.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        attachSource(card);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        card.classList.add('is-playing');
      });
    }
  });
});
