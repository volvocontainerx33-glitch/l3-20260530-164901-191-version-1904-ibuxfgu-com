(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHeroCarousel() {
    const root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }

    const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
    const thumbs = Array.from(root.querySelectorAll('[data-hero-thumb]'));
    let activeIndex = 0;
    let timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === activeIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopAutoPlay() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    root.addEventListener('mouseenter', stopAutoPlay);
    root.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  function setupLocalFilters() {
    const scope = document.querySelector('[data-filter-scope]');
    if (!scope) {
      return;
    }

    const keywordInput = scope.querySelector('[data-filter-keyword]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const regionSelect = scope.querySelector('[data-filter-region]');
    const resetButton = scope.querySelector('[data-filter-reset]');
    const countTarget = scope.querySelector('[data-filter-count]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      const keyword = normalize(keywordInput && keywordInput.value);
      const year = normalize(yearSelect && yearSelect.value);
      const region = normalize(regionSelect && regionSelect.value);
      let visibleCount = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.region,
          card.dataset.genre,
          card.dataset.category
        ].join(' '));
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedYear = !year || normalize(card.dataset.year) === year;
        const matchedRegion = !region || normalize(card.dataset.region) === region;
        const visible = matchedKeyword && matchedYear && matchedRegion;

        card.classList.toggle('is-filtered-out', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (countTarget) {
        countTarget.textContent = String(visibleCount);
      }
    }

    [keywordInput, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (keywordInput) keywordInput.value = '';
        if (yearSelect) yearSelect.value = '';
        if (regionSelect) regionSelect.value = '';
        applyFilter();
      });
    }

    applyFilter();
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise(function (resolve, reject) {
      const existingScript = document.querySelector('script[data-hls-cdn]');
      if (existingScript) {
        existingScript.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existingScript.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.dataset.hlsCdn = 'true';
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function setupPlayers() {
    const players = Array.from(document.querySelectorAll('video[data-hls-src]'));

    players.forEach(function (video) {
      const source = video.dataset.hlsSrc;
      const shell = video.closest('.player-shell');
      const playButton = shell && shell.querySelector('[data-player-button]');
      const status = shell && shell.querySelector('[data-player-status]');
      let initialized = false;

      function updateStatus(message) {
        if (status) {
          status.textContent = message;
        }
      }

      function initializePlayer() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          updateStatus('使用浏览器原生 HLS 播放');
          return Promise.resolve();
        }

        return loadHlsLibrary()
          .then(function (Hls) {
            if (Hls && Hls.isSupported()) {
              const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
              });
              hls.loadSource(source);
              hls.attachMedia(video);
              video._hlsInstance = hls;
              updateStatus('HLS 播放源已加载');
            } else {
              video.src = source;
              updateStatus('已尝试使用播放源直连');
            }
          })
          .catch(function () {
            video.src = source;
            updateStatus('HLS 组件加载失败，已尝试直连播放源');
          });
      }

      function playVideo() {
        initializePlayer().then(function () {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              updateStatus('请再次点击播放器开始播放');
            });
          }
        });
      }

      if (playButton) {
        playButton.addEventListener('click', function () {
          playButton.classList.add('is-hidden');
          playVideo();
        });
      }

      video.addEventListener('play', function () {
        if (playButton) {
          playButton.classList.add('is-hidden');
        }
      });

      video.addEventListener('pause', function () {
        if (playButton && video.currentTime === 0) {
          playButton.classList.remove('is-hidden');
        }
      });
    });
  }

  function movieCardTemplate(movie) {
    const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster" href="' + escapeHtml(movie.url) + '">',
      '    <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-glow"></span>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="play-chip">▶</span>',
      '  </a>',
      '  <div class="card-content">',
      '    <h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="meta-line">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '      <span>' + escapeHtml(movie.genre) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[character];
    });
  }

  function setupSearchPage() {
    const root = document.querySelector('[data-search-page]');
    if (!root || !window.MOVIE_INDEX) {
      return;
    }

    const input = root.querySelector('[data-search-input]');
    const regionSelect = root.querySelector('[data-search-region]');
    const yearSelect = root.querySelector('[data-search-year]');
    const clearButton = root.querySelector('[data-search-clear]');
    const totalTarget = root.querySelector('[data-search-total]');
    const results = root.querySelector('[data-search-results]');
    const movies = window.MOVIE_INDEX;

    function uniqueValues(key) {
      return Array.from(new Set(movies.map(function (movie) {
        return movie[key];
      }).filter(Boolean))).sort().reverse();
    }

    uniqueValues('region').sort().forEach(function (region) {
      const option = document.createElement('option');
      option.value = region;
      option.textContent = region;
      regionSelect.appendChild(option);
    });

    uniqueValues('year').forEach(function (year) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function readQueryParam() {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q && input) {
        input.value = q;
      }
    }

    function applySearch() {
      const keyword = normalize(input && input.value);
      const region = normalize(regionSelect && regionSelect.value);
      const year = normalize(yearSelect && yearSelect.value);

      const matched = movies.filter(function (movie) {
        const haystack = normalize([
          movie.title,
          movie.region,
          movie.year,
          movie.type,
          movie.genre,
          movie.category,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        const matchedKeyword = !keyword || haystack.includes(keyword);
        const matchedRegion = !region || normalize(movie.region) === region;
        const matchedYear = !year || normalize(movie.year) === year;
        return matchedKeyword && matchedRegion && matchedYear;
      }).slice(0, 120);

      totalTarget.textContent = String(matched.length);
      results.innerHTML = matched.map(movieCardTemplate).join('\n');
    }

    [input, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applySearch);
        control.addEventListener('change', applySearch);
      }
    });

    clearButton.addEventListener('click', function () {
      input.value = '';
      regionSelect.value = '';
      yearSelect.value = '';
      applySearch();
    });

    readQueryParam();
    applySearch();
  }

  setupHeroCarousel();
  setupLocalFilters();
  setupPlayers();
  setupSearchPage();
})();
