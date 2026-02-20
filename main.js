/**
 * PT. SARANA PAMUNAH LIMBAH INDONESIA
 * main.js — Main JavaScript Module
 * Version : 2.0
 * Author  : Senior Web Engineering
 *
 * Modules:
 *  1. Hero Slider
 *  2. Navbar Scroll Behaviour
 *  3. Mobile Drawer
 *  4. Scroll Reveal (IntersectionObserver)
 *  5. Active Nav Link Highlight
 *  6. Scroll-to-Top Button
 *  7. Counter Animation
 *  8. Touch / Swipe Support (Hero Slider)
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
============================================================ */

/**
 * Shorthand querySelector
 * @param {string} sel - CSS selector
 * @param {Element} [ctx=document] - context element
 * @returns {Element|null}
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Shorthand querySelectorAll → Array
 * @param {string} sel
 * @param {Element} [ctx=document]
 * @returns {Element[]}
 */
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));


/* ============================================================
   1. HERO SLIDER
============================================================ */
const Slider = (() => {
  const INTERVAL_MS   = 5000;
  const TRANSITION_MS = 1000;

  let current    = 0;
  let autoTimer  = null;
  let isAnimating = false;

  const slides       = $$('.slide');
  const dots         = $$('.s-dot');
  const progressBar  = $('#heroProgress');

  if (!slides.length) return {};   // guard: no slider on page

  /** Reset and restart the progress bar animation */
  function resetProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width      = '0%';
    // Force reflow before re-enabling transition
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${INTERVAL_MS}ms linear`;
    progressBar.style.width      = '100%';
  }

  /** Activate slide at index n */
  function goTo(n) {
    if (isAnimating) return;
    isAnimating = true;

    // Deactivate current
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');

    // Clamp index
    current = ((n % slides.length) + slides.length) % slides.length;

    // Activate next
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');

    resetProgress();

    // Unlock after CSS transition completes
    setTimeout(() => { isAnimating = false; }, TRANSITION_MS);
  }

  /** Move by delta (+1 or -1) */
  function move(delta) {
    clearInterval(autoTimer);
    goTo(current + delta);
    start();
  }

  /** Jump directly to slide n */
  function jump(n) {
    clearInterval(autoTimer);
    goTo(n);
    start();
  }

  /** Start auto-rotation */
  function start() {
    autoTimer = setInterval(() => goTo(current + 1), INTERVAL_MS);
  }

  /** Pause auto-rotation (e.g. on hover) */
  function pause() { clearInterval(autoTimer); }

  /** Resume auto-rotation */
  function resume() { start(); }

  /** Initialise */
  function init() {
    goTo(0);
    start();

    // Pause on hover
    slides.forEach(slide => {
      slide.addEventListener('mouseenter', pause);
      slide.addEventListener('mouseleave', resume);
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  move(-1);
      if (e.key === 'ArrowRight') move(+1);
    });

    // Expose prev/next to global scope for inline onclick handlers
    window.changeSlide = move;
    window.goSlide     = jump;
  }

  return { init, move, jump };
})();


/* ============================================================
   2. TOUCH / SWIPE SUPPORT FOR HERO SLIDER
============================================================ */
const TouchSwipe = (() => {
  const hero = $('.hero');
  if (!hero) return {};

  let startX = 0;
  let startY = 0;
  const THRESHOLD = 50; // px

  function onTouchStart(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;

    // Only trigger if horizontal swipe dominates
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > THRESHOLD) {
      dx < 0 ? Slider.move(+1) : Slider.move(-1);
    }
  }

  function init() {
    hero.addEventListener('touchstart', onTouchStart, { passive: true });
    hero.addEventListener('touchend',   onTouchEnd,   { passive: true });
  }

  return { init };
})();


/* ============================================================
   3. NAVBAR — SCROLL BEHAVIOUR & ACTIVE LINK
============================================================ */
const Navbar = (() => {
  const navbar     = $('#navbar');
  const SCROLL_THRESHOLD = 60;

  /** Toggle scrolled class for background blur effect */
  function handleScroll() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  }

  /**
   * Highlight active nav link based on current scroll position.
   * Uses section IDs that match href anchors.
   */
  function highlightActive() {
    const sections  = $$('section[id], div[id]');
    const navLinks  = $$('.nav-link');
    const offset    = 100;

    let currentId = '';

    sections.forEach(sec => {
      const top = sec.getBoundingClientRect().top;
      if (top <= offset) currentId = sec.id;
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      link.closest('.nav-item')?.classList.toggle(
        'active',
        href === `#${currentId}`
      );
    });
  }

  function init() {
    window.addEventListener('scroll', () => {
      handleScroll();
      highlightActive();
    }, { passive: true });

    handleScroll();   // run once on load
    highlightActive();
  }

  return { init };
})();


