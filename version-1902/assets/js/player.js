(function () {
    function bindPlayer(container) {
        const video = container.querySelector("video");
        const cover = container.querySelector(".player-cover");
        const stream = container.getAttribute("data-stream");
        let prepared = false;
        let hlsInstance = null;

        if (!video || !stream) {
            return;
        }

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = stream;
        }

        function start() {
            prepare();

            if (cover) {
                cover.setAttribute("hidden", "");
            }

            video.setAttribute("controls", "controls");
            video.play().catch(function () {});
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!prepared) {
                start();
                return;
            }

            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    document.querySelectorAll("[data-player]").forEach(bindPlayer);
})();
