(function () {
    var video = document.querySelector("[data-player-video]");
    var trigger = document.querySelector("[data-player-trigger]");

    if (!video) {
        return;
    }

    var src = video.getAttribute("data-stream-url") || "";
    var loaded = false;
    var hls = null;

    function loadVideo() {
        if (!src || loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            return;
        }

        video.src = src;
    }

    function startPlay() {
        loadVideo();

        if (trigger) {
            trigger.hidden = true;
        }

        var result = video.play();
        if (result && typeof result.catch === "function") {
            result.catch(function () {
                if (trigger) {
                    trigger.hidden = false;
                }
            });
        }
    }

    if (trigger) {
        trigger.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlay();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
            hls.destroy();
        }
    });
})();
