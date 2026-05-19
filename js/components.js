/* Shared HTML components for the portfolio site.
   Injects header, footer, and mobile menu markup into each page.
   Does not modify document.head — Google Analytics and other <head> tags stay intact. */

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
          <a href="#" class="header__link contact-link js-open-contact-modal">
            <img src="${assetPrefix}images/chat.svg" class="contact-icon--mobile" alt="Contact" width="20" height="20">
            <span class="contact-text--desktop" data-i18n="header.contact">Contact</span>
          </a>
        </div>
      `
      : `
        <div class="header__left">
          <a href="https://www.dropbox.com/scl/fi/iwiatoqi4rarxe228n505/M.Zlydar-UI-UX-Designer-EN.pdf?rlkey=4tyqsk23btvk38p8wg84jlqmk&amp;st=lor1nzvh&amp;dl=0" class="header__link" data-i18n="header.cv" data-i18n-href="links.cv" target="_blank" rel="noopener">CV</a>
          <a href="https://www.linkedin.com/in/maxzweb/" class="header__link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://dribbble.com/max4web" class="header__link" target="_blank" rel="noopener">Dribbble</a>
          <a href="#" class="header__link contact-link js-open-contact-modal">
            <img src="${assetPrefix}images/chat.svg" class="contact-icon--mobile" alt="Contact" width="20" height="20">
            <span class="contact-text--desktop" data-i18n="header.contact">Contact</span>
          </a>
        </div>
      `;

    // Default labels for language toggle (synced by main.js). Desktop shows current / hover target.
    const langCurrent = isCasePage ? 'UA' : 'EN';
    const langTarget = isCasePage ? 'EN' : 'UA';

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

          <button type="button" class="header__lang header__link--desktop" id="lang-toggle" data-i18n-aria-label="header.langAria" aria-label="Switch language">
            <span class="header__lang-inner">
              <span class="header__lang-text header__lang-text--current" aria-hidden="true">${langCurrent}</span>
              <span class="header__lang-text header__lang-text--hover" aria-hidden="true">${langTarget}</span>
            </span>
          </button>

          <button type="button" class="header__theme header__link--desktop" id="theme-toggle" aria-label="Switch to dark mode">
            <img class="header__theme-icon header__theme-icon--dark" src="${assetPrefix}images/dark.svg" alt="" width="20" height="20">
            <img class="header__theme-icon header__theme-icon--light" src="${assetPrefix}images/light.svg" alt="" width="20" height="20">
          </button>

          <button class="header__menu-btn" id="menu-toggle" type="button" data-i18n-aria-label="header.menu" aria-label="Menu" aria-controls="mobile-menu" aria-expanded="false">
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
          <button type="button" class="footer__link js-open-contact-modal" data-i18n="header.contact">Contact</button>
          <a href="mailto:maxz4web@gmail.com" class="footer__link" data-i18n="header.mail">Пошта</a>
        </nav>
      `
      }
    `;
  }

  function renderMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-modal', 'true');
    menu.setAttribute('aria-hidden', 'true');

    const { isCasePage, assetPrefix } = getContext();
    const mailText = isCasePage ? 'Email' : 'Пошта';
    const langLabel = isCasePage ? 'EN' : 'UA';

    menu.innerHTML = `
      <div class="mobile-menu__content">
        <div class="mobile-menu__header">
          <button type="button" class="mobile-menu__close" id="menu-close" data-i18n-aria-label="header.menuClose" aria-label="Close menu">
            <img src="${assetPrefix}images/Close_LG.svg" alt="" width="16" height="16" aria-hidden="true">
          </button>
        </div>

        <nav class="mobile-menu__nav">
          <a href="https://www.dropbox.com/scl/fi/iwiatoqi4rarxe228n505/M.Zlydar-UI-UX-Designer-EN.pdf?rlkey=4tyqsk23btvk38p8wg84jlqmk&amp;st=lor1nzvh&amp;dl=0" class="mobile-menu__link" data-i18n="header.cv" data-i18n-href="links.cv" target="_blank" rel="noopener">CV</a>
          <a href="https://www.linkedin.com/in/maxzweb/" class="mobile-menu__link" target="_blank" rel="noopener">LinkedIn</a>
          <a href="https://dribbble.com/max4web" class="mobile-menu__link" target="_blank" rel="noopener">Dribbble</a>
          <a href="https://www.upwork.com/freelancers/maxzweb" class="mobile-menu__link" target="_blank" rel="noopener">Upwork</a>
          <button type="button" class="mobile-menu__link mobile-menu__link--button js-open-contact-modal" data-i18n="header.contact">Contact</button>
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

  function renderTestimonials() {
    const root = document.getElementById('site-testimonials-root');
    if (!root) return;

    const { assetPrefix } = getContext();
    const im = (path) => `${assetPrefix}${path}`;
    const starPath =
      'M12 1.5l3.1 7.8h8.4l-6.8 5.2 2.6 8-7.3-5.3-7.3 5.3 2.6-8-6.8-5.2h8.4L12 1.5z';
    const star = `<svg class="rh-t-divider__star" viewBox="0 0 24 24" width="22" height="22" focusable="false"><path fill="currentColor" d="${starPath}"/></svg>`;
    const stars5 = star.repeat(5);
    const starHalf = `<svg class="rh-t-divider__star rh-t-divider__star--half" viewBox="0 0 24 24" width="22" height="22" focusable="false" aria-hidden="true"><defs><linearGradient id="rh-t-divider-48-half-grad" x1="0" y1="12" x2="24" y2="12" gradientUnits="userSpaceOnUse"><stop offset="50%" stop-color="var(--color-accent)"/><stop offset="50%" stop-color="var(--color-muted)"/></linearGradient></defs><path fill="url(#rh-t-divider-48-half-grad)" d="${starPath}"/></svg>`;
    const stars48 = star.repeat(4) + starHalf;
    const chevronRightImg = `<img class="ui-arrow-chevron" src="${im('images/arrow-chevron-right.svg')}" width="24" height="24" alt="" aria-hidden="true">`;

    root.innerHTML = `
      <section class="rh-t" id="testimonials" aria-labelledby="rh-t-heading">
        <div class="rh-t__head">
          <div class="rh-t__head-text">
            <h2 class="rh-t__title" id="rh-t-heading">
              <span class="rh-t__title-line" data-i18n="index.testimonials.headingLine1">A reliable partner for</span><br>
              <span class="rh-t__title-line rh-t__title-line--muted" data-i18n="index.testimonials.headingLine2">worldwide-class quality and on-time delivery</span>
            </h2>
          </div>
          <div class="rh-t__arrows" role="group" data-i18n-aria-label="index.testimonials.arrowsGroupAria" aria-label="Testimonials carousel">
            <button type="button" class="rh-t__arrow rh-t__arrow--prev" id="rh-t-prev" data-i18n-aria-label="index.testimonials.prevAria" aria-label="Previous testimonial">
              ${chevronRightImg}
            </button>
            <button type="button" class="rh-t__arrow rh-t__arrow--next" id="rh-t-next" data-i18n-aria-label="index.testimonials.nextAria" aria-label="Next testimonial">
              ${chevronRightImg}
            </button>
          </div>
        </div>
        <div class="rh-t__viewport">
          <div class="rh-t__track" id="rh-t-track">
            <div class="rh-t__lime" aria-hidden="true">
              <div class="rh-t__lime-inner">
                <p class="rh-t__lime-stat" data-i18n="index.testimonials.limeStat">70+</p>
                <p class="rh-t__lime-label" data-i18n="index.testimonials.limeLabel">Successfully delivered projects</p>
              </div>
            </div>
            <article class="rh-t-card">
              <div class="rh-t-card__logo-wrap">
                <img src="${im('images/logo1.png')}" alt="" width="120" height="48" loading="lazy" />
              </div>
              <div class="rh-t-card__quote-row">
                <img src="${im('images/feedback-quote.svg')}" alt="" class="rh-t-card__quote-mark-img" width="20" height="20" loading="lazy" />
                <p class="rh-t-card__quote" data-i18n="index.testimonials.quote1">Max redesigned our onboarding flow and sign-up conversion jumped from 18% to 31%. Communicative, sharp, and truly understood our vision. Highly recommend!</p>
              </div>
              <footer class="rh-t-card__foot">
                <img src="${im('images/feedback-pics/feedback-pic1.jpg')}" alt="" class="rh-t-card__avatar-img" width="48" height="48" loading="lazy" />
                <div class="rh-t-card__who">
                  <span class="rh-t-card__name">John M.</span>
                  <span class="rh-t-card__role">Product lead</span>
                </div>
              </footer>
            </article>
            <article class="rh-t-card">
              <div class="rh-t-card__logo-wrap">
                <img src="${im('images/logo2.png')}" alt="" width="120" height="48" loading="lazy" />
              </div>
              <div class="rh-t-card__quote-row">
                <img src="${im('images/feedback-quote.svg')}" alt="" class="rh-t-card__quote-mark-img" width="20" height="20" loading="lazy" />
                <p class="rh-t-card__quote" data-i18n="index.testimonials.quote2">Working with Max was great. He revamped our landing page — bounce rate dropped by 24%. Clean designs, fast delivery, always open to feedback. Will hire again.</p>
              </div>
              <footer class="rh-t-card__foot">
                <img src="${im('images/feedback-pics/feedback-pic2.jpg')}" alt="" class="rh-t-card__avatar-img" width="48" height="48" loading="lazy" />
                <div class="rh-t-card__who">
                  <span class="rh-t-card__name">Sarah K.</span>
                  <span class="rh-t-card__role">Startup founder</span>
                </div>
              </footer>
            </article>
            <div class="rh-t-divider" role="img" data-i18n-aria-label="index.testimonials.dividerAria5" aria-label="5.0 rating, 58 reviews">
              <p class="rh-t-divider__score">5.0</p>
              <div class="rh-t-divider__stars" aria-hidden="true">${stars5}</div>
              <p class="rh-t-divider__meta" data-i18n="index.testimonials.reviewsMeta5">58 reviews</p>
            </div>
            <article class="rh-t-card">
              <div class="rh-t-card__logo-wrap">
                <img src="${im('images/logo3.png')}" alt="" width="120" height="48" loading="lazy" />
              </div>
              <div class="rh-t-card__quote-row">
                <img src="${im('images/feedback-quote.svg')}" alt="" class="rh-t-card__quote-mark-img" width="20" height="20" loading="lazy" />
                <p class="rh-t-card__quote" data-i18n="index.testimonials.quote3">Max brought our product to life with his designs. Very professional and detail-oriented, with a great sense for what users actually need. Exceeded our expectations.</p>
              </div>
              <footer class="rh-t-card__foot">
                <img src="${im('images/feedback-pics/feedback-pic3.jpg')}" alt="" class="rh-t-card__avatar-img" width="48" height="48" loading="lazy" />
                <div class="rh-t-card__who">
                  <span class="rh-t-card__name">Andrew R.</span>
                  <span class="rh-t-card__role">Product manager</span>
                </div>
              </footer>
            </article>
            <article class="rh-t-card">
              <div class="rh-t-card__logo-wrap">
                <img src="${im('images/logo4.png')}" alt="" width="120" height="48" loading="lazy" />
              </div>
              <div class="rh-t-card__quote-row">
                <img src="${im('images/feedback-quote.svg')}" alt="" class="rh-t-card__quote-mark-img" width="20" height="20" loading="lazy" />
                <p class="rh-t-card__quote" data-i18n="index.testimonials.quote4">Excellent mobile app design from Max. He nailed the brief — after release, our App Store rating went from 3.8 to 4.7. High quality, delivered on time.</p>
              </div>
              <footer class="rh-t-card__foot">
                <img src="${im('images/feedback-pics/feedback-pic4.jpg')}" alt="" class="rh-t-card__avatar-img" width="48" height="48" loading="lazy" />
                <div class="rh-t-card__who">
                  <span class="rh-t-card__name">Adrien .</span>
                  <span class="rh-t-card__role">Mobile lead</span>
                </div>
              </footer>
            </article>
            <div class="rh-t-divider" role="img" data-i18n-aria-label="index.testimonials.dividerAria48" aria-label="4.8 rating, 12 reviews">
              <p class="rh-t-divider__score">4.8</p>
              <div class="rh-t-divider__stars" aria-hidden="true">${stars48}</div>
              <p class="rh-t-divider__meta" data-i18n="index.testimonials.reviewsMeta48">12 reviews</p>
            </div>
            <article class="rh-t-card">
              <div class="rh-t-card__logo-wrap">
                <img src="${im('images/logo5.png')}" alt="" width="120" height="48" loading="lazy" />
              </div>
              <div class="rh-t-card__quote-row">
                <img src="${im('images/feedback-quote.svg')}" alt="" class="rh-t-card__quote-mark-img" width="20" height="20" loading="lazy" />
                <p class="rh-t-card__quote" data-i18n="index.testimonials.quote5">Working with Max is always a pleasure. Strong eye for detail, polished and modern style. Our checkout redesign cut drop-off by 19%. A designer you can trust.</p>
              </div>
              <footer class="rh-t-card__foot">
                <img src="${im('images/feedback-pics/feedback-pic5.jpg')}" alt="" class="rh-t-card__avatar-img" width="48" height="48" loading="lazy" />
                <div class="rh-t-card__who">
                  <span class="rh-t-card__name">Joshua L.</span>
                  <span class="rh-t-card__role">Operations</span>
                </div>
              </footer>
            </article>
            <article class="rh-t-card">
              <div class="rh-t-card__logo-wrap">
                <img src="${im('images/feedback-logos/logo-feedback8.svg')}" alt="" width="120" height="48" loading="lazy" />
              </div>
              <div class="rh-t-card__quote-row">
                <img src="${im('images/feedback-quote.svg')}" alt="" class="rh-t-card__quote-mark-img" width="20" height="20" loading="lazy" />
                <p class="rh-t-card__quote" data-i18n="index.testimonials.quote6">Max is one of the best designers I've worked with on Upwork. Creative, fast, and professional — every screen felt intentional and well thought out.</p>
              </div>
              <footer class="rh-t-card__foot">
                <img src="${im('images/feedback-pics/feedback-pic8.jpg')}" alt="" class="rh-t-card__avatar-img" width="48" height="48" loading="lazy" />
                <div class="rh-t-card__who">
                  <span class="rh-t-card__name">Michael T.</span>
                  <span class="rh-t-card__role">Upwork client</span>
                </div>
              </footer>
            </article>
          </div>
        </div>
      </section>
    `;
  }

  function renderContactModal() {
    if (document.getElementById('site-contact-modal')) return;

    const wrap = document.createElement('div');
    wrap.id = 'site-contact-modal';
    wrap.className = 'contact-modal';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div class="contact-modal__backdrop js-contact-modal-backdrop" tabindex="-1"></div>
      <div class="contact-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="contact-modal-heading">
        <button type="button" class="contact-modal__close js-contact-modal-close" data-i18n-aria-label="contact.closeModal" aria-label="Close">&times;</button>
        <div class="contact-modal__body">
          <h2 id="contact-modal-heading" class="contact-modal__title" data-i18n="contact.heading">Let's start a project together</h2>

          <p id="contact-form-feedback" role="status" aria-live="polite" hidden></p>

          <form class="contact-modal__form" id="contact-form" action="#" method="post" novalidate>
            <div id="contact-form-fields">
              <div class="contact-modal__field">
                <label class="contact-modal__label" for="contact-name" data-i18n="contact.nameLabel">Name</label>
                <input class="contact-modal__input" type="text" id="contact-name" name="from_name" autocomplete="name" required data-i18n-placeholder="contact.namePlaceholder" placeholder="" />
              </div>

              <div class="contact-modal__field">
                <label class="contact-modal__label" for="contact-email" data-i18n="contact.emailLabel">Email</label>
                <input class="contact-modal__input" type="email" id="contact-email" name="from_email" autocomplete="email" required data-i18n-placeholder="contact.emailPlaceholder" placeholder="" />
              </div>

              <div class="contact-modal__field">
                <label class="contact-modal__label" for="contact-message" data-i18n="contact.messageLabel">Project description</label>
                <textarea class="contact-modal__textarea" id="contact-message" name="message" rows="5" required data-i18n-placeholder="contact.messagePlaceholder" placeholder=""></textarea>
              </div>

              <button type="submit" class="contact-modal__submit" id="contact-form-submit" data-i18n="contact.submit">Send message</button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.appendChild(wrap);
  }

  function renderScrollPill() {
    if (document.getElementById('pill-scroll-top')) return;

    const seg = 'Back to top · Product design · UI/UX · ';
    const btn = document.createElement('button');
    btn.id = 'pill-scroll-top';
    btn.type = 'button';
    btn.className = 'sd-scroll-pill';
    btn.setAttribute('data-i18n-aria-label', 'scrollPill.ariaLabel');
    btn.setAttribute('aria-label', '');
    btn.innerHTML = `
      <span class="sd-scroll-pill__row">
        <span class="sd-scroll-pill__pill">
          <span class="sd-scroll-pill__marquee" aria-hidden="true">
            <span class="sd-scroll-pill__marquee-track">
              <span data-i18n="scrollPill.marquee">${seg}</span>
              <span data-i18n="scrollPill.marquee">${seg}</span>
            </span>
          </span>
          <span class="sd-scroll-pill__accent" aria-hidden="true"></span>
        </span>
      </span>
    `;
    document.body.appendChild(btn);
  }

  function renderAll() {
    renderHeader();
    renderFooter();
    renderMobileMenu();
    renderTestimonials();
    renderContactModal();
    renderScrollPill();
  }

  window.siteComponents = {
    renderAll
  };
})();

