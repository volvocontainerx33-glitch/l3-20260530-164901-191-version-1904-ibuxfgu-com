(function() {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mainNav = document.querySelector('[data-main-nav]');

  if (menuButton && mainNav) {
    menuButton.addEventListener('click', function() {
      mainNav.classList.toggle('open');
      document.body.classList.toggle('menu-open', mainNav.classList.contains('open'));
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(current - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(current + 1);
        schedule();
      });
    }

    schedule();
  }
})();
