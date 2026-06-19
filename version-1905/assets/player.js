let hlsPromise = null;

function loadHls() {
  if (window.Hls) {
    return Promise.resolve(window.Hls);
  }

  if (hlsPromise) {
    return hlsPromise;
  }

  hlsPromise = new Promise(function (resolve, reject) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js';
    script.async = true;
    script.onload = function () {
      resolve(window.Hls);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return hlsPromise;
}

export function initPlayer(source, poster) {
  const video = document.querySelector('[data-player-video]');
  const button = document.querySelector('[data-player-button]');
  const shell = document.querySelector('[data-player-shell]');
  let started = false;
  let hlsInstance = null;

  if (!video || !button || !shell || !source) {
    return;
  }

  if (poster) {
    video.poster = poster;
  }

  async function start() {
    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;
    button.classList.add('is-hidden');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.play().catch(function () {});
      return;
    }

    try {
      const Hls = await loadHls();

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = source;
        video.play().catch(function () {});
      }
    } catch (error) {
      video.src = source;
      video.play().catch(function () {});
    }
  }

  button.addEventListener('click', start);

  shell.addEventListener('click', function (event) {
    if (event.target === shell) {
      start();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
