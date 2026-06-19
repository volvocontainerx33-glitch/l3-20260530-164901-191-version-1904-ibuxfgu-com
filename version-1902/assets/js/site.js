(function () {
    const toggle = document.querySelector(".nav-toggle");
    const panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            const open = panel.hasAttribute("hidden");
            if (open) {
                panel.removeAttribute("hidden");
                toggle.setAttribute("aria-expanded", "true");
                toggle.textContent = "×";
            } else {
                panel.setAttribute("hidden", "");
                toggle.setAttribute("aria-expanded", "false");
                toggle.textContent = "☰";
            }
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prev = document.querySelector(".hero-prev");
    const next = document.querySelector(".hero-next");
    let active = slides.findIndex(function (slide) {
        return slide.classList.contains("is-active");
    });

    if (active < 0) {
        active = 0;
    }

    function setHero(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === active);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === active);
        });
    }

    if (slides.length) {
        if (prev) {
            prev.addEventListener("click", function () {
                setHero(active - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setHero(active + 1);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                setHero(index);
            });
        });

        window.setInterval(function () {
            setHero(active + 1);
        }, 6500);
    }

    const form = document.querySelector("[data-filter-form]");
    const input = document.querySelector("[data-filter-input]");
    const typeSelect = document.querySelector("[data-filter-type]");
    const regionSelect = document.querySelector("[data-filter-region]");
    const grid = document.querySelector("[data-filter-grid]");
    const empty = document.querySelector("[data-empty-state]");

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setInputFromQuery() {
        if (!input) {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const query = params.get("q");

        if (query) {
            input.value = query;
        }
    }

    function filterCards() {
        if (!grid) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll(".movie-card"));
        const query = normalize(input ? input.value : "");
        const typeValue = normalize(typeSelect ? typeSelect.value : "");
        const regionValue = normalize(regionSelect ? regionSelect.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.year,
                card.dataset.region,
                card.dataset.tags
            ].join(" "));
            const matchesQuery = !query || haystack.indexOf(query) !== -1;
            const matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
            const matchesRegion = !regionValue || normalize(card.dataset.region).indexOf(regionValue) !== -1;
            const show = matchesQuery && matchesType && matchesRegion;

            card.hidden = !show;
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    setInputFromQuery();

    if (input) {
        input.addEventListener("input", filterCards);
    }

    if (typeSelect) {
        typeSelect.addEventListener("change", filterCards);
    }

    if (regionSelect) {
        regionSelect.addEventListener("change", filterCards);
    }

    if (form) {
        form.addEventListener("reset", function () {
            window.setTimeout(filterCards, 0);
        });
    }

    filterCards();
})();
