/* ============================================================
   AFIN SRL — Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── DARK MODE ───────────────────────────────────────────── */
  const THEME_KEY = 'afin-theme';

  function getTheme() {
    return localStorage.getItem(THEME_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update all theme toggle icons
    document.querySelectorAll('.js-theme-icon').forEach(function (el) {
      el.innerHTML = theme === 'dark' ? iconSun() : iconMoon();
    });
    document.querySelectorAll('[data-theme-title]').forEach(function (el) {
      el.title = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    });
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  /* ── MOBILE MENU ─────────────────────────────────────────── */
  function openMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    if (menu) { menu.classList.add('open'); document.body.style.overflow = 'hidden'; }
  }

  function closeMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    if (menu) { menu.classList.remove('open'); document.body.style.overflow = ''; }
  }

  /* ── PRODUCT FILTER (productos.html) ─────────────────────── */
  function initProductFilter() {
    var filterBtns = document.querySelectorAll('.js-filter-btn');
    var cards      = document.querySelectorAll('.js-product-card');
    var countLabel = document.getElementById('products-count');
    var titleLabel = document.getElementById('products-title');

    if (!filterBtns.length) return;

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Active state
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        var cat = btn.dataset.cat;
        var visible = 0;

        cards.forEach(function (card) {
          var match = cat === 'todos' || card.dataset.cat === cat;
          card.style.display = match ? '' : 'none';
          if (match) visible++;
        });

        if (countLabel) {
          countLabel.textContent = visible + ' producto' + (visible !== 1 ? 's' : '') +
            ' encontrado' + (visible !== 1 ? 's' : '');
        }

        if (titleLabel) {
          titleLabel.textContent = cat === 'todos'
            ? 'Todos los productos'
            : btn.querySelector('.filter-label') ? btn.querySelector('.filter-label').textContent : titleLabel.textContent;
        }
      });
    });
  }

  /* ── CONTACT FORM ─────────────────────────────────────────── */
  function initContactForm() {
    var form    = document.getElementById('contact-form');
    var success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.display = 'none';
      if (success) success.classList.add('visible');
    });
  }

  /* ── INLINE SVG ICONS ────────────────────────────────────── */
  function iconSun() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  }

  function iconMoon() {
    return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  /* ── ACTIVE NAV LINK ─────────────────────────────────────── */
  function markActiveNav() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href === page || (page === 'index.html' && href === '/') ||
          (page === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Apply saved theme
    applyTheme(getTheme());

    // Theme toggle buttons
    document.querySelectorAll('.js-theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });

    // Mobile menu
    var mobileOpen = document.getElementById('mobile-menu-open');
    var mobileClose = document.getElementById('mobile-menu-close');
    var mobileOverlay = document.getElementById('mobile-menu-overlay');

    if (mobileOpen)    mobileOpen.addEventListener('click', openMobileMenu);
    if (mobileClose)   mobileClose.addEventListener('click', closeMobileMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

    // Mark active nav
    markActiveNav();

    // Products filter
    initProductFilter();

    // Contact form
    initContactForm();
  });

})();
