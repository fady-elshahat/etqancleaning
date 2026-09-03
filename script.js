/* =========================================
   إتقان كلين - Vanilla JS ES6
   No external libraries
   ========================================= */
(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById('siteHeader');
  const toggleHeaderShadow = () => {
    if (window.scrollY > 10) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  toggleHeaderShadow();
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mainNav = document.getElementById('mainNav');

  const closeNav = () => {
    mainNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'فتح قائمة التنقل');
  };

  const openNav = () => {
    mainNav.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'إغلاق قائمة التنقل');
  };

  hamburgerBtn.addEventListener('click', () => {
    const isOpen = hamburgerBtn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });

  mainNav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 900) closeNav();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Count-up stats animation (IntersectionObserver) ---------- */
  const statsSection = document.getElementById('statsSection');
  const statNumbers = document.querySelectorAll('.stat-number');

  const toArabicDigits = (num) => {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).replace(/\d/g, (d) => arabicDigits[d]);
  };

  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;

    if (prefersReducedMotion) {
      el.textContent = toArabicDigits(target);
      return;
    }

    const duration = 1500;
    const startTime = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = toArabicDigits(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  if (statsSection && statNumbers.length) {
    let hasAnimated = false;
    const statsObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            statNumbers.forEach(animateCount);
            statsObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    statsObserver.observe(statsSection);
  }

  /* ---------- Testimonials slider (RTL-aware) ---------- */
  const track = document.getElementById('testimonialTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('sliderDots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = Array.from(track.children);
    let currentIndex = 0;
    let autoplayTimer = null;

    /* In RTL, the browser lays out flex children right-to-left already,
       so moving "forward" (next) means shifting the track in the
       positive X direction (toward the right edge), not negative. */
    const isRTL = getComputedStyle(document.documentElement).direction === 'rtl';
    const directionMultiplier = isRTL ? 1 : -1;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('dot');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `عرض رأي العميل رقم ${i + 1}`);
      dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    const updateSlider = () => {
      const offset = currentIndex * 100 * directionMultiplier;
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
        dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      });
    };

    const goToSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      updateSlider();
      resetAutoplay();
    };

    const nextSlide = () => goToSlide(currentIndex + 1);
    const prevSlide = () => goToSlide(currentIndex - 1);

    /* "next" button (left arrow, points toward reading-forward) */
    nextBtn.addEventListener('click', nextSlide);
    /* "prev" button (right arrow) */
    prevBtn.addEventListener('click', prevSlide);

    const startAutoplay = () => {
      if (prefersReducedMotion) return;
      autoplayTimer = setInterval(nextSlide, 6000);
    };

    const resetAutoplay = () => {
      if (autoplayTimer) clearInterval(autoplayTimer);
      startAutoplay();
    };

    startAutoplay();
    updateSlider();

    /* Pause autoplay on hover/focus */
    const sliderWrapper = document.getElementById('testimonialSlider');
    sliderWrapper.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
    sliderWrapper.addEventListener('mouseleave', startAutoplay);
    sliderWrapper.addEventListener('focusin', () => clearInterval(autoplayTimer));
    sliderWrapper.addEventListener('focusout', startAutoplay);

    /* Basic touch swipe support */
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        diff > 0 ? prevSlide() : nextSlide();
      }
    }, { passive: true });
  }

  /* ---------- Smooth close of mobile nav on outside click ---------- */
  document.addEventListener('click', (e) => {
    const isClickInsideNav = mainNav.contains(e.target) || hamburgerBtn.contains(e.target);
    if (!isClickInsideNav && mainNav.classList.contains('open')) {
      closeNav();
    }
  });

})();
