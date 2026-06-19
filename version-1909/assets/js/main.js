(function () {
  var ready = function (fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  };

  ready(function () {
    var navToggle = document.querySelector("[data-nav-toggle]");
    var siteNav = document.querySelector("[data-site-nav]");

    if (navToggle && siteNav) {
      navToggle.addEventListener("click", function () {
        siteNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      if (!slides.length) {
        return;
      }

      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
        });
      };

      var restart = function () {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      };

      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function (form) {
      var targetSelector = form.getAttribute("data-target");
      var target = targetSelector ? document.querySelector(targetSelector) : null;
      var cards = target ? Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]")) : [];
      var search = form.querySelector("[data-filter-search]");
      var type = form.querySelector("[data-filter-type]");
      var region = form.querySelector("[data-filter-region]");
      var year = form.querySelector("[data-filter-year]");
      var empty = form.parentElement ? form.parentElement.querySelector("[data-empty-state]") : null;

      var apply = function () {
        var query = search && search.value ? search.value.trim().toLowerCase() : "";
        var typeValue = type && type.value ? type.value : "";
        var regionValue = region && region.value ? region.value : "";
        var yearValue = year && year.value ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matched = true;

          if (query && haystack.indexOf(query) === -1) {
            matched = false;
          }

          if (typeValue && cardType !== typeValue) {
            matched = false;
          }

          if (regionValue && cardRegion !== regionValue) {
            matched = false;
          }

          if (yearValue && cardYear !== yearValue) {
            matched = false;
          }

          card.style.display = matched ? "" : "none";
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };

      [search, type, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });

    document.querySelectorAll("[data-video-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var hlsInstance = null;
      var loaded = false;

      if (!video) {
        return;
      }

      var loadAndPlay = function () {
        var source = video.getAttribute("data-src");

        if (!source) {
          return;
        }

        if (!loaded) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
          } else {
            video.src = source;
          }
          loaded = true;
        }

        player.classList.add("is-playing");
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            player.classList.remove("is-playing");
          });
        }
      };

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();
          loadAndPlay();
        });
      }

      player.addEventListener("click", function (event) {
        if (event.target === video && loaded) {
          return;
        }
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
