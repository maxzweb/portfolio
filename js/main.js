/**
 * Главный JS файл сайта-портфолио
 * Функционал: смена языка без перезагрузки, подготовка к темам
 */

(function() {
  'use strict';

  // ===================================
  // Конфигурация
  // ===================================

  const CONFIG = {
    defaultLang: 'en',
    supportedLangs: ['uk', 'en'],
    storageKey: 'site-language',
    themeKey: 'site-theme'
  };

  function trackGtag() {
    if (typeof window.gtag !== 'function') return;
    window.gtag.apply(window, arguments);
  }

  // ===================================
  // Состояние приложения
  // ===================================

  let currentLang = CONFIG.defaultLang;
  let translations = {};

  // ===================================
  // Утилиты
  // ===================================

  /**
   * Получает вложенное значение из объекта по ключу вида "nav.cv"
   */
  function getNestedValue(obj, key) {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  /**
   * Чистый URL страницы без query и hash (canonical, og:url).
   */
  function getCleanPageUrl() {
    try {
      const u = new URL(window.location.href);
      u.hash = '';
      u.search = '';
      return u.href;
    } catch (e) {
      return window.location.href.replace(/[?#].*$/, '');
    }
  }

  /**
   * Абсолютные canonical, og:url, og:image, twitter:image (если разметка есть в DOM).
   */
  function updateAbsoluteUrlMeta() {
    const clean = getCleanPageUrl();
    const canonical = document.getElementById('seo-canonical');
    if (canonical) canonical.setAttribute('href', clean);

    const ogUrl = document.getElementById('seo-og-url');
    if (ogUrl) ogUrl.setAttribute('content', clean);

    const ogImg = document.getElementById('seo-og-image');
    const twImg = document.getElementById('seo-twitter-image');
    const relPath =
      (ogImg && ogImg.getAttribute('content')) || 'images/case1.png';
    let absImg;
    try {
      absImg = /^(https?:|data:)/i.test(relPath)
        ? relPath
        : new URL(relPath, clean).href;
    } catch (err) {
      absImg = relPath;
    }
    if (ogImg) ogImg.setAttribute('content', absImg);
    if (twImg) twImg.setAttribute('content', absImg);
  }

  /**
   * JSON-LD: Person + WebSite на главной (после загрузки переводов).
   */
  function syncIndexJsonLd(langData) {
    if (!document.getElementById('hero')) return;

    const desc = getNestedValue(langData, 'index.seo.description') || '';
    const clean = getCleanPageUrl();
    const graph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${clean}#website`,
          url: clean,
          name: 'Max Zlydar',
          description: desc,
          inLanguage: ['en', 'uk'],
          publisher: { '@id': `${clean}#person` }
        },
        {
          '@type': 'Person',
          '@id': `${clean}#person`,
          name: 'Max Zlydar',
          url: clean,
          jobTitle: 'Product designer',
          sameAs: [
            'https://www.linkedin.com/in/maxzweb/',
            'https://dribbble.com/max4web',
            'https://www.upwork.com/freelancers/maxzweb',
            'https://t.me/MaxZweb'
          ]
        }
      ]
    };

    let script = document.getElementById('schema-portfolio');
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-portfolio';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(graph);
  }

  /**
   * JSON-LD: CreativeWork на страницах кейсов (data-case-schema="case1" … на <html>).
   */
  function syncCaseJsonLd(langData) {
    const slug = document.documentElement.getAttribute('data-case-schema');
    if (!slug || !/^case[1-4]$/.test(slug)) return;

    const title = getNestedValue(langData, `${slug}.seo.title`) || '';
    const desc = getNestedValue(langData, `${slug}.seo.description`) || '';
    const clean = getCleanPageUrl();
    const graph = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: title,
      description: desc,
      author: {
        '@type': 'Person',
        name: 'Max Zlydar'
      },
      url: clean
    };

    let script = document.getElementById('schema-case-study');
    if (!script) {
      script = document.createElement('script');
      script.id = 'schema-case-study';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(graph);
  }

  /**
   * Префикс к data/*.json: на страницах в /cases/ нужен ../
   */
  function getI18nDataPrefix() {
    return /\/cases\//.test(window.location.pathname) ? '../' : '';
  }

  /**
   * Загружает JSON файл с переводами
   */
  async function loadTranslations(lang) {
    try {
      const response = await fetch(`${getI18nDataPrefix()}data/${lang}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Ошибка загрузки переводов для ${lang}:`, error);
      return null;
    }
  }

  // ===================================
  // Смена языка
  // ===================================

  /**
   * Применяет переводы ко всем элементам с data-i18n
   */
  function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    const langData = translations[lang];

    if (!langData) {
      console.warn(`Переводы для языка ${lang} не загружены`);
      return;
    }

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(langData, key);

      if (value !== undefined) {
        if (el.tagName === 'TITLE') {
          el.textContent = value;
        } else {
          // Используем innerHTML чтобы сохранить HTML-разметку (например, <br>)
          el.innerHTML = value;
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = getNestedValue(langData, key);
      if (value !== undefined) el.placeholder = value;
    });

    document.querySelectorAll('[data-i18n-value]').forEach((el) => {
      const key = el.getAttribute('data-i18n-value');
      const value = getNestedValue(langData, key);
      if (value !== undefined) el.value = value;
    });

    document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      const value = getNestedValue(langData, key);
      if (value !== undefined) el.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-content]').forEach((el) => {
      const key = el.getAttribute('data-i18n-content');
      const value = getNestedValue(langData, key);
      if (value !== undefined) el.setAttribute('content', value);
    });

    // Обновляем ссылки с data-i18n-href
    const hrefElements = document.querySelectorAll('[data-i18n-href]');
    hrefElements.forEach(el => {
      const key = el.getAttribute('data-i18n-href');
      const value = getNestedValue(langData, key);

      if (value !== undefined) {
        el.href = value;
      }
    });

    // Обновляем атрибут lang на html
    document.documentElement.lang = lang;

    const ogLocale = document.getElementById('seo-og-locale');
    const ogLocaleAlt = document.getElementById('seo-og-locale-alt');
    if (ogLocale && ogLocaleAlt) {
      if (lang === 'uk') {
        ogLocale.setAttribute('content', 'uk_UA');
        ogLocaleAlt.setAttribute('content', 'en_US');
      } else {
        ogLocale.setAttribute('content', 'en_US');
        ogLocaleAlt.setAttribute('content', 'uk_UA');
      }
    }

    updateAbsoluteUrlMeta();
    syncIndexJsonLd(langData);
    syncCaseJsonLd(langData);

    // Кнопки языка: показываем язык переключения (EN ↔ UA), не дублируем текущий
    syncLangSwitchButtons(lang);
  }

  /**
   * Подписи на кнопках смены языка: показать язык, на который переключимся
   */
  function syncLangSwitchButtons(activeLang) {
    const label = activeLang === 'en' ? 'UA' : 'EN';
    ['lang-toggle', 'menu-lang-toggle'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = label;
    });
  }

  /**
   * Переключает язык между uk и en
   */
  async function toggleLanguage() {
    const newLang = currentLang === 'uk' ? 'en' : 'uk';

    if (!translations[newLang]) {
      translations[newLang] = await loadTranslations(newLang);
    }

    if (translations[newLang]) {
      currentLang = newLang;
      localStorage.setItem(CONFIG.storageKey, newLang);
      applyTranslations(newLang);
      trackGtag('event', 'language_switch', { event_category: 'UI', event_label: newLang });
    }
  }

  /**
   * Определяет язык браузера пользователя
   */
  function getBrowserLanguage() {
    // navigator.languages — массив предпочтительных языков
    // navigator.language — основной язык браузера
    const browserLangs = navigator.languages || [navigator.language || navigator.userLanguage];

    for (const lang of browserLangs) {
      const langCode = lang.split('-')[0].toLowerCase();
      if (CONFIG.supportedLangs.includes(langCode)) {
        return langCode;
      }
    }

    return CONFIG.defaultLang;
  }

  /**
   * Инициализирует язык из localStorage, языка браузера или по умолчанию
   */
  async function initLanguage() {
    const savedLang = localStorage.getItem(CONFIG.storageKey);

    if (savedLang && CONFIG.supportedLangs.includes(savedLang)) {
      // Приоритет: сохранённый выбор пользователя
      currentLang = savedLang;
    } else {
      // Если пользователь ещё не выбирал — определяем по языку браузера
      currentLang = getBrowserLanguage();
    }

    // Загружаем переводы для текущего языка
    translations[currentLang] = await loadTranslations(currentLang);

    if (translations[currentLang]) {
      applyTranslations(currentLang);
    }
  }

  // ===================================
  // Мобильное меню
  // ===================================

  /**
   * Открывает мобильное меню
   */
  function openMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Закрывает мобильное меню
   */
  function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  // ===================================
  // Темы (подготовка)
  // ===================================

  function syncThemeAria() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    ['theme-toggle', 'menu-theme-toggle'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('aria-label', label);
    });
  }

  /**
   * Переключает тему между light и dark
   */
  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(CONFIG.themeKey, theme);
    syncThemeAria();
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
    trackGtag('event', 'theme_switch', { event_category: 'UI', event_label: newTheme });
  }

  /**
   * Инициализирует тему из localStorage (синхронно с inline-скриптом в head)
   */
  function initTheme() {
    const saved = localStorage.getItem(CONFIG.themeKey);
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    syncThemeAria();
  }

  // ===================================
  // Google Analytics — custom events
  // ===================================

  function initAnalytics() {
    document.addEventListener(
      'click',
      function (e) {
        if (e.target.closest('.btn-telegram')) {
          trackGtag('event', 'click', { event_category: 'CTA', event_label: 'Telegram Button' });
          return;
        }
        if (e.target.closest('a[data-i18n-href="links.cv"]')) {
          trackGtag('event', 'click', { event_category: 'CTA', event_label: 'Resume Download' });
          return;
        }
        if (e.target.closest('.js-open-contact-modal')) {
          trackGtag('event', 'contact_form_open', { event_category: 'Modal' });
          return;
        }
        const caseLink = e.target.closest('.case-card--link a[href*="cases/case"]');
        if (caseLink) {
          const card = caseLink.closest('.case-card--link');
          const titleEl = card && card.querySelector('.case-card__title');
          const caseName = titleEl ? titleEl.textContent.trim() : 'Case';
          trackGtag('event', 'case_click', { event_category: 'Portfolio', event_label: caseName });
        }
      },
      true
    );

    document.addEventListener(
      'submit',
      function (e) {
        if (e.target && e.target.id === 'contact-form') {
          trackGtag('event', 'contact_form_submit', { event_category: 'Modal' });
        }
      },
      true
    );
  }

  // ===================================
  // Инициализация
  // ===================================

  function init() {
    // Inject shared UI skeleton (header/footer/mobile menu)
    // before i18n/theme initialization so event handlers and labels attach correctly.
    if (window.siteComponents && typeof window.siteComponents.renderAll === 'function') {
      window.siteComponents.renderAll();
    }

    initAnalytics();

    updateAbsoluteUrlMeta();

    // Инициализируем тему
    initTheme();

    // Инициализируем язык
    initLanguage();

    // Привязываем обработчик к кнопке смены языка
    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) {
      langToggle.addEventListener('click', toggleLanguage);
    }

    // Мобильное меню
    const menuToggle = document.getElementById('menu-toggle');
    const menuClose = document.getElementById('menu-close');
    const menuLangToggle = document.getElementById('menu-lang-toggle');

    if (menuToggle) {
      menuToggle.addEventListener('click', openMobileMenu);
    }

    if (menuClose) {
      menuClose.addEventListener('click', closeMobileMenu);
    }

    if (menuLangToggle) {
      menuLangToggle.addEventListener('click', () => {
        toggleLanguage();
        closeMobileMenu();
      });
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }

    const menuThemeToggle = document.getElementById('menu-theme-toggle');
    if (menuThemeToggle) {
      menuThemeToggle.addEventListener('click', toggleTheme);
    }

    // Закрытие меню по клику на ссылку
    const menuLinks = document.querySelectorAll('.mobile-menu__link[href]');
    menuLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Кликабельные карточки кейсов
    const clickableCards = document.querySelectorAll('.case-card--link');
    clickableCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Не перехватываем клик по самой ссылке
        if (e.target.closest('a')) return;

        const titleEl = card.querySelector('.case-card__title');
        const caseName = titleEl ? titleEl.textContent.trim() : 'Case';
        trackGtag('event', 'case_click', { event_category: 'Portfolio', event_label: caseName });

        const link = card.querySelector('a');
        if (link && link.href) {
          window.location.href = link.href;
        }
      });
    });

    // Раскрытие блока результатов на страницах кейсов (Figma: «More details»)
    document.querySelectorAll('.case-results__toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const block = btn.closest('.case-results');
        if (!block) return;
        block.classList.toggle('is-expanded');
        const open = block.classList.contains('is-expanded');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });

    // Testimonials: arrow step scroll + drag-to-scroll (only track scrollLeft changes)
    const rhTrack = document.getElementById('rh-t-track');
    const rhPrev = document.getElementById('rh-t-prev');
    const rhNext = document.getElementById('rh-t-next');
    if (rhTrack && rhPrev && rhNext) {
      const stepScroll = () => {
        const seg =
          rhTrack.querySelector('.rh-t__lime') ||
          rhTrack.querySelector('.rh-t-card') ||
          rhTrack.querySelector('.rh-t-divider');
        const w = seg ? seg.offsetWidth : 360;
        return Math.min(w + 1, rhTrack.clientWidth * 0.92);
      };

      rhPrev.addEventListener('click', () => {
        rhTrack.scrollBy({ left: -stepScroll(), behavior: 'smooth' });
      });
      rhNext.addEventListener('click', () => {
        rhTrack.scrollBy({ left: stepScroll(), behavior: 'smooth' });
      });

      let dragging = false;
      let dragMoved = false;
      let startX = 0;
      let startScrollLeft = 0;

      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        rhTrack.classList.remove('is-dragging');
      };

      rhTrack.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        dragging = true;
        dragMoved = false;
        startX = e.clientX;
        startScrollLeft = rhTrack.scrollLeft;
        rhTrack.classList.add('is-dragging');
      });

      document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) dragMoved = true;
        rhTrack.scrollLeft = startScrollLeft - dx;
      });

      document.addEventListener('mouseup', endDrag);
      rhTrack.addEventListener('mouseleave', endDrag);

      rhTrack.addEventListener(
        'click',
        (e) => {
          if (dragMoved) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );
    }
  }

  // Запускаем при загрузке DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспортируем для возможного использования
  window.siteApp = {
    toggleLanguage,
    toggleTheme,
    getCurrentLang: () => currentLang
  };

})();
