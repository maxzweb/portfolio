/* Shared HTML components for the portfolio site.
   Injects header, footer, and mobile menu markup into each page. */

(function () {
  'use strict';

  function getContext() {
    const path = window.location.pathname || '';
    const isCasePage = /\/cases\//.test(path);

    // Asset prefix for images on this page:
    // - index.html: "images/..."
    // - /cases/*.html: "../images/..."
    const assetPrefix = isCasePage ? '../' : '';
    const linkPrefix = isCasePage ? '../' : '';

    return { isCasePage, assetPrefix, linkPrefix };
  }

  function renderHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const { isCasePage, assetPrefix, linkPrefix } = getContext();
    const mailText = isCasePage ? 'Email' : 'Пошта';

    const leftNav = isCasePage
      ? `
        <div class="header__left">
          <a href="${linkPrefix}index.html#hero" class="header__link" data-i18n="case.nav.home">Home</a>
          <a href="${linkPrefix}index.html#cases" class="header__link" data-i18n="case.nav.cases">Cases</a>
        </div>
      `
      : `
        <div class="header__left">
          <a href="https://www.dropbox.com/scl/fi/iwiatoqi4rarxe228n505/M.Zlydar-UI-UX-Designer-EN.pdf?rlkey=4tyqsk23btvk38p8wg84jlqmk&amp;st=lor1nzvh&amp;dl=0" class="header__link" data-i18n="header.cv" data-i18n-href="links.cv" target="_blank" rel="noopener">CV</a>
          <a href="https://www.linkedin.com/in/maxzweb/" class="header__link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://dribbble.com/max4web" class="header__link" target="_blank" rel="noopener">Dribbble</a>
        </div>
      `;

    // Default labels (they will be corrected by i18n via main.js).
    const langLabel = isCasePage ? 'EN' : 'UA';

    header.innerHTML = `
      <nav class="header__nav">
        ${leftNav}

        <a href="${linkPrefix}index.html#" class="header__logo">
          <img src="${assetPrefix}images/mylogo-dark.svg" class="logo--dark" alt="Logo">
          <img src="${assetPrefix}images/mylogo-light.svg" class="logo--light" alt="Logo">
        </a>

        <div class="header__right">
          <a href="https://www.upwork.com/freelancers/maxzweb" class="header__link header__link--desktop" target="_blank" rel="noopener">Upwork</a>
          <a href="mailto:maxz4web@gmail.com" class="header__link header__link--desktop" data-i18n="header.mail">${mailText}</a>

          <button class="header__lang header__link--desktop" id="lang-toggle" data-i18n="header.lang">${langLabel}</button>

          <button type="button" class="header__theme header__link--desktop" id="theme-toggle" aria-label="Switch to dark mode">
            <img class="header__theme-icon header__theme-icon--dark" src="${assetPrefix}images/dark.svg" alt="" width="20" height="20">
            <img class="header__theme-icon header__theme-icon--light" src="${assetPrefix}images/light.svg" alt="" width="20" height="20">
          </button>

          <button class="header__menu-btn" id="menu-toggle" type="button" aria-label="Menu">
            <img src="${assetPrefix}images/Menu.svg" alt="" width="24" height="24">
          </button>
        </div>
      </nav>
    `;
  }

  function renderFooter() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const { isCasePage } = getContext();

    footer.innerHTML = `
      <div class="footer__content">
        <span class="footer__copy">Max Zlydar © 2026</span>
        <span class="footer__version" data-i18n="footer.version">Version 1.01b</span>
      </div>
      ${
        isCasePage
          ? ''
          : `
        <!-- Mobile footer nav (visible on mobile only) -->
        <nav class="footer__mobile-nav">
          <a href="https://www.dropbox.com/scl/fi/iwiatoqi4rarxe228n505/M.Zlydar-UI-UX-Designer-EN.pdf?rlkey=4tyqsk23btvk38p8wg84jlqmk&amp;st=lor1nzvh&amp;dl=0" class="footer__link" data-i18n="header.cv" data-i18n-href="links.cv" target="_blank" rel="noopener">CV</a>
          <a href="https://www.linkedin.com/in/maxzweb/" class="footer__link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://dribbble.com/max4web" class="footer__link" target="_blank" rel="noopener">Dribbble</a>
          <a href="https://www.upwork.com/freelancers/maxzweb" class="footer__link" target="_blank" rel="noopener">Upwork</a>
          <a href="mailto:maxz4web@gmail.com" class="footer__link" data-i18n="header.mail">Пошта</a>
        </nav>
      `
      }
    `;
  }

  function renderMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;

    const { isCasePage, assetPrefix } = getContext();
    const mailText = isCasePage ? 'Email' : 'Пошта';
    const langLabel = isCasePage ? 'EN' : 'UA';

    menu.innerHTML = `
      <div class="mobile-menu__content">
        <div class="mobile-menu__header">
          <button class="mobile-menu__close" id="menu-close">
            <img src="${assetPrefix}images/Close_LG.svg" alt="Закрыть" width="16" height="16">
          </button>
        </div>

        <nav class="mobile-menu__nav">
          <a href="https://www.dropbox.com/scl/fi/iwiatoqi4rarxe228n505/M.Zlydar-UI-UX-Designer-EN.pdf?rlkey=4tyqsk23btvk38p8wg84jlqmk&amp;st=lor1nzvh&amp;dl=0" class="mobile-menu__link" data-i18n="header.cv" data-i18n-href="links.cv" target="_blank" rel="noopener">CV</a>
          <a href="https://www.linkedin.com/in/maxzweb/" class="mobile-menu__link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://dribbble.com/max4web" class="mobile-menu__link" target="_blank" rel="noopener">Dribbble</a>
          <a href="https://www.upwork.com/freelancers/maxzweb" class="mobile-menu__link" target="_blank" rel="noopener">Upwork</a>
          <a href="mailto:maxz4web@gmail.com" class="mobile-menu__link" data-i18n="header.mail">${mailText}</a>

          <button class="mobile-menu__link" id="menu-lang-toggle" data-i18n="header.lang">${langLabel}</button>

          <button type="button" class="mobile-menu__theme" id="menu-theme-toggle" aria-label="Switch to dark mode">
            <img class="mobile-menu__theme-icon mobile-menu__theme-icon--dark" src="${assetPrefix}images/dark.svg" alt="" width="24" height="24">
            <img class="mobile-menu__theme-icon mobile-menu__theme-icon--light" src="${assetPrefix}images/light.svg" alt="" width="24" height="24">
          </button>
        </nav>

        <div class="mobile-menu__footer">
          <img src="${assetPrefix}images/mylogo-dark.svg" class="logo--dark" alt="Logo">
          <img src="${assetPrefix}images/mylogo-light.svg" class="logo--light" alt="Logo">
        </div>
      </div>
    `;
  }

  function renderAll() {
    renderHeader();
    renderFooter();
    renderMobileMenu();
  }

  window.siteComponents = {
    renderAll
  };
})();

