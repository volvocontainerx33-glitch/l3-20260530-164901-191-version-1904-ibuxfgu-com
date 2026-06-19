(function () {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  let heroIndex = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === heroIndex);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === heroIndex);
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      showSlide(heroIndex + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.dataset.heroDot || 0));
      startHero();
    });
  });

  if (slides.length) {
    showSlide(0);
    startHero();
  }

  const localSearch = document.querySelector('[data-local-search]');
  const cards = Array.from(document.querySelectorAll('[data-keywords]'));

  if (localSearch && cards.length) {
    localSearch.addEventListener('input', function () {
      const query = localSearch.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const keywords = (card.dataset.keywords || '').toLowerCase();
        card.classList.toggle('hidden-by-filter', Boolean(query) && !keywords.includes(query));
      });
    });
  }
})();