/* ============================================================
   4. MOBILE DRAWER
============================================================ */
const Drawer = (() => {
  const drawer    = $('#drawer');
  const overlay   = $('#overlay');
  const hamburger = $('#hamburger');

  function open() {
    drawer?.classList.add('open');
    overlay?.classList.add('open');
    hamburger?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    drawer?.classList.remove('open');
    overlay?.classList.remove('open');
    hamburger?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggle() {
    drawer?.classList.contains('open') ? close() : open();
  }

  /** Toggle sub-menu accordion inside the drawer */
  function toggleSub(btn) {
    const sub = btn.nextElementSibling;
    if (!sub) return;
    const isOpen = sub.classList.toggle('open');
    const arrow  = btn.querySelector('span');
    if (arrow) arrow.textContent = isOpen ? '▴' : '▾';
  }

  function init() {
    hamburger?.addEventListener('click', toggle);
    overlay?.addEventListener('click', close);

    // Close drawer when any link inside it is clicked
    $$('a', drawer).forEach(a => {
      a.addEventListener('click', close);
    });

    // Expose to global for inline onclick fallbacks
    window.toggleDrawer = toggle;
    window.closeDrawer  = close;
    window.toggleSub    = toggleSub;
  }

  return { init, open, close, toggle };
})();


/* ============================================================
   5. SCROLL REVEAL (IntersectionObserver)
============================================================ */
const ScrollReveal = (() => {
  const options = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  function init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      $$('.reveal').forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);  // fire once
        }
      });
    }, options);

    $$('.reveal').forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   6. SCROLL-TO-TOP BUTTON
============================================================ */
const ScrollTop = (() => {
  const btn = $('#scrollTop');
  const SHOW_THRESHOLD = 400;

  function handleScroll() {
    btn?.classList.toggle('show', window.scrollY > SHOW_THRESHOLD);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function init() {
    if (!btn) return;
    btn.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run once
  }

  return { init };
})();


/* ============================================================
   7. ANIMATED COUNTERS
   Targets elements with [data-count] attribute.
   Usage: <span data-count="2021" data-suffix=""></span>
============================================================ */
const Counter = (() => {
  const DURATION = 1800; // ms

  function animateCount(el) {
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = el.dataset.suffix ?? '';
    const start   = performance.now();
    const initial = 0;

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = Math.floor(initial + (target - initial) * eased);

      el.textContent = value.toLocaleString('id-ID') + suffix;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function init() {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    $$('[data-count]').forEach(el => observer.observe(el));
  }

  return { init };
})();


/* ============================================================
   8. SMOOTH ANCHOR SCROLL
   Override default anchor behaviour with smooth scroll
   and account for sticky navbar height.
============================================================ */
const SmoothScroll = (() => {
  function getNavbarHeight() {
    return $('#navbar')?.offsetHeight ?? 0;
  }

  function handleClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = $(href);
    if (!target) return;

    e.preventDefault();

    const offset = target.getBoundingClientRect().top + window.scrollY - getNavbarHeight() - 12;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  }

  function init() {
    $$('a[href^="#"]').forEach(a => {
      a.addEventListener('click', handleClick);
    });
  }

  return { init };
})();


/* ============================================================
   9. MARQUEE PAUSE ON HOVER
   (CSS handles it via animation-play-state, but JS adds
   accessibility support for reduced-motion preference)
============================================================ */
const Marquee = (() => {
  function init() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tracks = $$('.marquee-track');

    if (prefersReduced) {
      tracks.forEach(t => {
        t.style.animation = 'none';
        t.style.overflow  = 'auto';
      });
    }
  }

  return { init };
})();


/* ============================================================
   10. LANG SWITCHER (placeholder)
============================================================ */
const LangSwitcher = (() => {
  function init() {
    const btn = $('.lang-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // TODO: Implement full i18n / language switch
      const current = btn.textContent.includes('ID') ? 'EN' : 'ID';
      const flag    = current === 'ID' ? '🇮🇩' : '🇬🇧';
      btn.textContent = `${flag} ${current}`;
      console.info(`[SPLI] Language switched to: ${current}`);
    });
  }

  return { init };
})();


/* ============================================================
   APP INIT — Run all modules after DOM ready
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Slider.init();
  TouchSwipe.init();
  Navbar.init();
  Drawer.init();
  ScrollReveal.init();
  ScrollTop.init();
  Counter.init();
  SmoothScroll.init();
  Marquee.init();
  LangSwitcher.init();

  console.info('%c[SPLI] Website initialized successfully ✓', 'color:#22923f;font-weight:700');
});
