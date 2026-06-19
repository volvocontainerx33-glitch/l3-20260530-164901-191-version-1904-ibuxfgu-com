import { H as Hls } from './hls-vendor.js';

export function initMoviePlayer(options) {
  const video = document.getElementById(options.videoId);
  const overlay = document.getElementById(options.overlayId);
  const button = document.getElementById(options.buttonId);
  let hls = null;
  let loaded = false;

  if (!video || !overlay || !button || !options.source) {
    return;
  }

  function attach() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(options.source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal || !hls) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = options.source;
    }
  }

  function play() {
    attach();
    overlay.classList.add('is-hidden');
    video.play().catch(function () {
      overlay.classList.remove('is-hidden');
    });
  }

  overlay.addEventListener('click', play);
  button.addEventListener('click', function (event) {
    event.stopPropagation();
    play();
  });
  video.addEventListener('play', function () {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
