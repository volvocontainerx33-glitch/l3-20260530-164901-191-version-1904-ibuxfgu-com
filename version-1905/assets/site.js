(function () {
  const header = document.querySelector('.site-header');
  const navToggle = document.querySelector('.nav-toggle');

  if (header && navToggle) {
    navToggle.addEventListener('click', function () {
      const isOpen = header.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let activeSlide = 0;
  let slideTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  function startCarousel() {
    if (slides.length < 2) {
      return;
    }

    slideTimer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      const target = Number(dot.getAttribute('data-target-slide') || 0);
      showSlide(target);

      if (slideTimer) {
        window.clearInterval(slideTimer);
        startCarousel();
      }
    });
  });

  startCarousel();

  const searchInput = document.getElementById('movieSearch');
  const yearFilter = document.getElementById('yearFilter');
  const typeFilter = document.getElementById('typeFilter');
  const categoryFilter = document.getElementById('categoryFilter');
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const resultCount = document.querySelector('.result-count');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyQueryParam() {
    if (!searchInput) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');

    if (q) {
      searchInput.value = q;
    }
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    const keyword = normalize(searchInput ? searchInput.value : '');
    const year = normalize(yearFilter ? yearFilter.value : '');
    const type = normalize(typeFilter ? typeFilter.value : '');
    const category = normalize(categoryFilter ? categoryFilter.value : '');
    let visible = 0;

    cards.forEach(function (card) {
      const title = normalize(card.getAttribute('data-title'));
      const genre = normalize(card.getAttribute('data-genre'));
      const cardYear = normalize(card.getAttribute('data-year'));
      const cardType = normalize(card.getAttribute('data-type'));
      const region = normalize(card.getAttribute('data-region'));
      const cardCategory = normalize(card.getAttribute('data-category'));
      const haystack = [title, genre, cardYear, cardType, region, cardCategory].join(' ');
      const matchKeyword = !keyword || haystack.includes(keyword);
      const matchYear = !year || cardYear === year;
      const matchType = !type || cardType === type;
      const matchCategory = !category || cardCategory === category;
      const isVisible = matchKeyword && matchYear && matchType && matchCategory;

      card.classList.toggle('is-hidden', !isVisible);

      if (isVisible) {
        visible += 1;
      }
    });

    if (resultCount) {
      resultCount.textContent = '共 ' + visible + ' 部影片';
    }
  }

  applyQueryParam();

  [searchInput, yearFilter, typeFilter, categoryFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();
