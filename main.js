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
        // Используем innerHTML чтобы сохранить HTML-разметку (например, <br>)
        el.innerHTML = value;
      }
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

  /**
   * Применяет только динамические ссылки (без перезаписи текста)
   */
  function applyDynamicLinks(lang) {
    const langData = translations[lang];
    if (!langData) return;

    const hrefElements = document.querySelectorAll('[data-i18n-href]');
    hrefElements.forEach(el => {
      const key = el.getAttribute('data-i18n-href');
      const value = getNestedValue(langData, key);

      if (value !== undefined) {
        el.href = value;
      }
    });
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
    setTheme(isDark ? 'light' : 'dark');
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
  // Инициализация
  // ===================================

  function init() {
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
