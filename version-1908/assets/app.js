function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function initMenu() {
  const button = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!button || !menu) return;
  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function initHero() {
  const hero = document.querySelector("[data-hero]");
  if (!hero) return;
  const slides = Array.from(hero.querySelectorAll(".hero-slide"));
  const dots = Array.from(hero.querySelectorAll(".hero-dot"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  if (!slides.length) return;
  let index = slides.findIndex(function (slide) {
    return slide.classList.contains("is-active");
  });
  if (index < 0) index = 0;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === index);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
    });
  });

  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
    });
  }

  setInterval(function () {
    show(index + 1);
  }, 5200);
}

function initFilter() {
  const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));
  scopes.forEach(function (scope) {
    const input = scope.querySelector("[data-filter-input]");
    const select = scope.querySelector("[data-filter-select]");
    const cards = Array.from(scope.querySelectorAll(".movie-card, .rank-card"));
    const empty = scope.querySelector(".empty-state");
    function apply() {
      const q = input ? input.value.trim().toLowerCase() : "";
      const year = select ? select.value : "";
      let shown = 0;
      cards.forEach(function (card) {
        const hay = [card.dataset.title, card.dataset.tags, card.dataset.region, card.dataset.year].join(" ").toLowerCase();
        const yearOk = !year || card.dataset.year === year;
        const textOk = !q || hay.indexOf(q) !== -1;
        const keep = yearOk && textOk;
        card.style.display = keep ? "" : "none";
        if (keep) shown += 1;
      });
      if (empty) empty.classList.toggle("is-visible", shown === 0);
    }
    if (input) input.addEventListener("input", apply);
    if (select) select.addEventListener("change", apply);
  });
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      "\"": "&quot;"
    }[char];
  });
}

function renderSearchCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return "<span>" + escapeHtml(tag) + "</span>";
  }).join("");
  return "<article class=\"movie-card\">" +
    "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + " 在线观看\">" +
    "<img src=\"./" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
    "<span class=\"card-badge\">" + escapeHtml(movie.type) + "</span>" +
    "</a>" +
    "<div class=\"card-body\">" +
    "<h2><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h2>" +
    "<p class=\"card-desc\">" + escapeHtml(movie.oneLine) + "</p>" +
    "<div class=\"card-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
    "<div class=\"tag-row\">" + tags + "</div>" +
    "</div>" +
    "</article>";
}

function initSiteSearch() {
  const form = document.querySelector("[data-site-search-form]");
  const input = document.querySelector("[data-site-search-input]");
  const results = document.querySelector("[data-site-search-results]");
  const empty = document.querySelector("[data-site-search-empty]");
  if (!form || !input || !results || !window.SITE_MOVIES) return;
  const params = new URLSearchParams(window.location.search);
  const initial = params.get("q") || "";
  input.value = initial;

  function draw() {
    const q = input.value.trim().toLowerCase();
    const all = window.SITE_MOVIES;
    const matches = all.filter(function (movie) {
      if (!q) return true;
      const hay = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine].join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    }).slice(0, 120);
    results.innerHTML = matches.map(renderSearchCard).join("");
    if (empty) empty.classList.toggle("is-visible", matches.length === 0);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const url = new URL(window.location.href);
    if (input.value.trim()) {
      url.searchParams.set("q", input.value.trim());
    } else {
      url.searchParams.delete("q");
    }
    history.replaceState(null, "", url.toString());
    draw();
  });
  input.addEventListener("input", draw);
  draw();
}

function initPlayer() {
  const frame = document.querySelector(".js-player[data-stream]");
  if (!frame) return;
  const video = frame.querySelector("video");
  const overlay = frame.querySelector(".player-overlay");
  const stream = frame.dataset.stream;
  let attached = false;
  let hls;

  function attach() {
    if (attached || !video || !stream) return;
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
    attached = true;
  }

  function start() {
    attach();
    frame.classList.add("is-playing");
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        frame.classList.remove("is-playing");
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    frame.classList.add("is-playing");
  });

  video.addEventListener("pause", function () {
    if (video.currentTime === 0) {
      frame.classList.remove("is-playing");
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) hls.destroy();
  });
}

ready(function () {
  initMenu();
  initHero();
  initFilter();
  initSiteSearch();
  initPlayer();
});
