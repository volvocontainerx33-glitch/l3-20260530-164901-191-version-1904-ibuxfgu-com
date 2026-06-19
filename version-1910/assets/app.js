(function () {
    var navToggle = document.querySelector('.nav-toggle');
    var navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var open = navMenu.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var prev = hero.querySelector('.hero-control.prev');
        var next = hero.querySelector('.hero-control.next');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                showSlide(i);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    searchInputs.forEach(function (input) {
        var scopeSelector = input.getAttribute('data-search-scope');
        var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
        var empty = document.querySelector(input.getAttribute('data-empty-target') || '');

        function applyFilter() {
            var keyword = input.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call((scope || document).querySelectorAll('.searchable-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.style.display = visible ? 'none' : 'block';
            }
        }

        input.addEventListener('input', applyFilter);
        applyFilter();
    });

    function beginPlayback(frame) {
        if (!frame || frame.classList.contains('is-playing')) {
            return;
        }
        var video = frame.querySelector('video');
        var button = frame.querySelector('.play-layer');
        if (!video) {
            return;
        }
        var src = video.getAttribute('data-play') || (button ? button.getAttribute('data-play') : '');
        if (!src) {
            return;
        }
        frame.classList.add('is-playing');

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
        } else {
            video.src = src;
            video.play().catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-frame')).forEach(function (frame) {
        var button = frame.querySelector('.play-layer');
        var video = frame.querySelector('video');

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                beginPlayback(frame);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!frame.classList.contains('is-playing')) {
                    beginPlayback(frame);
                }
            });
        }
    });
})();
