document.addEventListener('DOMContentLoaded', function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.video-player'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-overlay]');
    var status = player.querySelector('[data-player-status]');
    var source = player.getAttribute('data-video-url');
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initializePlayer() {
      if (!video || !source || initialized) {
        return;
      }

      initialized = true;
      setStatus('正在初始化 HLS 播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成，正在播放...');
          video.play().catch(function () {
            setStatus('播放已就绪，请再次点击播放器开始。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源暂时无法加载，请刷新页面重试。');
            hlsInstance.destroy();
            hlsInstance = null;
            initialized = false;
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          setStatus('播放源加载完成，正在播放...');
          video.play().catch(function () {
            setStatus('播放已就绪，请再次点击播放器开始。');
          });
        }, { once: true });
      } else {
        setStatus('当前浏览器不支持 HLS，请使用 Chrome、Edge、Safari 或支持 HLS 的浏览器。');
      }
    }

    function play() {
      initializePlayer();
      if (video) {
        player.classList.add('playing');
        video.play().catch(function () {
          setStatus('播放已就绪，请点击视频控制栏开始播放。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('playing');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          player.classList.remove('playing');
        }
      });
    }
  });
});
