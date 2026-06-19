(function () {
    var video = document.querySelector('.movie-video');
    var overlay = document.querySelector('.video-overlay');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-video');
    var hlsInstance = null;
    var ready = false;

    function attachSource() {
        if (ready || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            ready = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            ready = true;
            return;
        }

        video.src = source;
        ready = true;
    }

    function playVideo() {
        attachSource();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
