/**
 * PT. SARANA PAMUNAH LIMBAH INDONESIA — main.js
 * ================================================
 * Handles: Hero Slider | Sticky Nav | Mobile Menu | Client Ticker
 */

'use strict';

/* ============================================================
   HERO SLIDER
   ============================================================ */
(function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  let current   = 0;
  let autoTimer = null;
  const INTERVAL = 5000;

  function goTo(idx) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  // Dot click handlers
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      startAuto(); // restart timer on manual change
    });
  });

  // Optional: swipe support on mobile
  let touchStartX = 0;
  const heroEl = document.querySelector('.hero');
  if (heroEl) {
    heroEl.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
    heroEl.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? current + 1 : current - 1);
        startAuto();
      }
    }, { passive: true });
  }

  startAuto();
})();

/* ============================================================
   STICKY NAVBAR — shrinks on scroll
   ============================================================ */
(function initStickyNav() {
  const navbar  = document.querySelector('.navbar');
  const topbar  = document.querySelector('.topbar');
  if (!navbar) return;

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Add scrolled class for visual feedback
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Hide topbar on scroll down, show on scroll up
    if (topbar) {
      if (scrollY > lastScroll && scrollY > 80) {
        topbar.style.marginTop = `-${topbar.offsetHeight}px`;
        topbar.style.opacity = '0';
      } else {
        topbar.style.marginTop = '0';
        topbar.style.opacity = '1';
      }
    }

    lastScroll = Math.max(0, scrollY);
  }, { passive: true });

  // Add CSS transition for topbar hide/show
  if (topbar) {
    topbar.style.transition = 'margin-top 0.35s ease, opacity 0.35s ease';
  }
})();

/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
(function initMobileNav() {
  const toggle  = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (!toggle || !navMenu) return;

  toggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on nav link click
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('open');
      toggle.classList.remove('open');
    }
  });
})();

/* ============================================================
   ACTIVE NAV HIGHLIGHT — highlights current page nav item
   ============================================================ */
(function initNavHighlight() {
  const links = document.querySelectorAll('.nav-menu a[data-page]');
  const pages = document.querySelectorAll('[data-page-id]');
  if (!links.length) return;

  function updateActive() {
    const hash = window.location.hash || '#home';
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === hash);
    });
  }

  window.addEventListener('hashchange', updateActive);
  updateActive();
})();

/* ============================================================
   CONTACT FORM — basic UX feedback (no backend)
   ============================================================ */
(function initContactForm() {
  const form     = document.getElementById('contactForm');
  const submitBtn = document.getElementById('formSubmit');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    submitBtn.textContent  = 'Pesan Terkirim ✓';
    submitBtn.style.background = '#16a36a';
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.textContent  = 'Kirim Pesan';
      submitBtn.style.background = '';
      submitBtn.disabled = false;
      form.reset();
    }, 3500);
  });
})();

/* ============================================================
   SCROLL REVEAL — lightweight entrance animations
   ============================================================ */
(function initScrollReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    const delay = el.getAttribute('data-reveal-delay') || 0;
    el.style.transitionDelay = delay + 'ms';
    observer.observe(el);
  });

  // Inject .revealed state via JS (avoids needing extra CSS)
  const style = document.createElement('style');
  style.textContent = '.revealed { opacity: 1 !important; transform: none !important; }';
  document.head.appendChild(style);
})();

/* ============================================================
   NAVBAR SCROLLED STATE STYLE INJECTION
   ============================================================ */
(function injectScrolledNavStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .navbar.scrolled {
      box-shadow: 0 4px 30px rgba(0,0,0,0.4);
      border-bottom-color: #16a36a;
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   UTILITY: Expose goSlide globally so onclick="" in HTML works
   ============================================================ */
window.goSlide = (function() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  let current  = 0;

  return function(idx) {
    if (!slides.length) return;
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  };
})();
