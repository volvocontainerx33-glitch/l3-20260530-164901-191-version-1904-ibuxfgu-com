(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;

        slides.forEach(function (slide, current) {
            slide.classList.toggle('is-active', current === activeIndex);
        });

        dots.forEach(function (dot, current) {
            dot.classList.toggle('is-active', current === activeIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            window.clearInterval(timer);
            showSlide(Number(dot.getAttribute('data-slide') || 0));
            startHero();
        });
    });

    startHero();

    var searchInput = document.getElementById('movieSearchInput');
    var clearButton = document.getElementById('movieSearchClear');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.search-card'));

    function filterCards(value) {
        var keyword = (value || '').trim().toLowerCase();

        cards.forEach(function (card) {
            var text = [
                card.getAttribute('data-title'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.textContent
            ].join(' ').toLowerCase();

            card.style.display = text.indexOf(keyword) === -1 ? 'none' : '';
        });
    }

    if (searchInput) {
        var query = new URLSearchParams(window.location.search).get('q') || '';
        searchInput.value = query;
        filterCards(query);

        searchInput.addEventListener('input', function () {
            filterCards(searchInput.value);
        });
    }

    if (clearButton && searchInput) {
        clearButton.addEventListener('click', function () {
            searchInput.value = '';
            filterCards('');
            searchInput.focus();
        });
    }
})();
